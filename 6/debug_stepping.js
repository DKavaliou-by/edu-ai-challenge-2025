const { Enigma } = require('./enigma.js');

console.log('=== Debugging Complex Double Stepping ===');

// Exact same setup as the failing test
const enigma = new Enigma([0, 1, 2], [0, 3, 20], [0, 0, 0], []); // Rotor II notch at E=4

console.log('Initial positions:', enigma.rotors.map(r => r.position));
console.log('Rotor notches: Q(16), E(4), V(21)');
console.log('Middle rotor starts at position 3, notch at position 4');

let positions = [];
for (let i = 0; i < 10; i++) {
  positions.push([enigma.rotors[0].position, enigma.rotors[1].position, enigma.rotors[2].position]);
  console.log(`Step ${i}: positions before = [${positions[i]}]`);
  
  // Check notch status before stepping
  console.log(`  Notches: L=${enigma.rotors[0].atNotch()}, M=${enigma.rotors[1].atNotch()}, R=${enigma.rotors[2].atNotch()}`);
  
  enigma.encryptChar('A');
  console.log(`  positions after = [${enigma.rotors.map(r => r.position)}]`);
}

console.log('\nPosition history:');
positions.forEach((pos, i) => {
  console.log(`Step ${i}: [${pos}]`);
});

console.log('\nTest assertions:');
console.log(`positions[0][1] = ${positions[0][1]} (should be 3): ${positions[0][1] === 3 ? 'PASS' : 'FAIL'}`);
console.log(`positions[5][1] = ${positions[5][1]} (should be 4): ${positions[5][1] === 4 ? 'PASS' : 'FAIL'}`);

const finalPos = [enigma.rotors[0].position, enigma.rotors[1].position, enigma.rotors[2].position];
console.log(`finalPos[2] = ${finalPos[2]} (should be 4): ${finalPos[2] === 4 ? 'PASS' : 'FAIL'}`);

// Calculate expected final right rotor position: 20 + 10 = 30, 30 % 26 = 4
console.log(`Expected right rotor calculation: (20 + 10) % 26 = ${(20 + 10) % 26}`); 