/**
 * Game Controller Module
 * Orchestrates game flow and coordinates between model and view components
 * @fileoverview This module contains all controller classes responsible for game logic,
 * user input processing, AI behavior, and ship placement mechanics
 */

import { 
  GAME_CONFIG, 
  SHIP_ORIENTATIONS, 
  GAME_RESULTS, 
  TURN_RESULT_REASONS, 
  TURN_RESULT_TYPES 
} from '../config/GameConfig.js';
import { Ship, GameState } from '../models/GameModel.js';
import { GameView } from '../views/GameView.js';
import { 
  CoordinateUtils, 
  RandomUtils, 
  ValidationUtils, 
  CollectionUtils 
} from '../utils/GameUtils.js';

/**
 * Handles ship placement logic and collision detection
 * Responsible for randomly placing ships on the game board without overlaps
 */
export class ShipPlacementController {
  /**
   * Creates a new ship placement controller
   * @param {Object} [gameConfig=GAME_CONFIG] - Game configuration object
   */
  constructor(gameConfig = GAME_CONFIG) {
    this.gameConfig = gameConfig;
  }

  /**
   * Places multiple ships randomly on a board without overlaps
   * @param {Board} targetBoard - The board to place ships on
   * @param {Array<Ship>} shipsCollection - Array to store created ship objects
   * @param {number} numberOfShipsToPlace - Number of ships to place
   * @throws {Error} If unable to place all ships after maximum attempts
   * @example
   * const controller = new ShipPlacementController();
   * controller.placeMultipleShipsRandomly(board, ships, 3);
   */
  placeMultipleShipsRandomly(targetBoard, shipsCollection, numberOfShipsToPlace) {
    let successfullyPlacedShips = 0;
    let placementAttempts = 0;
    const maxAttempts = this.gameConfig.MAX_PLACEMENT_ATTEMPTS;
    
    while (successfullyPlacedShips < numberOfShipsToPlace && placementAttempts < maxAttempts) {
      placementAttempts++;
      
      const shipOrientation = RandomUtils.selectRandomShipOrientation();
      const startingPosition = RandomUtils.generateValidShipStartPosition(
        shipOrientation, 
        this.gameConfig.SHIP_LENGTH, 
        targetBoard.getSize()
      );
      
      const proposedShipLocations = this.#calculateShipLocationSequence(
        startingPosition.row, 
        startingPosition.col, 
        shipOrientation
      );
      
      if (this.#validateShipPlacementIsLegal(targetBoard, proposedShipLocations)) {
        const newShip = new Ship(proposedShipLocations);
        this.#commitShipToBoard(targetBoard, proposedShipLocations);
        shipsCollection.push(newShip);
        successfullyPlacedShips++;
      }
    }

    if (successfullyPlacedShips < numberOfShipsToPlace) {
      throw new Error(`Failed to place ${numberOfShipsToPlace} ships after ${maxAttempts} attempts`);
    }
  }

  /**
   * Legacy alias for placeMultipleShipsRandomly - maintained for backward compatibility
   * @deprecated Use placeMultipleShipsRandomly instead
   * @param {Board} board - Target board
   * @param {Array<Ship>} ships - Ships collection
   * @param {number} count - Number of ships
   */
  placeShipsRandomly(board, ships, count) {
    this.placeMultipleShipsRandomly(board, ships, count);
  }

  /**
   * Calculates all coordinate locations for a ship based on start position and orientation
   * @private
   * @param {number} startRow - Starting row coordinate
   * @param {number} startColumn - Starting column coordinate
   * @param {string} shipOrientation - Ship orientation (horizontal or vertical)
   * @returns {Array<string>} Array of coordinate strings for the ship
   */
  #calculateShipLocationSequence(startRow, startColumn, shipOrientation) {
    const shipLocations = [];
    
    for (let segmentIndex = 0; segmentIndex < this.gameConfig.SHIP_LENGTH; segmentIndex++) {
      const segmentRow = shipOrientation === SHIP_ORIENTATIONS.HORIZONTAL ? 
        startRow : startRow + segmentIndex;
      const segmentColumn = shipOrientation === SHIP_ORIENTATIONS.HORIZONTAL ? 
        startColumn + segmentIndex : startColumn;
      
      shipLocations.push(CoordinateUtils.formatCoordinateAsString(segmentRow, segmentColumn));
    }
    
    return shipLocations;
  }

  /**
   * Validates that a ship can be placed at the proposed locations without collisions
   * @private
   * @param {Board} gameBoard - The board to check against
   * @param {Array<string>} proposedLocations - Locations where ship would be placed
   * @returns {boolean} True if placement is valid (no collisions)
   */
  #validateShipPlacementIsLegal(gameBoard, proposedLocations) {
    return proposedLocations.every(locationString => {
      const coordinatePosition = CoordinateUtils.parsePlayerGuess(locationString);
      return coordinatePosition && gameBoard.isEmpty(coordinatePosition.row, coordinatePosition.col);
    });
  }

  /**
   * Places ship markers on the board at specified locations
   * @private
   * @param {Board} gameBoard - The board to modify
   * @param {Array<string>} shipLocations - Locations to mark as occupied by ship
   */
  #commitShipToBoard(gameBoard, shipLocations) {
    shipLocations.forEach(locationString => {
      const coordinatePosition = CoordinateUtils.parsePlayerGuess(locationString);
      if (coordinatePosition) {
        gameBoard.placeShip(coordinatePosition.row, coordinatePosition.col);
      }
    });
  }
}

