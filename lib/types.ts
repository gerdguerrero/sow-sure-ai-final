/**
 * Type definitions for Sow Sure AI - Philippine Disaster Risk Assessment Tool
 */

// Core coordinate interface
export interface Coordinates {
  lat: number;
  lng: number;
}

// Nominatim API response interface
export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
}

// User confirmation response interface
export interface ConfirmationResult {
  confirmed: boolean;
  selectedIndex?: number;
}

// Favorite location interface
export interface FavoriteLocation {
  name: string;
  address: string;
  coordinates: Coordinates;
  dateAdded?: string;
}

// Favorites configuration interface
export interface FavoritesConfig {
  favorites: FavoriteLocation[];
  lastUpdated: string;
}

// Batch processing result interface
export interface BatchResult {
  address: string;
  status: 'success' | 'failed';
  coordinates?: Coordinates;
  filePath?: string;
  error?: string;
  timestamp: string;
}

// Batch processing summary interface
export interface BatchSummary {
  totalAddresses: number;
  successful: number;
  failed: number;
  successRate: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  results: BatchResult[];
}

// CLI command options
export interface GetCommandOptions {
  verbose?: boolean;
  output?: string;
  favorite?: boolean;
  saveFavorite?: string;
}

export interface BatchCommandOptions {
  verbose?: boolean;
  output?: string;
  continueOnError?: boolean;
  delay?: string;
}

// Geocoding options
export interface GeocodingOptions {
  countryCode?: string;
  limit?: number;
  addressDetails?: boolean;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Philippine bounds for validation
export interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Processing options for batch operations
export interface ProcessingOptions {
  verbose?: boolean;
  output?: string;
  continueOnError?: boolean;
  delayBetweenRequests?: number;
}
