<img src="enigma.png" alt="Broken Enigma Machine" width="300"/>

# Enigma Machine CLI

enigma.js contains a simplified command-line Enigma machine implementation. The Enigma was a rotor-based cipher device used for secure communication in the early 20th century.

## Usage

You can use the CLI to encrypt or decrypt messages using a configurable Enigma setup (rotors, plugboard, reflector).

## How to Run

1. **Ensure you have Node.js installed.**
2. **Navigate to the directory with enigma.js** in your terminal.
3. **Run the program** using:
   ```bash
   node enigma.js
   ```
4. **Follow the prompts** to enter your message and configuration.

## Detailed Instructions

When you run the program, you will be prompted for several configuration options:

### 1. Enter message
- Type the message you want to encrypt or decrypt. Only A-Z letters are processed; other characters are passed through unchanged.

### 2. Rotor positions (e.g. `0 0 0`)
- Enter three numbers (space-separated), each from 0 to 25, representing the initial position of each rotor (left to right). For example, `0 0 0` means all rotors start at 'A'.

### 3. Ring settings (e.g. `0 0 0`)
- Enter three numbers (space-separated), each from 0 to 25, representing the ring setting for each rotor. The ring setting shifts the internal wiring of the rotor. Historically, this was used to add another layer of security.

### 4. Plugboard pairs (e.g. `AB CD`)
- Enter pairs of letters (no separator between letters, space between pairs) to swap on the plugboard. For example, `AB CD` swaps A<->B and C<->D. You can leave this blank for no plugboard swaps.

### Example Session
```
$ node enigma.js
Enter message: HELLOWORLD
Rotor positions (e.g. 0 0 0): 0 0 0
Ring settings (e.g. 0 0 0): 0 0 0
Plugboard pairs (e.g. AB CD): QW ER
Output: ZISNQXQKGA
```

### Notes
- The machine always uses rotors I, II, and III (historical Enigma I order, rightmost rotor steps every keypress).
- Only uppercase A-Z are encrypted; all other characters are output unchanged.
- The same settings must be used to decrypt a message as were used to encrypt it.

## Testing

This project includes comprehensive unit tests to verify correct Enigma operation.

### Running Tests

**Basic test run:**
```bash
node test.js
```

**Using npm scripts:**
```bash
npm test
```

### Test Coverage

To get test coverage information, first install the coverage tool:

```bash
npm install
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

**Generate HTML coverage report:**
```bash
npm run test:coverage-html
```

**Save coverage report to file only:**
```bash
npm run test:coverage-file
```

The HTML report will be generated in the `coverage` directory. Open `coverage/index.html` in your browser to view detailed coverage information. Coverage output is automatically saved to `test_report.txt` for CI/CD integration.

### What the Tests Cover

The test suite verifies:
- ✅ Basic rotor stepping mechanics
- ✅ Rotor notch detection and positioning
- ✅ Single rotor advancement behavior
- ✅ Critical double-stepping logic (fixed bug)
- ✅ Plugboard functionality (dual application)
- ✅ Ring settings effect on encryption
- ✅ Full encryption/decryption symmetry
- ✅ Non-alphabetic character handling
- ✅ Position wraparound at boundaries
- ✅ Complex multi-step scenarios

### Test Output Example

```
🧪 Running Enigma Machine Tests...

✅ Rotor Basic Stepping
✅ Rotor Notch Detection  
✅ Single Rotor Stepping
✅ Double Stepping Logic
✅ Plugboard Swap Function
✅ No Plugboard Configuration
✅ Ring Settings Effect
✅ Known Test Vector - Basic
✅ Non-alphabetic Characters Pass Through
✅ Rotor Position Wraparound
✅ Full Encryption Cycle Symmetry
✅ Complex Double Stepping Scenario

✅ All tests passed! The Enigma machine is working correctly.
```

The tests ensure the implementation matches historical Enigma I machine behavior and verify that both critical bugs (double-stepping and dual plugboard application) have been properly fixed.
