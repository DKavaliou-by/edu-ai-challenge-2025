const assert = require('assert');
const { Enigma, Rotor } = require('./enigma.js');

// Test utilities
function runTest(name, testFn) {
  try {
    testFn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    process.exit(1);
  }
}

// Test Cases
runTest('Rotor Basic Stepping', () => {
  const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
  assert.strictEqual(rotor.position, 0);
  rotor.step();
  assert.strictEqual(rotor.position, 1);
  rotor.step();
  assert.strictEqual(rotor.position, 2);
});

runTest('Rotor Notch Detection', () => {
  const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 16); // Q is position 16
  assert.strictEqual(rotor.atNotch(), true);
  rotor.step();
  assert.strictEqual(rotor.atNotch(), false);
});

runTest('Single Rotor Stepping', () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Initial positions
  assert.strictEqual(enigma.rotors[0].position, 0);
  assert.strictEqual(enigma.rotors[1].position, 0);
  assert.strictEqual(enigma.rotors[2].position, 0);
  
  // After first character, only right rotor should step
  enigma.encryptChar('A');
  assert.strictEqual(enigma.rotors[0].position, 0);
  assert.strictEqual(enigma.rotors[1].position, 0);
  assert.strictEqual(enigma.rotors[2].position, 1);
});

runTest('Double Stepping Logic', () => {
  // Set up rotors where middle rotor is at notch position
  // Rotor II has notch at 'E' (position 4)
  const enigma = new Enigma([0, 1, 2], [0, 4, 25], [0, 0, 0], []);
  
  // Verify initial positions
  assert.strictEqual(enigma.rotors[0].position, 0);
  assert.strictEqual(enigma.rotors[1].position, 4); // At notch 'E'
  assert.strictEqual(enigma.rotors[2].position, 25);
  
  // Process one character - should trigger double stepping
  enigma.encryptChar('A');
  
  // Check that both left and middle rotors stepped
  assert.strictEqual(enigma.rotors[0].position, 1, 'Left rotor should step');
  assert.strictEqual(enigma.rotors[1].position, 5, 'Middle rotor should step (double step)');
  assert.strictEqual(enigma.rotors[2].position, 0, 'Right rotor should step normally');
});

runTest('Plugboard Swap Function', () => {
  // Test that encryption is symmetric with plugboard
  const original = 'HELLO';
  
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
  const encrypted = enigma1.process(original);
  
  // Reset enigma to same initial state
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
  const decrypted = enigma2.process(encrypted);
  
  assert.strictEqual(decrypted, original, 'Encryption should be symmetric');
  
  // Test individual character plugboard swapping
  const enigma3 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
  const charA = enigma3.encryptChar('A');
  
  const enigma4 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B'], ['C', 'D']]);
  const backToA = enigma4.encryptChar(charA);
  
  assert.strictEqual(backToA, 'A', 'Single character should be symmetric');
});

runTest('No Plugboard Configuration', () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const original = 'TESTMESSAGE';
  const encrypted = enigma.process(original);
  
  // Reset to same state
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const decrypted = enigma2.process(encrypted);
  
  assert.strictEqual(decrypted, original, 'Should work without plugboard');
  assert.notStrictEqual(encrypted, original, 'Should actually encrypt');
});

runTest('Ring Settings Effect', () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 1, 1], []); // Different ring settings
  
  const message = 'TESTMESSAGE';
  const encrypted1 = enigma1.process(message);
  const encrypted2 = enigma2.process(message);
  
  assert.notStrictEqual(encrypted1, encrypted2, 'Ring settings should change output');
});

runTest('Known Test Vector - Basic', () => {
  // Simple known test case
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Test single character encryption
  const result = enigma.encryptChar('A');
  assert.strictEqual(typeof result, 'string', 'Should return a string');
  assert.strictEqual(result.length, 1, 'Should return single character');
  assert.notStrictEqual(result, 'A', 'Should not return the same character');
});

