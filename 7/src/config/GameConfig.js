/**
 * Game Configuration Module
 * Centralizes all game constants and settings
 */

export const GAME_CONFIG = {
  // Board settings
  BOARD_SIZE: 10,
  
  // Ship settings
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3,
  
  // Board symbols
  SYMBOLS: {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
  },
  
  // CPU behavior
  CPU_MODES: {
    HUNT: 'hunt',
    TARGET: 'target'
  },
  
  // Game messages
  MESSAGES: {
    GAME_START: "Let's play Sea Battle!",
    SHIPS_TO_SINK: (count) => `Try to sink the ${count} enemy ships.`,
    BOARDS_CREATED: 'Boards created.',
    SHIPS_PLACED: (count, player) => `${count} ships placed randomly for ${player}.`,
    
    // Player messages
    PLAYER_HIT: 'PLAYER HIT!',
    PLAYER_MISS: 'PLAYER MISS.',
    SHIP_SUNK: 'You sunk an enemy battleship!',
    ALREADY_HIT: 'You already hit that spot!',
    ALREADY_GUESSED: 'You already guessed that location!',
    PLAYER_WINS: '*** CONGRATULATIONS! You sunk all enemy battleships! ***',
    
    // CPU messages
    CPU_TURN: "--- CPU's Turn ---",
    CPU_HIT: (location) => `CPU HIT at ${location}!`,
    CPU_MISS: (location) => `CPU MISS at ${location}.`,
    CPU_TARGETS: (location) => `CPU targets: ${location}`,
    CPU_SUNK_SHIP: 'CPU sunk your battleship!',
    CPU_WINS: '*** GAME OVER! The CPU sunk all your battleships! ***',
    
    // Input validation
    INVALID_INPUT: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).',
    INVALID_COORDINATES: (max) => `Oops, please enter valid row and column numbers between 0 and ${max}.`,
    
    // UI
    ENTER_GUESS: 'Enter your guess (e.g., 00): ',
    OPPONENT_BOARD: 'OPPONENT BOARD',
    YOUR_BOARD: 'YOUR BOARD'
  }
};

export default GAME_CONFIG; 