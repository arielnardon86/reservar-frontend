"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Mail,
  Download,
  Loader2,
} from "lucide-react"
import { BookingData } from "./ClientBooking"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { appointmentsApi } from "@/lib/api/endpoints"
import { AppointmentStatus } from "@/lib/api/types"
import type { Appointment } from "@/lib/api/types"
import { useQueryClient } from "@tanstack/react-query"
import { useTenantContext } from "@/lib/context/TenantContext"

interface BookingConfirmationProps {
  bookingData: Required<BookingData>
  onNewBooking: () => void
}

export function BookingConfirmation({
  bookingData,
  onNewBooking,
}: BookingConfirmationProps) {
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string | undefined
  const { tenantId, tenant } = useTenantContext()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Usar useRef para prevenir ejecuciones múltiples (más robusto que useState)
  const hasCreatedRef = useRef(false)
  const isCreatingRef = useRef(false)

  const { service, professional, date, time, clientName, clientLastName, clientEmail } =
    bookingData

  // Obtener tenantSlug: primero de params, luego del tenant cargado
  const effectiveTenantSlug = tenantSlug || tenant?.slug || null

  // Crear el turno cuando se monta el componente (solo una vez)
  useEffect(() => {
    // Prevenir ejecución múltiple usando refs (más robusto para React Strict Mode)
    if (hasCreatedRef.current || appointment || isCreatingRef.current) {
      console.log('[BookingConfirmation] Skipping - already created or creating:', {
        hasCreated: hasCreatedRef.current,
        hasAppointment: !!appointment,
        isCreating: isCreatingRef.current,
      })
      return
    }

    // Esperar a que tengamos tenantSlug disponible
    if (!effectiveTenantSlug) {
      // Si no hay tenantSlug, esperar un poco y reintentar
      const timer = setTimeout(() => {
        if (!effectiveTenantSlug && !hasCreatedRef.current) {
          setError('No se encontró el negocio. Por favor, recarga la página.')
        }
      }, 2000)
      return () => clearTimeout(timer)
    }

    // Marcar como "creando" inmediatamente usando refs
    hasCreatedRef.current = true
    isCreatingRef.current = true
    setIsCreating(true)
    setError(null)

    console.log('[BookingConfirmation] Starting appointment creation:', {
      tenantSlug: effectiveTenantSlug,
      service: service.name,
      professional: professional.fullName,
      date: date.toISOString(),
      time,
    })

    const createAppointment = async () => {
      if (!effectiveTenantSlug) {
        setError('No se encontró el negocio')
        hasCreatedRef.current = false // Permitir reintento
        isCreatingRef.current = false
        setIsCreating(false)
        return
      }

      try {
        // Construir fecha y hora completa en UTC para evitar problemas de timezone
        const [hours, minutes] = time.split(':').map(Number)
        // Crear fecha en UTC usando la fecha local pero interpretándola como UTC
        const dateStr = format(date, 'yyyy-MM-dd')
        const [year, month, day] = dateStr.split('-').map(Number)
        const startTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0))

        console.log('[BookingConfirmation] Creating appointment with:', {
          tenantSlug: effectiveTenantSlug,
          startTime: startTime.toISOString(),
          customerEmail: clientEmail,
          serviceId: service.id,
          professionalId: professional.id,
          apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NO CONFIGURADA',
        })

        // Crear el turno
        const createdAppointment = await appointmentsApi.createPublic(effectiveTenantSlug, {
          customerFirstName: clientName,
          customerLastName: clientLastName,
          customerEmail: clientEmail,
          serviceId: service.id,
          professionalId: professional.id,
          startTime: startTime.toISOString(),
          status: AppointmentStatus.PENDING,
        })

        console.log('[BookingConfirmation] Appointment created successfully:', createdAppointment.id)
        setAppointment(createdAppointment)
        toast.success('Turno creado exitosamente')
        
        // Invalidar TODAS las queries de disponibilidad (incluye tenantSlug y query en la key)
        // Esto asegura que cualquier fecha/profesional/servicio se refresque
        await queryClient.invalidateQueries({ 
          queryKey: ['availability'],
          exact: false, // Invalidar todas las queries que empiecen con 'availability'
        })
        
        // También refetch inmediatamente las queries activas de availability
        await queryClient.refetchQueries({
          queryKey: ['availability'],
          exact: false,
          type: 'active', // Solo refetch queries activas
        })
        
        // Invalidar cache de appointments también
        await queryClient.invalidateQueries({ 
          queryKey: ['appointments'],
        })
        
        console.log('[BookingConfirmation] Cache invalidated and refetched')
      } catch (error: any) {
        console.error('[BookingConfirmation] Error creating appointment:', error)
        
        // Extraer mensaje de error más descriptivo
        let errorMessage = 'Error al crear el turno'
        
        if (error?.message) {
          errorMessage = error.message
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        
        // Si es un error de conexión, agregar información adicional
        if (error?.statusCode === 0 || errorMessage.includes('conectar') || errorMessage.includes('fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet o contacta al soporte.'
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        hasCreatedRef.current = false // Permitir reintento en caso de error
      } finally {
        isCreatingRef.current = false
        setIsCreating(false)
      }
    }

    createAppointment()
    
    // Cleanup: reset refs si el componente se desmonta antes de completar
    return () => {
      if (!appointment) {
        hasCreatedRef.current = false
        isCreatingRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Ejecutar SOLO una vez al montar - sin dependencias

  const downloadCalendar = () => {
    if (!appointment) return

    const startTime = new Date(appointment.startTime)
    const endTime = new Date(appointment.endTime)

    // Formato para .ics
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Turnero//Turnero//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(startTime)}`,
      `DTEND:${formatICSDate(endTime)}`,
      `SUMMARY:${service.name} - ${professional.fullName}`,
      `DESCRIPTION:Turno con ${professional.fullName} para ${service.name}`,
      `LOCATION:`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio de turno',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `turno-${format(startTime, 'yyyy-MM-dd')}.ics`
    link.click()
  }

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Creando tu turno...</h2>
        <p className="text-gray-600">Por favor espera un momento</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
          <CheckCircle2 className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-red-600">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button 
          onClick={onNewBooking}
          style={{
            backgroundColor: tenant?.primaryColor || '#3b82f6',
            color: 'white',
          }}
        >
          Intentar de Nuevo
        </Button>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  const appointmentDate = new Date(appointment.startTime)
  const appointmentTime = format(appointmentDate, "HH:mm")

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Turno Confirmado!
        </h2>
        <p className="text-gray-600">
          Hemos enviado un email de confirmación a {clientEmail}
        </p>
      </div>

      {/* Booking Details Card */}
      <Card className="mb-6">
        <CardContent className="p-6 space-y-6">
          {/* Servicio */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Servicio</h3>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{service.name}</p>
                {service.description && (
                  <p className="text-sm text-gray-600">{service.description}</p>
                )}
              </div>
              <div className="text-right">
                {service.price && (
                  <p className="font-semibold text-lg">
                    ${Number(service.price).toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-gray-600">{service.duration} min</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Profesional</h3>
            <div className="flex items-center gap-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src={professional.photoUrl || undefined} alt={professional.fullName} />
                <AvatarFallback>
                  {`${professional.firstName[0]}${professional.lastName[0]}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{professional.fullName}</p>
                {professional.bio && (
                  <p className="text-sm text-gray-600">{professional.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">
                  {format(appointmentDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Hora</p>
                <p className="font-semibold">{appointmentTime} hs</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-semibold">
                  {clientName} {clientLastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{clientEmail}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          className="flex-1 gap-2" 
          onClick={downloadCalendar}
          style={{
            borderColor: tenant?.primaryColor || '#3b82f6',
            color: tenant?.primaryColor || '#3b82f6',
          }}
        >
          <Download className="w-4 h-4" />
          Agregar al Calendario
        </Button>
        <Button 
          onClick={onNewBooking} 
          className="flex-1"
          style={{
            backgroundColor: tenant?.primaryColor || '#3b82f6',
            color: 'white',
          }}
        >
          Reservar Otro Turno
        </Button>
      </div>

      {/* Info adicional */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Nota:</strong> Te enviaremos un recordatorio 24 horas antes de tu cita.
          Si necesitas cancelar o reprogramar, por favor contáctanos con al menos
          12 horas de anticipación.
        </p>
      </div>
    </div>
  )
}
