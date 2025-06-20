const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Sends transcription text to GPT-4.1-mini for summarization
 * @param {string} transcriptionText - The transcribed text to summarize
 * @returns {Promise<string>} - The generated summary
 * @throws {Error} - If the summarization fails
 */
async function summarizeTranscription(transcriptionText) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Please create a .env file and add your key.');
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, well-structured summaries of transcribed audio content. Focus on the main ideas, key points, and important details. Format your response as clean markdown.'
        },
        {
          role: 'user',
          content: `Please provide a concise summary of the main ideas from this transcription:\n\n${transcriptionText}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from GPT API.');
    }
  } catch (error) {
    let errorMessage = 'Failed to generate summary.';
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage += ` OpenAI Error: ${error.response.data.error.message}`;
    } else {
      errorMessage += ` Error: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

module.exports = { summarizeTranscription }; 