/**
 * Handles player turn logic including input validation and hit processing
 * Manages all aspects of processing human player actions and moves
 */
export class PlayerController {
  /**
   * Creates a new player controller
   * @param {GameState} gameState - Current game state
   * @param {GameView} gameView - View for displaying messages
   * @param {Object} [gameConfig=GAME_CONFIG] - Game configuration
   */
  constructor(gameState, gameView, gameConfig = GAME_CONFIG) {
    this.gameState = gameState;
    this.gameView = gameView;
    this.gameConfig = gameConfig;
  }

  /**
   * Processes a player's guess attempt with comprehensive validation
   * @param {string} playerGuessInput - Raw input from player (should be two digits)
   * @returns {Object} Result object with success status, result type, and reason
   * @example
   * const result = controller.processPlayerGuessAttempt("05");
   * // Returns: { success: true, result: 'hit', reason: null }
   */
  processPlayerGuessAttempt(playerGuessInput) {
    // Phase 1: Validate input format
    const formatValidationResult = this.#validatePlayerInputFormat(playerGuessInput);
    if (!formatValidationResult.isValid) {
      return formatValidationResult.errorResponse;
    }

    // Phase 2: Parse and validate coordinates
    const coordinateValidationResult = this.#validateAndParseCoordinates(playerGuessInput);
    if (!coordinateValidationResult.isValid) {
      return coordinateValidationResult.errorResponse;
    }

    // Phase 3: Check for duplicate guess
    const duplicateCheckResult = this.#checkForDuplicateGuess(playerGuessInput);
    if (!duplicateCheckResult.isValid) {
      return duplicateCheckResult.errorResponse;
    }

    // Phase 4: Record the guess and process hit/miss
    this.gameState.addPlayerGuess(playerGuessInput);
    return this.#processHitDetectionAndBoardUpdate(playerGuessInput, coordinateValidationResult.coordinates);
  }

  /**
   * Legacy alias for processPlayerGuessAttempt - maintained for backward compatibility
   * @deprecated Use processPlayerGuessAttempt instead
   * @param {string} guess - Player guess
   * @returns {Object} Processing result
   */
  processGuess(guess) {
    return this.processPlayerGuessAttempt(guess);
  }

