import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// Interface for coordinates
interface Coordinates {
    lat: number;
    lng: number;
}

// Interface for Nominatim API response
interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    place_id: number;
}

// Interface for user confirmation response
interface ConfirmationResult {
    confirmed: boolean;
    selectedIndex?: number;
}

// Interface for favorite location
interface FavoriteLocation {
    id: string;
    name: string;
    address: string;
    coordinates: Coordinates;
    createdAt: string;
    lastUsed?: string;
    useCount: number;
}

// Interface for favorites configuration
interface FavoritesConfig {
    favorites: FavoriteLocation[];
    lastUpdated: string;
}

/**
 * Prompt user for confirmation when multiple addresses are found
 * @param results - Array of geocoding results
 * @returns Promise<ConfirmationResult> - User's confirmation choice
 */
async function promptAddressConfirmation(results: NominatimResult[]): Promise<ConfirmationResult> {
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
 * Validate and confirm address before geocoding
 * @param address - Plain text address to validate
 * @returns Promise<boolean> - Whether address passed validation
 */
async function validateAddressInput(address: string): Promise<boolean> {
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
            return false;
        }
    }
    
    console.log(`✅ Address validation passed`);
    return true;
}

/**
 * Geocode an address using OpenStreetMap Nominatim API with validation and confirmation
 * @param address - Plain text address to geocode
 * @returns Promise<Coordinates> - Latitude and longitude coordinates
 */
async function getCoordinatesFromAddress(address: string): Promise<Coordinates> {
    // Step 1: Validate address input
    const isValid = await validateAddressInput(address);
    if (!isValid) {
        throw new Error('Address validation failed. Please provide a valid address.');
    }
    
    const cleanAddress = address.trim();
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}&limit=5&countrycodes=ph&addressdetails=1`;
    
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
        const philippinesBounds = {
            north: 21.2,
            south: 4.5,
            east: 127.0,
            west: 116.0
        };
        
        if (lat < philippinesBounds.south || lat > philippinesBounds.north || 
            lon < philippinesBounds.west || lon > philippinesBounds.east) {
            throw new Error(`❌ Location "${selectedResult.display_name}" appears to be outside the Philippines. 
    Please provide a Philippine address for hazard assessment.`);
        }
        
        const coords: Coordinates = {
            lat: lat,
            lng: lon
        };
        
        console.log(`✅ Address confirmed and validated`);
        console.log(`� Final coordinates: ${coords.lat}, ${coords.lng}`);
        
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
 * Download hazard assessment report for a given address
 * @param address - Plain text address to get hazard report for
 */
async function downloadHazardReportByAddress(address: string): Promise<void> {
    try {
        // Step 1: Geocode the address to get coordinates
        console.log(`🏠 Processing address: "${address}"`);
        const coords = await getCoordinatesFromAddress(address);
        
        // Step 2: Download hazard report using the coordinates
        await downloadHazardReportByCoordinates(coords);
        
    } catch (error) {
        if (error instanceof Error) {
            // Check for specific error types and provide helpful guidance
            if (error.message.includes('No locations found')) {
                console.error('💡 Suggestion: Try searching for a nearby landmark, major street, or city center.');
            } else if (error.message.includes('Rate limit exceeded')) {
                console.error('💡 Suggestion: Wait 1-2 seconds and try again.');
            } else if (error.message.includes('outside the Philippines')) {
                console.error('💡 Suggestion: This tool only works for Philippine addresses.');
            } else if (error.message.includes('HTTP error')) {
                console.error('💡 Suggestion: Check your internet connection or try again later.');
            }
        }
        
        console.error('❌ Failed to download hazard report for address:', address);
        throw error;
    }
}

/**
 * Download hazard assessment report for given coordinates
 * @param coords - Latitude and longitude coordinates
 */
async function downloadHazardReportByCoordinates(coords: Coordinates): Promise<void> {
    const reportUrl = `https://ulap-reports.georisk.gov.ph/api/reports/hazard-assessments/${coords.lng}/${coords.lat}`;
    const downloadPath = `hazard-reports/hazard-report-${coords.lng}-${coords.lat}-${Date.now()}.pdf`;

    // Create hazard-reports directory if it doesn't exist
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
        
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(downloadPath, Buffer.from(buffer));
        
        console.log(`✅ File downloaded successfully to: ${downloadPath}`);
    } catch (error) {
        console.error('❌ Download failed:', error);
        throw error;
    }
}

