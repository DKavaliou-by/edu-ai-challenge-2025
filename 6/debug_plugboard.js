const { Enigma } = require('./enigma.js');

console.log('=== Debugging Plugboard Test Failure ===');

// Exact same test case that's failing
const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);

console.log('Initial rotor positions:', enigma.rotors.map(r => r.position));

const original = 'HELLO';
console.log('Original message:', original);

const encrypted = enigma.process(original);
console.log('Encrypted message:', encrypted);
console.log('Rotor positions after encryption:', enigma.rotors.map(r => r.position));

// Reset enigma to same initial state
const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
console.log('Second enigma initial positions:', enigma2.rotors.map(r => r.position));

const decrypted = enigma2.process(encrypted);
console.log('Decrypted message:', decrypted);
console.log('Rotor positions after decryption:', enigma2.rotors.map(r => r.position));

console.log('Symmetric?', decrypted === original);

// Test step by step
console.log('\n=== Step by step analysis ===');
console.log('Expected steps:');
console.log('H -> plugboard -> rotors -> reflector -> rotors -> plugboard -> result');
console.log('E -> plugboard -> rotors -> reflector -> rotors -> plugboard -> result');
console.log('...');

// Let's test each character individually
const enigma3 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
console.log('\nTesting character by character:');
for (let i = 0; i < original.length; i++) {
  const char = original[i];
  const encrypted_char = enigma3.encryptChar(char);
  console.log(`${char} -> ${encrypted_char} (positions: ${enigma3.rotors.map(r => r.position)})`);
}

// Now decrypt character by character
const enigma4 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
console.log('\nDecrypting character by character:');
for (let i = 0; i < encrypted.length; i++) {
  const char = encrypted[i];
  const decrypted_char = enigma4.encryptChar(char);
  console.log(`${char} -> ${decrypted_char} (positions: ${enigma4.rotors.map(r => r.position)})`);
} 