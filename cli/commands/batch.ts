/**
 * CLI Commands - Batch command implementation
 */

import { Command } from 'commander';
import { processBatchFromCSV, createSampleCSV, retryFailedBatch } from '../../lib/batch';
import fs from 'fs';

export function createBatchCommand(): Command {
  const command = new Command('batch');
  
  command
    .description('Process multiple addresses from a CSV file')
    .argument('<csvPath>', 'Path to CSV file containing addresses')
    .option('-o, --output <dir>', 'Output directory for hazard reports', 'hazard-reports')
    .option('-d, --delay <ms>', 'Delay between requests in milliseconds', '1000')
    .option('--create-sample', 'Create a sample CSV file at the specified path')
    .option('--retry', 'Retry previously failed addresses')
    .action(async (csvPath: string, options) => {
      try {
        // Create sample CSV option
        if (options.createSample) {
          createSampleCSV(csvPath);
          return;
        }
        
        // Retry failed batch option
        if (options.retry) {
          // Look for previous batch results
          const resultsFiles = fs.readdirSync(options.output)
            .filter(file => file.startsWith('batch-results-') && file.endsWith('.json'))
            .sort()
            .reverse(); // Most recent first
          
          if (resultsFiles.length === 0) {
            console.error('❌ No previous batch results found to retry');
            process.exit(1);
          }
          
          const latestResultsFile = resultsFiles[0];
          const resultsPath = `${options.output}/${latestResultsFile}`;
          const previousResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
          
          console.log(`🔄 Retrying failed addresses from: ${latestResultsFile}`);
          await retryFailedBatch(previousResults, options.output, parseInt(options.delay));
          return;
        }
        
        // Regular batch processing
        const delay = parseInt(options.delay);
        if (isNaN(delay) || delay < 0) {
          console.error('❌ Invalid delay value. Must be a positive number.');
          process.exit(1);
        }
        
        await processBatchFromCSV(csvPath, options.output, delay);
        
      } catch (error) {
        if (error instanceof Error) {
          console.error('❌ Error details:', error.message);
        }
        
        console.error('❌ Failed to process batch file:', csvPath);
        process.exit(1);
      }
    });

  return command;
}