  /**
   * Validates the format of player input
   * @private
   * @param {string} inputString - Raw player input
   * @returns {Object} Validation result with isValid flag and potential error response
   */
  #validatePlayerInputFormat(inputString) {
    if (!ValidationUtils.isPlayerGuessFormatValid(inputString)) {
      this.gameView.showInvalidInput();
      return {
        isValid: false,
        errorResponse: { 
          success: false, 
          reason: TURN_RESULT_REASONS.INVALID_FORMAT,
          message: this.gameConfig.MESSAGES.INVALID_INPUT
        }
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validates and parses coordinate values from input string
   * @private
   * @param {string} inputString - Validated input string
   * @returns {Object} Validation result with coordinates if valid
   */
  #validateAndParseCoordinates(inputString) {
    const parsedCoordinates = CoordinateUtils.parsePlayerGuess(inputString);
    
    if (!parsedCoordinates || 
        !ValidationUtils.areGuessCoordinatesValid(parsedCoordinates.row, parsedCoordinates.col)) {
      this.gameView.showInvalidCoordinates();
      return {
        isValid: false,
        errorResponse: { 
          success: false, 
          reason: TURN_RESULT_REASONS.INVALID_COORDINATES,
          message: this.gameConfig.MESSAGES.INVALID_COORDINATES(this.gameConfig.BOARD_SIZE - 1)
        }
      };
    }
    
    return { 
      isValid: true, 
      coordinates: parsedCoordinates 
    };
  }

  /**
   * Checks if the player has already made this guess
   * @private
   * @param {string} guessString - The guess to check
   * @returns {Object} Validation result
   */
  #checkForDuplicateGuess(guessString) {
    if (this.gameState.hasPlayerGuessed(guessString)) {
      this.gameView.showAlreadyGuessed();
      return {
        isValid: false,
        errorResponse: { 
          success: false, 
          reason: TURN_RESULT_REASONS.DUPLICATE_GUESS,
          message: this.gameConfig.MESSAGES.ALREADY_GUESSED
        }
      };
    }
    
    return { isValid: true };
  }

  /**
   * Processes hit detection and updates the board accordingly
   * @private
   * @param {string} guessString - The coordinate guess as string
   * @param {Object} coordinatePosition - Parsed coordinate object
   * @returns {Object} Result of the hit processing
   */
  #processHitDetectionAndBoardUpdate(guessString, coordinatePosition) {
    // Search for a ship at this location
    const targetShip = this.gameState.cpuShips.find(ship => 
      ship.occupiesLocation(guessString)
    );

    if (targetShip) {
      return this.#handleSuccessfulHit(targetShip, guessString, coordinatePosition);
    } else {
      return this.#handleMissedShot(coordinatePosition);
    }
  }

  /**
   * Handles the logic when player successfully hits a ship
   * @private
   * @param {Ship} hitShip - The ship that was hit
   * @param {string} guessString - The guess coordinate string
   * @param {Object} coordinatePosition - The coordinate position object
   * @returns {Object} Hit processing result
   */
  #handleSuccessfulHit(hitShip, guessString, coordinatePosition) {
    // Check if this location was already hit
    if (hitShip.isLocationHit(guessString)) {
      this.gameView.showAlreadyHit();
      return { 
        success: true, 
        result: TURN_RESULT_TYPES.ALREADY_HIT,
        message: this.gameConfig.MESSAGES.ALREADY_HIT
      };
    }

    // Record the new hit
    hitShip.takeHit(guessString);
    this.gameState.opponentBoard.markHit(coordinatePosition.row, coordinatePosition.col);
    this.gameView.showPlayerHit();

    // Check if the ship is completely sunk
    if (hitShip.isSunk()) {
      this.gameView.showShipSunk();
      this.gameState.sinkCpuShip();
      return { 
        success: true, 
        result: TURN_RESULT_TYPES.SHIP_SUNK,
        message: this.gameConfig.MESSAGES.SHIP_SUNK
      };
    }

    return { 
      success: true, 
      result: TURN_RESULT_TYPES.HIT,
      message: this.gameConfig.MESSAGES.PLAYER_HIT
    };
  }

  /**
   * Handles the logic when player misses (no ship at location)
   * @private
   * @param {Object} coordinatePosition - The coordinate position object
   * @returns {Object} Miss processing result
   */
  #handleMissedShot(coordinatePosition) {
    this.gameState.opponentBoard.markMiss(coordinatePosition.row, coordinatePosition.col);
    this.gameView.showPlayerMiss();
    return { 
      success: true, 
      result: TURN_RESULT_TYPES.MISS,
      message: this.gameConfig.MESSAGES.PLAYER_MISS
    };
  }
}

/**
 * Handles CPU artificial intelligence logic and decision making
 * Implements intelligent targeting strategies for computer opponent
 */
export class CpuController {
  /**
   * Creates a new CPU controller
   * @param {GameState} gameState - Current game state
   * @param {GameView} gameView - View for displaying messages
   * @param {Object} [gameConfig=GAME_CONFIG] - Game configuration
   */
  constructor(gameState, gameView, gameConfig = GAME_CONFIG) {
    this.gameState = gameState;
    this.gameView = gameView;
    this.gameConfig = gameConfig;
  }

