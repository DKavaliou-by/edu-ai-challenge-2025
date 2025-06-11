/**
 * Game Utilities Module
 * Contains pure helper functions for game operations including coordinate handling,
 * random number generation, validation, and collection utilities
 * @fileoverview This module provides stateless utility functions used throughout the Sea Battle game
 */

import { GAME_CONFIG, SHIP_ORIENTATIONS } from '../config/GameConfig.js';

/**
 * Coordinate and spatial calculation utilities
 * Handles all coordinate-related operations including validation, parsing, and adjacency calculations
 */
export class CoordinateUtils {
  /**
   * Validates if coordinates are within the game board boundaries
   * @param {number} row - The row coordinate (0-based)
   * @param {number} column - The column coordinate (0-based)
   * @param {number} [boardSize=GAME_CONFIG.BOARD_SIZE] - Size of the game board
   * @returns {boolean} True if coordinates are valid and within bounds
   * @example
   * CoordinateUtils.areCoordinatesValid(0, 0); // true
   * CoordinateUtils.areCoordinatesValid(-1, 5); // false
   * CoordinateUtils.areCoordinatesValid(5, 10); // false (assuming 10x10 board)
   */
  static areCoordinatesValid(row, column, boardSize = GAME_CONFIG.BOARD_SIZE) {
    return Number.isInteger(row) && Number.isInteger(column) &&
           row >= 0 && row < boardSize && 
           column >= 0 && column < boardSize;
  }

  /**
   * Legacy alias for areCoordinatesValid - maintained for backward compatibility
   * @deprecated Use areCoordinatesValid instead
   * @param {number} row - The row coordinate
   * @param {number} col - The column coordinate
   * @param {number} [boardSize=GAME_CONFIG.BOARD_SIZE] - Size of the game board
   * @returns {boolean} True if coordinates are valid
   */
  static isValidCoordinate(row, col, boardSize = GAME_CONFIG.BOARD_SIZE) {
    return this.areCoordinatesValid(row, col, boardSize);
  }

  /**
   * Converts a two-character string guess to a coordinate object
   * @param {string} playerGuess - Two-digit string representing coordinates (e.g., "05", "34")
   * @returns {Object|null} Coordinate object with row and col properties, or null if invalid
   * @example
   * CoordinateUtils.parsePlayerGuess("05"); // { row: 0, col: 5 }
   * CoordinateUtils.parsePlayerGuess("99"); // { row: 9, col: 9 }
   * CoordinateUtils.parsePlayerGuess("abc"); // null
   */
  static parsePlayerGuess(playerGuess) {
    // Validate input format
    if (!playerGuess || typeof playerGuess !== 'string' || playerGuess.length !== 2) {
      return null;
    }
    
    const rowCharacter = playerGuess[0];
    const columnCharacter = playerGuess[1];
    
    const row = parseInt(rowCharacter, 10);
    const column = parseInt(columnCharacter, 10);
    
    // Check if parsing was successful
    if (!Number.isInteger(row) || !Number.isInteger(column)) {
      return null;
    }
    
    return { row, col: column };
  }

  /**
   * Legacy alias for parsePlayerGuess - maintained for backward compatibility
   * @deprecated Use parsePlayerGuess instead
   * @param {string} guess - The guess string to parse
   * @returns {Object|null} Parsed coordinate object or null
   */
  static parseGuess(guess) {
    return this.parsePlayerGuess(guess);
  }

  /**
   * Converts row and column coordinates to a string format
   * @param {number} row - The row coordinate (0-9)
   * @param {number} column - The column coordinate (0-9)
   * @returns {string} Two-character coordinate string
   * @throws {Error} If coordinates are not valid integers
   * @example
   * CoordinateUtils.formatCoordinateAsString(0, 5); // "05"
   * CoordinateUtils.formatCoordinateAsString(9, 9); // "99"
   */
  static formatCoordinateAsString(row, column) {
    if (!Number.isInteger(row) || !Number.isInteger(column)) {
      throw new Error('Row and column must be integers');
    }
    
    if (row < 0 || row > 9 || column < 0 || column > 9) {
      throw new Error('Row and column must be between 0 and 9');
    }
    
    return `${row}${column}`;
  }

  /**
   * Legacy alias for formatCoordinateAsString - maintained for backward compatibility
   * @deprecated Use formatCoordinateAsString instead
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate  
   * @returns {string} Formatted coordinate string
   */
  static coordinateToString(row, col) {
    return this.formatCoordinateAsString(row, col);
  }

