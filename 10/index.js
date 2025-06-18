const readlineSync = require('readline-sync');
const { searchProducts } = require('./product-search');
const { isTestMode } = require('./openai-service');

async function getProductSearchInput() {
    if (isTestMode) {
        console.log('\n=== RUNNING IN TEST MODE ===');
        console.log('No OpenAI API key provided. The app will show the generated function call instead of making API calls.');
    }
    
    console.log('\nEnter your product search criteria (e.g., "I want headphones under $100 that are in stock"):');
    const input = readlineSync.question('> ');
    
    if (!input.trim()) {
        console.log('Error: Input cannot be empty');
        return getProductSearchInput();
    }
    
    return input.trim();
}

async function main() {
    try {
        const searchInput = await getProductSearchInput();
        
        console.log('\nSearching for products...');
        const results = await searchProducts(searchInput);
        
        console.log('\nSearch Results:');
        console.log(results);
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

main(); 