  /**
   * Executes a complete CPU turn including guess generation and hit processing
   * @returns {Object} Result of the CPU turn with success status and outcome
   * @example
   * const result = cpuController.executeCompleteCpuTurn();
   * // Returns: { success: true, result: 'hit', targetLocation: '45' }
   */
  executeCompleteCpuTurn() {
    this.gameView.showCpuTurn();
    
    const selectedTargetLocation = this.#generateIntelligentCpuGuess();
    const targetCoordinates = CoordinateUtils.parsePlayerGuess(selectedTargetLocation);
    
    this.gameState.addCpuGuess(selectedTargetLocation);
    
    return this.#processCpuHitDetectionAndResponse(selectedTargetLocation, targetCoordinates);
  }

  /**
   * Legacy alias for executeCompleteCpuTurn - maintained for backward compatibility
   * @deprecated Use executeCompleteCpuTurn instead
   * @returns {Object} CPU turn result
   */
  executeTurn() {
    return this.executeCompleteCpuTurn();
  }

  /**
   * Generates an intelligent guess based on current CPU strategy mode
   * @private
   * @returns {string} Coordinate string for CPU's next guess
   */
  #generateIntelligentCpuGuess() {
    const isInTargetingMode = this.gameState.cpuMode === this.gameConfig.CPU_MODES.TARGET && 
                              this.gameState.cpuTargetQueue.length > 0;
    
