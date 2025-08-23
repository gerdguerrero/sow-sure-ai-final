/**
 * Batch processing functionality for multiple addresses
 */

import fs from 'fs';
import path from 'path';
import type { BatchResult, Coordinates } from './types';
import { geocodeAddress } from './geocoding';
import { downloadHazardReport } from './hazard-api';

/**
 * Process a batch of addresses from a CSV file
 * @param csvPath - Path to CSV file containing addresses
 * @param outputDir - Directory to save hazard reports
 * @param delay - Delay between requests in milliseconds (default: 1000ms)
 * @returns Promise<BatchResult[]> - Array of batch processing results
 */
export async function processBatchFromCSV(
  csvPath: string, 
  outputDir: string = 'hazard-reports',
  delay: number = 1000
): Promise<BatchResult[]> {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const addresses = readAddressesFromCSV(csvPath);
  console.log(`📁 Found ${addresses.length} addresses in ${csvPath}`);
  
  return processBatchAddresses(addresses, outputDir, delay);
}

/**
 * Process a batch of addresses (array)
 * @param addresses - Array of address strings
 * @param outputDir - Directory to save hazard reports
 * @param delay - Delay between requests in milliseconds (default: 1000ms)
 * @returns Promise<BatchResult[]> - Array of batch processing results
 */
export async function processBatchAddresses(
  addresses: string[], 
  outputDir: string = 'hazard-reports',
  delay: number = 1000
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  let successCount = 0;
  let failCount = 0;

  console.log(`🚀 Starting batch processing of ${addresses.length} addresses...`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`⏱️  Delay between requests: ${delay}ms\n`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i].trim();
    const progress = `[${i + 1}/${addresses.length}]`;
    
    console.log(`${progress} Processing: "${address}"`);
    
    try {
      // Step 1: Geocode the address
      const coords = await geocodeAddress(address);
      console.log(`${progress} ✅ Geocoded: ${coords.lat}, ${coords.lng}`);
      
      // Step 2: Download hazard report
      const filePath = await downloadHazardReport(coords, outputDir);
      console.log(`${progress} ✅ Downloaded: ${path.basename(filePath)}`);
      
      results.push({
        address,
        status: 'success',
        coordinates: coords,
        filePath,
        timestamp: new Date().toISOString()
      });
      
      successCount++;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`${progress} ❌ Failed: ${errorMessage}`);
      
      results.push({
        address,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      failCount++;
    }
    
    // Add delay between requests (except for the last one)
    if (i < addresses.length - 1) {
      console.log(`${progress} ⏳ Waiting ${delay}ms before next request...\n`);
      await sleep(delay);
    }
  }

  // Summary
  console.log('\n📊 Batch Processing Summary:');
  console.log('─'.repeat(40));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Total: ${addresses.length}`);
  console.log(`📂 Reports saved to: ${outputDir}`);

  // Save batch results to JSON
  const resultsPath = path.join(outputDir, `batch-results-${Date.now()}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📄 Batch results saved to: ${resultsPath}`);

  return results;
}

/**
 * Read addresses from a CSV file
 * @param csvPath - Path to CSV file
 * @returns string[] - Array of addresses
 */
export function readAddressesFromCSV(csvPath: string): string[] {
  try {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    // Handle CSV with headers (if first line contains "address" or similar)
    const firstLine = lines[0]?.toLowerCase();
    if (firstLine?.includes('address') || firstLine?.includes('location')) {
      console.log('📋 Detected CSV header, skipping first line');
      return lines.slice(1);
    }
    
    return lines;
  } catch (error) {
    throw new Error(`Failed to read CSV file: ${error}`);
  }
}

/**
 * Create a sample CSV file with addresses
 * @param filePath - Path where to create the sample CSV
 * @param addresses - Array of sample addresses (optional)
 */
export function createSampleCSV(filePath: string, addresses?: string[]): void {
  const sampleAddresses = addresses || [
    'Makati City, Metro Manila, Philippines',
    'Quezon City, Metro Manila, Philippines',
    'Cebu City, Cebu, Philippines',
    'Davao City, Davao del Sur, Philippines',
    'Baguio City, Benguet, Philippines'
  ];

  const csvContent = ['address', ...sampleAddresses].join('\n');
  fs.writeFileSync(filePath, csvContent);
  console.log(`✅ Sample CSV created: ${filePath}`);
  console.log(`📄 Contains ${sampleAddresses.length} sample addresses`);
}

/**
 * Validate batch results and generate summary report
 * @param results - Array of batch results
 * @returns object - Summary statistics
 */
export function generateBatchSummary(results: BatchResult[]) {
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  const summary = {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    successRate: results.length > 0 ? (successful.length / results.length * 100).toFixed(2) : '0',
    failedAddresses: failed.map(r => ({ address: r.address, error: r.error }))
  };

  return summary;
}

/**
 * Export batch results to CSV format
 * @param results - Array of batch results
 * @param outputPath - Path to save the CSV file
 */
export function exportResultsToCSV(results: BatchResult[], outputPath: string): void {
  const headers = ['address', 'status', 'latitude', 'longitude', 'filePath', 'error', 'timestamp'];
  const rows = results.map(result => [
    result.address,
    result.status,
    result.coordinates?.lat || '',
    result.coordinates?.lng || '',
    result.filePath || '',
    result.error || '',
    result.timestamp
  ]);

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  fs.writeFileSync(outputPath, csvContent);
  console.log(`✅ Results exported to CSV: ${outputPath}`);
}

/**
 * Sleep utility for adding delays
 * @param ms - Milliseconds to sleep
 * @returns Promise<void>
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry failed batch items
 * @param results - Previous batch results
 * @param outputDir - Directory to save hazard reports
 * @param delay - Delay between requests
 * @returns Promise<BatchResult[]> - Results of retry attempts
 */
export async function retryFailedBatch(
  results: BatchResult[], 
  outputDir: string = 'hazard-reports',
  delay: number = 1000
): Promise<BatchResult[]> {
  const failedAddresses = results
    .filter(r => r.status === 'failed')
    .map(r => r.address);

  if (failedAddresses.length === 0) {
    console.log('✅ No failed addresses to retry');
    return [];
  }

  console.log(`🔄 Retrying ${failedAddresses.length} failed addresses...`);
  return processBatchAddresses(failedAddresses, outputDir, delay);
}