  /**
   * Gets all adjacent coordinates (up, down, left, right) for a given position
   * @param {number} centerRow - The center row coordinate
   * @param {number} centerColumn - The center column coordinate
   * @param {number} [boardSize=GAME_CONFIG.BOARD_SIZE] - Size of the game board for validation
   * @returns {Array<Object>} Array of adjacent coordinate objects, filtered to valid positions only
   * @example
   * // For position (5,5) on a 10x10 board:
   * CoordinateUtils.getAdjacentPositions(5, 5);
   * // Returns: [{ row: 4, col: 5 }, { row: 6, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 6 }]
   */
  static getAdjacentPositions(centerRow, centerColumn, boardSize = GAME_CONFIG.BOARD_SIZE) {
    const potentialAdjacentPositions = [
      { row: centerRow - 1, col: centerColumn },  // North (up)
      { row: centerRow + 1, col: centerColumn },  // South (down)
      { row: centerRow, col: centerColumn - 1 },  // West (left)
      { row: centerRow, col: centerColumn + 1 }   // East (right)
    ];
    
    // Filter out positions that are outside the board boundaries
    return potentialAdjacentPositions.filter(position => 
      this.areCoordinatesValid(position.row, position.col, boardSize)
    );
  }

  /**
   * Legacy alias for getAdjacentPositions - maintained for backward compatibility
   * @deprecated Use getAdjacentPositions instead
   * @param {number} row - Center row
   * @param {number} col - Center column
   * @returns {Array<Object>} Array of adjacent coordinates
   */
  static getAdjacentCoordinates(row, col) {
    return this.getAdjacentPositions(row, col);
  }

  /**
   * Calculates the Manhattan distance between two coordinates
   * @param {number} row1 - First position row
   * @param {number} col1 - First position column
   * @param {number} row2 - Second position row
   * @param {number} col2 - Second position column
   * @returns {number} Manhattan distance (sum of absolute differences)
   */
  static calculateManhattanDistance(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }
}

/**
 * Random number generation and probability utilities
 * Provides controlled randomness for game mechanics like ship placement and CPU decisions
 */
export class RandomUtils {
  /**
   * Generates a random integer between min (inclusive) and max (exclusive)
   * @param {number} minimumValue - Minimum value (inclusive)
   * @param {number} maximumValue - Maximum value (exclusive)
   * @returns {number} Random integer in the specified range
   * @throws {Error} If min >= max or if values are not integers
   * @example
   * RandomUtils.generateRandomInteger(0, 10); // Returns 0-9
   * RandomUtils.generateRandomInteger(5, 8);  // Returns 5, 6, or 7
   */
  static generateRandomInteger(minimumValue, maximumValue) {
    if (!Number.isInteger(minimumValue) || !Number.isInteger(maximumValue)) {
      throw new Error('Min and max values must be integers');
    }
    
    if (minimumValue >= maximumValue) {
      throw new Error('Minimum value must be less than maximum value');
    }
    
    return Math.floor(Math.random() * (maximumValue - minimumValue)) + minimumValue;
  }

  /**
   * Legacy alias for generateRandomInteger - maintained for backward compatibility
   * @deprecated Use generateRandomInteger instead
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return this.generateRandomInteger(min, max);
  }

  /**
   * Generates a random coordinate within the game board boundaries
   * @param {number} [boardSize=GAME_CONFIG.BOARD_SIZE] - Size of the game board
   * @returns {Object} Random coordinate object with row and col properties
   * @example
   * RandomUtils.generateRandomBoardPosition(); // { row: 3, col: 7 }
   */
  static generateRandomBoardPosition(boardSize = GAME_CONFIG.BOARD_SIZE) {
    return {
      row: this.generateRandomInteger(0, boardSize),
      col: this.generateRandomInteger(0, boardSize)
    };
  }

  /**
   * Legacy alias for generateRandomBoardPosition - maintained for backward compatibility
   * @deprecated Use generateRandomBoardPosition instead
   * @param {number} [boardSize] - Board size
   * @returns {Object} Random coordinate
   */
  static randomCoordinate(boardSize) {
    return this.generateRandomBoardPosition(boardSize);
  }

  /**
   * Randomly selects a ship orientation (horizontal or vertical)
   * @returns {string} Either SHIP_ORIENTATIONS.HORIZONTAL or SHIP_ORIENTATIONS.VERTICAL
   * @example
   * RandomUtils.selectRandomShipOrientation(); // "horizontal" or "vertical"
   */
  static selectRandomShipOrientation() {
    return Math.random() < 0.5 ? SHIP_ORIENTATIONS.HORIZONTAL : SHIP_ORIENTATIONS.VERTICAL;
  }

  /**
   * Legacy alias for selectRandomShipOrientation - maintained for backward compatibility  
   * @deprecated Use selectRandomShipOrientation instead
   * @returns {string} Random ship orientation
   */
  static randomOrientation() {
    return this.selectRandomShipOrientation();
  }

