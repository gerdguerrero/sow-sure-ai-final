import { NextRequest, NextResponse } from 'next/server'

// Fallback location data for common Philippine cities
const fallbackLocations = [
  { display_name: 'Manila, Metro Manila, Philippines', lat: 14.5995, lon: 120.9842, address: { city: 'Manila', country: 'Philippines' } },
  { display_name: 'Quezon City, Metro Manila, Philippines', lat: 14.6760, lon: 121.0437, address: { city: 'Quezon City', country: 'Philippines' } },
  { display_name: 'Cebu City, Cebu, Philippines', lat: 10.3157, lon: 123.8854, address: { city: 'Cebu City', country: 'Philippines' } },
  { display_name: 'Davao City, Davao del Sur, Philippines', lat: 7.0731, lon: 125.6128, address: { city: 'Davao City', country: 'Philippines' } },
  { display_name: 'Cabanatuan, Nueva Ecija, Philippines', lat: 15.4858, lon: 120.9658, address: { city: 'Cabanatuan', country: 'Philippines' } },
  { display_name: 'Makati, Metro Manila, Philippines', lat: 14.5547, lon: 121.0244, address: { city: 'Makati', country: 'Philippines' } },
  { display_name: 'Taguig, Metro Manila, Philippines', lat: 14.5176, lon: 121.0509, address: { city: 'Taguig', country: 'Philippines' } },
  { display_name: 'Pasig, Metro Manila, Philippines', lat: 14.5764, lon: 121.0851, address: { city: 'Pasig', country: 'Philippines' } },
]

async function fetchWithTimeout(url: string, options: any, timeout = 8000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    console.log(`🔍 Geocoding search for: ${query}`)
    
    // First check if we can match with fallback locations
    const normalizedQuery = query.toLowerCase().trim()
    const fallbackMatches = fallbackLocations.filter(location => 
      location.display_name.toLowerCase().includes(normalizedQuery) ||
      location.address.city?.toLowerCase().includes(normalizedQuery)
    )
    
    if (fallbackMatches.length > 0) {
      console.log(`✅ Found ${fallbackMatches.length} fallback matches for: ${query}`)
      return NextResponse.json(fallbackMatches)
    }
    
    // Try multiple geocoding services as fallbacks
    const geocodingAPIs = [
      {
        name: 'Nominatim',
        url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Philippines')}&limit=5&addressdetails=1`,
        headers: { 'User-Agent': 'SowSureAI-Geocoding/1.0 (Risk Assessment)' }
      },
      {
        name: 'Photon',
        url: `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ' Philippines')}&limit=5`,
        headers: {}
      }
    ]
    
    for (const api of geocodingAPIs) {
      try {
        console.log(`🌐 Trying ${api.name} API...`)
        
        const response = await fetchWithTimeout(api.url, {
          headers: api.headers,
        }, 8000)
        
        if (!response.ok) {
          console.error(`❌ ${api.name} API error: ${response.status}`)
          continue
        }
        
        const data = await response.json()
        
        if (!data || data.length === 0) {
          console.log(`📍 ${api.name} returned no results`)
          continue
        }
        
        // Transform data based on API format
        let suggestions = []
        
        if (api.name === 'Nominatim') {
          suggestions = data.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            address: item.address || {}
          }))
        } else if (api.name === 'Photon') {
          suggestions = data.features?.map((item: any) => ({
            display_name: `${item.properties.name || item.properties.city || ''}, ${item.properties.state || ''}, Philippines`,
            lat: item.geometry.coordinates[1],
            lon: item.geometry.coordinates[0],
            address: item.properties || {}
          })) || []
        }
        
        if (suggestions.length > 0) {
          console.log(`✅ Found ${suggestions.length} suggestions from ${api.name} for: ${query}`)
          return NextResponse.json(suggestions)
        }
        
      } catch (error) {
        console.error(`❌ ${api.name} error:`, error instanceof Error ? error.message : 'Unknown error')
        continue
      }
    }
    
    // If all APIs fail, return a helpful message with fallback suggestions
    console.log(`📍 No results found, returning popular Philippine cities`)
    return NextResponse.json(fallbackLocations.slice(0, 3))
    
  } catch (error) {
    console.error('❌ Geocoding error:', error)
    
    // Return fallback locations even on error
    return NextResponse.json(fallbackLocations.slice(0, 3))
  }
}
