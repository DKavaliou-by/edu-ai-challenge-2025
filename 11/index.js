const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { transcribeAudio } = require('./transcribe');
const { summarizeTranscription } = require('./summarize');
const { analyzeTranscription, saveAnalyticsToFile } = require('./analyze');

/**
 * Generates a unique filename for the transcription
 * @param {string} baseName - Base filename without extension
 * @returns {string} - Unique filename
 */
function generateUniqueFilename(baseName) {
  let counter = 0;
  let filename = `${baseName}.md`;
  
  while (fs.existsSync(filename)) {
    counter++;
    filename = `${baseName}-${counter}.md`;
  }
  
  return filename;
}

/**
 * Saves transcription text to a markdown file
 * @param {string} transcribedText - The transcribed text
 * @param {string} originalFilePath - Path to the original audio file
 * @returns {string} - The filename that was created
 */
function saveTranscriptionToFile(transcribedText, originalFilePath) {
  const audioFileName = path.basename(originalFilePath, path.extname(originalFilePath));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseName = `transcription-${audioFileName}-${timestamp}`;
  const filename = generateUniqueFilename(baseName);
  
  const markdownContent = `# Transcription

**Original Audio File:** ${originalFilePath}
**Transcribed on:** ${new Date().toLocaleString()}

## Content

${transcribedText}
`;

  fs.writeFileSync(filename, markdownContent, 'utf8');
  return filename;
}

/**
 * Saves summary text to a markdown file
 * @param {string} summaryText - The summary text
 * @param {string} originalFilePath - Path to the original audio file
 * @returns {string} - The filename that was created
 */
function saveSummaryToFile(summaryText, originalFilePath) {
  const audioFileName = path.basename(originalFilePath, path.extname(originalFilePath));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseName = `summary-${audioFileName}-${timestamp}`;
  const filename = generateUniqueFilename(baseName);
  
  const markdownContent = `# Summary

**Original Audio File:** ${originalFilePath}
**Summarized on:** ${new Date().toLocaleString()}

## Main Ideas

${summaryText}
`;

  fs.writeFileSync(filename, markdownContent, 'utf8');
  return filename;
}

/**
 * Gets audio duration in minutes (placeholder - would need audio processing library)
 * For now, we'll ask the user for the duration
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<number>} - Duration in minutes
 */
async function getAudioDuration(filePath) {
  const { duration } = await inquirer.prompt([
    {
      type: 'number',
      name: 'duration',
      message: 'Enter the audio duration in minutes (e.g., 5.5 for 5 minutes 30 seconds):',
      validate: (input) => {
        if (input <= 0) {
          return 'Duration must be greater than 0';
        }
        return true;
      }
    }
  ]);
  
  return duration;
}