runTest('Non-alphabetic Characters Pass Through', () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  const input = 'HELLO, WORLD! 123';
  const output = enigma.process(input);
  
  // Check that non-alphabetic characters are preserved
  assert.strictEqual(output.includes(','), true, 'Comma should pass through');
  assert.strictEqual(output.includes(' '), true, 'Space should pass through');
  assert.strictEqual(output.includes('!'), true, 'Exclamation should pass through');
  assert.strictEqual(output.includes('123'), true, 'Numbers should pass through');
});

runTest('Rotor Position Wraparound', () => {
  const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 25);
  rotor.step();
  assert.strictEqual(rotor.position, 0, 'Should wrap around from 25 to 0');
});

runTest('Full Encryption Cycle Symmetry', () => {
  const settings = {
    rotorIDs: [0, 1, 2],
    positions: [5, 10, 15],
    rings: [2, 4, 6],
    plugboard: [['A', 'M'], ['F', 'I'], ['N', 'V'], ['P', 'S'], ['T', 'U'], ['W', 'Z']]
  };
  
  const message = 'THISISASECRETMESSAGE';
  
  // Encrypt
  const enigma1 = new Enigma(settings.rotorIDs, settings.positions, settings.rings, settings.plugboard);
  const encrypted = enigma1.process(message);
  
  // Decrypt
  const enigma2 = new Enigma(settings.rotorIDs, settings.positions, settings.rings, settings.plugboard);
  const decrypted = enigma2.process(encrypted);
  
  assert.strictEqual(decrypted, message, 'Full encryption cycle should be symmetric');
  assert.notStrictEqual(encrypted, message, 'Message should actually be encrypted');
});

runTest('Complex Double Stepping Scenario', () => {
  // Test scenario where multiple double-stepping occurs
  // Set middle rotor near its notch
  const enigma = new Enigma([0, 1, 2], [0, 3, 20], [0, 0, 0], []); // Rotor II notch at E=4
  
  let positions = [];
  for (let i = 0; i < 10; i++) {
    positions.push([enigma.rotors[0].position, enigma.rotors[1].position, enigma.rotors[2].position]);
    enigma.encryptChar('A');
  }
  
  // Verify that stepping occurs correctly
  assert.strictEqual(positions[0][1], 3, 'Middle rotor should start at position 3');
  assert.strictEqual(positions[2][1], 4, 'Middle rotor should reach notch position 4 at step 2');
  assert.strictEqual(positions[3][1], 5, 'Middle rotor should advance to 5 after double-stepping');
  
  // Verify double-stepping triggered left rotor advancement
  assert.strictEqual(positions[2][0], 0, 'Left rotor should be 0 before double-step');
  assert.strictEqual(positions[3][0], 1, 'Left rotor should advance to 1 after double-step');
  
  // The exact sequence depends on when the notch is reached, but positions should advance
  const finalPos = [enigma.rotors[0].position, enigma.rotors[1].position, enigma.rotors[2].position];
  assert.strictEqual(finalPos[2], 4, 'Right rotor should have advanced 10 positions (with wraparound)'); // 20 + 10 = 30, 30 % 26 = 4
});

console.log('\n🧪 Running Enigma Machine Tests...\n');

// Run all tests
console.log('\n✅ All tests passed! The Enigma machine is working correctly.\n');

console.log('Test Summary:');
console.log('- ✅ Basic rotor stepping');
console.log('- ✅ Rotor notch detection');
console.log('- ✅ Single rotor advancement');
console.log('- ✅ Double stepping logic');
console.log('- ✅ Plugboard functionality');
console.log('- ✅ Ring settings effect');
console.log('- ✅ Encryption symmetry');
console.log('- ✅ Non-alphabetic character handling');
console.log('- ✅ Position wraparound');
console.log('- ✅ Complex stepping scenarios'); 