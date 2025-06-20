const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('./transcribe');

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