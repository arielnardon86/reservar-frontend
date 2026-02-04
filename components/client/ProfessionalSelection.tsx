"use client"

import { useProfessionals } from "@/lib/api/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Service, Professional, Tenant } from "@/lib/api/types"

// Alias semántico: en el contexto de pádel, un "Professional" representa una Cancha
export type Court = Professional

interface CourtSelectionProps {
  service: Service
  tenant?: Tenant | null
  onSelect: (court: Court) => void
  onBack: () => void
}

export function ProfessionalSelection({
  service,
  tenant,
  onSelect,
  onBack,
}: CourtSelectionProps) {
  // useProfessionals devuelve las canchas (courts)
  const { data: courts, isLoading } = useProfessionals()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Filtrar canchas activas
  const availableCourts = courts?.filter((c) => c.isActive) || []

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4 gap-2"
        style={{
          color: tenant?.primaryColor || '#22c55e',
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🎾 Selecciona una Cancha</h2>
        <p className="text-gray-600">
          Duración del turno: <span className="font-semibold">{service.name}</span>
        </p>
      </div>

      {availableCourts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No hay canchas disponibles en este momento
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCourts.map((court) => {
            // Determinar el tipo de cancha desde bio/description
            const courtType = court.bio || 'Cancha de Pádel'
            const isIndoor = courtType.toLowerCase().includes('techada') || courtType.toLowerCase().includes('cubierta')
            
            return (
              <Card
                key={court.id}
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
                onClick={() => onSelect(court)}
              >
                {/* Imagen de la cancha o placeholder */}
                <div 
                  className="h-32 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative"
                  style={{
                    backgroundImage: court.photoUrl ? `url(${court.photoUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!court.photoUrl && (
                    <div className="text-white text-6xl opacity-50">🎾</div>
                  )}
                  {isIndoor && (
                    <Badge 
                      className="absolute top-2 right-2 bg-blue-500 text-white"
                    >
                      🏠 Techada
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">
                    {court.fullName}
                  </h3>
                  {court.bio && (
                    <p className="text-sm text-gray-600 mb-3">
                      {court.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs border-green-500 text-green-700"
                    >
                      ✓ Disponible
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