    if (isInTargetingMode) {
      return this.#selectTargetedGuessFromQueue();
    } else {
      return this.#generateRandomHuntingGuess();
    }
  }

  /**
   * Selects the next guess from the targeting queue (when pursuing a hit ship)
   * @private
   * @returns {string} Next targeted coordinate guess
   */
  #selectTargetedGuessFromQueue() {
    let proposedGuess;
    
    do {
      proposedGuess = this.gameState.getNextCpuTarget();
      
      if (!proposedGuess) {
        // No more targets in queue, switch back to hunting mode
        this.gameState.setCpuMode(this.gameConfig.CPU_MODES.HUNT);
        return this.#generateRandomHuntingGuess();
      }
    } while (this.gameState.hasCpuGuessed(proposedGuess));

    this.gameView.showCpuTargets(proposedGuess);
    return proposedGuess;
  }

  /**
   * Generates a random guess for hunting mode (no active targets)
   * @private
   * @returns {string} Random coordinate guess
   */
  #generateRandomHuntingGuess() {
    this.gameState.setCpuMode(this.gameConfig.CPU_MODES.HUNT);
    
    let randomGuess;
    do {
      const randomCoordinates = RandomUtils.generateRandomBoardPosition();
      randomGuess = CoordinateUtils.formatCoordinateAsString(
        randomCoordinates.row, 
        randomCoordinates.col
      );
    } while (this.gameState.hasCpuGuessed(randomGuess));

    return randomGuess;
  }

  /**
   * Processes CPU hit detection and generates appropriate response
   * @private
   * @param {string} guessLocation - CPU's guess coordinate string
   * @param {Object} targetCoordinates - Parsed coordinate object
   * @returns {Object} Hit processing result
   */
  #processCpuHitDetectionAndResponse(guessLocation, targetCoordinates) {
    const targetedPlayerShip = this.gameState.playerShips.find(ship => 
      ship.occupiesLocation(guessLocation)
    );

    if (targetedPlayerShip) {
      return this.#handleCpuSuccessfulHit(targetedPlayerShip, guessLocation, targetCoordinates);
    } else {
      return this.#handleCpuMissedShot(guessLocation, targetCoordinates);
    }
  }

  /**
   * Handles CPU successful hit including AI strategy updates
   * @private
   * @param {Ship} hitPlayerShip - The player ship that was hit
   * @param {string} hitLocation - Location coordinate string
   * @param {Object} hitCoordinates - Coordinate object
   * @returns {Object} Hit result with strategy updates
   */
  #handleCpuSuccessfulHit(hitPlayerShip, hitLocation, hitCoordinates) {
    hitPlayerShip.takeHit(hitLocation);
    this.gameState.playerBoard.markHit(hitCoordinates.row, hitCoordinates.col);
    this.gameView.showCpuHit(hitLocation);

    if (hitPlayerShip.isSunk()) {
      return this.#handleCpuShipSinking();
    } else {
      this.#activateIntelligentTargetingMode(hitCoordinates);
      return { 
        success: true, 
        result: TURN_RESULT_TYPES.HIT,
        targetLocation: hitLocation
      };
    }
  }

  /**
   * Handles when CPU completely sinks a player ship
   * @private
   * @returns {Object} Ship sinking result
   */
  #handleCpuShipSinking() {
    this.gameView.showCpuSunkShip();
    this.gameState.sinkPlayerShip();
    this.gameState.setCpuMode(this.gameConfig.CPU_MODES.HUNT);
    this.gameState.clearCpuTargets();
    
    return { 
      success: true, 
      result: TURN_RESULT_TYPES.SHIP_SUNK,
      message: this.gameConfig.MESSAGES.CPU_SUNK_SHIP
    };
  }

  /**
   * Handles CPU missed shot and strategy adjustments
   * @private
   * @param {string} missLocation - Location where CPU missed
   * @param {Object} missCoordinates - Coordinate object for miss
   * @returns {Object} Miss result
   */
  #handleCpuMissedShot(missLocation, missCoordinates) {
    this.gameState.playerBoard.markMiss(missCoordinates.row, missCoordinates.col);
    this.gameView.showCpuMiss(missLocation);
    
    // If in targeting mode but queue is empty, switch back to hunting
    if (this.gameState.cpuMode === this.gameConfig.CPU_MODES.TARGET && 
        this.gameState.cpuTargetQueue.length === 0) {
      this.gameState.setCpuMode(this.gameConfig.CPU_MODES.HUNT);
    }
    
    return { 
      success: true, 
      result: TURN_RESULT_TYPES.MISS,
      targetLocation: missLocation
    };
  }

  /**
   * Activates intelligent targeting mode and queues adjacent cells for investigation
   * @private
   * @param {Object} hitCoordinates - Coordinates of the successful hit
   */
  #activateIntelligentTargetingMode(hitCoordinates) {
    this.gameState.setCpuMode(this.gameConfig.CPU_MODES.TARGET);
    
    const adjacentPositions = CoordinateUtils.getAdjacentPositions(
      hitCoordinates.row, 
      hitCoordinates.col
    );
    
    adjacentPositions.forEach(({ row, col }) => {
      if (CoordinateUtils.areCoordinatesValid(row, col)) {
        const adjacentGuessString = CoordinateUtils.formatCoordinateAsString(row, col);
        
        if (!this.gameState.hasCpuGuessed(adjacentGuessString)) {
          this.gameState.addCpuTarget(adjacentGuessString);
        }
      }
    });
  }
}

/**
 * Main game controller that orchestrates overall game flow and coordination
 * Manages the complete game lifecycle from initialization to completion
 */
export class GameController {
  /**
   * Creates a new game controller with all necessary sub-controllers
   * @param {Object} [gameConfig=GAME_CONFIG] - Game configuration object
   */
  constructor(gameConfig = GAME_CONFIG) {
    this.gameConfig = gameConfig;
    this.gameState = new GameState(gameConfig);
    this.gameView = new GameView(gameConfig);
    
    // Initialize specialized controllers
    this.shipPlacementController = new ShipPlacementController(gameConfig);
    this.playerTurnController = new PlayerController(this.gameState, this.gameView, gameConfig);
    this.cpuIntelligenceController = new CpuController(this.gameState, this.gameView, gameConfig);
  }

  /**
   * Legacy property names for backward compatibility
   * @deprecated Use the new descriptive property names instead
   */
  get shipPlacement() { return this.shipPlacementController; }
  get playerController() { return this.playerTurnController; }
  get cpuController() { return this.cpuIntelligenceController; }

  /**
   * Initializes a complete new game including setup and ship placement
   * @returns {GameState} The initialized game state
   * @example
   * const gameState = controller.initializeCompleteNewGame();
   */
  initializeCompleteNewGame() {
    this.gameView.showGameStart();
    this.gameState.reset();
    
    this.#performInitialBoardSetup();
    this.#executeShipPlacementForBothPlayers();
    
    return this.gameState;
  }

