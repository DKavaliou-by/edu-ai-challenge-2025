const { searchProducts } = require('./product-search');

async function test() {
    const testInputs = [
        "I want headphones under $100 that are in stock",
        "Show me fitness equipment under $50",
        "Find kitchen appliances with rating above 4.5",
        "Books under $20"
    ];
    
    for (const input of testInputs) {
        console.log(`\n=== Testing: "${input}" ===`);
        try {
            const result = await searchProducts(input);
            console.log(result);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

test(); 