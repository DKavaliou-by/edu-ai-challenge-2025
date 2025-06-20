const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Sends transcription text to GPT-4o-mini for analytics
 * @param {string} transcriptionText - The transcribed text to analyze
 * @param {number} audioDurationMinutes - Duration of the audio in minutes
 * @returns {Promise<Object>} - The analytics data as JSON object
 * @throws {Error} - If the analysis fails
 */
async function analyzeTranscription(transcriptionText, audioDurationMinutes) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Please create a .env file and add your key.');
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `You are an analytics expert. Analyze the provided transcription and return ONLY a valid JSON object with the following structure:
{
  "word_count": <total number of words>,
  "speaking_speed_wpm": <words per minute calculated as word_count / audio_duration_minutes>,
  "frequently_mentioned_topics": [
    { "topic": "<topic name>", "mentions": <number of times mentioned> },
    ...
  ]
}

Rules:
- Count only the top 3+ most frequently mentioned topics
- Sort topics by mention count (highest first)
- Return ONLY the JSON object, no additional text
- Ensure the JSON is valid and properly formatted`
        },
        {
          role: 'user',
          content: `Analyze this transcription. Audio duration: ${audioDurationMinutes} minutes.

Transcription:
${transcriptionText}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content.trim();
      
      // Try to parse the JSON response
      try {
        const analytics = JSON.parse(content);
        
        // Validate the structure
        if (!analytics.word_count || !analytics.speaking_speed_wpm || !Array.isArray(analytics.frequently_mentioned_topics)) {
          throw new Error('Invalid analytics structure returned from GPT');
        }
        
        return analytics;
      } catch (parseError) {
        throw new Error(`Failed to parse GPT response as JSON: ${parseError.message}`);
      }
    } else {
      throw new Error('Invalid response from GPT API.');
    }
  } catch (error) {
    let errorMessage = 'Failed to analyze transcription.';
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage += ` OpenAI Error: ${error.response.data.error.message}`;
    } else {
      errorMessage += ` Error: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

/**
 * Saves analytics data to a JSON file
 * @param {Object} analyticsData - The analytics data object
 * @param {string} originalFilePath - Path to the original audio file
 * @returns {string} - The filename that was created
 */
function saveAnalyticsToFile(analyticsData, originalFilePath) {
  const audioFileName = require('path').basename(originalFilePath, require('path').extname(originalFilePath));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseName = `analysis-${audioFileName}-${timestamp}`;
  
  // Generate unique filename
  let counter = 0;
  let filename = `${baseName}.json`;
  
  while (fs.existsSync(filename)) {
    counter++;
    filename = `${baseName}-${counter}.json`;
  }
  
  fs.writeFileSync(filename, JSON.stringify(analyticsData, null, 2), 'utf8');
  return filename;
}

module.exports = { analyzeTranscription, saveAnalyticsToFile }; 