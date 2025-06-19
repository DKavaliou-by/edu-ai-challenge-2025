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

async function getProductFilters(userInput, functionDefinition, forceTestMode = false) {
    if (isTestMode || forceTestMode) {
        console.log('\n=== TEST MODE ===');
        if (forceTestMode) {
            console.log('Test mode enabled via --test flag. Showing function call that would be made:');
        } else {
            console.log('No OpenAI API key provided. Showing function call that would be made:');
        }
        console.log('\nUser Input:', userInput);
        console.log('\nFunction Definition:', JSON.stringify(functionDefinition, null, 2));
        
        // Return test filters based on common patterns in user input
        const testFilters = {};
        const inputLower = userInput.toLowerCase();
        
        // Product name detection (most specific)
        if (inputLower.includes('smartphone') || inputLower.includes('phone')) {
            testFilters.product_name = 'smartphone';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('headphones') || inputLower.includes('headphone')) {
            testFilters.product_name = 'headphones';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('laptop')) {
            testFilters.product_name = 'laptop';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('smart watch') || inputLower.includes('smartwatch')) {
            testFilters.product_name = 'smart watch';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('speaker')) {
            testFilters.product_name = 'speaker';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('monitor')) {
            testFilters.product_name = 'monitor';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('mouse')) {
            testFilters.product_name = 'mouse';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('hard drive')) {
            testFilters.product_name = 'hard drive';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('charger')) {
            testFilters.product_name = 'charger';
            testFilters.category = 'Electronics';
        } else if (inputLower.includes('yoga mat')) {
            testFilters.product_name = 'yoga mat';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('treadmill')) {
            testFilters.product_name = 'treadmill';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('dumbbell')) {
            testFilters.product_name = 'dumbbell';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('bike')) {
            testFilters.product_name = 'bike';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('bands')) {
            testFilters.product_name = 'bands';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('kettlebell')) {
            testFilters.product_name = 'kettlebell';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('roller')) {
            testFilters.product_name = 'roller';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('pull-up')) {
            testFilters.product_name = 'pull-up';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('jump rope')) {
            testFilters.product_name = 'jump rope';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('ab roller')) {
            testFilters.product_name = 'ab roller';
            testFilters.category = 'Fitness';
        } else if (inputLower.includes('blender')) {
            testFilters.product_name = 'blender';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('fryer')) {
            testFilters.product_name = 'fryer';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('microwave')) {
            testFilters.product_name = 'microwave';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('coffee')) {
            testFilters.product_name = 'coffee';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('toaster')) {
            testFilters.product_name = 'toaster';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('kettle')) {
            testFilters.product_name = 'kettle';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('rice cooker')) {
            testFilters.product_name = 'rice cooker';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('pressure cooker')) {
            testFilters.product_name = 'pressure cooker';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('dishwasher')) {
            testFilters.product_name = 'dishwasher';
            testFilters.category = 'Kitchen';
        } else if (inputLower.includes('refrigerator')) {
            testFilters.product_name = 'refrigerator';
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
                    content: `Extract product filtering criteria from this user request: "${userInput}". Be specific and extract product names when mentioned.`
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