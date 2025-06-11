import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

// Import the new modular architecture
import { GAME_CONFIG } from './src/config/GameConfig.js';
import { Ship, Board, GameState } from './src/models/GameModel.js';
import { GameController } from './src/controllers/GameController.js';
import { CoordinateUtils, ValidationUtils } from './src/utils/GameUtils.js';

describe('Sea Battle Game Tests - Modular Architecture', () => {
  let gameController;
  let gameState;
  
  beforeEach(() => {
    // Create fresh instances for each test
    gameController = new GameController();
    gameState = gameController.gameState;
    
    // Reset boards
    gameState.playerBoard.reset();
    gameState.opponentBoard.reset();
  });

  describe('Board Creation', () => {
    test('Board should initialize with correct dimensions', () => {
      const board = new Board();
      assert.strictEqual(board.size, GAME_CONFIG.BOARD_SIZE);
      
      // Check all cells are initialized with water
      for (let i = 0; i < GAME_CONFIG.BOARD_SIZE; i++) {
        for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
          assert.strictEqual(board.getCell(i, j), GAME_CONFIG.SYMBOLS.WATER);
        }
      }
    });

    test('Board should allow setting and getting cells', () => {
      const board = new Board();
      board.setCell(0, 0, GAME_CONFIG.SYMBOLS.HIT);
      assert.strictEqual(board.getCell(0, 0), GAME_CONFIG.SYMBOLS.HIT);
      
      board.setCell(5, 5, GAME_CONFIG.SYMBOLS.SHIP);
      assert.strictEqual(board.getCell(5, 5), GAME_CONFIG.SYMBOLS.SHIP);
    });
  });

  describe('Ship Placement', () => {
    test('Ships should be placed correctly with valid locations', () => {
      const board = gameState.opponentBoard;
      const numShips = 3;
      
      // Place ships using the controller
      gameController.shipPlacement.placeShipsRandomly(board, gameState.cpuShips, numShips);
      
      // Check that ships were placed
      assert.strictEqual(gameState.cpuShips.length, numShips);
      
      // Each ship should have correct length
      gameState.cpuShips.forEach(ship => {
        assert.strictEqual(ship.getLocations().length, GAME_CONFIG.SHIP_LENGTH);
        
        // All locations should be valid coordinates
        ship.getLocations().forEach(location => {
          const coords = CoordinateUtils.parseGuess(location);
          assert.strictEqual(ValidationUtils.isValidGuessCoordinates(coords.row, coords.col), true);
        });
      });
    });

    test('Ships should not overlap', () => {
      const board = gameState.opponentBoard;
      gameController.shipPlacement.placeShipsRandomly(board, gameState.cpuShips, 2);
      
      const allLocations = [];
      gameState.cpuShips.forEach(ship => {
        ship.getLocations().forEach(location => {
          assert.strictEqual(allLocations.includes(location), false, 
            `Location ${location} is used by multiple ships`);
          allLocations.push(location);
        });
      });
    });
  });

  describe('Coordinate Validation', () => {
    test('ValidationUtils should validate coordinates correctly', () => {
      // Valid coordinates
      assert.strictEqual(CoordinateUtils.isValidCoordinate(0, 0), true);
      assert.strictEqual(CoordinateUtils.isValidCoordinate(5, 5), true);
      assert.strictEqual(CoordinateUtils.isValidCoordinate(9, 9), true);
      
      // Invalid coordinates
      assert.strictEqual(CoordinateUtils.isValidCoordinate(-1, 0), false);
      assert.strictEqual(CoordinateUtils.isValidCoordinate(0, -1), false);
      assert.strictEqual(CoordinateUtils.isValidCoordinate(10, 0), false);
      assert.strictEqual(CoordinateUtils.isValidCoordinate(0, 10), false);
    });

    test('CoordinateUtils should parse coordinates correctly', () => {
      const coord1 = CoordinateUtils.parseGuess('05');
      assert.strictEqual(coord1.row, 0);
      assert.strictEqual(coord1.col, 5);
      
      const coord2 = CoordinateUtils.parseGuess('99');
      assert.strictEqual(coord2.row, 9);
      assert.strictEqual(coord2.col, 9);
    });
  });

  describe('Ship Mechanics', () => {
    test('Ship should track hits correctly', () => {
      const ship = new Ship(['00', '01', '02']);
      
      assert.strictEqual(ship.isSunk(), false);
      assert.strictEqual(ship.isLocationHit('00'), false);
      
      // Hit the ship
      assert.strictEqual(ship.takeHit('00'), true);
      assert.strictEqual(ship.isLocationHit('00'), true);
      assert.strictEqual(ship.isSunk(), false);
      
      // Hit invalid location
      assert.strictEqual(ship.takeHit('99'), false);
      
      // Sink the ship
      ship.takeHit('01');
      ship.takeHit('02');
      assert.strictEqual(ship.isSunk(), true);
    });
  });

  describe('Player Turn Processing', () => {
    beforeEach(() => {
      // Set up a test ship for the opponent
      const ship = new Ship(['00', '01', '02']);
      gameState.cpuShips.push(ship);
      gameState.opponentBoard.setCell(0, 0, GAME_CONFIG.SYMBOLS.SHIP);
      gameState.opponentBoard.setCell(0, 1, GAME_CONFIG.SYMBOLS.SHIP);
      gameState.opponentBoard.setCell(0, 2, GAME_CONFIG.SYMBOLS.SHIP);
    });

    test('Player turn should reject invalid input formats', () => {
      assert.strictEqual(gameController.processPlayerTurn(null).success, false);
      assert.strictEqual(gameController.processPlayerTurn('').success, false);
      assert.strictEqual(gameController.processPlayerTurn('0').success, false);
      assert.strictEqual(gameController.processPlayerTurn('000').success, false);
      assert.strictEqual(gameController.processPlayerTurn('ab').success, false);
    });

    test('Player turn should reject out-of-bounds coordinates', () => {
      assert.strictEqual(gameController.processPlayerTurn('99').success, true); // Valid
      assert.strictEqual(gameController.processPlayerTurn('aa').success, false); // Invalid
    });

    test('Player turn should detect hits correctly', () => {
      const result = gameController.processPlayerTurn('00'); // Should hit the ship
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 'hit');
      assert.strictEqual(gameState.opponentBoard.getCell(0, 0), GAME_CONFIG.SYMBOLS.HIT);
      assert.strictEqual(gameState.cpuShips[0].isLocationHit('00'), true);
    });

    test('Player turn should detect misses correctly', () => {
      const result = gameController.processPlayerTurn('99'); // Should miss
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 'miss');
      assert.strictEqual(gameState.opponentBoard.getCell(9, 9), GAME_CONFIG.SYMBOLS.MISS);
    });

    test('Player turn should prevent duplicate guesses', () => {
      gameController.processPlayerTurn('00'); // First guess
      const result = gameController.processPlayerTurn('00'); // Duplicate guess
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.reason, 'duplicate_guess');
    });

    test('Player turn should handle sinking ships correctly', () => {
      // Hit all parts of the ship
      gameController.processPlayerTurn('00');
      gameController.processPlayerTurn('01');
      const result = gameController.processPlayerTurn('02'); // Should sink the ship
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 'ship_sunk');
      assert.strictEqual(gameState.cpuShips[0].isSunk(), true);
    });
  });

  describe('CPU Turn Logic', () => {
    beforeEach(() => {
      // Set up player ships for CPU to target
      const ship = new Ship(['55', '56', '57']);
      gameState.playerShips.push(ship);
      gameState.playerBoard.setCell(5, 5, GAME_CONFIG.SYMBOLS.SHIP);
      gameState.playerBoard.setCell(5, 6, GAME_CONFIG.SYMBOLS.SHIP);
      gameState.playerBoard.setCell(5, 7, GAME_CONFIG.SYMBOLS.SHIP);
      
      // Reset CPU state
      gameState.cpuGuesses.length = 0;
      gameState.cpuMode = GAME_CONFIG.CPU_MODES.HUNT;
      gameState.cpuTargetQueue.length = 0;
    });

    test('CPU should make valid guesses', () => {
      const result = gameController.processCpuTurn();
      
      // Should have made one guess
      assert.strictEqual(gameState.cpuGuesses.length, 1);
      assert.strictEqual(result.success, true);
      
      // Guess should be valid format
      const guess = gameState.cpuGuesses[0];
      assert.strictEqual(guess.length, 2);
      const coords = CoordinateUtils.parseGuess(guess);
      assert.strictEqual(ValidationUtils.isValidGuessCoordinates(coords.row, coords.col), true);
    });

    test('CPU should enter target mode after hitting a ship', () => {
      // Force CPU to hit the player ship at 55
      gameState.cpuGuesses.push('55');
      gameState.cpuMode = GAME_CONFIG.CPU_MODES.TARGET;
      gameState.cpuTargetQueue.push('45', '65', '54', '56');
      gameState.playerShips[0].takeHit('55');
      gameState.playerBoard.setCell(5, 5, GAME_CONFIG.SYMBOLS.HIT);
      
      const result = gameController.processCpuTurn();
      
      // Should still be in target mode
      assert.strictEqual(gameState.cpuMode, GAME_CONFIG.CPU_MODES.TARGET);
      assert.strictEqual(result.success, true);
      assert.strictEqual(gameState.cpuGuesses.length, 2);
    });
  });

  describe('Game State Management', () => {
    test('GameState should track game progress correctly', () => {
      const state = new GameState();
      
      // Initial state
      assert.strictEqual(state.playerShips.length, 0);
      assert.strictEqual(state.cpuShips.length, 0);
      assert.strictEqual(state.playerGuesses.length, 0);
      assert.strictEqual(state.cpuGuesses.length, 0);
      
      // Add ships
      state.playerShips.push(new Ship(['00', '01', '02']));
      state.cpuShips.push(new Ship(['99', '98', '97']));
      
      assert.strictEqual(state.playerShips.length, 1);
      assert.strictEqual(state.cpuShips.length, 1);
    });
  });

  describe('Game View Integration', () => {
    test('View should be able to render game state', () => {
      // This test just ensures the view can be called without errors
      const originalLog = console.log;
      let logOutput = '';
      console.log = (msg) => { logOutput += msg + '\n'; };
      
      gameController.view.renderBoards(
        gameState.opponentBoard,
        gameState.playerBoard
      );
      
      console.log = originalLog;
      
      // Should contain board headers
      assert.strictEqual(logOutput.includes('OPPONENT BOARD'), true);
      assert.strictEqual(logOutput.includes('YOUR BOARD'), true);
      
      // Should contain coordinate headers
      assert.strictEqual(logOutput.includes('0 1 2 3 4 5 6 7 8 9'), true);
    });
  });
}); 