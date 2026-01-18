"use client"

import { useProfessionals } from "@/lib/api/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Service, Professional, Tenant } from "@/lib/api/types"

interface ProfessionalSelectionProps {
  service: Service
  tenant?: Tenant | null
  onSelect: (professional: Professional) => void
  onBack: () => void
}

export function ProfessionalSelection({
  service,
  tenant,
  onSelect,
  onBack,
}: ProfessionalSelectionProps) {
  const { data: professionals, isLoading } = useProfessionals()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Filtrar profesionales activos
  // Nota: En el futuro, esto debería filtrarse por servicios asignados
  // Por ahora, mostramos todos los profesionales activos
  const availableProfessionals = professionals?.filter((p) => p.isActive) || []

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4 gap-2"
        style={{
          color: tenant?.primaryColor || '#3b82f6',
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Selecciona un Profesional</h2>
        <p className="text-gray-600">
          Para el servicio: <span className="font-semibold">{service.name}</span>
        </p>
      </div>

      {availableProfessionals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No hay profesionales disponibles para este servicio
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableProfessionals.map((professional) => {
            const initials = `${professional.firstName[0]}${professional.lastName[0]}`.toUpperCase()
            
            return (
              <Card
                key={professional.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2"
                style={{
                  borderColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = tenant?.primaryColor || '#3b82f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                }}
                onClick={() => onSelect(professional)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={professional.photoUrl || undefined}
                        alt={professional.fullName}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {professional.fullName}
                      </h3>
                      {professional.bio && (
                        <p className="text-sm text-gray-600 mb-2">
                          {professional.bio}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Profesional Verificado
                        </Badge>
                      </div>
                    </div>
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
