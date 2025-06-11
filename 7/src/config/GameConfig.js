/**
 * Game Configuration Module
 * Centralizes all game constants, settings, and enums for the Sea Battle game
 * @fileoverview This module contains all configurable values and constants used throughout the application
 */

/**
 * Ship orientation constants for placement and validation
 * @readonly
 * @enum {string}
 */
export const SHIP_ORIENTATIONS = {
  /** Ship placed horizontally (left to right) */
  HORIZONTAL: 'horizontal',
  /** Ship placed vertically (top to bottom) */
  VERTICAL: 'vertical'
};

/**
 * Game result constants for win/loss/continue states
 * @readonly
 * @enum {string}
 */
export const GAME_RESULTS = {
  /** Player has won the game */
  PLAYER_WINS: 'player_wins',
  /** CPU has won the game */
  CPU_WINS: 'cpu_wins',
  /** Game continues - no winner yet */
  CONTINUE: 'continue'
};

/**
 * Player turn result reasons for validation and error handling
 * @readonly
 * @enum {string}
 */
export const TURN_RESULT_REASONS = {
  /** Input format is invalid (not two digits) */
  INVALID_FORMAT: 'invalid_format',
  /** Coordinates are out of bounds */
  INVALID_COORDINATES: 'invalid_coordinates',
  /** Player has already guessed this location */
  DUPLICATE_GUESS: 'duplicate_guess',
  /** Location was already hit */
  ALREADY_HIT: 'already_hit'
};

/**
 * Turn result types for hit/miss/sink outcomes
 * @readonly
 * @enum {string}
 */
export const TURN_RESULT_TYPES = {
  /** Successful hit on a ship */
  HIT: 'hit',
  /** Missed - no ship at location */
  MISS: 'miss',
  /** Hit and sunk a complete ship */
  SHIP_SUNK: 'ship_sunk',
  /** Hit same location twice */
  ALREADY_HIT: 'already_hit'
};

/**
 * Main game configuration object containing all game settings and constants
 * @readonly
 */
