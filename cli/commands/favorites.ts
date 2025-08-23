/**
 * CLI Commands - Favorites command implementation
 */

import { Command } from 'commander';
import { addFavorite, removeFavorite, listFavorites, displayFavorites, clearFavorites, findFavoriteByName } from '../../lib/favorites';
import { geocodeAddress } from '../../lib/geocoding';
import { downloadHazardReport } from '../../lib/hazard-api';

export function createFavoritesCommand(): Command {
  const command = new Command('favorites');
  
  command.alias('fav');
  command.description('Manage favorite locations');

  // Add subcommand
  command
    .command('add')
    .description('Add a new favorite location')
    .argument('<name>', 'Name for the favorite location')
    .argument('<address>', 'Address to geocode and save')
    .action(async (name: string, address: string) => {
      try {
        console.log(`🏠 Geocoding address: "${address}"`);
        const coords = await geocodeAddress(address);
        console.log(`✅ Geocoded coordinates: ${coords.lat}, ${coords.lng}`);
        
        const success = addFavorite(name, address, coords);
        if (!success) {
          process.exit(1);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('❌ Error details:', error.message);
        }
        console.error('❌ Failed to add favorite');
        process.exit(1);
      }
    });

  // Remove subcommand
  command
    .command('remove')
    .alias('rm')
    .description('Remove a favorite location')
    .argument('<name>', 'Name of the favorite to remove')
    .action((name: string) => {
      const success = removeFavorite(name);
      if (!success) {
        process.exit(1);
      }
    });

  // List subcommand
  command
    .command('list')
    .alias('ls')
    .description('List all favorite locations')
    .option('--json', 'Output in JSON format')
    .action((options) => {
      const favorites = listFavorites();
      
      if (options.json) {
        console.log(JSON.stringify(favorites, null, 2));
      } else {
        displayFavorites();
      }
    });

  // Get report for favorite
  command
    .command('report')
    .description('Download hazard report for a favorite location')
    .argument('<name>', 'Name of the favorite location')
    .option('-o, --output <dir>', 'Output directory for hazard reports', 'hazard-reports')
    .action(async (name: string, options) => {
      try {
        const favorite = findFavoriteByName(name);
        if (!favorite) {
          console.error(`❌ Favorite not found: "${name}"`);
          process.exit(1);
        }
        
        console.log(`⭐ Using favorite: "${favorite.name}" - ${favorite.address}`);
        console.log(`📍 Coordinates: ${favorite.coordinates.lat}, ${favorite.coordinates.lng}`);
        
        const filePath = await downloadHazardReport(favorite.coordinates, options.output);
        console.log(`✅ Hazard report downloaded: ${filePath}`);
        
      } catch (error) {
        if (error instanceof Error) {
          console.error('❌ Error details:', error.message);
        }
        console.error('❌ Failed to download hazard report for favorite');
        process.exit(1);
      }
    });

  // Clear all favorites
  command
    .command('clear')
    .description('Clear all favorite locations')
    .option('--force', 'Skip confirmation prompt')
    .action((options) => {
      const success = clearFavorites(options.force);
      if (!success) {
        process.exit(1);
      }
    });

  return command;
}
