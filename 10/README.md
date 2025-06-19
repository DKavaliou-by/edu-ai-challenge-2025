# Product Search with OpenAI Function Calling

A Node.js console application that uses OpenAI's GPT-4.1-mini model with function calling to search and filter products from a local dataset.

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key (for production mode)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in project root:
```bash
# For production mode (with API key)
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# For test mode (without API key)
touch .env
```

## Usage

### Running the Application

1. Start the application:
```bash
npm start
```

2. When prompted, enter your product search criteria in natural language:
```
Enter your product search criteria (e.g., "I want headphones under $100 that are in stock"):
> I want headphones under $100 that are in stock
```

3. View the results:
```
Search Results:
1. Wireless Headphones – $99.99, Rating: 4.5, In Stock
2. Bluetooth Speaker – $49.99, Rating: 4.4, In Stock
3. Gaming Mouse – $59.99, Rating: 4.3, In Stock
4. External Hard Drive – $89.99, Rating: 4.4, In Stock
5. Portable Charger – $29.99, Rating: 4.2, In Stock
```

### Test Mode Options

The application supports two ways to run in test mode:

#### Option 1: No API Key (Automatic Test Mode)
If no OpenAI API key is provided in the `.env` file, the application automatically runs in test mode.

#### Option 2: Force Test Mode with --test Flag
You can force test mode even with an API key by using the `--test` flag:

```bash
node index.js --test
```

This is useful for:
- Testing the application without using API credits
- Demonstrating the function calling process
- Development and debugging

### Example Search Queries

The application accepts natural language queries like:
- "I want headphones under $100 that are in stock"
- "Show me fitness equipment under $50"
- "Find kitchen appliances with rating above 4.5"
- "Books under $20"
- "Electronics in stock"
- "Clothing with rating above 4.0"

### Test Mode
When running in test mode (either automatically or with --test flag), the application will:
- Show the function call that would be made to OpenAI
- Display the extracted filtering parameters
- Use mock filtering logic for demonstration
- Useful for testing and development without using API credits

Example test mode output:
```
=== RUNNING IN TEST MODE ===
Test mode enabled via --test flag. The app will show the generated function call instead of making API calls.

Enter your product search criteria (e.g., "I want headphones under $100 that are in stock"):
> I want headphones under $100 that are in stock

Searching for products...

=== TEST MODE ===
Test mode enabled via --test flag. Showing function call that would be made:

User Input: I want headphones under $100 that are in stock

Function Definition: {
  "name": "filter_products",
  "description": "Filters products based on user preferences",
  "parameters": {
    "type": "object",
    "properties": {
      "category": { "type": "string" },
      "max_price": { "type": "number" },
      "min_rating": { "type": "number" },
      "in_stock": { "type": "boolean" }
    },
    "required": []
  }
}

Applied Filters: {
  "category": "Electronics",
  "max_price": 100,
  "in_stock": true
}
=== END TEST MODE ===

Search Results:
1. Wireless Headphones – $99.99, Rating: 4.5, In Stock
2. Bluetooth Speaker – $49.99, Rating: 4.4, In Stock
3. Gaming Mouse – $59.99, Rating: 4.3, In Stock
4. External Hard Drive – $89.99, Rating: 4.4, In Stock
5. Portable Charger – $29.99, Rating: 4.2, In Stock
```

## How It Works

### OpenAI Function Calling
The application uses OpenAI's function calling feature to extract structured filtering criteria from natural language input:

```json
{
  "name": "filter_products",
  "description": "Filters products based on user preferences",
  "parameters": {
    "type": "object",
    "properties": {
      "category": { "type": "string" },
      "max_price": { "type": "number" },
      "min_rating": { "type": "number" },
      "in_stock": { "type": "boolean" }
    },
    "required": []
  }
}
```

### Product Dataset
The application includes a local `products.json` file with 50 products across 5 categories:
- Electronics (10 products)
- Fitness (10 products)
- Kitchen (10 products)
- Books (10 products)
- Clothing (10 products)

Each product has:
- name: Product name
- category: Product category
- price: Price in dollars
- rating: Rating from 1.0 to 5.0
- in_stock: Boolean stock status

### Filtering Process
1. User enters natural language search criteria
2. OpenAI function calling extracts structured filters
3. Local dataset is filtered based on extracted criteria
4. Results are formatted and displayed

## Features
- Natural language product search
- OpenAI GPT-4.1-mini integration with function calling
- Secure API key management with dotenv
- Comprehensive product filtering (category, price, rating, stock)
- Test mode for development and testing (automatic or with --test flag)
- Error handling for API calls and file operations
- Formatted output with product details

## Troubleshooting

1. If you get "Module not found" errors:
```bash
npm install
```

2. If OpenAI API calls fail:
- Check your API key in `.env`
- Ensure you have sufficient API credits
- Verify your internet connection

3. If no products are found:
- Try broader search criteria
- Check spelling in your search terms
- Verify the product category exists

## Dependencies
- readline-sync: ^1.4.10
- openai: ^4.28.0
- dotenv: ^16.4.5 