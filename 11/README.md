# Audio File Validator & Transcriber

A Node.js console app for validating, transcribing, summarizing, and analyzing audio files using OpenAI Whisper and GPT APIs.

## Features
- Interactive CLI for audio file selection
- Validates file existence and type
- Transcribes audio using OpenAI Whisper API
- Summarizes transcription using GPT-4.1-mini
- Analyzes transcription for word count, speaking speed, and top topics using GPT-4.1-mini
- Outputs:
  - Markdown transcription file
  - Markdown summary file
  - JSON analytics file
- Colorized, formatted console output

## Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <repo-directory>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage
1. Run the app:
   ```bash
   npm start
   ```
2. Enter the path to your audio file (e.g., `files/audio.mp3`) when prompted.
3. Follow the prompts to transcribe, summarize, and analyze the audio.

## Output Files
- **transcription.md**: Contains the full transcription in markdown format.
- **summary.md**: Contains a concise summary of the main ideas in markdown format.
- **analysis.json**: Contains analytics (word count, speaking speed, top topics) in JSON format.

## APIs Used
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [OpenAI GPT-4.1-mini API](https://platform.openai.com/docs/guides/gpt)

## Example Output Files
See the placeholder files `transcription.md`, `summary.md`, and `analysis.json` for the expected output structure.

## File Types Generated

### Transcription Files
Transcriptions are automatically saved as markdown files with the following naming convention:
- Format: `transcription-{original-filename}-{timestamp}.md`
- If a file with the same name exists, it will be numbered: `transcription-{filename}-{timestamp}-1.md`, `transcription-{filename}-{timestamp}-2.md`, etc.
- Each file includes metadata about the original audio file and transcription date.

### Summary Files
Summaries are automatically saved as markdown files with the following naming convention:
- Format: `summary-{original-filename}-{timestamp}.md`
- If a file with the same name exists, it will be numbered: `summary-{filename}-{timestamp}-1.md`, `summary-{filename}-{timestamp}-2.md`, etc.
- Each file includes metadata about the original audio file and summary generation date.

### Analytics Files
Analytics are automatically saved as JSON files with the following naming convention:
- Format: `analysis-{original-filename}-{timestamp}.json`
- If a file with the same name exists, it will be numbered: `analysis-{filename}-{timestamp}-1.json`, `analysis-{filename}-{timestamp}-2.json`, etc.
- Each file contains structured analytics data including word count, speaking speed, and frequently mentioned topics.

### Analytics JSON Structure
```json
{
  "word_count": 1280,
  "speaking_speed_wpm": 366,
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Product Features", "mentions": 4 },
    { "topic": "User Experience", "mentions": 3 }
  ]
}
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

## Error Handling

The app handles various error scenarios:
- Non-existent files
- Directory paths instead of files
- Invalid file extensions (with warnings)
- General file system errors 