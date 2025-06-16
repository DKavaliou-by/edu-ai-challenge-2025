const readlineSync = require('readline-sync');
const { generateReport } = require('./report-generator');
const { isTestMode } = require('./openai-service');

async function getServiceInput() {
    if (isTestMode) {
        console.log('\n=== RUNNING IN TEST MODE ===');
        console.log('No OpenAI API key provided. The app will show the generated prompt instead of making API calls.');
    }
    
    console.log('\nEnter service name (e.g., "Spotify", "Notion") or description:');
    const input = readlineSync.question('> ');
    
    if (!input.trim()) {
        console.log('Error: Input cannot be empty');
        return getServiceInput();
    }
    
    return input.trim();
}

async function getOutputPreference() {
    console.log('\nHow would you like to receive the report?');
    console.log('1. Display in terminal');
    console.log('2. Save to file');
    
    const choice = readlineSync.question('Enter choice (1/2): ');
    return choice === '2';
}

async function main() {
    try {
        const serviceInput = await getServiceInput();
        const saveToFile = await getOutputPreference();
        
        console.log('\nGenerating report...');
        const result = await generateReport(serviceInput, saveToFile);
        
        if (saveToFile) {
            console.log(result);
        } else {
            console.log('\n' + result);
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

main(); 