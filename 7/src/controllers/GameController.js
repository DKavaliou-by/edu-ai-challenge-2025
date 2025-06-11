/**
 * Game Controller Module
 * Orchestrates game flow and coordinates between model and view
 */

import { GAME_CONFIG } from '../config/GameConfig.js';
import { Ship, GameState } from '../models/GameModel.js';
import { GameView } from '../views/GameView.js';
import { 
  CoordinateUtils, 
  RandomUtils, 
  ValidationUtils, 
  CollectionUtils 
} from '../utils/GameUtils.js';

/**
 * Handles ship placement logic
 */
export class ShipPlacementController {
  constructor(config = GAME_CONFIG) {
    this.config = config;
  }

  /**
   * Place ships randomly on a board
   */
  placeShipsRandomly(board, ships, count) {
    let placedShips = 0;
    
    while (placedShips < count) {
      const orientation = RandomUtils.randomOrientation();
      const startPos = RandomUtils.randomShipStartPosition(
        orientation, 
        this.config.SHIP_LENGTH, 
        board.getSize()
      );
      
      const locations = this.#generateShipLocations(
        startPos.row, 
        startPos.col, 
        orientation
      );
      
      if (this.#isValidPlacement(board, locations)) {
        const ship = new Ship(locations);
        this.#placeShipOnBoard(board, locations);
        ships.push(ship);
        placedShips++;
      }
    }
  }

  /**
   * Generate ship locations based on start position and orientation
   */
  #generateShipLocations(startRow, startCol, orientation) {
    const locations = [];
    for (let i = 0; i < this.config.SHIP_LENGTH; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      locations.push(CoordinateUtils.coordinateToString(row, col));
    }
    return locations;
  }

  /**
   * Check if ship placement is valid (no collisions)
   */
  #isValidPlacement(board, locations) {
    return locations.every(location => {
      const coord = CoordinateUtils.parseGuess(location);
      return coord && board.isEmpty(coord.row, coord.col);
    });
  }

  /**
   * Place ship markers on the board
   */
  #placeShipOnBoard(board, locations) {
    locations.forEach(location => {
      const coord = CoordinateUtils.parseGuess(location);
      if (coord) {
        board.placeShip(coord.row, coord.col);
      }
    });
  }
}

/**
 * Handles player turn logic
 */
export class PlayerController {
  constructor(gameState, view, config = GAME_CONFIG) {
    this.gameState = gameState;
    this.view = view;
    this.config = config;
  }

  /**
   * Process a player guess
   */
  processGuess(guess) {
    // Validate input format
    if (!ValidationUtils.isValidGuessFormat(guess)) {
      this.view.showInvalidInput();
      return { success: false, reason: 'invalid_format' };
    }

    const coord = CoordinateUtils.parseGuess(guess);
    if (!coord || !ValidationUtils.isValidGuessCoordinates(coord.row, coord.col)) {
      this.view.showInvalidCoordinates();
      return { success: false, reason: 'invalid_coordinates' };
    }

    // Check for duplicate guess
    if (this.gameState.hasPlayerGuessed(guess)) {
      this.view.showAlreadyGuessed();
      return { success: false, reason: 'duplicate_guess' };
    }

    // Record the guess
    this.gameState.addPlayerGuess(guess);

    // Process the hit/miss
    return this.#processHit(guess, coord);
  }

  /**
   * Process hit detection and board updates
   */
  #processHit(guess, coord) {
    // Find ship at this location
    const hitShip = this.gameState.cpuShips.find(ship => 
      ship.occupiesLocation(guess)
    );

    if (hitShip) {
      // Check if location was already hit
      if (hitShip.isLocationHit(guess)) {
        this.view.showAlreadyHit();
        return { success: true, result: 'already_hit' };
      }

      // Record new hit
      hitShip.takeHit(guess);
      this.gameState.opponentBoard.markHit(coord.row, coord.col);
      this.view.showPlayerHit();

      // Check if ship is sunk
      if (hitShip.isSunk()) {
        this.view.showShipSunk();
        this.gameState.sinkCpuShip();
        return { success: true, result: 'ship_sunk' };
      }

      return { success: true, result: 'hit' };
    } else {
      // Miss
      this.gameState.opponentBoard.markMiss(coord.row, coord.col);
      this.view.showPlayerMiss();
      return { success: true, result: 'miss' };
    }
  }
}

/**
 * Handles CPU AI logic
 */
export class CpuController {
  constructor(gameState, view, config = GAME_CONFIG) {
    this.gameState = gameState;
    this.view = view;
    this.config = config;
  }

  /**
   * Execute CPU turn
   */
  executeTurn() {
    this.view.showCpuTurn();
    
    const guess = this.#generateGuess();
    const coord = CoordinateUtils.parseGuess(guess);
    
    this.gameState.addCpuGuess(guess);
    
    return this.#processHit(guess, coord);
  }

