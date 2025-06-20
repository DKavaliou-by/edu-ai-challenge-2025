const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Sends an audio file to the OpenAI Whisper API for transcription.
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<string>} - The transcribed text.
 * @throws {Error} - If the transcription fails.
 */
async function transcribeAudio(filePath) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Please create a .env file and add your key.');
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (response.data && response.data.text) {
      return response.data.text;
    } else {
      throw new Error('Invalid response from Whisper API.');
    }
  } catch (error) {
    let errorMessage = 'Failed to transcribe audio.';
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage += ` OpenAI Error: ${error.response.data.error.message}`;
    } else {
      errorMessage += ` Error: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

module.exports = { transcribeAudio }; 