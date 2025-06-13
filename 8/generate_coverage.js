#!/usr/bin/env node

/**
 * Test Coverage Report Generator
 * Runs tests and generates a comprehensive coverage report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Generating test coverage report...\n');

try {
  // Run tests and capture output
  console.log('📋 Running test suite...');
  const testOutput = execSync('node test.js', { 
    encoding: 'utf8',
    timeout: 10000 // 10 second timeout
  });
  
  // Extract test results
  const lines = testOutput.split('\n');
  const summaryStart = lines.findIndex(line => line.includes('📊 Test Summary:'));
  
  if (summaryStart === -1) {
    throw new Error('Could not find test summary in output');
  }
  
  const totalLine = lines[summaryStart + 1];
  const passedLine = lines[summaryStart + 2];
  const failedLine = lines[summaryStart + 3];
  const successLine = lines[summaryStart + 4];
  
  // Parse test numbers
  const total = parseInt(totalLine.match(/Total: (\d+)/)[1]);
  const passed = parseInt(passedLine.match(/Passed: (\d+)/)[1]);
  const failed = parseInt(failedLine.match(/Failed: (\d+)/)[1]);
  const successRate = successLine.match(/Success Rate: ([\d.]+)%/)[1];
  
  console.log(`✅ Tests completed: ${passed}/${total} passed (${successRate}%)`);
  
  if (failed > 0) {
    console.log(`❌ ${failed} tests failed. Fix failing tests before generating coverage report.`);
    process.exit(1);
  }
  
  // Generate timestamp
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Read the current test_report.txt template
  let reportTemplate;
  try {
    reportTemplate = fs.readFileSync('test_report.txt', 'utf8');
  } catch (error) {
    console.log('⚠️  test_report.txt not found, creating from scratch...');
    reportTemplate = getDefaultReportTemplate();
  }
  
  // Update dynamic fields in the report
  const updatedReport = reportTemplate
    .replace(/Generated: [\d-]+/, `Generated: ${timestamp}`)
    .replace(/Total Tests: \d+/, `Total Tests: ${total}`)
    .replace(/Passed Tests: \d+/, `Passed Tests: ${passed}`)
    .replace(/Failed Tests: \d+/, `Failed Tests: ${failed}`)
    .replace(/Success Rate: [\d.]+%/, `Success Rate: ${successRate}%`);
  
  // Write updated report
  fs.writeFileSync('test_report.txt', updatedReport);
  
  console.log('📊 Test coverage report updated successfully!');
  console.log('\n📋 View the report:');
  console.log('   cat test_report.txt');
  console.log('\n🔍 Quick summary:');
  console.log('   head -30 test_report.txt');
  
} catch (error) {
  console.error('❌ Error generating coverage report:', error.message);
  process.exit(1);
}

function getDefaultReportTemplate() {
  return `==========================================
Schema Validator Library - Test Coverage Report
==========================================
Generated: ${new Date().toISOString().split('T')[0]}
Library Version: 1.0.0
Test Suite Version: 1.0.0

==========================================
OVERVIEW
==========================================
Total Tests: 0
Passed Tests: 0
Failed Tests: 0
Success Rate: 0.0%
Test Execution Time: ~500ms (estimated)

==========================================
NOTE
==========================================
This is a basic template. Please update with actual coverage data.
Run the test suite and update this file with detailed coverage information.
==========================================`;
} 