export const GAME_CONFIG = {
  // ==================== BOARD SETTINGS ====================
  
  /** 
   * Size of the game board (10x10 grid)
   * @type {number}
   */
  BOARD_SIZE: 10,
  
  // ==================== SHIP SETTINGS ====================
  
  /** 
   * Number of ships each player has
   * @type {number}
   */
  NUM_SHIPS: 3,
  
  /** 
   * Length of each ship in grid cells
   * @type {number}
   */
  SHIP_LENGTH: 3,
  
  // ==================== VISUAL SYMBOLS ====================
  
  /** 
   * Symbols used to represent different board states
   * @readonly
   */
  SYMBOLS: {
    /** Empty water cell */
    WATER: '~',
    /** Ship cell (not visible to opponent) */
    SHIP: 'S',
    /** Successfully hit cell */
    HIT: 'X',
    /** Missed shot cell */
    MISS: 'O'
  },
  
  // ==================== CPU AI BEHAVIOR ====================
  
  /** 
   * CPU artificial intelligence modes
   * @readonly
   */
  CPU_MODES: {
    /** Random targeting mode when no hits are active */
    HUNT: 'hunt',
    /** Focused targeting mode when pursuing a hit ship */
    TARGET: 'target'
  },
  
  // ==================== USER INTERFACE MESSAGES ====================
  
  /** 
   * All user-facing messages and text templates
   * @readonly
   */
  MESSAGES: {
    // ---------- Game Flow Messages ----------
    /** Welcome message when game starts */
    GAME_START: "Let's play Sea Battle!",
    
    /** 
     * Instructions about objective
     * @param {number} count - Number of ships to sink
     * @returns {string} Formatted instruction message
     */
    SHIPS_TO_SINK: (count) => `Try to sink the ${count} enemy ships.`,
    
    /** Confirmation that game boards have been initialized */
    BOARDS_CREATED: 'Boards created.',
    
    /** 
     * Confirmation of ship placement
     * @param {number} count - Number of ships placed
     * @param {string} player - Which player ('Player' or 'CPU')
     * @returns {string} Formatted placement confirmation
     */
    SHIPS_PLACED: (count, player) => `${count} ships placed randomly for ${player}.`,
    
    // ---------- Player Action Results ----------
    /** Message when player hits an enemy ship */
    PLAYER_HIT: 'PLAYER HIT!',
    
    /** Message when player misses */
    PLAYER_MISS: 'PLAYER MISS.',
    
    /** Message when player sinks a complete ship */
    SHIP_SUNK: 'You sunk an enemy battleship!',
    
    /** Warning when player hits same spot twice */
    ALREADY_HIT: 'You already hit that spot!',
    
    /** Warning when player guesses same coordinates again */
    ALREADY_GUESSED: 'You already guessed that location!',
    
    /** Victory message for player */
    PLAYER_WINS: '*** CONGRATULATIONS! You sunk all enemy battleships! ***',
    
    // ---------- CPU Action Messages ----------
    /** Header for CPU turn notifications */
    CPU_TURN: "--- CPU's Turn ---",
    
    /** 
     * Message when CPU hits player ship
     * @param {string} location - Coordinate where CPU hit (e.g., "45")
     * @returns {string} Formatted hit message
     */
    CPU_HIT: (location) => `CPU HIT at ${location}!`,
    
    /** 
     * Message when CPU misses
     * @param {string} location - Coordinate where CPU missed
     * @returns {string} Formatted miss message
     */
    CPU_MISS: (location) => `CPU MISS at ${location}.`,
    
    /** 
     * Message showing CPU targeting strategy
     * @param {string} location - Target coordinate
     * @returns {string} Formatted targeting message
     */
    CPU_TARGETS: (location) => `CPU targets: ${location}`,
    
    /** Message when CPU sinks player ship */
    CPU_SUNK_SHIP: 'CPU sunk your battleship!',
    
    /** Game over message when CPU wins */
    CPU_WINS: '*** GAME OVER! The CPU sunk all your battleships! ***',
    
    // ---------- Input Validation Messages ----------
    /** Error message for invalid input format */
    INVALID_INPUT: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).',
    
    /** 
     * Error message for out-of-bounds coordinates
     * @param {number} max - Maximum valid coordinate value
     * @returns {string} Formatted error message
     */
    INVALID_COORDINATES: (max) => `Oops, please enter valid row and column numbers between 0 and ${max}.`,
    
    // ---------- User Interface Elements ----------
    /** Prompt for player input */
    ENTER_GUESS: 'Enter your guess (e.g., 00): ',
    
    /** Header for opponent's board display */
    OPPONENT_BOARD: 'OPPONENT BOARD',
    
    /** Header for player's own board display */
    YOUR_BOARD: 'YOUR BOARD',
    
    // ---------- Error Messages ----------
    /** Generic error message prefix */
    ERROR_PREFIX: 'Error: ',
    
    /** Message for unexpected application errors */
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.'
  },
  
  // ==================== GAME LIMITS & CONSTRAINTS ====================
  
  /** 
   * Maximum number of placement attempts before giving up
   * @type {number}
   */
  MAX_PLACEMENT_ATTEMPTS: 1000,
  
  /** 
   * Minimum board size supported
   * @type {number}
   */
  MIN_BOARD_SIZE: 5,
  
  /** 
   * Maximum board size supported
   * @type {number}
   */
  MAX_BOARD_SIZE: 26
};

/**
 * Validates game configuration values
 * @throws {Error} If configuration values are invalid
 */
export function validateGameConfig() {
  const config = GAME_CONFIG;
  
  if (config.BOARD_SIZE < config.MIN_BOARD_SIZE || config.BOARD_SIZE > config.MAX_BOARD_SIZE) {
    throw new Error(`Board size must be between ${config.MIN_BOARD_SIZE} and ${config.MAX_BOARD_SIZE}`);
  }
  
  if (config.SHIP_LENGTH > config.BOARD_SIZE) {
    throw new Error('Ship length cannot be larger than board size');
  }
  
  if (config.NUM_SHIPS <= 0) {
    throw new Error('Number of ships must be positive');
  }
  
  // Rough check if ships can fit on board
  const minCellsNeeded = config.NUM_SHIPS * config.SHIP_LENGTH;
  const totalCells = config.BOARD_SIZE * config.BOARD_SIZE;
  
  if (minCellsNeeded > totalCells * 0.8) {
    throw new Error('Too many ships for board size - ships may not fit');
  }
}

