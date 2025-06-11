/**
 * Game Utilities Module
 * Contains pure helper functions for game operations
 */

import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * Coordinate and validation utilities
 */
export class CoordinateUtils {
  /**
   * Validates if coordinates are within board bounds
   */
  static isValidCoordinate(row, col, boardSize = GAME_CONFIG.BOARD_SIZE) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
  }

  /**
   * Converts string guess to coordinate object
   */
  static parseGuess(guess) {
    if (!guess || guess.length !== 2) {
      return null;
    }
    
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);
    
    if (isNaN(row) || isNaN(col)) {
      return null;
    }
    
    return { row, col };
  }

  /**
   * Converts row, col to string format
   */
  static coordinateToString(row, col) {
    return `${row}${col}`;
  }

  /**
   * Gets adjacent coordinates for targeting mode
   */
  static getAdjacentCoordinates(row, col) {
    return [
      { row: row - 1, col: col },  // Up
      { row: row + 1, col: col },  // Down
      { row: row, col: col - 1 },  // Left
      { row: row, col: col + 1 }   // Right
    ];
  }
}

/**
 * Random number generation utilities
 */
export class RandomUtils {
  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Generate random coordinate within board bounds
   */
  static randomCoordinate(boardSize = GAME_CONFIG.BOARD_SIZE) {
    return {
      row: this.randomInt(0, boardSize),
      col: this.randomInt(0, boardSize)
    };
  }

  /**
   * Generate random orientation
   */
  static randomOrientation() {
    return Math.random() < 0.5 ? 'horizontal' : 'vertical';
  }

  /**
   * Generate random start position for ship placement
   */
  static randomShipStartPosition(orientation, shipLength, boardSize = GAME_CONFIG.BOARD_SIZE) {
    if (orientation === 'horizontal') {
      return {
        row: this.randomInt(0, boardSize),
        col: this.randomInt(0, boardSize - shipLength + 1)
      };
    } else {
      return {
        row: this.randomInt(0, boardSize - shipLength + 1),
        col: this.randomInt(0, boardSize)
      };
    }
  }
}

/**
 * Array and collection utilities
 */
export class CollectionUtils {
  /**
   * Create 2D array filled with default value
   */
  static create2DArray(rows, cols, defaultValue) {
    return Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => defaultValue)
    );
  }

  /**
   * Check if array includes value
   */
  static includes(array, value) {
    return array.indexOf(value) !== -1;
  }

  /**
   * Remove all elements from array
   */
  static clearArray(array) {
    array.length = 0;
  }

  /**
   * Get random element from array
   */
  static randomElement(array) {
    return array[RandomUtils.randomInt(0, array.length)];
  }
}

/**
 * Input validation utilities
 */
export class ValidationUtils {
  /**
   * Validate guess input format
   */
  static isValidGuessFormat(guess) {
    return guess && guess.length === 2 && /^\d{2}$/.test(guess);
  }

  /**
   * Validate coordinates are within bounds
   */
  static isValidGuessCoordinates(row, col, boardSize = GAME_CONFIG.BOARD_SIZE) {
    return CoordinateUtils.isValidCoordinate(row, col, boardSize);
  }

  /**
   * Check if guess has been made before
   */
  static isNewGuess(guess, guessList) {
    return !CollectionUtils.includes(guessList, guess);
  }
}

export default {
  CoordinateUtils,
  RandomUtils,
  CollectionUtils,
  ValidationUtils
}; 