async function validateAudioFile() {
  console.log('🎵 Audio File Validator & Transcriber\n');
  
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'filePath',
        message: 'Enter the path to your audio file (e.g., audio.mp3):',
        validate: (input) => {
          if (!input.trim()) {
            return 'Please enter a file path';
          }
          return true;
        }
      }
    ]);

    const filePath = answers.filePath.trim();
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('\n❌ Error: File does not exist at the specified path.');
      console.log(`Path: ${filePath}`);
      return;
    }

    // Check if it's a file (not a directory)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      console.log('\n❌ Error: The specified path is not a file.');
      console.log(`Path: ${filePath}`);
      return;
    }

    // Get file extension and validate it's an audio file
    const ext = path.extname(filePath).toLowerCase();
    const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.aiff'];
    
    if (!audioExtensions.includes(ext)) {
      console.log('\n⚠️  Warning: File extension may not be a common audio format.');
      console.log(`Extension: ${ext}`);
      console.log('Supported extensions: ' + audioExtensions.join(', '));
    }

    // Display file information
    console.log('\n✅ File validation successful!');
    console.log(`📁 Path: ${filePath}`);
    console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📅 Created: ${stats.birthtime.toLocaleString()}`);
    console.log(`📅 Modified: ${stats.mtime.toLocaleString()}`);
    console.log(`🔧 Extension: ${ext}`);

    // Ask user if they want to transcribe
    const { shouldTranscribe } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldTranscribe',
        message: 'Do you want to transcribe this audio file?',
        default: false,
      },
    ]);

    if (shouldTranscribe) {
      console.log('\n🔄 Transcribing... Please wait.');
      try {
        const transcribedText = await transcribeAudio(filePath);
        console.log('\n📝 Transcription Result:');
        console.log(transcribedText);
        
        // Save transcription to file
        const savedFilename = saveTranscriptionToFile(transcribedText, filePath);
        console.log(`\n💾 Transcription saved to: ${savedFilename}`);
        
        // Ask user if they want to generate a summary
        const { shouldSummarize } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldSummarize',
            message: 'Do you want to generate a summary of the transcription?',
            default: false,
          },
        ]);

        if (shouldSummarize) {
          console.log(chalk.cyan('\n🤖 Generating summary with GPT-4.1-mini... Please wait.'));
          try {
            const summaryText = await summarizeTranscription(transcribedText);
            console.log(chalk.green('\n📋 Summary:'));
            console.log(chalk.yellow(summaryText));
            
            // Save summary to file
            const savedSummaryFilename = saveSummaryToFile(summaryText, filePath);
            console.log(chalk.green(`\n💾 Summary saved to: ${savedSummaryFilename}`));
            
            // Ask user if they want to generate analytics
            const { shouldAnalyze } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'shouldAnalyze',
                message: 'Do you want to generate analytics for the transcription?',
                default: false,
              },
            ]);

            if (shouldAnalyze) {
              console.log(chalk.cyan('\n📊 Getting audio duration for analytics...'));
              const audioDurationMinutes = await getAudioDuration(filePath);
              
              console.log(chalk.cyan('\n🔍 Generating analytics with GPT-4.1-mini... Please wait.'));
              try {
                const analyticsData = await analyzeTranscription(transcribedText, audioDurationMinutes);
                console.log(chalk.green('\n📈 Analytics Results:'));
                console.log(chalk.magenta('📝 Word Count:'), chalk.bold(analyticsData.word_count));
                console.log(chalk.magenta('⚡ Speaking Speed:'), chalk.bold(`${analyticsData.speaking_speed_wpm} words per minute`));
                console.log(chalk.magenta('\n🎯 Frequently Mentioned Topics:'));
                console.table(analyticsData.frequently_mentioned_topics);
                
                // Save analytics to file
                const savedAnalyticsFilename = saveAnalyticsToFile(analyticsData, filePath);
                console.log(chalk.green(`\n💾 Analytics saved to: ${savedAnalyticsFilename}`));
                
              } catch (analyticsError) {
                console.error(chalk.red(`\n❌ Analytics Generation Failed: ${analyticsError.message}`));
              }
            } else {
              console.log(chalk.gray('\n👍 Analytics generation skipped.'));
            }
            
          } catch (summaryError) {
            console.error(chalk.red(`\n❌ Summary Generation Failed: ${summaryError.message}`));
          }
        } else {
          console.log(chalk.gray('\n👍 Summary generation skipped.'));
        }
        
        // Ask user if they want to generate analytics (even if summary was skipped)
        if (!shouldSummarize) {
          const { shouldAnalyze } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'shouldAnalyze',
              message: 'Do you want to generate analytics for the transcription?',
              default: false,
            },
          ]);

          if (shouldAnalyze) {
            console.log(chalk.cyan('\n📊 Getting audio duration for analytics...'));
            const audioDurationMinutes = await getAudioDuration(filePath);
            
            console.log(chalk.cyan('\n🔍 Generating analytics with GPT-4.1-mini... Please wait.'));
            try {
              const analyticsData = await analyzeTranscription(transcribedText, audioDurationMinutes);
              console.log(chalk.green('\n📈 Analytics Results:'));
              console.log(chalk.magenta('📝 Word Count:'), chalk.bold(analyticsData.word_count));
              console.log(chalk.magenta('⚡ Speaking Speed:'), chalk.bold(`${analyticsData.speaking_speed_wpm} words per minute`));
              console.log(chalk.magenta('\n🎯 Frequently Mentioned Topics:'));
              console.table(analyticsData.frequently_mentioned_topics);
              
              // Save analytics to file
              const savedAnalyticsFilename = saveAnalyticsToFile(analyticsData, filePath);
              console.log(chalk.green(`\n💾 Analytics saved to: ${savedAnalyticsFilename}`));
              
            } catch (analyticsError) {
              console.error(chalk.red(`\n❌ Analytics Generation Failed: ${analyticsError.message}`));
            }
          } else {
            console.log(chalk.gray('\n👍 Analytics generation skipped.'));
          }
        }
        
      } catch (transcriptionError) {
        console.error(`\n❌ Transcription Failed: ${transcriptionError.message}`);
      }
    } else {
      console.log('\n👍 Transcription skipped.');
    }

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message);
  }
}

// Run the application
validateAudioFile(); 