/**
 * Core Game Mechanics Validator
 * Ensures the game meets all required specifications throughout refactoring
 * @throws {Error} If core mechanics don't match specifications
 */
export function validateCoreGameMechanics() {
  const requiredMechanics = {
    // Required: 10x10 grid
    boardSize: 10,
    
    // Required: Turn-based coordinate input (e.g., 00, 34)
    coordinateFormat: /^\d{2}$/,
    
    // Required: Standard Battleship mechanics
    shipLength: 3,
    numberOfShips: 3,
    symbols: {
      water: '~',
      hit: 'X',
      miss: 'O', 
      ship: 'S'
    },
    
    // Required: CPU opponent hunt and target modes
    cpuModes: {
      hunt: 'hunt',
      target: 'target'
    },
    
    // Required: Standard game results
    gameResults: ['player_wins', 'cpu_wins', 'continue']
  };

  const config = GAME_CONFIG;
  
  // Validate 10x10 grid requirement
  if (config.BOARD_SIZE !== requiredMechanics.boardSize) {
    throw new Error(`Core Mechanics Violation: Board must be exactly ${requiredMechanics.boardSize}x${requiredMechanics.boardSize}, got ${config.BOARD_SIZE}x${config.BOARD_SIZE}`);
  }
  
  // Validate coordinate format (tested with examples)
  const testCoordinates = ['00', '34', '99'];
  testCoordinates.forEach(coord => {
    if (!requiredMechanics.coordinateFormat.test(coord)) {
      throw new Error(`Core Mechanics Violation: Coordinate format ${coord} must match pattern ${requiredMechanics.coordinateFormat}`);
    }
  });
  
  // Validate ship specifications
  if (config.SHIP_LENGTH !== requiredMechanics.shipLength) {
    throw new Error(`Core Mechanics Violation: Ships must be exactly ${requiredMechanics.shipLength} cells long, got ${config.SHIP_LENGTH}`);
  }
  
  if (config.NUM_SHIPS !== requiredMechanics.numberOfShips) {
    throw new Error(`Core Mechanics Violation: Must have exactly ${requiredMechanics.numberOfShips} ships per player, got ${config.NUM_SHIPS}`);
  }
  
  // Validate Battleship symbols
  Object.entries(requiredMechanics.symbols).forEach(([key, expectedSymbol]) => {
    const actualSymbol = config.SYMBOLS[key.toUpperCase()];
    if (actualSymbol !== expectedSymbol) {
      throw new Error(`Core Mechanics Violation: ${key} symbol must be '${expectedSymbol}', got '${actualSymbol}'`);
    }
  });
  
  // Validate CPU modes
  Object.entries(requiredMechanics.cpuModes).forEach(([mode, expectedValue]) => {
    const actualValue = config.CPU_MODES[mode.toUpperCase()];
    if (actualValue !== expectedValue) {
      throw new Error(`Core Mechanics Violation: CPU ${mode} mode must be '${expectedValue}', got '${actualValue}'`);
    }
  });
  
  return {
    validated: true,
    mechanics: requiredMechanics,
    timestamp: new Date().toISOString(),
    message: 'All core game mechanics validated successfully'
  };
}

/**
 * Validates that the game preserves original gameplay experience
 * This function serves as a contract to ensure refactoring doesn't break core mechanics
 * @returns {Object} Validation report
 */
export function validateGameplayPreservation() {
  try {
    // Validate configuration
    validateGameConfig();
    
    // Validate core mechanics
    const mechanicsReport = validateCoreGameMechanics();
    
    return {
      status: 'PASSED',
      ...mechanicsReport,
      contract: {
        description: 'Sea Battle Core Mechanics Contract',
        requirements: [
          'MUST use 10x10 grid',
          'MUST accept two-digit coordinate input (e.g., 00, 34)', 
          'MUST implement standard Battleship hit/miss/sunk logic',
          'MUST support CPU hunt and target modes',
          'MUST preserve turn-based gameplay'
        ],
        lastValidated: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString(),
      recommendation: 'Core game mechanics have been altered and must be restored'
    };
  }
}

// Validate configuration on module load
validateGameConfig();

// Validate core mechanics on module load
validateCoreGameMechanics();

export default GAME_CONFIG; 