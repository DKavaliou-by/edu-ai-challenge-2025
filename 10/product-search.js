const { getProductFilters } = require('./openai-service');
const fs = require('fs').promises;

const FILTER_FUNCTION = {
    name: "filter_products",
    description: "Filters products based on user preferences",
    parameters: {
        type: "object",
        properties: {
            category: { 
                type: "string",
                description: "Product category (Electronics, Fitness, Kitchen, Books, Clothing)"
            },
            max_price: { 
                type: "number",
                description: "Maximum price in dollars"
            },
            min_rating: { 
                type: "number",
                description: "Minimum rating (1.0 to 5.0)"
            },
            in_stock: { 
                type: "boolean",
                description: "Whether product must be in stock"
            }
        },
        required: []
    }
};

async function loadProducts() {
    try {
        const data = await fs.readFile('products.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to load products: ${error.message}`);
    }
}

function filterProducts(products, filters) {
    return products.filter(product => {
        // Category filter
        if (filters.category && product.category !== filters.category) {
            return false;
        }
        
        // Max price filter
        if (filters.max_price && product.price > filters.max_price) {
            return false;
        }
        
        // Min rating filter
        if (filters.min_rating && product.rating < filters.min_rating) {
            return false;
        }
        
        // In stock filter
        if (filters.in_stock !== undefined && product.in_stock !== filters.in_stock) {
            return false;
        }
        
        return true;
    });
}

function formatResults(products) {
    if (products.length === 0) {
        return "No products found matching your criteria.";
    }
    
    return products.map((product, index) => {
        const stockStatus = product.in_stock ? "In Stock" : "Out of Stock";
        return `${index + 1}. ${product.name} – $${product.price}, Rating: ${product.rating}, ${stockStatus}`;
    }).join('\n');
}

async function searchProducts(userInput) {
    try {
        // Get filters from OpenAI function calling
        const filters = await getProductFilters(userInput, FILTER_FUNCTION);
        
        // Load and filter products
        const allProducts = await loadProducts();
        const filteredProducts = filterProducts(allProducts, filters);
        
        // Format and return results
        return formatResults(filteredProducts);
    } catch (error) {
        throw new Error(`Failed to search products: ${error.message}`);
    }
}

module.exports = { searchProducts }; 