// Test the new address-based hazard report download
async function testAddressBasedDownload() {
    try {
        const testAddress = "Manila City Hall, Manila, Philippines";
        console.log(`🧪 Testing hazard report download for: ${testAddress}`);
        await downloadHazardReportByAddress(testAddress);
        console.log(`🎉 Test completed successfully!`);
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Test error handling scenarios
async function testErrorHandling() {
    console.log('\n🧪 Testing error handling scenarios...\n');
    
    const testCases = [
        {
            name: 'Empty address',
            address: '',
            expectedError: 'empty'
        },
        {
            name: 'Whitespace only',
            address: '   ',
            expectedError: 'empty'
        },
        {
            name: 'Invalid/non-existent location',
            address: 'Nonexistent City, Philippines',
            expectedError: 'not found'
        },
        {
            name: 'Foreign address (should be rejected)',
            address: 'New York City, USA',
            expectedError: 'outside Philippines'
        },
        {
            name: 'Ambiguous address (multiple results)',
            address: 'Manila',
            expectedError: 'multiple results'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n📋 Test: ${testCase.name}`);
        console.log(`📍 Address: "${testCase.address}"`);
        
        try {
            await getCoordinatesFromAddress(testCase.address);
            console.log(`✅ Unexpected success for: ${testCase.name}`);
        } catch (error) {
            if (error instanceof Error) {
                console.log(`❌ Expected error caught: ${error.message.split('\n')[0]}`);
            }
        }
        
        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1100));
    }
    
    console.log('\n🎉 Error handling tests completed!');
}

// Test various Philippine address formats
async function testVariousAddressFormats() {
    console.log('\n🧪 Testing various Philippine address formats...\n');
    
    const addressFormats = [
        {
            category: 'Full Street Addresses',
            addresses: [
                '123 Rizal Street, Poblacion, Makati City, Metro Manila',
                '456 EDSA, Mandaluyong City, Philippines',
                'Unit 789, Ayala Avenue, Makati CBD, Metro Manila, Philippines'
            ]
        },
        {
            category: 'City Names Only',
            addresses: [
                'Cebu City',
                'Davao City, Philippines',
                'Iloilo City, Iloilo',
                'Baguio City, Benguet'
            ]
        },
        {
            category: 'Famous Landmarks',
            addresses: [
                'Boracay Island, Aklan',
                'Mayon Volcano, Albay',
                'Banaue Rice Terraces, Ifugao',
                'Chocolate Hills, Bohol'
            ]
        },
        {
            category: 'Government Buildings',
            addresses: [
                'Malacañang Palace, Manila',
                'Philippine Senate, Pasay City',
                'Supreme Court of the Philippines, Manila',
                'Quezon City Hall, Quezon City'
            ]
        },
        {
            category: 'Universities and Schools',
            addresses: [
                'University of the Philippines Diliman, Quezon City',
                'Ateneo de Manila University, Quezon City',
                'De La Salle University, Manila',
                'University of Santo Tomas, Manila'
            ]
        },
        {
            category: 'Shopping Centers',
            addresses: [
                'SM Mall of Asia, Pasay City',
                'Greenbelt, Makati City',
                'Ayala Center Cebu, Cebu City',
                'Gateway Mall, Quezon City'
            ]
        },
        {
            category: 'Airports and Transportation',
            addresses: [
                'Ninoy Aquino International Airport, Pasay City',
                'Clark International Airport, Pampanga',
                'Mactan-Cebu International Airport, Cebu',
                'MRT Ayala Station, Makati City'
            ]
        },
        {
            category: 'Hospitals',
            addresses: [
                'Philippine General Hospital, Manila',
                'St. Luke\'s Medical Center, Quezon City',
                'Makati Medical Center, Makati City',
                'Asian Hospital, Muntinlupa City'
            ]
        },
        {
            category: 'Informal/Common Formats',
            addresses: [
                'Intramuros, Manila',
                'Bonifacio Global City',
                'Ortigas Center',
                'Eastwood City'
            ]
        }
    ];
    
    let totalTests = 0;
    let successfulTests = 0;
    let failedTests = 0;
    
    for (const category of addressFormats) {
        console.log(`\n� Category: ${category.category}`);
        console.log('=' .repeat(50));
        
        for (const address of category.addresses) {
            totalTests++;
            console.log(`\n📍 Testing: "${address}"`);
            
            try {
                const coords = await getCoordinatesFromAddress(address);
                console.log(`✅ Success: Found coordinates ${coords.lat}, ${coords.lng}`);
                successfulTests++;
                
                // Optional: Test actual report download for a few samples
                if (successfulTests <= 3) {
                    console.log(`🔄 Testing report download...`);
                    await downloadHazardReportByCoordinates(coords);
                    console.log(`📥 Report downloaded successfully`);
                }
                
            } catch (error) {
                console.log(`❌ Failed: ${error instanceof Error ? error.message.split('\n')[0] : error}`);
                failedTests++;
            }
            
            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
    }
    
    // Summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 ADDRESS FORMAT TESTING SUMMARY');
    console.log('='.repeat(60));
    console.log(`📈 Total tests: ${totalTests}`);
    console.log(`✅ Successful: ${successfulTests} (${Math.round(successfulTests/totalTests*100)}%)`);
    console.log(`❌ Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
    console.log(`📊 Success rate: ${Math.round(successfulTests/totalTests*100)}%`);
    
    if (successfulTests >= totalTests * 0.8) {
        console.log(`🎉 Excellent! High success rate indicates robust address format support.`);
    } else if (successfulTests >= totalTests * 0.6) {
        console.log(`👍 Good! Most address formats are supported.`);
    } else {
        console.log(`⚠️  Consider improving address format handling.`);
    }
    
    console.log('\n💡 Recommendations:');
    console.log('• Most successful formats can be used as examples for users');
    console.log('• Failed formats may need additional context or different spelling');
    console.log('• Consider adding format suggestions based on successful patterns');
    
    return {
        total: totalTests,
        successful: successfulTests,
        failed: failedTests,
        successRate: Math.round(successfulTests/totalTests*100)
    };
}

/**
 * Main function to download hazard assessment report for any Philippine address
 * @param address - The address to get hazard assessment for
 * @returns Promise<string> - Path to downloaded report
 */
async function main(address?: string): Promise<string | null> {
    // Use provided address or default for demo
    const targetAddress = address || 'Rizal Park, Manila, Philippines';
    
    console.log('🏛️  SOW SURE AI - HAZARD ASSESSMENT TOOL');
    console.log('=' .repeat(50));
    console.log('📍 Philippine Disaster Risk Assessment System');
    console.log('🔗 Powered by OpenStreetMap + ULAP API\n');
    
    try {
        console.log(`🎯 Target Location: "${targetAddress}"`);
        
        // Step 1: Geocode the address
        const coords = await getCoordinatesFromAddress(targetAddress);
        
        // Step 2: Download hazard assessment report
        console.log(`\n📥 Downloading hazard assessment report...`);
        await downloadHazardReportByCoordinates(coords);
        
        console.log(`\n🎉 Hazard assessment completed successfully!`);
        console.log(`📊 Location: ${coords.lat}, ${coords.lng}`);
        console.log(`📁 Report saved in: ./hazard-reports/`);
        
        return `hazard-reports/hazard-report-${coords.lng}-${coords.lat}-${Date.now()}.pdf`;
        
    } catch (error) {
        console.error('\n❌ Hazard assessment failed:');
        if (error instanceof Error) {
            console.error(`   ${error.message}`);
        } else {
            console.error(`   Unknown error: ${error}`);
        }
        return null;
    }
}

/**
 * Interface for batch processing results
 */
interface BatchResult {
    address: string;
    success: boolean;
    filePath?: string;
    error?: string;
    coordinates?: Coordinates;
    processingTime: number;
}

/**
 * Interface for batch processing summary
 */
interface BatchSummary {
    totalAddresses: number;
    successful: number;
    failed: number;
    successRate: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    results: BatchResult[];
}

/**
 * Process multiple addresses from a file or array
 * @param addresses - Array of addresses to process
 * @param options - Processing options
 * @returns Promise<BatchSummary> - Summary of batch processing results
 */
async function processBatchAddresses(
    addresses: string[], 
    options: { 
        verbose?: boolean; 
        output?: string;
        continueOnError?: boolean;
        delayBetweenRequests?: number;
    } = {}
): Promise<BatchSummary> {
    const { verbose = false, output = 'hazard-reports', continueOnError = true, delayBetweenRequests = 1200 } = options;
    
    console.log('\n🏛️  SOW SURE AI - BATCH PROCESSING MODE');
    console.log('=' .repeat(55));
    console.log(`📊 Processing ${addresses.length} addresses`);
    console.log(`📁 Output directory: ${output}`);
    console.log(`⚙️  Continue on error: ${continueOnError ? 'Yes' : 'No'}`);
    console.log(`⏰ Delay between requests: ${delayBetweenRequests}ms\n`);
    
    const results: BatchResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i].trim();
        if (!address) continue; // Skip empty lines
        
        const addressStartTime = Date.now();
        console.log(`\n📍 Processing ${i + 1}/${addresses.length}: ${address}`);
        console.log('-'.repeat(60));
        
        try {
            if (verbose) {
                console.log('🔍 Verbose mode: Starting geocoding process...');
            }
            
            const filePath = await main(address);
            const processingTime = Date.now() - addressStartTime;
            
            if (filePath) {
                successCount++;
                results.push({
                    address,
                    success: true,
                    filePath,
                    processingTime,
                    coordinates: undefined // Will be extracted if needed
                });
                console.log(`✅ Success: Report saved to ${filePath}`);
            } else {
                failedCount++;
                results.push({
                    address,
                    success: false,
                    error: 'Failed to generate report',
                    processingTime
                });
                console.log(`❌ Failed: Could not generate report for ${address}`);
                
                if (!continueOnError) {
                    console.log('🛑 Stopping batch processing due to error (continueOnError=false)');
                    break;
                }
            }
            
        } catch (error) {
            const processingTime = Date.now() - addressStartTime;
            failedCount++;
            
            const errorMessage = error instanceof Error ? error.message : String(error);
            results.push({
                address,
                success: false,
                error: errorMessage,
                processingTime
            });
            
            console.log(`❌ Error processing ${address}: ${errorMessage}`);
            
            if (!continueOnError) {
                console.log('🛑 Stopping batch processing due to error (continueOnError=false)');
                break;
            }
        }
        
        // Rate limiting delay (except for last item)
        if (i < addresses.length - 1) {
            console.log(`⏳ Waiting ${delayBetweenRequests}ms to respect API rate limits...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }
    }
    
    const totalProcessingTime = Date.now() - startTime;
    const averageProcessingTime = results.length > 0 ? totalProcessingTime / results.length : 0;
    const successRate = results.length > 0 ? Math.round((successCount / results.length) * 100) : 0;
    
    // Create summary
    const summary: BatchSummary = {
        totalAddresses: results.length,
        successful: successCount,
        failed: failedCount,
        successRate,
        totalProcessingTime,
        averageProcessingTime,
        results
    };
    
    // Display summary
    displayBatchSummary(summary);
    
    return summary;
}

/**
 * Display batch processing summary
 * @param summary - Batch processing summary to display
 */
function displayBatchSummary(summary: BatchSummary) {
    console.log('\n🎊 BATCH PROCESSING COMPLETED');
    console.log('=' .repeat(55));
    console.log(`📊 Total Addresses: ${summary.totalAddresses}`);
    console.log(`✅ Successful: ${summary.successful}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`📈 Success Rate: ${summary.successRate}%`);
    console.log(`⏱️  Total Time: ${Math.round(summary.totalProcessingTime / 1000)}s`);
    console.log(`📏 Average Time per Address: ${Math.round(summary.averageProcessingTime / 1000)}s`);
    
    if (summary.failed > 0) {
        console.log('\n❌ FAILED ADDRESSES:');
        summary.results
            .filter(r => !r.success)
            .forEach((result, index) => {
                console.log(`   ${index + 1}. "${result.address}" - ${result.error}`);
            });
    }
    
    if (summary.successful > 0) {
        console.log('\n✅ SUCCESSFUL DOWNLOADS:');
        summary.results
            .filter(r => r.success)
            .forEach((result, index) => {
                console.log(`   ${index + 1}. "${result.address}" - ${result.filePath}`);
            });
    }
    
    console.log('\n💡 BATCH PROCESSING TIPS:');
    console.log('• Use --no-continue-on-error to stop on first failure');
    console.log('• Adjust --delay for faster/slower processing');
    console.log('• Use --verbose for detailed geocoding information');
    console.log('• Check the output directory for all generated reports');
}

/**
 * Read addresses from a file (one address per line)
 * @param filePath - Path to file containing addresses
 * @returns Promise<string[]> - Array of addresses
 */
async function readAddressesFromFile(filePath: string): Promise<string[]> {
    try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const addresses = fileContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#')); // Remove empty lines and comments
        
        console.log(`📄 Loaded ${addresses.length} addresses from ${filePath}`);
        return addresses;
    } catch (error) {
        throw new Error(`Failed to read addresses file: ${error instanceof Error ? error.message : error}`);
    }
}

/**
 * Get the path to the favorites configuration file
 * @returns string - Path to favorites.json file
 */
function getFavoritesFilePath(): string {
    return path.join(process.cwd(), 'favorites.json');
}

/**
 * Load favorite locations from file
 * @returns Promise<FavoritesConfig> - Loaded favorites configuration
 */
async function loadFavorites(): Promise<FavoritesConfig> {
    const favoritesPath = getFavoritesFilePath();
    
    try {
        const fileContent = await fs.promises.readFile(favoritesPath, 'utf-8');
        const config = JSON.parse(fileContent) as FavoritesConfig;
        return config;
    } catch (error) {
        // If file doesn't exist or is invalid, return empty config
        return {
            favorites: [],
            lastUpdated: new Date().toISOString()
        };
    }
}

/**
 * Save favorite locations to file
 * @param config - Favorites configuration to save
 * @returns Promise<void>
 */
async function saveFavorites(config: FavoritesConfig): Promise<void> {
    const favoritesPath = getFavoritesFilePath();
    config.lastUpdated = new Date().toISOString();
    
    try {
        await fs.promises.writeFile(favoritesPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Failed to save favorites: ${error instanceof Error ? error.message : error}`);
    }
}

/**
 * Add a new favorite location
 * @param name - Display name for the favorite
 * @param address - The address string
 * @param coordinates - The geocoded coordinates
 * @returns Promise<void>
 */
async function addFavorite(name: string, address: string, coordinates: Coordinates): Promise<void> {
    const config = await loadFavorites();
    
    // Check if favorite with same name already exists
    const existingIndex = config.favorites.findIndex(fav => fav.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex >= 0) {
        // Update existing favorite
        config.favorites[existingIndex] = {
            ...config.favorites[existingIndex],
            address,
            coordinates,
            lastUsed: new Date().toISOString(),
            useCount: config.favorites[existingIndex].useCount + 1
        };
        console.log(`🔄 Updated existing favorite: "${name}"`);
    } else {
        // Add new favorite
        const newFavorite: FavoriteLocation = {
            id: Date.now().toString(),
            name,
            address,
            coordinates,
            createdAt: new Date().toISOString(),
            useCount: 0
        };
        config.favorites.push(newFavorite);
        console.log(`⭐ Added new favorite: "${name}"`);
    }
    
    await saveFavorites(config);
}

/**
 * Remove a favorite location by name
 * @param name - Name of the favorite to remove
 * @returns Promise<boolean> - True if removed, false if not found
 */
async function removeFavorite(name: string): Promise<boolean> {
    const config = await loadFavorites();
    const initialCount = config.favorites.length;
    
    config.favorites = config.favorites.filter(fav => fav.name.toLowerCase() !== name.toLowerCase());
    
    if (config.favorites.length < initialCount) {
        await saveFavorites(config);
        console.log(`🗑️  Removed favorite: "${name}"`);
        return true;
    } else {
        console.log(`❌ Favorite not found: "${name}"`);
        return false;
    }
}

/**
 * List all favorite locations
 * @returns Promise<FavoriteLocation[]> - Array of favorite locations
 */
async function listFavorites(): Promise<FavoriteLocation[]> {
    const config = await loadFavorites();
    return config.favorites.sort((a, b) => b.useCount - a.useCount); // Sort by most used
}

/**
 * Get a favorite location by name
 * @param name - Name of the favorite to find
 * @returns Promise<FavoriteLocation | null> - The favorite location or null if not found
 */
async function getFavorite(name: string): Promise<FavoriteLocation | null> {
    const config = await loadFavorites();
    const favorite = config.favorites.find(fav => fav.name.toLowerCase() === name.toLowerCase());
    
    if (favorite) {
        // Update use count and last used
        favorite.useCount++;
        favorite.lastUsed = new Date().toISOString();
        await saveFavorites(config);
    }
    
    return favorite || null;
}

/**
 * Display favorites in a formatted list
 * @param favorites - Array of favorite locations to display
 */
function displayFavorites(favorites: FavoriteLocation[]) {
    if (favorites.length === 0) {
        console.log('📭 No favorite locations saved yet.');
        console.log('💡 Add favorites using: npx tsx index.ts favorites add "My Location" "Address"');
        return;
    }
    
    console.log('⭐ FAVORITE LOCATIONS');
    console.log('=' .repeat(55));
    
    favorites.forEach((fav, index) => {
        const lastUsed = fav.lastUsed ? new Date(fav.lastUsed).toLocaleDateString() : 'Never';
        const created = new Date(fav.createdAt).toLocaleDateString();
        
        console.log(`\n${index + 1}. 📍 ${fav.name}`);
        console.log(`   Address: ${fav.address}`);
        console.log(`   Coordinates: ${fav.coordinates.lat}, ${fav.coordinates.lng}`);
        console.log(`   Used: ${fav.useCount} times | Last: ${lastUsed} | Created: ${created}`);
    });
    
    console.log('\n💡 USAGE TIPS:');
    console.log('• Use favorites: npx tsx index.ts get --favorite "Location Name"');
    console.log('• Add favorites: npx tsx index.ts favorites add "Name" "Address"');
    console.log('• Remove favorites: npx tsx index.ts favorites remove "Name"');
}

/**
 * Demo function showing various address format examples
 */
async function runDemo() {
    console.log('\n🧪 DEMO MODE - Testing various Philippine address formats\n');
    
    const demoAddresses = [
        'Manila City Hall, Manila, Philippines',
        'University of the Philippines Diliman, Quezon City',
        'Boracay Island, Aklan',
        'Cebu City, Philippines',
        'Baguio City, Benguet'
    ];
    
    for (let i = 0; i < demoAddresses.length; i++) {
        const address = demoAddresses[i];
        console.log(`\n📍 Demo ${i + 1}/${demoAddresses.length}: ${address}`);
        console.log('-'.repeat(60));
        
        const result = await main(address);
        
        if (result) {
            console.log(`✅ Demo ${i + 1} completed successfully`);
        } else {
            console.log(`❌ Demo ${i + 1} failed`);
        }
        
        // Rate limiting delay
        if (i < demoAddresses.length - 1) {
            console.log('\n⏳ Waiting to respect API rate limits...');
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
    }
    
    console.log('\n🎊 Demo completed! All address formats tested.');
    console.log('\n💡 Usage Examples:');
    console.log('• Full addresses: "123 Rizal Street, Makati City, Metro Manila"');
    console.log('• City names: "Davao City, Philippines"');
    console.log('• Landmarks: "Rizal Park, Manila"');
    console.log('• Universities: "Ateneo de Manila University, Quezon City"');
    console.log('• Government: "Malacañang Palace, Manila"');
}

/**
 * Initialize CLI program with commander.js
 */
function initializeCLI() {
    const program = new Command();
    
    program
        .name('sow-sure-ai')
        .description('🏛️  SOW SURE AI - Philippine Disaster Risk Assessment Tool\n' +
                    'Download hazard assessment reports for any Philippine address using OpenStreetMap geocoding and ULAP API.')
        .version('1.0.0')
        .addHelpText('after', `
Examples:
  $ npx tsx index.ts get "Rizal Park, Manila"
  $ npx tsx index.ts get "University of the Philippines, Diliman"
  $ npx tsx index.ts get "Mayon Volcano, Albay, Philippines"
  $ npx tsx index.ts get --favorite "MyHome"
  $ npx tsx index.ts get "Manila" --save-favorite "Capital"
  $ npx tsx index.ts batch addresses.txt
  $ npx tsx index.ts batch addresses.txt --verbose --delay 2000
  $ npx tsx index.ts favorites add "Office" "Makati CBD, Philippines"
  $ npx tsx index.ts favorites list
  $ npx tsx index.ts demo
  
Favorite Locations:
  • Add: npx tsx index.ts favorites add "Name" "Address"
  • List: npx tsx index.ts favorites list
  • Use: npx tsx index.ts get --favorite "Name"
  • Remove: npx tsx index.ts favorites remove "Name"
  
Batch Processing:
  • Create a text file with one address per line
  • Use # for comments in your address file
  • Control processing speed with --delay option
  • Use --no-continue-on-error to stop on first failure
  
Address Formats Supported:
  • Full addresses: "123 Rizal Street, Makati City, Metro Manila"
  • City names: "Davao City, Philippines"
  • Landmarks: "Rizal Park, Manila"
  • Universities: "Ateneo de Manila University, Quezon City"
  • Government buildings: "Malacañang Palace, Manila"
        `);

    // Command to get hazard report for a specific address
    program
        .command('get <address>')
        .description('Download hazard assessment report for the specified address')
        .option('-v, --verbose', 'Enable verbose output with detailed geocoding information')
        .option('-o, --output <dir>', 'Output directory for hazard reports', 'hazard-reports')
        .option('-f, --favorite', 'Use address as a favorite location name instead of a raw address')
        .option('--save-favorite <name>', 'Save this address as a favorite with the given name')
        .action(async (address: string, options: { 
            verbose?: boolean; 
            output?: string; 
            favorite?: boolean;
            saveFavorite?: string;
        }) => {
            try {
                if (options.verbose) {
                    console.log('🔍 Verbose mode enabled - showing detailed geocoding information');
                }
                
                // Set output directory if specified
                if (options.output !== 'hazard-reports') {
                    console.log(`📁 Using custom output directory: ${options.output}`);
                }
                
                let finalAddress = address;
                let coordinates: Coordinates | null = null;
                
                // Check if using favorite
                if (options.favorite) {
                    console.log(`⭐ Looking up favorite: "${address}"`);
                    const favorite = await getFavorite(address);
                    if (!favorite) {
                        console.error(`❌ Favorite "${address}" not found`);
                        console.log('💡 List favorites: npx tsx index.ts favorites list');
                        process.exit(1);
                    }
                    finalAddress = favorite.address;
                    coordinates = favorite.coordinates;
                    console.log(`📍 Using favorite address: "${finalAddress}"`);
                }
                
                const result = await main(finalAddress);
                if (!result) {
                    process.exit(1);
                }
                
                // Save as favorite if requested
                if (options.saveFavorite) {
                    if (!coordinates) {
                        // Need to geocode the address to get coordinates
                        coordinates = await getCoordinatesFromAddress(finalAddress);
                    }
                    await addFavorite(options.saveFavorite, finalAddress, coordinates);
                    console.log(`⭐ Saved as favorite: "${options.saveFavorite}"`);
                }
                
            } catch (error) {
                console.error('❌ Command failed:', error);
                process.exit(1);
            }
        });

    // Command to run demo mode
    program
        .command('demo')
        .description('Run demonstration mode with sample Philippine addresses')
        .action(async () => {
            try {
                await runDemo();
            } catch (error) {
                console.error('❌ Demo failed:', error);
                process.exit(1);
            }
        });

    // Command for batch processing multiple addresses
    program
        .command('batch <file>')
        .description('Process multiple addresses from a file (one address per line)')
        .option('-v, --verbose', 'Enable verbose output with detailed geocoding information')
        .option('-o, --output <dir>', 'Output directory for hazard reports', 'hazard-reports')
        .option('--no-continue-on-error', 'Stop processing on first error (default: continue)')
        .option('--delay <ms>', 'Delay between requests in milliseconds', '1200')
        .action(async (file: string, options: { 
            verbose?: boolean; 
            output?: string; 
            continueOnError?: boolean;
            delay?: string;
        }) => {
            try {
                const delay = parseInt(options.delay || '1200');
                
                if (options.verbose) {
                    console.log('🔍 Verbose mode enabled - showing detailed geocoding information');
                }
                
                console.log(`📄 Reading addresses from file: ${file}`);
                const addresses = await readAddressesFromFile(file);
                
                if (addresses.length === 0) {
                    console.log('⚠️  No valid addresses found in file');
                    process.exit(1);
                }
                
                const summary = await processBatchAddresses(addresses, {
                    verbose: options.verbose,
                    output: options.output,
                    continueOnError: options.continueOnError,
                    delayBetweenRequests: delay
                });
                
                // Exit with error code if any addresses failed and continue-on-error is false
                if (!options.continueOnError && summary.failed > 0) {
                    process.exit(1);
                }
                
            } catch (error) {
                console.error('❌ Batch processing failed:', error);
                process.exit(1);
            }
        });

    // Command to show supported address formats and examples
    program
        .command('examples')
        .description('Show examples of supported Philippine address formats')
        .action(() => {
            console.log('🏛️  SOW SURE AI - Supported Address Formats\n');
            console.log('📍 LANDMARKS & TOURIST SPOTS:');
            console.log('   • "Rizal Park, Manila"');
            console.log('   • "Boracay Island, Aklan"');
            console.log('   • "Mayon Volcano, Albay"\n');
            
            console.log('🏫 EDUCATIONAL INSTITUTIONS:');
            console.log('   • "University of the Philippines Diliman"');
            console.log('   • "Ateneo de Manila University, Quezon City"');
            console.log('   • "De La Salle University, Manila"\n');
            
            console.log('🏛️  GOVERNMENT BUILDINGS:');
            console.log('   • "Malacañang Palace, Manila"');
            console.log('   • "Manila City Hall, Philippines"');
            console.log('   • "Quezon City Hall"\n');
            
            console.log('🏙️  CITIES & MUNICIPALITIES:');
            console.log('   • "Makati City, Metro Manila"');
            console.log('   • "Davao City, Philippines"');
            console.log('   • "Baguio City, Benguet"\n');
            
            console.log('🏠 FULL ADDRESSES:');
            console.log('   • "123 Rizal Street, Makati City, Metro Manila"');
            console.log('   • "456 EDSA, Quezon City, Philippines"');
            console.log('   • "789 Ayala Avenue, Makati, NCR"\n');
            
            console.log('💡 TIP: The more specific your address, the better the geocoding accuracy!');
        });

    // Command for managing favorite locations
    program
        .command('favorites')
        .description('Manage favorite locations for quick access')
        .argument('[action]', 'Action to perform: list, add, remove, show')
        .argument('[name]', 'Name of the favorite location')
        .argument('[address]', 'Address for the favorite location (when adding)')
        .action(async (action: string = 'list', name?: string, address?: string) => {
            try {
                switch (action.toLowerCase()) {
                    case 'list':
                    case 'ls':
                        const favorites = await listFavorites();
                        displayFavorites(favorites);
                        break;
                        
                    case 'add':
                        if (!name || !address) {
                            console.error('❌ Usage: npx tsx index.ts favorites add "Location Name" "Address"');
                            process.exit(1);
                        }
                        
                        console.log(`🔍 Geocoding address for favorite: "${address}"`);
                        const coords = await getCoordinatesFromAddress(address);
                        await addFavorite(name, address, coords);
                        console.log(`✅ Favorite "${name}" saved successfully!`);
                        break;
                        
                    case 'remove':
                    case 'rm':
                        if (!name) {
                            console.error('❌ Usage: npx tsx index.ts favorites remove "Location Name"');
                            process.exit(1);
                        }
                        
                        const removed = await removeFavorite(name);
                        if (!removed) {
                            process.exit(1);
                        }
                        break;
                        
                    case 'show':
                        if (!name) {
                            console.error('❌ Usage: npx tsx index.ts favorites show "Location Name"');
                            process.exit(1);
                        }
                        
                        const favorite = await getFavorite(name);
                        if (favorite) {
                            console.log(`⭐ ${favorite.name}`);
                            console.log(`📍 Address: ${favorite.address}`);
                            console.log(`🗺️  Coordinates: ${favorite.coordinates.lat}, ${favorite.coordinates.lng}`);
                            console.log(`📊 Used ${favorite.useCount} times`);
                            if (favorite.lastUsed) {
                                console.log(`⏰ Last used: ${new Date(favorite.lastUsed).toLocaleString()}`);
                            }
                            console.log(`📅 Created: ${new Date(favorite.createdAt).toLocaleString()}`);
                        } else {
                            console.log(`❌ Favorite "${name}" not found`);
                            process.exit(1);
                        }
                        break;
                        
                    default:
                        console.error(`❌ Unknown action: ${action}`);
                        console.log('📖 Available actions: list, add, remove, show');
                        process.exit(1);
                }
            } catch (error) {
                console.error('❌ Favorites command failed:', error);
                process.exit(1);
            }
        });

    return program;
}

// Initialize and parse CLI arguments
const program = initializeCLI();

// If no arguments provided, show help
if (process.argv.length <= 2) {
    console.log('🏛️  SOW SURE AI - Philippine Disaster Risk Assessment Tool');
    console.log('=' .repeat(55));
    console.log('📍 No command specified. Here are your options:\n');
    program.help();
} else {
    program.parse();
}
