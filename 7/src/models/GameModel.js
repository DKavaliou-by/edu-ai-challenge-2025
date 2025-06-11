/**
 * Game Model Module
 * Contains pure game entities focused on state management
 */

import { GAME_CONFIG } from '../config/GameConfig.js';
import { CoordinateUtils, CollectionUtils } from '../utils/GameUtils.js';

/**
 * Ship entity - manages ship state and hit detection
 */
export class Ship {
  constructor(locations) {
    this.locations = [...locations]; // Defensive copy
    this.hits = new Array(locations.length).fill('');
  }

  /**
   * Check if a specific location on this ship has been hit
   */
  isLocationHit(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index] === 'hit';
  }

  /**
   * Record a hit on this ship at the specified location
   * Returns true if it's a new hit, false if already hit
   */
  takeHit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0 && this.hits[index] !== 'hit') {
      this.hits[index] = 'hit';
      return true;
    }
    return false;
  }

  /**
   * Check if this ship is completely sunk
   */
  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }

  /**
   * Check if this ship occupies the given location
   */
  occupiesLocation(location) {
    return this.locations.includes(location);
  }

  /**
   * Get a copy of this ship's locations
   */
  getLocations() {
    return [...this.locations];
  }

  /**
   * Get ship status summary
   */
  getStatus() {
    return {
      locations: this.getLocations(),
      hitCount: this.hits.filter(hit => hit === 'hit').length,
      totalLength: this.locations.length,
      isSunk: this.isSunk()
    };
  }
}

/**
 * Board entity - manages the game board state
 */
export class Board {
  constructor(size = GAME_CONFIG.BOARD_SIZE) {
    this.size = size;
    this.grid = CollectionUtils.create2DArray(size, size, GAME_CONFIG.SYMBOLS.WATER);
  }

  /**
   * Reset board to initial state
   */
  reset() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.grid[i][j] = GAME_CONFIG.SYMBOLS.WATER;
      }
    }
  }

  /**
   * Check if coordinates are valid for this board
   */
  isValidPosition(row, col) {
    return CoordinateUtils.isValidCoordinate(row, col, this.size);
  }

  /**
   * Get the symbol at the specified position
   */
  getCell(row, col) {
    return this.isValidPosition(row, col) ? this.grid[row][col] : null;
  }

  /**
   * Set a symbol at the specified position
   */
  setCell(row, col, symbol) {
    if (this.isValidPosition(row, col)) {
      this.grid[row][col] = symbol;
      return true;
    }
    return false;
  }

  /**
   * Check if a position is empty (contains water)
   */
  isEmpty(row, col) {
    return this.getCell(row, col) === GAME_CONFIG.SYMBOLS.WATER;
  }

  /**
   * Mark a position as hit
   */
  markHit(row, col) {
    return this.setCell(row, col, GAME_CONFIG.SYMBOLS.HIT);
  }

  /**
   * Mark a position as miss
   */
  markMiss(row, col) {
    return this.setCell(row, col, GAME_CONFIG.SYMBOLS.MISS);
  }

  /**
   * Place a ship on the board
   */
  placeShip(row, col) {
    return this.setCell(row, col, GAME_CONFIG.SYMBOLS.SHIP);
  }

  /**
   * Get board state as 2D array copy
   */
  getGrid() {
    return this.grid.map(row => [...row]);
  }

  /**
   * Get board size
   */
  getSize() {
    return this.size;
  }
}

/**
 * Game State - manages overall game state
 */
export class GameState {
  constructor(config = GAME_CONFIG) {
    this.config = config;
    this.reset();
  }

  /**
   * Reset game to initial state
   */
  reset() {
    // Boards
    this.playerBoard = new Board(this.config.BOARD_SIZE);
    this.opponentBoard = new Board(this.config.BOARD_SIZE);
    
    // Ships
    this.playerShips = [];
    this.cpuShips = [];
    
    // Ship counts
    this.playerShipCount = this.config.NUM_SHIPS;
    this.cpuShipCount = this.config.NUM_SHIPS;
    
    // Guess history
    this.playerGuesses = [];
    this.cpuGuesses = [];
    
    // CPU AI state
    this.cpuMode = this.config.CPU_MODES.HUNT;
    this.cpuTargetQueue = [];
  }

  /**
   * Add a ship to player fleet
   */
  addPlayerShip(ship) {
    this.playerShips.push(ship);
  }

  /**
   * Add a ship to CPU fleet
   */
  addCpuShip(ship) {
    this.cpuShips.push(ship);
  }

  /**
   * Record a player guess
   */
  addPlayerGuess(guess) {
    this.playerGuesses.push(guess);
  }

  /**
   * Record a CPU guess
   */
  addCpuGuess(guess) {
    this.cpuGuesses.push(guess);
  }

  /**
   * Check if player has made this guess before
   */
  hasPlayerGuessed(guess) {
    return this.playerGuesses.includes(guess);
  }

  /**
   * Check if CPU has made this guess before
   */
  hasCpuGuessed(guess) {
    return this.cpuGuesses.includes(guess);
  }

  /**
   * Decrement player ship count (when ship is sunk)
   */
  sinkPlayerShip() {
    this.playerShipCount = Math.max(0, this.playerShipCount - 1);
  }

  /**
   * Decrement CPU ship count (when ship is sunk)
   */
  sinkCpuShip() {
    this.cpuShipCount = Math.max(0, this.cpuShipCount - 1);
  }

  /**
   * Set CPU mode
   */
  setCpuMode(mode) {
    this.cpuMode = mode;
  }

  /**
   * Add target to CPU queue
   */
  addCpuTarget(target) {
    if (!this.cpuTargetQueue.includes(target)) {
      this.cpuTargetQueue.push(target);
    }
  }

  /**
   * Get next CPU target
   */
  getNextCpuTarget() {
    return this.cpuTargetQueue.shift();
  }

  /**
   * Clear CPU target queue
   */
  clearCpuTargets() {
    this.cpuTargetQueue.length = 0;
  }

  /**
   * Check if player has won
   */
  hasPlayerWon() {
    return this.cpuShipCount === 0;
  }

  /**
   * Check if CPU has won
   */
  hasCpuWon() {
    return this.playerShipCount === 0;
  }

  /**
   * Check if game is over
   */
  isGameOver() {
    return this.hasPlayerWon() || this.hasCpuWon();
  }

  /**
   * Get game status summary
   */
  getStatus() {
    return {
      playerShipCount: this.playerShipCount,
      cpuShipCount: this.cpuShipCount,
      playerGuessCount: this.playerGuesses.length,
      cpuGuessCount: this.cpuGuesses.length,
      cpuMode: this.cpuMode,
      cpuTargetsQueued: this.cpuTargetQueue.length,
      isGameOver: this.isGameOver(),
      winner: this.hasPlayerWon() ? 'player' : this.hasCpuWon() ? 'cpu' : null
    };
  }
}

export default { Ship, Board, GameState }; 