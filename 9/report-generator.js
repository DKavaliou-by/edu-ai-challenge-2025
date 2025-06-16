const { getAIResponse } = require('./openai-service');
const fs = require('fs').promises;
const path = require('path');

const REPORT_TEMPLATE = `Please analyze the following service and provide a detailed report in markdown format. Include all sections below:

# {service_name} Analysis Report

## Brief History
[Include founding year, key milestones, and significant events]

## Target Audience
[Describe primary user segments and demographics]

## Core Features
[List 2-4 key functionalities that define the service]

## Unique Selling Points
[Highlight key differentiators from competitors]

## Business Model
[Explain how the service generates revenue]

## Tech Stack Insights
[Note any visible or known technologies used]

## Perceived Strengths
[List positive aspects and standout features]

## Perceived Weaknesses
[Note limitations and areas for improvement]

Please provide a comprehensive analysis based on the following input:`;

async function generateReport(input, outputToFile = false) {
    try {
        const prompt = REPORT_TEMPLATE + `\n\n${input}`;
        const report = await getAIResponse(prompt);

        if (outputToFile) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `report-${timestamp}.md`;
            await fs.writeFile(filename, report);
            return `Report saved to ${filename}`;
        }

        return report;
    } catch (error) {
        throw new Error(`Failed to generate report: ${error.message}`);
    }
}

module.exports = { generateReport }; 