  /**
   * Generates a valid random starting position for ship placement
   * @param {string} shipOrientation - Either 'horizontal' or 'vertical'
   * @param {number} shipLength - Length of the ship to be placed
   * @param {number} [boardSize=GAME_CONFIG.BOARD_SIZE] - Size of the game board
   * @returns {Object} Starting position that allows the ship to fit within board bounds
   * @throws {Error} If ship cannot fit on board with given parameters
   * @example
   * RandomUtils.generateValidShipStartPosition('horizontal', 3, 10);
   * // Returns: { row: 5, col: 2 } (ship would occupy columns 2, 3, 4)
   */
  static generateValidShipStartPosition(shipOrientation, shipLength, boardSize = GAME_CONFIG.BOARD_SIZE) {
    if (shipLength > boardSize) {
      throw new Error(`Ship length (${shipLength}) cannot exceed board size (${boardSize})`);
    }

    if (shipOrientation === SHIP_ORIENTATIONS.HORIZONTAL) {
      return {
        row: this.generateRandomInteger(0, boardSize),
        col: this.generateRandomInteger(0, boardSize - shipLength + 1)
      };
    } else if (shipOrientation === SHIP_ORIENTATIONS.VERTICAL) {
      return {
        row: this.generateRandomInteger(0, boardSize - shipLength + 1),
        col: this.generateRandomInteger(0, boardSize)
      };
    } else {
      throw new Error(`Invalid ship orientation: ${shipOrientation}`);
    }
  }

  /**
   * Legacy alias for generateValidShipStartPosition - maintained for backward compatibility
   * @deprecated Use generateValidShipStartPosition instead
   * @param {string} orientation - Ship orientation
   * @param {number} shipLength - Ship length
   * @param {number} [boardSize] - Board size
   * @returns {Object} Valid start position
   */
  static randomShipStartPosition(orientation, shipLength, boardSize) {
    return this.generateValidShipStartPosition(orientation, shipLength, boardSize);
  }

  /**
   * Returns a random boolean value with optional probability weighting
   * @param {number} [probabilityOfTrue=0.5] - Probability of returning true (0.0 to 1.0)
   * @returns {boolean} Random boolean value
   */
  static generateRandomBoolean(probabilityOfTrue = 0.5) {
    return Math.random() < probabilityOfTrue;
  }
}

/**
 * Array and collection manipulation utilities
 * Provides helpful functions for working with arrays and collections in the game
 */
export class CollectionUtils {
  /**
   * Creates a 2D array filled with a default value
   * @param {number} numberOfRows - Number of rows in the array
   * @param {number} numberOfColumns - Number of columns in the array  
   * @param {*} defaultValue - Value to fill each cell with
   * @returns {Array<Array<*>>} 2D array initialized with the default value
   * @throws {Error} If dimensions are not positive integers
   * @example
   * CollectionUtils.create2DArray(3, 3, '~');
   * // Returns: [['~','~','~'], ['~','~','~'], ['~','~','~']]
   */
  static create2DArray(numberOfRows, numberOfColumns, defaultValue) {
    if (!Number.isInteger(numberOfRows) || !Number.isInteger(numberOfColumns) || 
        numberOfRows <= 0 || numberOfColumns <= 0) {
      throw new Error('Array dimensions must be positive integers');
    }

    return Array.from({ length: numberOfRows }, () => 
      Array.from({ length: numberOfColumns }, () => defaultValue)
    );
  }

  /**
   * Checks if an array contains a specific value
   * @param {Array<*>} searchArray - Array to search in
   * @param {*} targetValue - Value to search for
   * @returns {boolean} True if the value is found in the array
   * @example
   * CollectionUtils.arrayContainsValue([1, 2, 3], 2); // true
   * CollectionUtils.arrayContainsValue(['a', 'b'], 'c'); // false
   */
  static arrayContainsValue(searchArray, targetValue) {
    if (!Array.isArray(searchArray)) {
      throw new Error('First parameter must be an array');
    }
    return searchArray.indexOf(targetValue) !== -1;
  }

  /**
   * Legacy alias for arrayContainsValue - maintained for backward compatibility
   * @deprecated Use arrayContainsValue instead
   * @param {Array} array - Array to search
   * @param {*} value - Value to find
   * @returns {boolean} True if found
   */
  static includes(array, value) {
    return this.arrayContainsValue(array, value);
  }

  /**
   * Removes all elements from an array (mutates the original array)
   * @param {Array<*>} targetArray - Array to clear
   * @throws {Error} If parameter is not an array
   * @example
   * const myArray = [1, 2, 3];
   * CollectionUtils.clearArray(myArray);
   * console.log(myArray); // []
   */
  static clearArray(targetArray) {
    if (!Array.isArray(targetArray)) {
      throw new Error('Parameter must be an array');
    }
    targetArray.length = 0;
  }

