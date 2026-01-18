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
        <p className="text-gray-500">No hay servicios disponibles en este momento</p>
      </div>
    )
  }

  // Filtrar solo servicios activos
  const activeServices = services.filter(s => s.isActive)

  if (activeServices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay servicios disponibles en este momento</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Selecciona un Servicio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeServices.map((service) => (
          <Card
            key={service.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2"
            style={{
              borderColor: 'transparent',
              '--hover-border-color': tenant?.primaryColor || '#3b82f6',
            } as React.CSSProperties & { '--hover-border-color': string }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = tenant?.primaryColor || '#3b82f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
            }}
            onClick={() => onSelect(service)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-lg">{service.name}</h4>
              </div>
              
              {service.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {service.description}
                </p>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
                
                {service.price && (
                  <div 
                    className="flex items-center gap-1 font-semibold"
                    style={{ color: tenant?.primaryColor || '#3b82f6' }}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>${Number(service.price).toLocaleString()}</span>
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
