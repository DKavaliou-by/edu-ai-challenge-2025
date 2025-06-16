require('dotenv').config();
const OpenAI = require('openai');

const isTestMode = !process.env.OPENAI_API_KEY;

const openai = isTestMode ? null : new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function getAIResponse(prompt) {
    if (isTestMode) {
        console.log('\n=== TEST MODE ===');
        console.log('No OpenAI API key provided. Showing generated prompt:');
        console.log('\n' + prompt);
        console.log('\n=== END TEST MODE ===');
        return 'This is a test response. In production mode, this would be the AI-generated analysis.';
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        return response.choices[0].message.content;
    } catch (error) {
        if (error.response) {
            throw new Error(`OpenAI API Error: ${error.response.status} - ${error.response.data.error.message}`);
        }
        throw new Error(`Error calling OpenAI API: ${error.message}`);
    }
}

module.exports = { getAIResponse, isTestMode }; 