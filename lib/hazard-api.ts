/**
 * ULAP Hazard Assessment API integration
 */

import fs from 'fs';
import path from 'path';
import type { Coordinates } from './types';

/**
 * Download hazard assessment report for given coordinates
 * @param coords - Latitude and longitude coordinates
 * @param outputDir - Directory to save the report
 * @returns Promise<string> - Path to downloaded report
 */
export async function downloadHazardReport(
  coords: Coordinates, 
  outputDir: string = 'hazard-reports'
): Promise<string> {
  const reportUrl = `https://ulap-reports.georisk.gov.ph/api/reports/hazard-assessments/${coords.lng}/${coords.lat}`;
  const downloadPath = path.join(outputDir, `hazard-report-${coords.lng}-${coords.lat}-${Date.now()}.pdf`);

  // Create output directory if it doesn't exist
  const downloadsDir = path.dirname(downloadPath);
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  try {
    console.log(`📥 Downloading hazard report from: ${reportUrl}`);
    const response = await fetch(reportUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    // Log response status and headers
    console.log('🔎 Response status:', response.status);
    console.log('🔎 Response headers:', response.headers);
    if (!contentType || !contentType.includes('application/pdf')) {
      const text = await response.text();
      console.error('❌ Response is not a PDF. Content-Type:', contentType);
      console.error('❌ Response body (first 500 chars):', text.substring(0, 500));
      throw new Error('Hazard report download failed: Response is not a PDF.');
    } else {
      // Even if content-type is PDF, log first 500 bytes for inspection
      const buffer = await response.arrayBuffer();
      const preview = Buffer.from(buffer).toString('utf8', 0, 500);
      console.log('🔎 PDF file preview (first 500 bytes as utf8):', preview);
      fs.writeFileSync(downloadPath, Buffer.from(buffer));
      console.log(`✅ File downloaded successfully to: ${downloadPath}`);
      return downloadPath;
    }
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw error;
  }
}

/**
 * Download hazard assessment report for a given address (combines geocoding + download)
 * @param address - Plain text address
 * @param outputDir - Directory to save the report
 * @returns Promise<string> - Path to downloaded report
 */
export async function downloadHazardReportByAddress(
  address: string, 
  outputDir: string = 'hazard-reports'
): Promise<string> {
  try {
    // Import geocoding function (dynamic import to avoid circular dependencies)
    const { geocodeAddress } = await import('./geocoding');
    
    // Step 1: Geocode the address to get coordinates
    console.log(`🏠 Processing address: "${address}"`);
    const coords = await geocodeAddress(address);
    
    // Step 2: Download hazard report using the coordinates
    const filePath = await downloadHazardReport(coords, outputDir);
    
    return filePath;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error details:', error.message);
    }
    
    console.error('❌ Failed to download hazard report for address:', address);
    throw error;
  }
}

/**
 * Validate coordinates are within acceptable ranges
 * @param coords - Coordinates to validate
 * @returns boolean - True if coordinates are valid
 */
export function validateCoordinates(coords: Coordinates): boolean {
  // Basic coordinate validation
  if (coords.lat < -90 || coords.lat > 90) {
    throw new Error(`Invalid latitude: ${coords.lat}. Must be between -90 and 90.`);
  }
  
  if (coords.lng < -180 || coords.lng > 180) {
    throw new Error(`Invalid longitude: ${coords.lng}. Must be between -180 and 180.`);
  }
  
  return true;
}

/**
 * Get report filename for given coordinates
 * @param coords - Coordinates
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns string - Suggested filename
 */
export function getReportFilename(coords: Coordinates, timestamp?: number): string {
  const ts = timestamp || Date.now();
  return `hazard-report-${coords.lng}-${coords.lat}-${ts}.pdf`;
}

/**
 * Check if ULAP API is accessible
 * @returns Promise<boolean> - True if API is accessible
 */
export async function checkULAPAvailability(): Promise<boolean> {
  try {
    // Test with a known good coordinate (Manila)
    const testUrl = 'https://ulap-reports.georisk.gov.ph/api/reports/hazard-assessments/121.0486254/14.6510546';
    const response = await fetch(testUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('⚠️ ULAP API availability check failed:', error);
    return false;
  }
}
