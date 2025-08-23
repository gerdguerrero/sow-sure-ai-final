/**
 * CLI Commands - Address command implementation
 */

import { Command } from 'commander';
import { geocodeAddress } from '../../lib/geocoding';
import { downloadHazardReport } from '../../lib/hazard-api';

export function createAddressCommand(): Command {
  const command = new Command('address');
  
  command
    .description('Get hazard assessment for a specific address')
    .argument('<address>', 'Address to geocode and analyze')
    .option('-o, --output <dir>', 'Output directory for hazard reports', 'hazard-reports')
    .option('--coords-only', 'Only geocode the address, don\'t download hazard report')
    .action(async (address: string, options) => {
      try {
        console.log(`🏠 Processing address: "${address}"`);
        
        // Step 1: Geocode the address
        const coords = await geocodeAddress(address);
        console.log(`✅ Geocoded coordinates: ${coords.lat}, ${coords.lng}`);
        
        if (options.coordsOnly) {
          console.log('📍 Coordinates-only mode, skipping hazard report download.');
          return;
        }
        
        // Step 2: Download hazard report
        const filePath = await downloadHazardReport(coords, options.output);
        console.log(`✅ Hazard report downloaded: ${filePath}`);
        
      } catch (error) {
        if (error instanceof Error) {
          console.error('❌ Error details:', error.message);
        }
        
        console.error('❌ Failed to process address:', address);
        process.exit(1);
      }
    });

  return command;
}
