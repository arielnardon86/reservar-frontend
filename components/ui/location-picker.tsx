"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"

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


export function LocationPicker({
  value = '',
  onChange,
  label = 'Dirección',
  placeholder = 'Calle, número, ciudad',
  required = false,
}: LocationPickerProps) {
  const [address, setAddress] = useState(value)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    setAddress(value)
  }, [value])

  // Geocodificación: convertir dirección a coordenadas
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return

    setIsSearching(true)
    try {
      // Usar Nominatim (OpenStreetMap) - gratuito, no requiere API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'TurneroApp/1.0',
          },
        }
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
        // Si no se encuentra, permitir ingresar manualmente
        onChange?.(address)
      }
    } catch (error) {
      console.error('Error geocoding:', error)
      onChange?.(address)
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
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              onChange?.(e.target.value)
            }}
            onBlur={() => {
              if (address.trim()) {
                geocodeAddress(address)
              }
            }}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
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
        Escribe la dirección y presiona Enter, o haz clic en el mapa para seleccionar la ubicación exacta
      </p>
    </div>
  )
}

