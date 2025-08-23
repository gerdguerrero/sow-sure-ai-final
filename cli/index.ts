#!/usr/bin/env node

/**
 * Sow Sure AI - Philippine Disaster Risk Assessment CLI Tool
 * Modular TypeScript version using Next.js-compatible structure
 */

import { Command } from 'commander';
import { createAddressCommand } from './commands/address';
import { createBatchCommand } from './commands/batch';
import { createFavoritesCommand } from './commands/favorites';
import { checkULAPAvailability } from '../lib/hazard-api';

const program = new Command();

// CLI Configuration
program
  .name('sow-sure-ai')
  .description('🌊 Philippine Disaster Risk Assessment Tool - Get hazard reports for any address in the Philippines')
  .version('2.0.0', '-v, --version', 'Display version number');

// Global options
program
  .option('--debug', 'Enable debug output')
  .option('--no-color', 'Disable colored output');

// Add commands
program.addCommand(createAddressCommand());
program.addCommand(createBatchCommand());
program.addCommand(createFavoritesCommand());

// Health check command
program
  .command('health')
  .description('Check API availability and system health')
  .action(async () => {
    console.log('🔍 Checking system health...\n');
    
    try {
      // Check ULAP API
      console.log('📡 Testing ULAP API connection...');
      const ulapAvailable = await checkULAPAvailability();
      console.log(`🌐 ULAP API: ${ulapAvailable ? '✅ Available' : '❌ Unavailable'}`);
      
      // Check Nominatim API (OpenStreetMap)
      console.log('🗺️  Testing Nominatim API connection...');
      const testResponse = await fetch('https://nominatim.openstreetmap.org/search?q=manila&format=json&limit=1');
      const nominatimAvailable = testResponse.ok;
      console.log(`🌐 Nominatim API: ${nominatimAvailable ? '✅ Available' : '❌ Unavailable'}`);
      
      // System info
      console.log('\n💻 System Information:');
      console.log(`   Node.js: ${process.version}`);
      console.log(`   Platform: ${process.platform}`);
      console.log(`   Working Directory: ${process.cwd()}`);
      
      // Summary
      const allHealthy = ulapAvailable && nominatimAvailable;
      console.log(`\n📊 Overall Health: ${allHealthy ? '✅ All systems operational' : '⚠️  Some services unavailable'}`);
      
      if (!allHealthy) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    }
  });

// Examples command
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log('📚 Sow Sure AI - Usage Examples\n');
    
    console.log('🏠 Single Address Processing:');
    console.log('   sow-sure-ai address "Makati City, Metro Manila"');
    console.log('   sow-sure-ai address "123 Main St, Cebu City" --output ./reports\n');
    
    console.log('📁 Batch Processing:');
    console.log('   sow-sure-ai batch addresses.csv');
    console.log('   sow-sure-ai batch --create-sample sample.csv');
    console.log('   sow-sure-ai batch addresses.csv --delay 2000 --output ./batch-reports\n');
    
    console.log('⭐ Favorites Management:');
    console.log('   sow-sure-ai favorites add "Home" "123 Main St, Manila"');
    console.log('   sow-sure-ai favorites list');
    console.log('   sow-sure-ai favorites report "Home"');
    console.log('   sow-sure-ai favorites remove "Home"\n');
    
    console.log('🔍 System Commands:');
    console.log('   sow-sure-ai health');
    console.log('   sow-sure-ai --version');
    console.log('   sow-sure-ai --help\n');
    
    console.log('💡 Tips:');
    console.log('   • Use quotes around addresses with spaces');
    console.log('   • Add --output to specify custom download directory');
    console.log('   • Use --delay in batch mode to avoid rate limiting');
    console.log('   • Check health before processing large batches');
  });

// Error handling
program.configureOutput({
  writeErr: (str) => process.stderr.write(`❌ ${str}`)
});

// Handle unrecognized commands
program.on('command:*', function () {
  console.error('❌ Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

// CLI Banner
function showBanner() {
  console.log('🌊 Sow Sure AI v2.0.0');
  console.log('📍 Philippine Disaster Risk Assessment Tool\n');
}

// Main execution
async function main() {
  try {
    // Show banner for help and version commands
    if (process.argv.includes('--help') || process.argv.includes('-h') || 
        process.argv.includes('--version') || process.argv.includes('-v') ||
        process.argv.length === 2) {
      showBanner();
    }
    
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Terminating...');
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main();
}

export { program };
