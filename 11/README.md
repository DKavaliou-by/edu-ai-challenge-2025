# Audio File Validator

A Node.js console application that prompts users for an audio file path and validates its existence.

## Features

- Interactive command-line interface using Inquirer
- File existence validation
- File type validation (checks if it's actually a file, not a directory)
- Audio file extension validation
- Detailed file information display (size, creation date, modification date)

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

Run the application:
```bash
npm start
```

Or directly with Node:
```bash
node index.js
```

## Supported Audio Formats

The app recognizes these common audio file extensions:
- .mp3
- .wav
- .flac
- .aac
- .ogg
- .m4a
- .wma
- .aiff

## Example Output

```
🎵 Audio File Validator

? Enter the path to your audio file (e.g., audio.mp3): /path/to/music.mp3

✅ File validation successful!
📁 Path: /path/to/music.mp3
📊 Size: 3.45 MB
📅 Created: 1/15/2024, 2:30:45 PM
📅 Modified: 1/15/2024, 2:30:45 PM
🔧 Extension: .mp3
```

## Error Handling

The app handles various error scenarios:
- Non-existent files
- Directory paths instead of files
- Invalid file extensions (with warnings)
- General file system errors 