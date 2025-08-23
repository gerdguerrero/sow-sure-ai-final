'use client'

import { useEffect, useRef } from 'react'

interface Coordinates {
  lat: number
  lng: number
}

interface LocationData {
  address: string
  coordinates: Coordinates
  displayName: string
}

interface MapComponentProps {
  selectedLocation: LocationData | null
  searchResults: LocationData[]
  onLocationSelect: (location: LocationData) => void
}

export default function InteractiveMap({ 
  selectedLocation, 
  searchResults, 
  onLocationSelect 
}: MapComponentProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])

  // Initialize map when component mounts and Leaflet is available
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return

      try {
        // Dynamic import of Leaflet to avoid SSR issues
        const L = await import('leaflet')
        
        // Note: CSS should be imported in global CSS or layout
        // await import('leaflet/dist/leaflet.css')

        // Fix for default markers in React Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        // Initialize map centered on Philippines
        const map = L.map(mapContainerRef.current).setView([12.8797, 121.7740], 6)

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map)

        mapRef.current = map
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initializeMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Clear existing markers
  const clearMarkers = async () => {
    if (!mapRef.current) return
    
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker)
      }
    })
    markersRef.current = []
  }

  // Update markers when locations change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapRef.current) return

      const L = await import('leaflet')
      await clearMarkers()

      // Add markers for search results
      if (searchResults.length > 1) {
        for (let i = 0; i < searchResults.length; i++) {
          const location = searchResults[i]
          const marker = L.marker([location.coordinates.lat, location.coordinates.lng])
            .addTo(mapRef.current)
            .bindPopup(`
              <div style="padding: 8px;">
                <div style="font-weight: 600; margin-bottom: 4px;">Result ${i + 1}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${location.displayName}</div>
                <button 
                  onclick="window.selectLocationFromMap(${i})" 
                  style="background: #2563eb; color: white; padding: 4px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;"
                >
                  Select This Location
                </button>
              </div>
            `)

          markersRef.current.push(marker)
        }

        // Fit map to show all search results
        if (searchResults.length > 0) {
          const group = new L.FeatureGroup(markersRef.current)
          mapRef.current.fitBounds(group.getBounds().pad(0.1))
        }
      }

      // Add marker for selected location
      if (selectedLocation) {
        const selectedMarker = L.marker([
          selectedLocation.coordinates.lat, 
          selectedLocation.coordinates.lng
        ])
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px; color: #059669;">Selected Location</div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${selectedLocation.displayName}</div>
              <div style="font-size: 10px; color: #059669;">
                ${selectedLocation.coordinates.lat.toFixed(6)}, ${selectedLocation.coordinates.lng.toFixed(6)}
              </div>
            </div>
          `)
          .openPopup()

        markersRef.current.push(selectedMarker)

        // Center map on selected location
        mapRef.current.setView([
          selectedLocation.coordinates.lat,
          selectedLocation.coordinates.lng
        ], 14)
      }

      // Global function for popup buttons (workaround for popup click handling)
      ;(window as any).selectLocationFromMap = (index: number) => {
        if (searchResults[index]) {
          onLocationSelect(searchResults[index])
        }
      }
    }

    updateMarkers()
  }, [selectedLocation, searchResults, onLocationSelect])

  return (
    <div 
      ref={mapContainerRef}
      className="w-full h-full min-h-[400px] rounded-lg"
      style={{ minHeight: '400px' }}
    />
  )
}
