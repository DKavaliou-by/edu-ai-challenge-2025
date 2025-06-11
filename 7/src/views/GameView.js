/**
 * Game View Module
 * Handles all display and rendering operations
 */

import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Console-based game view for rendering game state
 */
export class GameView {
  constructor(config = GAME_CONFIG) {
    this.config = config;
  }

  /**
   * Display welcome message and game setup
   */
  showGameStart() {
    console.log(`\n${this.config.MESSAGES.GAME_START}`);
    console.log(this.config.MESSAGES.SHIPS_TO_SINK(this.config.NUM_SHIPS));
  }

  /**
   * Display boards creation message
   */
  showBoardsCreated() {
    console.log(this.config.MESSAGES.BOARDS_CREATED);
  }

  /**
   * Display ship placement message
   */
  showShipsPlaced(count, playerType) {
    console.log(this.config.MESSAGES.SHIPS_PLACED(count, playerType));
  }

  /**
   * Render both game boards side by side
   */
  renderBoards(opponentBoard, playerBoard) {
    const size = opponentBoard.getSize();
    
    console.log(`\n   --- ${this.config.MESSAGES.OPPONENT_BOARD} ---          --- ${this.config.MESSAGES.YOUR_BOARD} ---`);
    
    // Header with column numbers
    let header = '  ';
    for (let h = 0; h < size; h++) {
      header += `${h} `;
    }
    console.log(`${header}     ${header}`);

    // Board rows
    for (let i = 0; i < size; i++) {
      let rowStr = `${i} `;
      
      // Opponent board (hide ships)
      for (let j = 0; j < size; j++) {
        const cell = opponentBoard.getCell(i, j);
        // Hide enemy ships - show only hits and misses
        const displayCell = cell === this.config.SYMBOLS.SHIP ? this.config.SYMBOLS.WATER : cell;
        rowStr += `${displayCell} `;
      }
      
      rowStr += `    ${i} `;
      
      // Player board (show everything)
      for (let j = 0; j < size; j++) {
        rowStr += `${playerBoard.getCell(i, j)} `;
      }
      
      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Display single board (for debugging or game end)
   */
  renderSingleBoard(board, title) {
    console.log(`\n   --- ${title} ---`);
    let header = '  ';
    for (let h = 0; h < board.getSize(); h++) {
      header += `${h} `;
    }
    console.log(header);

    for (let i = 0; i < board.getSize(); i++) {
      let rowStr = `${i} `;
      for (let j = 0; j < board.getSize(); j++) {
        rowStr += `${board.getCell(i, j)} `;
      }
      console.log(rowStr);
    }
    console.log('');
  }

  /**
   * Display player hit message
   */
  showPlayerHit() {
    console.log(this.config.MESSAGES.PLAYER_HIT);
  }

  /**
   * Display player miss message
   */
  showPlayerMiss() {
    console.log(this.config.MESSAGES.PLAYER_MISS);
  }

  /**
   * Display ship sunk message
   */
  showShipSunk() {
    console.log(this.config.MESSAGES.SHIP_SUNK);
  }

  /**
   * Display already hit message
   */
  showAlreadyHit() {
    console.log(this.config.MESSAGES.ALREADY_HIT);
  }

  /**
   * Display already guessed message
   */
  showAlreadyGuessed() {
    console.log(this.config.MESSAGES.ALREADY_GUESSED);
  }

  /**
   * Display CPU turn header
   */
  showCpuTurn() {
    console.log(`\n${this.config.MESSAGES.CPU_TURN}`);
  }

  /**
   * Display CPU hit message
   */
  showCpuHit(location) {
    console.log(this.config.MESSAGES.CPU_HIT(location));
  }

  /**
   * Display CPU miss message
   */
  showCpuMiss(location) {
    console.log(this.config.MESSAGES.CPU_MISS(location));
  }

  /**
   * Display CPU targeting message
   */
  showCpuTargets(location) {
    console.log(this.config.MESSAGES.CPU_TARGETS(location));
  }

  /**
   * Display CPU sunk ship message
   */
  showCpuSunkShip() {
    console.log(this.config.MESSAGES.CPU_SUNK_SHIP);
  }

  /**
   * Display player wins message
   */
  showPlayerWins() {
    console.log(`\n${this.config.MESSAGES.PLAYER_WINS}`);
  }

  /**
   * Display CPU wins message
   */
  showCpuWins() {
    console.log(`\n${this.config.MESSAGES.CPU_WINS}`);
  }

  /**
   * Display input validation error
   */
  showInvalidInput() {
    console.log(this.config.MESSAGES.INVALID_INPUT);
  }

  /**
   * Display coordinate validation error
   */
  showInvalidCoordinates() {
    const maxCoord = this.config.BOARD_SIZE - 1;
    console.log(this.config.MESSAGES.INVALID_COORDINATES(maxCoord));
  }

  /**
   * Display generic error message
   */
  showError(message) {
    console.error(`Error: ${message}`);
  }

  /**
   * Display game statistics
   */
  showGameStats(gameState) {
    const status = gameState.getStatus();
    console.log('\n--- Game Statistics ---');
    console.log(`Player ships remaining: ${status.playerShipCount}`);
    console.log(`CPU ships remaining: ${status.cpuShipCount}`);
    console.log(`Player guesses made: ${status.playerGuessCount}`);
    console.log(`CPU guesses made: ${status.cpuGuessCount}`);
    console.log(`CPU mode: ${status.cpuMode}`);
    console.log(`CPU targets queued: ${status.cpuTargetsQueued}`);
  }

  /**
   * Clear console (if supported)
   */
  clearScreen() {
    // Simple console clear for supported terminals
    console.clear();
  }

  /**
   * Show debug information
   */
  showDebug(message) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

/**
 * Input prompts and user interaction
 */
export class InputView {
  constructor(config = GAME_CONFIG) {
    this.config = config;
  }

  /**
   * Get the prompt message for player guess
   */
  getGuessPrompt() {
    return this.config.MESSAGES.ENTER_GUESS;
  }

  /**
   * Format a confirmation message
   */
  getConfirmationPrompt(message) {
    return `${message} (y/n): `;
  }

  /**
   * Format an information message
   */
  formatInfo(message) {
    return `[INFO] ${message}`;
  }

  /**
   * Format a warning message
   */
  formatWarning(message) {
    return `[WARNING] ${message}`;
  }
}

export default { GameView, InputView }; 