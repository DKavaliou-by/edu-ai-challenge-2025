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
            max_tokens: 1500
        });

        return response.choices[0].message.content;
    } catch (error) {
        if (error.response) {
            throw new Error(`OpenAI API Error: ${error.response.status} - ${error.response.data.error.message}`);
        }
        throw new Error(`Error calling OpenAI API: ${error.message}`);
    }
}

async function getProductFilters(userInput, functionDefinition) {
    if (isTestMode) {
        console.log('\n=== TEST MODE ===');
        console.log('No OpenAI API key provided. Showing function call that would be made:');
        console.log('\nUser Input:', userInput);
        console.log('\nFunction Definition:', JSON.stringify(functionDefinition, null, 2));
        
        // Return test filters based on common patterns in user input
        const testFilters = {};
        const inputLower = userInput.toLowerCase();
        
        // Category detection
        if (inputLower.includes('headphones') || inputLower.includes('laptop') || inputLower.includes('smartphone') || 
            inputLower.includes('speaker') || inputLower.includes('monitor') || inputLower.includes('mouse') || 
            inputLower.includes('hard drive') || inputLower.includes('charger')) {
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('yoga') || inputLower.includes('treadmill') || inputLower.includes('dumbbell') || 
                   inputLower.includes('bike') || inputLower.includes('bands') || inputLower.includes('kettlebell') || 
                   inputLower.includes('roller') || inputLower.includes('pull-up') || inputLower.includes('jump rope') || 
                   inputLower.includes('ab roller')) {
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('blender') || inputLower.includes('fryer') || inputLower.includes('microwave') || 
                   inputLower.includes('coffee') || inputLower.includes('toaster') || inputLower.includes('kettle') || 
                   inputLower.includes('rice cooker') || inputLower.includes('pressure cooker') || 
                   inputLower.includes('dishwasher') || inputLower.includes('refrigerator')) {
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('book') || inputLower.includes('novel') || inputLower.includes('guide') || 
                   inputLower.includes('cookbook') || inputLower.includes('history') || inputLower.includes('biography') || 
                   inputLower.includes('mystery') || inputLower.includes('children') || inputLower.includes('fiction')) {
            testFilters.category = 'Books';
        } else if (inputLower.includes('shirt') || inputLower.includes('dress') || inputLower.includes('jeans') || 
                   inputLower.includes('jacket') || inputLower.includes('shoes') || inputLower.includes('sandals') || 
                   inputLower.includes('hoodie') || inputLower.includes('scarf') || inputLower.includes('socks') || 
                   inputLower.includes('hat')) {
            testFilters.category = 'Clothing';
        }
        
        // Price detection
        const priceMatch = inputLower.match(/under \$?(\d+)/);
        if (priceMatch) {
            testFilters.max_price = parseInt(priceMatch[1]);
        }
        
        // Rating detection
        const ratingMatch = inputLower.match(/rating.*?(\d+\.?\d*)/);
        if (ratingMatch) {
            testFilters.min_rating = parseFloat(ratingMatch[1]);
        }
        
        // Stock detection
        if (inputLower.includes('in stock')) {
            testFilters.in_stock = true;
        } else if (inputLower.includes('out of stock')) {
            testFilters.in_stock = false;
        }
        
        console.log('\nApplied Filters:', JSON.stringify(testFilters, null, 2));
        console.log('\n=== END TEST MODE ===');
        
        return testFilters;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "user",
                    content: `Extract product filtering criteria from this user request: "${userInput}"`
                }
            ],
            functions: [functionDefinition],
            function_call: { name: functionDefinition.name },
            temperature: 0.1,
            max_tokens: 1000
        });

        const functionCall = response.choices[0].message.function_call;
        if (functionCall && functionCall.name === functionDefinition.name) {
            return JSON.parse(functionCall.arguments);
        }
        
        return {};
    } catch (error) {
        if (error.response) {
            throw new Error(`OpenAI API Error: ${error.response.status} - ${error.response.data.error.message}`);
        }
        throw new Error(`Error calling OpenAI API: ${error.message}`);
    }
}

module.exports = { getAIResponse, getProductFilters, isTestMode }; 