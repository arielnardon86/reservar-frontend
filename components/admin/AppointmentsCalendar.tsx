"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  useAppointments,
  useUpdateAppointment,
  useServices,
} from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import { appointmentsApi } from "@/lib/api/endpoints"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  X,
  Loader2,
} from "lucide-react"
import { format, startOfDay, isSameDay, isToday, addDays, subDays, parseISO } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { AppointmentStatus } from "@/lib/api/types"
import type { TimeSlot } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const HOUR_START = 8
const HOUR_END = 24
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_DURATION = 30
const TOTAL_SLOTS = (TOTAL_HOURS * 60) / SLOT_DURATION

const slotToPercent = (slot: number): number => {
  return (slot / TOTAL_SLOTS) * 100
}

const timeToSlot = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m
  return (totalMinutes - HOUR_START * 60) / SLOT_DURATION
}

export function AppointmentsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
  const { tenantId, tenant } = useTenantContext()
  const { data: appointments, isLoading: loadingAppointments } = useAppointments()
  const { data: services, isLoading: loadingServices } = useServices()
  const updateAppointment = useUpdateAppointment()
  const [availabilityData, setAvailabilityData] = useState<Record<string, TimeSlot[]>>({})

  const isLoading = loadingAppointments || loadingServices
  const activeSpaces = useMemo(() => services?.filter(s => s.isActive) || [], [services])

  const hours = useMemo(() => {
    const h = []
    for (let i = HOUR_START; i < HOUR_END; i++) {
      h.push(i)
    }
    return h
  }, [])

  // Cargar disponibilidad por espacio (sin profesional)
  useEffect(() => {
    if (!activeSpaces.length || !tenant?.slug) return

    const loadAvailability = async () => {
      const newAvailability: Record<string, TimeSlot[]> = {}
      const dateStr = format(currentDate, 'yyyy-MM-dd')

      for (const space of activeSpaces) {
        const key = `${space.id}-${dateStr}`
        try {
          const slots = await appointmentsApi.getAvailability(tenant.slug, {
            serviceId: space.id,
            date: dateStr,
          })
          newAvailability[key] = slots || []
        } catch (error) {
          console.error(`Error loading availability for ${space.id}:`, error)
          newAvailability[key] = []
        }
      }

      setAvailabilityData(newAvailability)
    }

    loadAvailability()
  }, [activeSpaces, tenant?.slug, currentDate])

  // Filtrar turnos del día actual
  const dayAppointments = useMemo(() => {
    if (!appointments) return []

    return appointments.filter(apt => {
      const aptDate = startOfDay(parseISO(apt.startTime))
      return isSameDay(aptDate, currentDate) && apt.status !== AppointmentStatus.CANCELLED
    })
  }, [appointments, currentDate])

  // Agrupar turnos por espacio (serviceId)
  const appointmentsBySpace = useMemo(() => {
    const grouped: Record<string, any[]> = {}
    activeSpaces.forEach(space => {
      grouped[space.id] = dayAppointments
        .filter(apt => apt.serviceId === space.id)
        .sort((a, b) => {
          const timeA = parseISO(a.startTime).getTime()
          const timeB = parseISO(b.startTime).getTime()
          return timeA - timeB
        })
    })
    return grouped
  }, [dayAppointments, activeSpaces])

  // Calcular ocupación global
  const globalOccupancy = useMemo(() => {
    let totalSlots = 0
    let occupiedSlots = 0

    activeSpaces.forEach(space => {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const key = `${space.id}-${dateStr}`
      const slots = availabilityData[key] || []
      const spaceAppointments = appointmentsBySpace[space.id] || []

      totalSlots += slots.length
      occupiedSlots += spaceAppointments.length
    })

    return totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0
  }, [availabilityData, appointmentsBySpace, activeSpaces, currentDate])

  // Helper para calcular posición de turnos
  const getAppointmentPosition = (appointment: any) => {
    // Usar la zona horaria del tenant o default
    const timeZone = tenant?.timezone || 'America/Argentina/Buenos_Aires'

    // Convertir UTC a la zona horaria del tenant para visualización correcta
    const start = toZonedTime(appointment.startTime, timeZone)
    const end = toZonedTime(appointment.endTime, timeZone)

    // Usar hora local del navegador
    const startHour = start.getHours()
    const startMin = start.getMinutes()
    const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`

    const startSlot = timeToSlot(startTimeStr)
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    const durationSlots = durationMinutes / SLOT_DURATION

    const leftPercent = slotToPercent(startSlot)
    const widthPercent = slotToPercent(durationSlots)

    return { leftPercent, widthPercent, startTimeStr }
  }

  // Obtener bloques ocupados por espacio
  const getOccupiedBlocks = (spaceId: string) => {
    const appointments = appointmentsBySpace[spaceId] || []
    const blocks: Array<{ startSlot: number; endSlot: number }> = []

    appointments.forEach(apt => {
      const timeZone = tenant?.timezone || 'America/Argentina/Buenos_Aires'
      const start = toZonedTime(apt.startTime, timeZone)
      const end = toZonedTime(apt.endTime, timeZone)
      const startSlot = timeToSlot(format(start, 'HH:mm'))
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      const endSlot = startSlot + (durationMinutes / SLOT_DURATION)

      blocks.push({ startSlot, endSlot })
    })

    return blocks
  }

  const handleQuickAction = async (id: string, action: "confirm" | "cancel") => {
    try {
      if (action === "confirm") {
        await updateAppointment.mutateAsync({
          id,
          data: { status: AppointmentStatus.CONFIRMED },
        })
        toast.success("Turno confirmado")
      } else {
        await updateAppointment.mutateAsync({
          id,
          data: {
            status: AppointmentStatus.CANCELLED,
          },
        })
        toast.success("Turno cancelado")
      }
    } catch (error: any) {
      toast.error(error?.message || "Error al actualizar turno")
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!activeSpaces.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Sin espacios configurados</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-sm">
          Configurá espacios en la sección <strong>Espacios</strong> para ver las reservas del día aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-emerald-400">📅 Gestión de Reservas</h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(currentDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate("prev")}
              className="border-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={goToToday}
              className="min-w-[100px] border-gray-300"
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate("next")}
              className="border-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Ocupación global */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ocupación total del día</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">
                {globalOccupancy.toFixed(1)}%
              </p>
            </div>
            <div className="w-64">
              <Progress
                value={globalOccupancy}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{dayAppointments.length} reservas</span>
                <span>{activeSpaces.length} espacios</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Grid - Espacios */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl overflow-x-auto">
        {/* Header con horas */}
        <div className="flex border-b border-slate-700 bg-slate-800 relative">
          {/* Columna izquierda fija - Header */}
          <div className="w-28 sm:w-48 shrink-0 p-2 sm:p-4 border-r border-white/20 sticky left-0 z-30 bg-slate-800 shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Espacios</span>
          </div>
          {/* Horarios scrolleables */}
          <div className="flex-1 flex">
            {hours.map((h) => (
              <div
                key={h}
                className="flex-1 p-3 text-center text-sm font-medium text-white/70 border-r border-white/10 last:border-r-0"
              >
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* Espacios */}
        <div className="relative">
          {activeSpaces.map((space, idx) => {
            const occupiedBlocks = getOccupiedBlocks(space.id)
            const spaceAppointments = appointmentsBySpace[space.id] || []

            return (
              <div
                key={space.id}
                className={cn(
                  "flex border-b border-gray-100 last:border-b-0 relative",
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                )}
              >
                {/* Espacio info - Columna izquierda fija */}
                <div className="w-28 sm:w-48 shrink-0 p-2 sm:p-4 border-r border-gray-200 flex flex-col justify-center bg-gradient-to-r from-emerald-500/5 to-transparent sticky left-0 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)]" style={{ backgroundColor: idx % 2 === 0 ? 'white' : 'rgb(249 250 251 / 0.5)' }}>
                  <div className="font-semibold text-emerald-400">{space.name}</div>
                  {space.description && (
                    <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{space.description}</div>
                  )}
                  <div className="text-[10px] text-emerald-400 font-medium mt-1">
                    {spaceAppointments.length} reservas
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 h-16 relative select-none bg-gradient-to-b from-slate-800/50 to-slate-800/30">
                  {/* Turnos como bloques */}
                  {spaceAppointments.map((apt) => {
                    const { leftPercent, widthPercent, startTimeStr } = getAppointmentPosition(apt)
                    const timeZone = tenant?.timezone || 'America/Argentina/Buenos_Aires'
                    const start = toZonedTime(apt.startTime, timeZone)
                    const end = toZonedTime(apt.endTime, timeZone)
                    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
                    const isLongDuration = durationMinutes >= 90

                    // Formatear horas locales
                    const startHour = start.getHours()
                    const startMin = start.getMinutes()
                    const endHour = end.getHours()
                    const endMin = end.getMinutes()
                    const startTimeFormatted = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`
                    const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`

                    return (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={cn(
                          "absolute top-1 bottom-1 rounded-sm cursor-pointer transition-all hover:opacity-90 z-10 shadow-sm border-2",
                          apt.status === AppointmentStatus.CONFIRMED
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-slate-700 text-white border-slate-600",
                          isLongDuration && "ring-2 ring-amber-400/50"
                        )}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        title={`${apt.customer.firstName} ${apt.customer.lastName} - ${startTimeFormatted} a ${endTimeFormatted} (${durationMinutes} min)`}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                          <span className="text-[10px] font-bold truncate w-full text-center">
                            {apt.customer.firstName} {apt.customer.lastName.charAt(0)}.
                          </span>
                          <span className="text-[9px] opacity-80">
                            {startTimeFormatted} - {endTimeFormatted}
                          </span>
                          {isLongDuration && (
                            <span className="text-[8px] font-bold mt-0.5 opacity-90">
                              {durationMinutes / 60}h
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Click en una reserva para ver detalles</span>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded bg-emerald-500" />
              <span className="text-gray-500">Reserva</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-white/95 border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {dayAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length}
            </p>
            <p className="text-sm text-gray-600">Confirmadas</p>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {dayAppointments.filter(a => a.status === AppointmentStatus.COMPLETED).length}
            </p>
            <p className="text-sm text-gray-600">Completadas</p>
          </CardContent>
        </Card>
        <Card className="bg-white/95 border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {dayAppointments.length}
            </p>
            <p className="text-sm text-gray-600">Total Reservas</p>
          </CardContent>
        </Card>
      </div>

      {/* Popup de detalles del cliente */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Detalles de la Reserva</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedAppointment(null)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-600 text-xs">Cliente</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-emerald-400" />
                    <p className="text-gray-900 font-semibold">
                      {selectedAppointment.customer.firstName} {selectedAppointment.customer.lastName}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600 text-xs">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <a
                      href={`mailto:${selectedAppointment.customer.email}`}
                      className="text-emerald-400 hover:underline"
                    >
                      {selectedAppointment.customer.email}
                    </a>
                  </div>
                </div>

                {(selectedAppointment as any).departamento || (selectedAppointment as any).piso ? (
                  <>
                    <div>
                      <Label className="text-gray-600 text-xs">Departamento</Label>
                      <p className="text-gray-900 mt-1">{(selectedAppointment as any).departamento || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600 text-xs">Piso</Label>
                      <p className="text-gray-900 mt-1">{(selectedAppointment as any).piso || '-'}</p>
                    </div>
                  </>
                ) : selectedAppointment.professional ? (
                  <div>
                    <Label className="text-gray-600 text-xs">Recurso</Label>
                    <p className="text-gray-900 mt-1">{selectedAppointment.professional.fullName}</p>
                  </div>
                ) : null}

                <div>
                  <Label className="text-gray-600 text-xs">Espacio / Duración</Label>
                  <p className="text-gray-900 mt-1">{selectedAppointment.service.name}</p>
                </div>

                <div>
                  <Label className="text-gray-600 text-xs">Horario</Label>
                  <p className="text-gray-900 mt-1">
                    {(() => {
                      const timeZone = tenant?.timezone || 'America/Argentina/Buenos_Aires'
                      const start = toZonedTime(selectedAppointment.startTime, timeZone)
                      const end = toZonedTime(selectedAppointment.endTime, timeZone)
                      const startHour = start.getHours()
                      const startMin = start.getMinutes()
                      const endHour = end.getHours()
                      const endMin = end.getMinutes()
                      return `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
                    })()}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-600 text-xs">Fecha</Label>
                  <p className="text-gray-900 mt-1">
                    {format(new Date(selectedAppointment.startTime), "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                </div>

                {selectedAppointment.service.price && (
                  <div>
                    <Label className="text-gray-600 text-xs">Precio</Label>
                    <p className="text-emerald-400 font-bold text-lg mt-1">
                      ${Number(selectedAppointment.service.price).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-gray-600 text-xs">Estado</Label>
                  <div className="mt-1">
                    {selectedAppointment.status === AppointmentStatus.CONFIRMED ? (
                      <Badge className="bg-emerald-500 text-white">Confirmado</Badge>
                    ) : selectedAppointment.status === AppointmentStatus.CANCELLED ? (
                      <Badge variant="secondary">Cancelado</Badge>
                    ) : selectedAppointment.status === AppointmentStatus.COMPLETED ? (
                      <Badge variant="secondary">Completado</Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 border-gray-300"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
