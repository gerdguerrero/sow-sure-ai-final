/**
 * Geocoding utilities for Philippine addresses using OpenStreetMap Nominatim API
 */

import type { 
  Coordinates, 
  NominatimResult, 
  ConfirmationResult, 
  ValidationResult,
  GeographicBounds,
  GeocodingOptions 
} from './types';

// Philippine geographic bounds for validation
export const PHILIPPINE_BOUNDS: GeographicBounds = {
  north: 21.2,
  south: 4.5,
  east: 127.0,
  west: 116.0
};

/**
 * Validate address input before geocoding
 * @param address - Plain text address to validate
 * @returns ValidationResult - Whether address passed validation
 */
export function validateAddressInput(address: string): ValidationResult {
  console.log(`🔍 Validating address: "${address}"`);
  
  // Basic validation checks
  const validationChecks = [
    {
      test: () => address && address.trim().length > 0,
      message: "Address cannot be empty"
    },
    {
      test: () => address.trim().length >= 3,
      message: "Address must be at least 3 characters long"
    },
    {
      test: () => address.trim().length <= 200,
      message: "Address cannot exceed 200 characters"
    },
    {
      test: () => !/^[\s\d\-,.']+$/.test(address.trim()),
      message: "Address must contain some letters (not just numbers and punctuation)"
    }
  ];
  
  for (const check of validationChecks) {
    if (!check.test()) {
      console.error(`❌ Validation failed: ${check.message}`);
      return { isValid: false, error: check.message };
    }
  }
  
  console.log(`✅ Address validation passed`);
  return { isValid: true };
}

/**
 * Check if coordinates are within Philippine territory
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns boolean - True if within Philippines
 */
export function isWithinPhilippines(lat: number, lng: number): boolean {
  return lat >= PHILIPPINE_BOUNDS.south && 
         lat <= PHILIPPINE_BOUNDS.north && 
         lng >= PHILIPPINE_BOUNDS.west && 
         lng <= PHILIPPINE_BOUNDS.east;
}

/**
 * Prompt user for confirmation when multiple addresses are found
 * @param results - Array of geocoding results
 * @returns Promise<ConfirmationResult> - User's confirmation choice
 */
export async function promptAddressConfirmation(results: NominatimResult[]): Promise<ConfirmationResult> {
  if (results.length === 1) {
    // Single result - show and confirm
    console.log(`\n📍 Found location: ${results[0].display_name}`);
    console.log(`📊 Coordinates: ${parseFloat(results[0].lat)}, ${parseFloat(results[0].lon)}`);
    console.log(`\n❓ Is this the correct location? (This is a demo - auto-confirming)`);
    
    // In a real CLI app, we'd use readline here
    // For now, we'll auto-confirm single results
    return { confirmed: true, selectedIndex: 0 };
  } else {
    // Multiple results - show options and let user choose
    console.log(`\n⚠️  Multiple locations found for your address:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.display_name}`);
      console.log(`      Coordinates: ${parseFloat(result.lat)}, ${parseFloat(result.lon)}`);
    });
    
    console.log(`\n❓ Which location would you like to use? (This is a demo - using first option)`);
    console.log(`💡 In CLI mode, you would type the number (1-${results.length}) or 'cancel'`);
    
    // In a real CLI app, we'd use readline to get user input
    // For now, we'll auto-select the first option
    const selectedIndex = 0;
    console.log(`🎯 Auto-selected option ${selectedIndex + 1}: ${results[selectedIndex].display_name}`);
    
    return { confirmed: true, selectedIndex };
  }
}

/**
 * Geocode an address using OpenStreetMap Nominatim API
 * @param address - Plain text address to geocode
 * @param options - Geocoding options
 * @returns Promise<Coordinates> - Latitude and longitude coordinates
 */
export async function geocodeAddress(
  address: string, 
  options: GeocodingOptions = {}
): Promise<Coordinates> {
  // Step 1: Validate address input
  const validation = validateAddressInput(address);
  if (!validation.isValid) {
    throw new Error(`Address validation failed: ${validation.error}`);
  }
  
  const {
    countryCode = 'ph',
    limit = 5,
    addressDetails = true
  } = options;
  
  const cleanAddress = address.trim();
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}&limit=${limit}&countrycodes=${countryCode}&addressdetails=${addressDetails ? 1 : 0}`;
  
  try {
    console.log(`🔍 Geocoding address: "${cleanAddress}"`);
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Sow-Sure-AI-Hazard-Assessment-Tool/1.0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('Geocoding service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`Geocoding API error! status: ${response.status}`);
      }
    }
    
    const results: NominatimResult[] = await response.json();
    
    if (results.length === 0) {
      throw new Error(`❌ No locations found for "${cleanAddress}". Please try:
• Adding more details (e.g., city, province)
• Using a different spelling
• Including landmarks or street names
• Example: "Rizal Park, Manila, Philippines"`);
    }
    
    // Step 2: Get user confirmation for the address
    const confirmation = await promptAddressConfirmation(results);
    
    if (!confirmation.confirmed) {
      throw new Error('Address confirmation cancelled by user.');
    }
    
    const selectedResult = results[confirmation.selectedIndex || 0];
    const lat = parseFloat(selectedResult.lat);
    const lon = parseFloat(selectedResult.lon);
    
    // Step 3: Check if the result is actually in the Philippines
    if (!isWithinPhilippines(lat, lon)) {
      throw new Error(`❌ Location "${selectedResult.display_name}" appears to be outside the Philippines. 
Please provide a Philippine address for hazard assessment.`);
    }
    
    const coords: Coordinates = {
      lat: lat,
      lng: lon
    };
    
    console.log(`✅ Address confirmed and validated`);
    console.log(`📊 Final coordinates: ${coords.lat}, ${coords.lng}`);
    
    return coords;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Geocoding failed:', error.message);
    } else {
      console.error('❌ Geocoding failed with unknown error:', error);
    }
    throw error;
  }
}

/**
 * Geocode multiple addresses with rate limiting
 * @param addresses - Array of addresses to geocode
 * @param delay - Delay between requests in milliseconds
 * @returns Promise<Array<{address: string, coordinates?: Coordinates, error?: string}>>
 */
export async function geocodeAddresses(
  addresses: string[], 
  delay: number = 1200
): Promise<Array<{address: string, coordinates?: Coordinates, error?: string}>> {
  const results: Array<{address: string, coordinates?: Coordinates, error?: string}> = [];
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    
    try {
      const coordinates = await geocodeAddress(address);
      results.push({ address, coordinates });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({ address, error: errorMessage });
    }
    
    // Rate limiting - wait between requests (except for last request)
    if (i < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}
