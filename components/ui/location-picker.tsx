"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

const NOMINATIM_DELAY_MS = 350
const NOMINATIM_MIN_CHARS = 3

// Importar Leaflet dinámicamente para evitar problemas de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// Componente para manejar clicks en el mapa
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  if (typeof window === 'undefined') return null
  
  const { useMapEvents } = require('react-leaflet')
  useMapEvents({
    click: (e: any) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    },
  })
  return null
}

interface LocationPickerProps {
  value?: string
  onChange?: (address: string, lat?: number, lng?: number) => void
  label?: string
  placeholder?: string
  required?: boolean
}


interface Suggestion {
  display_name: string
  lat: string
  lon: string
}

export function LocationPicker({
  value = '',
  onChange,
  label = 'Dirección',
  placeholder = 'Calle, número, ciudad',
  required = false,
}: LocationPickerProps) {
  const [address, setAddress] = useState(value)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const mapRef = useRef<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipBlurGeocodeRef = useRef(false)

  useEffect(() => {
    setAddress(value)
  }, [value])

  // Buscar sugerencias mientras se escribe (Nominatim)
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < NOMINATIM_MIN_CHARS) {
      setSuggestions([])
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=0`,
        {
          headers: { 'User-Agent': 'ReservAr/1.0' },
        }
      )
      const data = await response.json()
      setSuggestions(Array.isArray(data) ? data : [])
      setHighlightedIndex(-1)
      setShowDropdown(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setAddress(v)
    onChange?.(v)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.trim().length < NOMINATIM_MIN_CHARS) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(v.trim())
    }, NOMINATIM_DELAY_MS)
  }

  const selectSuggestion = (s: Suggestion) => {
    skipBlurGeocodeRef.current = true
    const coords = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) }
    setAddress(s.display_name)
    setCoordinates(coords)
    setSuggestions([])
    setShowDropdown(false)
    setHighlightedIndex(-1)
    onChange?.(s.display_name, coords.lat, coords.lng)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1))
      return
    }
    if (e.key === 'Enter' && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      e.preventDefault()
      selectSuggestion(suggestions[highlightedIndex])
      return
    }
    if (e.key === 'Escape') {
      setShowDropdown(false)
      setHighlightedIndex(-1)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Geocodificación al hacer blur si no eligió sugerencia (comportamiento anterior)
  const geocodeAddress = async (addressText: string) => {
    if (!addressText.trim()) return
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&limit=1`,
        { headers: { 'User-Agent': 'ReservAr/1.0' } }
      )
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }
        setCoordinates(coords)
        setAddress(display_name)
        onChange?.(display_name, coords.lat, coords.lng)
        setShowMap(true)
      } else {
        onChange?.(addressText)
      }
    } catch (error) {
      console.error('Error geocoding:', error)
      onChange?.(addressText)
    } finally {
      setIsSearching(false)
    }
  }

  // Reverse geocoding: convertir coordenadas a dirección
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'TurneroApp/1.0',
          },
        }
      )
      const data = await response.json()

      if (data && data.display_name) {
        setAddress(data.display_name)
        onChange?.(data.display_name, lat, lng)
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates({ lat, lng })
    reverseGeocode(lat, lng)
  }

  const handleConfirmLocation = () => {
    if (coordinates) {
      onChange?.(address, coordinates.lat, coordinates.lng)
      setShowMap(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && '*'}</Label>}
      <div className="space-y-2" ref={dropdownRef}>
        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <Input
              value={address}
              onChange={onInputChange}
              onBlur={() => {
                setTimeout(() => {
                  if (skipBlurGeocodeRef.current) {
                    skipBlurGeocodeRef.current = false
                    return
                  }
                  if (address.trim()) geocodeAddress(address)
                }, 200)
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pr-9"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </span>
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 py-1 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.lat}-${s.lon}-${i}`}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none ${i === highlightedIndex ? 'bg-accent' : ''}`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectSuggestion(s)
                    }}
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            disabled={isSearching}
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
        
        {showMap && (
          <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
            {typeof window !== 'undefined' && (
              <MapContainer
                center={coordinates || [-34.6037, -58.3816]} // Buenos Aires por defecto
                zoom={coordinates ? 15 : 10}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {coordinates && (
                  <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">Ubicación seleccionada</p>
                        <p className="text-gray-600">{address}</p>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={handleConfirmLocation}
                        >
                          Confirmar ubicación
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                )}
                <MapClickHandler onMapClick={handleMapClick} />
              </MapContainer>
            )}
          </div>
        )}
        
        {coordinates && !showMap && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Ubicación confirmada: {address}
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Escribí y elegí una sugerencia, o abrí el mapa para marcar la ubicación exacta
      </p>
    </div>
  )
}

