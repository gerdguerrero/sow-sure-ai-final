'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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

export default function MapComponent({ 
  selectedLocation, 
  searchResults, 
  onLocationSelect 
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map centered on Philippines
    const map = L.map(mapContainerRef.current).setView([12.8797, 121.7740], 6)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker)
      }
    })
    markersRef.current = []
  }

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return

    clearMarkers()

    // Add markers for search results
    if (searchResults.length > 1) {
      searchResults.forEach((location, index) => {
        const marker = L.marker([location.coordinates.lat, location.coordinates.lng])
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="p-2">
              <div class="font-semibold text-sm mb-1">Result ${index + 1}</div>
              <div class="text-xs text-gray-600 mb-2">${location.displayName}</div>
              <button 
                onclick="window.selectLocation(${index})" 
                class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
              >
                Select This Location
              </button>
            </div>
          `)

        markersRef.current.push(marker)
      })

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
          <div class="p-2">
            <div class="font-semibold text-sm mb-1">Selected Location</div>
            <div class="text-xs text-gray-600 mb-2">${selectedLocation.displayName}</div>
            <div class="text-xs text-green-600">
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
    ;(window as any).selectLocation = (index: number) => {
      if (searchResults[index]) {
        onLocationSelect(searchResults[index])
      }
    }

  }, [selectedLocation, searchResults, onLocationSelect])

  return (
    <div 
      ref={mapContainerRef}
      className="w-full h-full min-h-[400px] rounded-lg"
      style={{ minHeight: '400px' }}
    />
  )
}