  /**
   * Selects a random element from an array
   * @param {Array<*>} sourceArray - Array to select from
   * @returns {*} Randomly selected element from the array
   * @throws {Error} If array is empty or not an array
   * @example
   * CollectionUtils.selectRandomElement([1, 2, 3, 4]); // Returns one of: 1, 2, 3, or 4
   */
  static selectRandomElement(sourceArray) {
    if (!Array.isArray(sourceArray)) {
      throw new Error('Parameter must be an array');
    }
    
    if (sourceArray.length === 0) {
      throw new Error('Cannot select from empty array');
    }
    
    const randomIndex = RandomUtils.generateRandomInteger(0, sourceArray.length);
    return sourceArray[randomIndex];
  }

  /**
   * Legacy alias for selectRandomElement - maintained for backward compatibility
   * @deprecated Use selectRandomElement instead
   * @param {Array} array - Source array
   * @returns {*} Random element
   */
  static randomElement(array) {
    return this.selectRandomElement(array);
  }

  /**
   * Creates a shallow copy of an array
   * @param {Array<*>} sourceArray - Array to copy
   * @returns {Array<*>} New array with same elements
   */
  static createArrayCopy(sourceArray) {
    if (!Array.isArray(sourceArray)) {
      throw new Error('Parameter must be an array');
    }
    return [...sourceArray];
  }
}

/**
 * Input validation and format checking utilities
 * Handles validation of user inputs and game data formats
 */
export class ValidationUtils {
  /**
   * Validates that a guess string has the correct format (two digits)
   * @param {string} playerGuess - User input to validate
   * @returns {boolean} True if format is valid (exactly two digits)
   * @example
   * ValidationUtils.isPlayerGuessFormatValid("05"); // true
   * ValidationUtils.isPlayerGuessFormatValid("abc"); // false
   * ValidationUtils.isPlayerGuessFormatValid("123"); // false
   */
  static isPlayerGuessFormatValid(playerGuess) {
    return !!(playerGuess && 
             typeof playerGuess === 'string' && 
             playerGuess.length === 2 && 
             /^\d{2}$/.test(playerGuess));
  }

  /**
   * Legacy alias for isPlayerGuessFormatValid - maintained for backward compatibility
   * @deprecated Use isPlayerGuessFormatValid instead
   * @param {string} guess - Guess to validate
   * @returns {boolean} True if valid format
   */
  static isValidGuessFormat(guess) {
    return this.isPlayerGuessFormatValid(guess);
  }

  /**
   * Validates that coordinates are within the game board boundaries
   * @param {number} row - Row coordinate to validate
   * @param {number} column - Column coordinate to validate
   * @param {number} [boardSize=GAME_CONFIG.BOARD_SIZE] - Size of the game board
   * @returns {boolean} True if coordinates are within valid range
   */
  static areGuessCoordinatesValid(row, column, boardSize = GAME_CONFIG.BOARD_SIZE) {
    return CoordinateUtils.areCoordinatesValid(row, column, boardSize);
  }

  /**
   * Legacy alias for areGuessCoordinatesValid - maintained for backward compatibility
   * @deprecated Use areGuessCoordinatesValid instead
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate  
   * @param {number} [boardSize] - Board size
   * @returns {boolean} True if valid
   */
  static isValidGuessCoordinates(row, col, boardSize) {
    return this.areGuessCoordinatesValid(row, col, boardSize);
  }

  /**
   * Checks if a guess has not been made before
   * @param {string} newGuess - The guess to check
   * @param {Array<string>} previousGuesses - Array of previously made guesses
   * @returns {boolean} True if this is a new guess
   * @example
   * ValidationUtils.isGuessNew("05", ["03", "44"]); // true
   * ValidationUtils.isGuessNew("03", ["03", "44"]); // false
   */
  static isGuessNew(newGuess, previousGuesses) {
    return !CollectionUtils.arrayContainsValue(previousGuesses, newGuess);
  }

  /**
   * Legacy alias for isGuessNew - maintained for backward compatibility
   * @deprecated Use isGuessNew instead
   * @param {string} guess - Guess to check
   * @param {Array} guessList - Previous guesses
   * @returns {boolean} True if new
   */
  static isNewGuess(guess, guessList) {
    return this.isGuessNew(guess, guessList);
  }

  /**
   * Validates that a value is a non-negative integer
   * @param {*} value - Value to validate
   * @returns {boolean} True if value is a non-negative integer
   */
  static isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
  }

  /**
   * Validates that a value is a positive integer
   * @param {*} value - Value to validate
   * @returns {boolean} True if value is a positive integer
   */
  static isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
  }
}

export default {
  CoordinateUtils,
  RandomUtils,
  CollectionUtils,
  ValidationUtils
}; 