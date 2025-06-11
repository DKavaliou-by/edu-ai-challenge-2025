/**
 * Sea Battle Application - Main Entry Point
 * Uses modular architecture with clear separation of concerns
 */

import readline from 'readline';
import { GameController } from './controllers/GameController.js';
import { InputView } from './views/GameView.js';

/**
 * Application class handling the main game loop and user interaction
 */
export class SeaBattleApp {
  constructor() {
    this.gameController = new GameController();
    this.inputView = new InputView();
    this.rl = null;
  }

  /**
   * Initialize readline interface
   */
  #initializeReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Promisify readline question for async/await usage
   */
  async #askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  /**
   * Start the application
   */
  async start() {
    try {
      this.#initializeReadline();
      await this.#runGame();
    } catch (error) {
      this.gameController.getView().showError(`Application error: ${error.message}`);
    } finally {
      this.#cleanup();
    }
  }

  /**
   * Main game execution flow
   */
  async #runGame() {
    // Initialize game
    this.gameController.initializeGame();
    
    // Main game loop
    let gameResult = 'continue';
    
    while (gameResult === 'continue') {
      // Check for game end before each round
      gameResult = this.gameController.checkGameEnd();
      if (gameResult !== 'continue') {
        break;
      }

      // Render current game state
      this.gameController.renderGame();
      
      // Player turn
      const playerTurnResult = await this.#handlePlayerTurn();
      
      if (playerTurnResult.success) {
        // Check for game end after player turn
        gameResult = this.gameController.checkGameEnd();
        if (gameResult !== 'continue') {
          break;
        }

        // CPU turn
        const cpuTurnResult = this.gameController.processCpuTurn();
        
        // Check for game end after CPU turn
        gameResult = this.gameController.checkGameEnd();
      }
    }

    return gameResult;
  }

  /**
   * Handle player turn with input validation and retry logic
   */
  async #handlePlayerTurn() {
    while (true) {
      try {
        const guess = await this.#askQuestion(
          this.inputView.getGuessPrompt()
        );
        
        const result = this.gameController.processPlayerTurn(guess);
        
        if (result.success) {
          return result;
        }
        
        // Invalid input - let player try again
        if (result.reason === 'invalid_format' || 
            result.reason === 'invalid_coordinates' || 
            result.reason === 'duplicate_guess') {
          continue;
        }
        
        return result;
      } catch (error) {
        this.gameController.getView().showError(`Input error: ${error.message}`);
        continue;
      }
    }
  }

  /**
   * Cleanup resources
   */
  #cleanup() {
    if (this.rl) {
      this.rl.close();
    }
  }

  /**
   * Handle graceful shutdown
   */
  async shutdown() {
    this.#cleanup();
    process.exit(0);
  }
}

/**
 * Application entry point
 */
export async function main() {
  const app = new SeaBattleApp();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nGame interrupted. Thanks for playing!');
    await app.shutdown();
  });

  process.on('SIGTERM', async () => {
    await app.shutdown();
  });

  // Start the application
  await app.start();
}

// Auto-start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SeaBattleApp; 