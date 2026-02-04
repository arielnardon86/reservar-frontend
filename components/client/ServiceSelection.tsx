"use client"

import { useServices } from "@/lib/api/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Loader2 } from "lucide-react"
import type { Service, Tenant } from "@/lib/api/types"

interface ServiceSelectionProps {
  tenant?: Tenant | null
  onSelect: (service: Service) => void
}

export function ServiceSelection({ tenant, onSelect }: ServiceSelectionProps) {
  const { data: services, isLoading } = useServices()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎾</div>
        <p className="text-gray-500">No hay tipos de turno disponibles en este momento</p>
      </div>
    )
  }

  // Filtrar solo servicios activos
  const activeServices = services.filter(s => s.isActive)

  if (activeServices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎾</div>
        <p className="text-gray-500">No hay tipos de turno disponibles en este momento</p>
      </div>
    )
  }

  // Helper para formatear duración
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }
    return `${minutes} min`
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">🎾 Reserva tu Cancha</h2>
      <p className="text-gray-600 mb-6">Selecciona la duración del turno</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeServices.map((service) => (
          <Card
            key={service.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 overflow-hidden"
            style={{
              borderColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = tenant?.primaryColor || '#22c55e'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
            }}
            onClick={() => onSelect(service)}
          >
            {/* Header con gradiente verde pádel */}
            <div 
              className="py-4 px-6 text-white"
              style={{
                background: `linear-gradient(135deg, ${tenant?.primaryColor || '#22c55e'} 0%, ${tenant?.primaryColor ? tenant.primaryColor + 'dd' : '#16a34a'} 100%)`
              }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">{formatDuration(service.duration)}</span>
              </div>
            </div>

            <CardContent className="p-5">
              <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
              
              {service.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {service.description}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <Badge 
                  variant="outline" 
                  className="border-green-500 text-green-700"
                >
                  Turno de pádel
                </Badge>
                
                {service.price && (
                  <div 
                    className="flex items-center gap-1 font-bold text-lg"
                    style={{ color: tenant?.primaryColor || '#22c55e' }}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>{Number(service.price).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
