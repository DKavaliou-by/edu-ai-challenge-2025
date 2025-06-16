# Service Analysis Report Generator

A Node.js console application that generates detailed analysis reports for services using OpenAI's GPT-4.1-mini model.

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key (for production mode)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in project root:
```bash
# For production mode (with API key)
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# For test mode (without API key)
touch .env
```

## Usage

### Running the Application

1. Start the application:
```bash
npm start
```

2. When prompted, enter a service name or description:
```
Enter service name (e.g., "Spotify", "Notion") or description:
> Spotify
```

3. Choose output format:
```
How would you like to receive the report?
1. Display in terminal
2. Save to file
Enter choice (1/2):
```

4. View the results:
- If terminal output (option 1): Report will be displayed directly in the console
- If file output (option 2): Report will be saved as `report-{timestamp}.md`

### Example Output

Terminal output example:
```markdown
# Spotify Analysis Report

## Brief History
[Analysis content...]

## Target Audience
[Analysis content...]

[... other sections ...]
```

File output example:
```
Report saved to report-2024-03-14T12-34-56-789Z.md
```

### Test Mode
If no OpenAI API key is provided in the `.env` file, the application will run in test mode:
- Shows the generated prompt that would be sent to OpenAI
- Displays a placeholder response
- Useful for testing and development without using API credits

Example test mode output:
```
=== RUNNING IN TEST MODE ===
No OpenAI API key provided. The app will show the generated prompt instead of making API calls.

=== TEST MODE ===
No OpenAI API key provided. Showing generated prompt:
[Generated prompt content...]
=== END TEST MODE ===
```

## Report Sections

The generated report includes:
- Brief History
- Target Audience
- Core Features
- Unique Selling Points
- Business Model
- Tech Stack Insights
- Perceived Strengths
- Perceived Weaknesses

## Features
- Interactive console input using readline-sync
- OpenAI GPT-4.1-mini integration
- Secure API key management with dotenv
- Markdown-formatted report generation
- Option to save reports to files
- Comprehensive error handling
- Test mode for development and testing

## Troubleshooting

1. If you get "Module not found" errors:
```bash
npm install
```

2. If OpenAI API calls fail:
- Check your API key in `.env`
- Ensure you have sufficient API credits
- Verify your internet connection

3. If file saving fails:
- Check write permissions in the current directory
- Ensure sufficient disk space

## Dependencies
- readline-sync: ^1.4.10
- openai: ^4.28.0
- dotenv: ^16.4.5 