  /**
   * Generate CPU guess based on current mode
   */
  #generateGuess() {
    if (this.gameState.cpuMode === this.config.CPU_MODES.TARGET && 
        this.gameState.cpuTargetQueue.length > 0) {
      
      return this.#getTargetedGuess();
    } else {
      return this.#getRandomGuess();
    }
  }

  /**
   * Get targeted guess from queue
   */
  #getTargetedGuess() {
    let guess;
    do {
      guess = this.gameState.getNextCpuTarget();
      if (!guess) {
        this.gameState.setCpuMode(this.config.CPU_MODES.HUNT);
        return this.#getRandomGuess();
      }
    } while (this.gameState.hasCpuGuessed(guess));

    this.view.showCpuTargets(guess);
    return guess;
  }

  /**
   * Generate random guess
   */
  #getRandomGuess() {
    this.gameState.setCpuMode(this.config.CPU_MODES.HUNT);
    
    let guess;
    do {
      const coord = RandomUtils.randomCoordinate();
      guess = CoordinateUtils.coordinateToString(coord.row, coord.col);
    } while (this.gameState.hasCpuGuessed(guess));

    return guess;
  }

  /**
   * Process CPU hit/miss
   */
  #processHit(guess, coord) {
    const hitShip = this.gameState.playerShips.find(ship => 
      ship.occupiesLocation(guess)
    );

    if (hitShip) {
      hitShip.takeHit(guess);
      this.gameState.playerBoard.markHit(coord.row, coord.col);
      this.view.showCpuHit(guess);

      if (hitShip.isSunk()) {
        this.view.showCpuSunkShip();
        this.gameState.sinkPlayerShip();
        this.gameState.setCpuMode(this.config.CPU_MODES.HUNT);
        this.gameState.clearCpuTargets();
        return { success: true, result: 'ship_sunk' };
      } else {
        this.#enterTargetMode(coord);
        return { success: true, result: 'hit' };
      }
    } else {
      this.gameState.playerBoard.markMiss(coord.row, coord.col);
      this.view.showCpuMiss(guess);
      
      if (this.gameState.cpuMode === this.config.CPU_MODES.TARGET && 
          this.gameState.cpuTargetQueue.length === 0) {
        this.gameState.setCpuMode(this.config.CPU_MODES.HUNT);
      }
      
      return { success: true, result: 'miss' };
    }
  }

  /**
   * Enter target mode and queue adjacent cells
   */
  #enterTargetMode(coord) {
    this.gameState.setCpuMode(this.config.CPU_MODES.TARGET);
    
    const adjacentCoords = CoordinateUtils.getAdjacentCoordinates(coord.row, coord.col);
    
    adjacentCoords.forEach(({ row, col }) => {
      if (CoordinateUtils.isValidCoordinate(row, col)) {
        const targetGuess = CoordinateUtils.coordinateToString(row, col);
        if (!this.gameState.hasCpuGuessed(targetGuess)) {
          this.gameState.addCpuTarget(targetGuess);
        }
      }
    });
  }
}

/**
 * Main game controller - coordinates overall game flow
 */
export class GameController {
  constructor(config = GAME_CONFIG) {
    this.config = config;
    this.gameState = new GameState(config);
    this.view = new GameView(config);
    
    this.shipPlacement = new ShipPlacementController(config);
    this.playerController = new PlayerController(this.gameState, this.view, config);
    this.cpuController = new CpuController(this.gameState, this.view, config);
  }

  /**
   * Initialize a new game
   */
  initializeGame() {
    this.view.showGameStart();
    this.gameState.reset();
    
    this.#setupBoards();
    this.#placeShips();
    
    return this.gameState;
  }

  /**
   * Setup game boards
   */
  #setupBoards() {
    this.gameState.playerBoard.reset();
    this.gameState.opponentBoard.reset();
    this.view.showBoardsCreated();
  }

  /**
   * Place ships for both players
   */
  #placeShips() {
    // Place player ships
    this.shipPlacement.placeShipsRandomly(
      this.gameState.playerBoard, 
      this.gameState.playerShips, 
      this.config.NUM_SHIPS
    );
    this.view.showShipsPlaced(this.config.NUM_SHIPS, 'Player');

    // Place CPU ships
    this.shipPlacement.placeShipsRandomly(
      this.gameState.opponentBoard, 
      this.gameState.cpuShips, 
      this.config.NUM_SHIPS
    );
    this.view.showShipsPlaced(this.config.NUM_SHIPS, 'CPU');
  }

  /**
   * Process player turn
   */
  processPlayerTurn(guess) {
    return this.playerController.processGuess(guess);
  }

  /**
   * Process CPU turn
   */
  processCpuTurn() {
    return this.cpuController.executeTurn();
  }

  /**
   * Check game end conditions
   */
  checkGameEnd() {
    if (this.gameState.hasPlayerWon()) {
      this.view.showPlayerWins();
      this.view.renderBoards(this.gameState.opponentBoard, this.gameState.playerBoard);
      return 'player_wins';
    }
    
    if (this.gameState.hasCpuWon()) {
      this.view.showCpuWins();
      this.view.renderBoards(this.gameState.opponentBoard, this.gameState.playerBoard);
      return 'cpu_wins';
    }
    
    return 'continue';
  }

  /**
   * Render current game state
   */
  renderGame() {
    this.view.renderBoards(this.gameState.opponentBoard, this.gameState.playerBoard);
  }

  /**
   * Get current game state
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Get game view
   */
  getView() {
    return this.view;
  }
}

export default { 
  GameController, 
  PlayerController, 
  CpuController, 
  ShipPlacementController 
}; 