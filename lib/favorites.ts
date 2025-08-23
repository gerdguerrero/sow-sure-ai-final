/**
 * Favorites management system
 */

import fs from 'fs';
import path from 'path';
import type { FavoriteLocation, Coordinates } from './types';

const FAVORITES_FILE = 'favorites.json';

/**
 * Get the favorites file path
 * @returns string - Path to favorites.json file
 */
function getFavoritesFilePath(): string {
  return path.join(process.cwd(), FAVORITES_FILE);
}

/**
 * Load favorites from file
 * @returns FavoriteLocation[] - Array of favorite locations
 */
export function loadFavorites(): FavoriteLocation[] {
  const favoritesPath = getFavoritesFilePath();
  
  if (!fs.existsSync(favoritesPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(favoritesPath, 'utf8');
    const favorites = JSON.parse(content);
    
    // Validate favorites structure
    if (!Array.isArray(favorites)) {
      console.warn('⚠️ Invalid favorites file format. Creating new empty favorites.');
      return [];
    }
    
    return favorites.filter(fav => 
      fav && 
      typeof fav.name === 'string' && 
      typeof fav.address === 'string' &&
      typeof fav.coordinates === 'object' &&
      typeof fav.coordinates.lat === 'number' &&
      typeof fav.coordinates.lng === 'number'
    );
  } catch (error) {
    console.warn('⚠️ Error loading favorites:', error);
    return [];
  }
}

/**
 * Save favorites to file
 * @param favorites - Array of favorite locations to save
 */
export function saveFavorites(favorites: FavoriteLocation[]): void {
  const favoritesPath = getFavoritesFilePath();
  
  try {
    fs.writeFileSync(favoritesPath, JSON.stringify(favorites, null, 2));
  } catch (error) {
    console.error('❌ Error saving favorites:', error);
    throw error;
  }
}

/**
 * Add a new favorite location
 * @param name - Display name for the favorite
 * @param address - Original address string
 * @param coordinates - Geocoded coordinates
 * @returns boolean - True if added successfully
 */
export function addFavorite(name: string, address: string, coordinates: Coordinates): boolean {
  const favorites = loadFavorites();
  
  // Check if favorite already exists (by name or coordinates)
  const existingByName = favorites.find(fav => fav.name.toLowerCase() === name.toLowerCase());
  if (existingByName) {
    console.warn(`⚠️ Favorite with name "${name}" already exists.`);
    return false;
  }
  
  const existingByCoords = favorites.find(fav => 
    Math.abs(fav.coordinates.lat - coordinates.lat) < 0.0001 &&
    Math.abs(fav.coordinates.lng - coordinates.lng) < 0.0001
  );
  if (existingByCoords) {
    console.warn(`⚠️ Favorite at these coordinates already exists: "${existingByCoords.name}"`);
    return false;
  }
  
  // Add new favorite
  const newFavorite: FavoriteLocation = {
    name,
    address,
    coordinates,
    dateAdded: new Date().toISOString()
  };
  
  favorites.push(newFavorite);
  saveFavorites(favorites);
  
  console.log(`✅ Added favorite: "${name}" - ${address}`);
  return true;
}

/**
 * Remove a favorite by name
 * @param name - Name of the favorite to remove
 * @returns boolean - True if removed successfully
 */
export function removeFavorite(name: string): boolean {
  const favorites = loadFavorites();
  const initialLength = favorites.length;
  
  const updatedFavorites = favorites.filter(fav => 
    fav.name.toLowerCase() !== name.toLowerCase()
  );
  
  if (updatedFavorites.length === initialLength) {
    console.warn(`⚠️ No favorite found with name: "${name}"`);
    return false;
  }
  
  saveFavorites(updatedFavorites);
  console.log(`✅ Removed favorite: "${name}"`);
  return true;
}

/**
 * List all favorites
 * @returns FavoriteLocation[] - Array of all favorite locations
 */
export function listFavorites(): FavoriteLocation[] {
  return loadFavorites();
}

/**
 * Find a favorite by name (case-insensitive)
 * @param name - Name to search for
 * @returns FavoriteLocation | undefined - Found favorite or undefined
 */
export function findFavoriteByName(name: string): FavoriteLocation | undefined {
  const favorites = loadFavorites();
  return favorites.find(fav => fav.name.toLowerCase() === name.toLowerCase());
}

/**
 * Display formatted list of favorites
 */
export function displayFavorites(): void {
  const favorites = loadFavorites();
  
  if (favorites.length === 0) {
    console.log('📝 No favorites saved yet.');
    return;
  }
  
  console.log('\n⭐ Your Favorite Locations:');
  console.log('─'.repeat(50));
  
  favorites.forEach((fav, index) => {
    console.log(`${index + 1}. ${fav.name}`);
    console.log(`   📍 ${fav.address}`);
    console.log(`   🌐 ${fav.coordinates.lat}, ${fav.coordinates.lng}`);
    if (fav.dateAdded) {
      console.log(`   📅 Added: ${new Date(fav.dateAdded).toLocaleDateString()}`);
    }
    console.log();
  });
}

/**
 * Check if favorites file exists
 * @returns boolean - True if favorites file exists
 */
export function favoritesFileExists(): boolean {
  return fs.existsSync(getFavoritesFilePath());
}

/**
 * Get favorites count
 * @returns number - Number of saved favorites
 */
export function getFavoritesCount(): number {
  return loadFavorites().length;
}

/**
 * Clear all favorites (with confirmation in CLI context)
 * @param force - Skip confirmation if true
 * @returns boolean - True if cleared successfully
 */
export function clearFavorites(force: boolean = false): boolean {
  const favorites = loadFavorites();
  
  if (favorites.length === 0) {
    console.log('📝 No favorites to clear.');
    return true;
  }
  
  if (!force) {
    console.log(`⚠️ This will delete all ${favorites.length} favorite(s). Use --force to confirm.`);
    return false;
  }
  
  saveFavorites([]);
  console.log(`✅ Cleared all ${favorites.length} favorite(s).`);
  return true;
}
