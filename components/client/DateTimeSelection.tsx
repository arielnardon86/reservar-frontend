"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { format, addDays, startOfDay, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { useAvailability } from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import type { Service, Professional } from "@/lib/api/types"

interface DateTimeSelectionProps {
  service: Service
  professional: Professional
  onSelect: (date: Date, time: string) => void
  onBack: () => void
}

export function DateTimeSelection({
  service,
  professional,
  onSelect,
  onBack,
}: DateTimeSelectionProps) {
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string
  const { tenant } = useTenantContext()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  
  // Refrescar disponibilidad cuando se monta el componente (por si acaso hay cambios)
  useEffect(() => {
    // Invalidar y refetch availability cuando se entra a este paso
    queryClient.invalidateQueries({
      queryKey: ['availability'],
      exact: false,
    })
  }, [queryClient])

  // Resetear hora cuando cambia la fecha y refrescar disponibilidad
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)
    
    // Refrescar disponibilidad cuando se selecciona una nueva fecha
    if (date && (tenantSlug || tenant?.slug)) {
      const effectiveSlug = tenantSlug || tenant?.slug
      queryClient.invalidateQueries({
        queryKey: ['availability', effectiveSlug, {
          professionalId: professional.id,
          serviceId: service.id,
          date: format(date, 'yyyy-MM-dd'),
        }],
      })
    }
  }

  // Consultar disponibilidad cuando se selecciona una fecha
  const availabilityQuery = selectedDate
    ? {
        professionalId: professional.id,
        serviceId: service.id,
        date: format(selectedDate, 'yyyy-MM-dd'), // Formato ISO date string (solo fecha)
      }
    : null

  const { data: availability, isLoading: loadingAvailability, error: availabilityError, refetch: refetchAvailability } = useAvailability(
    tenantSlug || tenant?.slug || null,
    availabilityQuery
  )

  // Debug: Log para ver qué está retornando el backend
  useEffect(() => {
    if (availability) {
      console.log('📅 Availability data received:', {
        totalSlots: availability.length,
        availableSlots: availability.filter(s => s.available).length,
        allSlots: availability,
      })
    }
    if (availabilityError) {
      console.error('❌ Availability error:', availabilityError)
    }
  }, [availability, availabilityError])
  
  // Refetch availability cuando cambia la fecha (para asegurar datos frescos)
  useEffect(() => {
    if (availabilityQuery?.date && (tenantSlug || tenant?.slug)) {
      // Refetch después de un pequeño delay para asegurar que el backend haya procesado cambios
      const timer = setTimeout(() => {
        console.log('🔄 Refetching availability for date:', availabilityQuery.date)
        refetchAvailability()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [availabilityQuery?.date, refetchAvailability, tenantSlug, tenant?.slug])

  // Obtener slots disponibles
  // El backend retorna un array directamente de TimeSlot[]
  const availableSlots = Array.isArray(availability) ? availability : []
  
  // Filtrar slots disponibles y eliminar duplicados
  const uniqueTimeSlots = Array.from(
    new Set(
      availableSlots
        .filter((slot) => slot.available)
        .map((slot) => slot.time)
    )
  ).sort((a, b) => a.localeCompare(b))
  
  const timeSlots = uniqueTimeSlots

  // Debug: Log para ver qué slots están disponibles
  useEffect(() => {
    if (selectedDate && timeSlots.length > 0) {
      console.log('✅ Available time slots:', timeSlots)
    } else if (selectedDate && timeSlots.length === 0) {
      console.warn('⚠️ No available time slots for date:', format(selectedDate, 'yyyy-MM-dd'))
    }
  }, [selectedDate, timeSlots])

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onSelect(selectedDate, selectedTime)
    }
  }

  // Deshabilitar fechas pasadas
  const disabledDates = (date: Date) => {
    return date < startOfDay(new Date())
  }

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      <h2 className="text-2xl font-bold mb-6">Selecciona Fecha y Hora</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendario */}
        <div>
          <h3 className="font-semibold mb-4">Fecha</h3>
          <div className="border rounded-lg p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabledDates}
              fromDate={new Date()}
              toDate={addDays(new Date(), 60)}
              locale={es}
              className="rounded-md border"
            />
          </div>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="font-semibold mb-4">
            {selectedDate
              ? `Horarios disponibles - ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
              : "Selecciona una fecha"}
          </h3>

          {!selectedDate ? (
            <div className="text-center py-12 text-gray-500">
              <p>Por favor selecciona una fecha para ver los horarios disponibles</p>
            </div>
          ) : loadingAvailability ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay horarios disponibles para esta fecha</p>
              <p className="text-sm mt-2">Por favor selecciona otra fecha</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botón Continuar */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          size="lg"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