  /**
   * Legacy alias for initializeCompleteNewGame - maintained for backward compatibility
   * @deprecated Use initializeCompleteNewGame instead
   * @returns {GameState} Game state
   */
  initializeGame() {
    return this.initializeCompleteNewGame();
  }

  /**
   * Sets up clean game boards for both players
   * @private
   */
  #performInitialBoardSetup() {
    this.gameState.playerBoard.reset();
    this.gameState.opponentBoard.reset();
    this.gameView.showBoardsCreated();
  }

  /**
   * Places ships randomly for both human and CPU players
   * @private
   */
  #executeShipPlacementForBothPlayers() {
    // Place ships for human player
    this.shipPlacementController.placeMultipleShipsRandomly(
      this.gameState.playerBoard, 
      this.gameState.playerShips, 
      this.gameConfig.NUM_SHIPS
    );
    this.gameView.showShipsPlaced(this.gameConfig.NUM_SHIPS, 'Player');

    // Place ships for CPU opponent
    this.shipPlacementController.placeMultipleShipsRandomly(
      this.gameState.opponentBoard, 
      this.gameState.cpuShips, 
      this.gameConfig.NUM_SHIPS
    );
    this.gameView.showShipsPlaced(this.gameConfig.NUM_SHIPS, 'CPU');
  }

  /**
   * Processes a complete player turn with validation and feedback
   * @param {string} playerGuessInput - Raw player input
   * @returns {Object} Complete turn result
   */
  processPlayerTurn(playerGuessInput) {
    return this.playerTurnController.processPlayerGuessAttempt(playerGuessInput);
  }

  /**
   * Processes a complete CPU turn with AI decision making
   * @returns {Object} Complete CPU turn result
   */
  processCpuTurn() {
    return this.cpuIntelligenceController.executeCompleteCpuTurn();
  }

  /**
   * Checks current game state for win/loss/continue conditions
   * @returns {string} Game result status from GAME_RESULTS enum
   * @example
   * const result = controller.evaluateGameEndConditions();
   * // Returns: 'player_wins', 'cpu_wins', or 'continue'
   */
  evaluateGameEndConditions() {
    if (this.gameState.hasPlayerWon()) {
      this.gameView.showPlayerWins();
      this.gameView.renderBoards(this.gameState.opponentBoard, this.gameState.playerBoard);
      return GAME_RESULTS.PLAYER_WINS;
    }
    
    if (this.gameState.hasCpuWon()) {
      this.gameView.showCpuWins();
      this.gameView.renderBoards(this.gameState.opponentBoard, this.gameState.playerBoard);
      return GAME_RESULTS.CPU_WINS;
    }
    
    return GAME_RESULTS.CONTINUE;
  }

  /**
   * Legacy alias for evaluateGameEndConditions - maintained for backward compatibility
   * @deprecated Use evaluateGameEndConditions instead
   * @returns {string} Game result
   */
  checkGameEnd() {
    return this.evaluateGameEndConditions();
  }

  /**
   * Renders the current state of both game boards
   */
  renderCurrentGameState() {
    this.gameView.renderBoards(this.gameState.opponentBoard, this.gameState.playerBoard);
  }

  /**
   * Legacy alias for renderCurrentGameState - maintained for backward compatibility
   * @deprecated Use renderCurrentGameState instead
   */
  renderGame() {
    this.renderCurrentGameState();
  }

  /**
   * Gets the current game state object
   * @returns {GameState} Current game state
   */
  getCurrentGameState() {
    return this.gameState;
  }

  /**
   * Legacy alias for getCurrentGameState - maintained for backward compatibility
   * @deprecated Use getCurrentGameState instead
   * @returns {GameState} Game state
   */
  getGameState() {
    return this.getCurrentGameState();
  }

  /**
   * Gets the game view object for display operations
   * @returns {GameView} Current game view
   */
  getGameView() {
    return this.gameView;
  }

  /**
   * Legacy alias for getGameView - maintained for backward compatibility
   * @deprecated Use getGameView instead
   * @returns {GameView} Game view
   */
  getView() {
    return this.getGameView();
  }
}

export default { 
  GameController, 
  PlayerController, 
  CpuController, 
  ShipPlacementController 
}; 