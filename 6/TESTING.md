# Testing Guide

This document provides detailed instructions for running tests and analyzing test coverage for the Enigma machine implementation.

## Quick Start

```bash
# Run tests immediately (no dependencies needed)
node test.js

# Or install dependencies and use npm scripts
npm install
npm test
```

## Test Commands

### 1. Direct Node.js Execution
```bash
node test.js
```
- **Pros**: No dependencies, runs immediately
- **Cons**: No coverage information

### 2. NPM Scripts
```bash
npm test                    # Basic test run
npm run test:coverage       # Run with coverage (terminal + file output)
npm run test:coverage-html  # Generate HTML coverage report (+ file output)
npm run test:coverage-file  # Save coverage to file only (no terminal output)
```

## Coverage Analysis

### Terminal Coverage Output
```bash
npm run test:coverage
```

Example output:
```
🧪 Running Enigma Machine Tests...
[... test results ...]

-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |   98.55 |    95.83 |     100 |   98.55 |                   
 enigma.js |   98.55 |    95.83 |     100 |   98.55 | 45                
-----------|---------|----------|---------|---------|-------------------
```

### Test Report File

Coverage results are automatically saved to `test_report.txt`:

```bash
# Shows output on terminal AND saves to file
npm run test:coverage

# Saves to file only (silent mode for CI/CD)
npm run test:coverage-file

# Check the saved report
cat test_report.txt
```

The `test_report.txt` file contains:
- Complete test execution results
- Coverage statistics table
- Any error messages or warnings
- Timestamp of test execution

### HTML Coverage Report
```bash
npm run test:coverage-html
open coverage/index.html  # macOS
# or
start coverage/index.html # Windows
# or
xdg-open coverage/index.html # Linux
```

The HTML report provides:
- **Line-by-line coverage** highlighting
- **Branch coverage** analysis
- **Function coverage** metrics
- **Interactive exploration** of uncovered code

## Test Structure

### Test Categories

1. **Unit Tests** - Individual component functionality
   - Rotor mechanics (stepping, notch detection)
   - Basic encryption/decryption

2. **Integration Tests** - Component interaction
   - Full encryption cycle
   - Double-stepping behavior
   - Plugboard + rotor interaction

3. **Edge Case Tests** - Boundary conditions
   - Position wraparound
   - Non-alphabetic characters
   - Empty plugboard configuration

4. **Regression Tests** - Bug verification
   - Double-stepping fix verification
   - Dual plugboard application

### Critical Test Cases

**Double-Stepping Logic Test:**
```javascript
// Verifies the historical Enigma double-stepping behavior
// When middle rotor hits notch, both middle and left rotors advance
runTest('Double Stepping Logic', () => {
  const enigma = new TestEnigma([0, 1, 2], [0, 4, 25], [0, 0, 0], []);
  enigma.encryptChar('A');
  // Validates both rotors stepped correctly
});
```

**Plugboard Dual Application:**
```javascript
// Ensures plugboard is applied twice (input + output)
runTest('Plugboard Swap Function', () => {
  const enigma = new TestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
  // Tests full encryption cycle symmetry
});
```

## Coverage Targets

- **Statement Coverage**: > 95%
- **Branch Coverage**: > 90%
- **Function Coverage**: 100%
- **Line Coverage**: > 95%

## Debugging Failed Tests

If a test fails:

1. **Check error message** for specific assertion failure
2. **Isolate the failing test** by commenting out others
3. **Add debug logging** to understand state changes:
   ```javascript
   console.log('Rotor positions:', enigma.rotors.map(r => r.position));
   ```
4. **Verify test setup** matches expected initial conditions

## Adding New Tests

Follow this pattern:
```javascript
runTest('Your Test Name', () => {
  // Setup
  const enigma = new TestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Action
  const result = enigma.process('TEST');
  
  // Assertion
  assert.strictEqual(result, 'EXPECTED', 'Explanation of what should happen');
});
```

## Performance Testing

For performance benchmarks:
```javascript
runTest('Performance Test', () => {
  const enigma = new TestEnigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < 1000; i++) {
    enigma.process('TESTMESSAGE');
  }
  
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
  console.log(`1000 encryptions took ${duration.toFixed(2)}ms`);
});
```

## Continuous Integration

For CI/CD pipelines:
```bash
# In your CI script
npm install
npm test
npm run test:coverage-file  # Silent mode, saves to test_report.txt

# Check test results from file
if grep -q "All tests passed" test_report.txt; then
  echo "Tests passed!"
else
  echo "Tests failed!"
  cat test_report.txt
  exit 1
fi

# Fail build if coverage below threshold
npx c8 check-coverage --statements 95 --branches 90 --functions 100 --lines 95

# Archive test report as CI artifact
# (GitHub Actions, Jenkins, etc. can save test_report.txt)
```

## Troubleshooting

**Common Issues:**

1. **"c8: command not found"**
   - Run `npm install` first
   - Or install globally: `npm install -g c8`

2. **Tests pass but coverage is 0%**
   - Ensure you're using `npm run test:coverage`
   - Check that `enigma.js` exports classes correctly

3. **HTML report not generated**
   - Check if `coverage/` directory exists
   - Verify write permissions in project directory 