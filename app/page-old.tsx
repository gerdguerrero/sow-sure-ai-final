'use client'

import { useState } from 'react'
import RiskAssessmentForm from './components/RiskAssessmentForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            🏛️ SOW SURE AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Philippine Farmer Loan Risk Assessment
          </p>
          <p className="text-lg text-gray-500">
            🌾 Comprehensive risk scoring for agricultural lending
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <RiskAssessmentForm />
        </div>

        <footer className="text-center mt-12 text-gray-500">
          <p>© 2024 SOW SURE AI - Farmer loan risk assessment platform for the Philippines</p>
        </footer>
      </div>
    </main>
  )
}
  const [address, setAddress] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Array<{name: string, address: string}>>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIRiskAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      // This would typically load from localStorage or an API
      const savedFavorites = localStorage.getItem('hazard-favorites')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const searchAddress = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchResults([])

    try {
      // Use OpenStreetMap Nominatim API for geocoding
      const encodedAddress = encodeURIComponent(address.trim())
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=5&countrycodes=ph`,
        {
          headers: {
            'User-Agent': 'SowSureAI-HazardAssessment/1.0 (Disaster Risk Assessment Tool)'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }

      const results = await response.json()

      if (results.length === 0) {
        setError('No locations found. Please try a different address or check spelling.')
        return
      }

      const locations: LocationData[] = results.map((result: any) => ({
        address: address.trim(),
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        displayName: result.display_name
      }))

      setSearchResults(locations)

      // Auto-select first result if only one and automatically download
      if (locations.length === 1) {
        setSelectedLocation(locations[0])
        // Automatically download hazard report for single result
        await downloadHazardReport(locations[0])
      }

    } catch (error) {
      console.error('Geocoding error:', error)
      setError('Unable to search for location. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectLocation = async (location: LocationData) => {
    setSelectedLocation(location)
    setSearchResults([])
    
    // Automatically download hazard report when location is selected
    await downloadHazardReport(location)
  }

  const downloadHazardReport = async (location?: LocationData) => {
    const targetLocation = location || selectedLocation
    if (!targetLocation) return

    setIsDownloading(true)
    setDownloadStatus('Downloading hazard report...')
    setError(null)

    try {
      const { lat, lng } = targetLocation.coordinates
      
      console.log(`🌏 Downloading hazard report for: ${targetLocation.displayName}`)
      console.log(`📍 Coordinates: ${lat}, ${lng}`)
      
      const response = await fetch('/api/hazard-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: { lat, lng },
          address: targetLocation.address
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Create a clean filename
        const cleanAddress = targetLocation.address.replace(/[^a-zA-Z0-9]/g, '-')
        const timestamp = new Date().toISOString().slice(0, 10)
        a.download = `hazard-report-${cleanAddress}-${timestamp}.pdf`
        
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        setDownloadStatus('✅ Hazard report downloaded successfully!')
        
        // Automatically trigger AI analysis after successful download
        await performAIAnalysis(targetLocation.address, targetLocation.coordinates)
        
        // Clear status after 3 seconds
        setTimeout(() => setDownloadStatus(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to download report')
      }
    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to download hazard report'
      setError(`Download failed: ${errorMessage}`)
      setDownloadStatus(null)
    } finally {
      setIsDownloading(false)
    }
  }

  const performAIAnalysis = async (address: string, coordinates: Coordinates) => {
    setIsAnalyzing(true)
    setAiAnalysis(null)
    setError(null)
    
    try {
      console.log(`🤖 Starting AI analysis for: ${address}`)
      
      const response = await fetch('/api/ai-risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, coordinates }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'AI analysis failed')
      }

      const responseData = await response.json()
      console.log('🎯 AI Analysis Response:', responseData)
      
      // Extract the aiAnalysis from the response
      const analysis = responseData.aiAnalysis || responseData
      console.log('🎯 Extracted Analysis:', analysis)
      console.log('🔍 Analysis Keys:', Object.keys(analysis || {}))
      setAiAnalysis(analysis)
      console.log('✅ AI analysis completed successfully')
    } catch (error) {
      console.error('AI analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'AI analysis failed'
      setError(`AI Analysis failed: ${errorMessage}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const useFavorite = (favorite: {name: string, address: string}) => {
    setAddress(favorite.address)
    // Auto-search when using favorite
    setTimeout(() => searchAddress(), 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sow Sure AI</h1>
                <p className="text-sm text-gray-600">Philippine Disaster Risk Assessment</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by ULAP & OpenStreetMap
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
          
          {/* Left Panel - Address Input & Results */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Search</h2>
            
            {/* Search Form */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
                  placeholder="Enter Philippine address (e.g., Quezon City, Metro Manila)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              
              <button
                onClick={searchAddress}
                disabled={isLoading || !address.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    <span>Search Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Favorites Quick Access */}
            {favorites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Favorites</h3>
                <div className="flex flex-wrap gap-2">
                  {favorites.slice(0, 3).map((favorite, index) => (
                    <button
                      key={index}
                      onClick={() => useFavorite(favorite)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 flex items-center space-x-1"
                    >
                      <Heart className="h-3 w-3" />
                      <span>{favorite.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Multiple locations found:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => selectLocation(result)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300"
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.displayName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Location with Download Status */}
            {selectedLocation && (
              <div className="flex-1 flex flex-col">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-green-800 mb-1">Selected Location</h3>
                  <p className="text-sm text-green-700 mb-2">{selectedLocation.displayName}</p>
                  <p className="text-xs text-green-600">
                    Coordinates: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>

                {/* Download Status */}
                {isDownloading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-700">{downloadStatus}</span>
                    </div>
                  </div>
                )}

                {downloadStatus && !isDownloading && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">{downloadStatus}</span>
                    </div>
                  </div>
                )}

                {/* AI Analysis Status */}
                {isAnalyzing && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-sm text-purple-700">🤖 AI analyzing hazard report...</span>
                    </div>
                  </div>
                )}

                {/* AI Analysis Results */}
                {aiAnalysis && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                      <span className="mr-2">🧠</span>
                      AI Risk Analysis
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Overall Risk Level */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Overall Risk Level:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          aiAnalysis.riskLevel === 'HIGH' || aiAnalysis.riskLevel === 'VERY HIGH' ? 'bg-red-100 text-red-800' :
                          aiAnalysis.riskLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {aiAnalysis.riskLevel}
                        </span>
                      </div>

                      {/* Key Findings */}
                      {aiAnalysis.keyFindings && aiAnalysis.keyFindings.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">Key Findings:</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {aiAnalysis.keyFindings.slice(0, 3).map((finding, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Top Recommendations */}
                      {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">Top Recommendations:</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {aiAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-1">💡</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Primary Hazards */}
                      {aiAnalysis.hazardTypes && aiAnalysis.hazardTypes.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-1">Hazard Types:</div>
                          <div className="flex flex-wrap gap-1">
                            {aiAnalysis.hazardTypes.slice(0, 4).map((hazard, index) => (
                              <span key={index} className={`px-2 py-1 text-xs rounded-full ${
                                hazard.risk === 'HIGH' || hazard.risk === 'VERY HIGH' ? 'bg-red-100 text-red-800' :
                                hazard.risk === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {hazard.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 text-center">
                  💡 Hazard reports are automatically downloaded when you select a location
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Interactive Map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Map</h2>
            <div className="h-full min-h-[400px] rounded-lg overflow-hidden">
              <InteractiveMap
                selectedLocation={selectedLocation}
                searchResults={searchResults}
                onLocationSelect={selectLocation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
