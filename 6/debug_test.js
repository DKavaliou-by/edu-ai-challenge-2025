const { Enigma } = require('./enigma.js');

console.log('=== Testing Enigma Symmetry ===');

// Test basic symmetry without plugboard
console.log('\n1. Testing without plugboard:');
const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
const original = 'HELLO';
const encrypted = enigma1.process(original);
console.log('Original:', original);
console.log('Encrypted:', encrypted);

const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
const decrypted = enigma2.process(encrypted);
console.log('Decrypted:', decrypted);
console.log('Symmetric?', decrypted === original);

// Test with plugboard
console.log('\n2. Testing with plugboard:');
const enigma3 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
const encrypted2 = enigma3.process(original);
console.log('Original:', original);
console.log('Encrypted:', encrypted2);

const enigma4 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
const decrypted2 = enigma4.process(encrypted2);
console.log('Decrypted:', decrypted2);
console.log('Symmetric?', decrypted2 === original);

// Test single character
console.log('\n3. Testing single character:');
const enigma5 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
const char1 = enigma5.encryptChar('A');
console.log('A encrypts to:', char1);

const enigma6 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
const char2 = enigma6.encryptChar(char1);
console.log(char1, 'encrypts back to:', char2);
console.log('Single char symmetric?', char2 === 'A'); 