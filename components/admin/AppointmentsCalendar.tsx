"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  useAppointments, 
  useUpdateAppointment,
  useProfessionals,
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Copy,
  Share2,
} from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks, startOfDay, parseISO, addMinutes, setHours, setMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { AppointmentStatus } from "@/lib/api/types"
import type { TimeSlot } from "@/lib/api/types"

type ViewMode = "day" | "week"

interface ProfessionalDayData {
  professional: any
  appointments: any[]
  availableSlots: TimeSlot[]
  occupiedSlots: number
  totalSlots: number
  occupancyPercentage: number
  freeSlots: TimeSlot[]
}

export function AppointmentsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const { tenantId, tenant } = useTenantContext()
  const { data: appointments, isLoading: loadingAppointments } = useAppointments()
  const { data: professionals, isLoading: loadingProfessionals } = useProfessionals()
  const { data: services, isLoading: loadingServices } = useServices()
  const updateAppointment = useUpdateAppointment()
  const [availabilityData, setAvailabilityData] = useState<Record<string, TimeSlot[]>>({})

  const isLoading = loadingAppointments || loadingProfessionals || loadingServices

  // Calcular rango de fechas según el modo de vista
  const dateRange = useMemo(() => {
    if (viewMode === "day") {
      return [currentDate]
    } else {
      const weekStart = startOfWeek(currentDate, { locale: es, weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { locale: es, weekStartsOn: 1 })
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    }
  }, [currentDate, viewMode])

  // Cargar disponibilidad para cada profesional y servicio
  useEffect(() => {
    if (!professionals || !services || !tenant?.slug || dateRange.length === 0) return

    const loadAvailability = async () => {
      const newAvailability: Record<string, TimeSlot[]> = {}

      for (const date of dateRange) {
        const dateStr = format(date, 'yyyy-MM-dd')
        
        for (const professional of professionals.filter(p => p.isActive)) {
          // Usar el primer servicio disponible para calcular disponibilidad
          const firstService = services.find(s => s.isActive)
          if (!firstService) continue

          const key = `${professional.id}-${dateStr}`
          
          try {
            const slots = await appointmentsApi.getAvailability(tenant.slug, {
              professionalId: professional.id,
              serviceId: firstService.id,
              date: dateStr,
            })
            newAvailability[key] = slots || []
          } catch (error) {
            console.error(`Error loading availability for ${professional.id} on ${dateStr}:`, error)
            newAvailability[key] = []
          }
        }
      }

      setAvailabilityData(newAvailability)
    }

    loadAvailability()
  }, [professionals, services, tenant?.slug, dateRange])

  // Filtrar turnos por rango de fechas
  const filteredAppointments = useMemo(() => {
    if (!appointments) return []
    
    return appointments.filter(apt => {
      const aptDate = startOfDay(parseISO(apt.startTime))
      return dateRange.some(date => isSameDay(aptDate, date))
    })
  }, [appointments, dateRange])

  // Agrupar turnos por profesional y día, eliminando duplicados
  const appointmentsByProfessionalAndDay = useMemo(() => {
    const grouped: Record<string, Record<string, any[]>> = {}
    
    if (!professionals) return grouped

    // Primero, eliminar duplicados de filteredAppointments
    const appointmentsMap = new Map<string, (typeof filteredAppointments)[number]>()
    
    filteredAppointments.forEach((appointment) => {
      const startTime = new Date(parseISO(appointment.startTime))
      const roundedTime = new Date(startTime)
      roundedTime.setSeconds(0, 0) // Redondear a minutos
      
      const uniqueKey = `${appointment.customerId}-${appointment.serviceId}-${appointment.professionalId}-${roundedTime.toISOString()}`
      
      if (!appointmentsMap.has(uniqueKey)) {
        appointmentsMap.set(uniqueKey, appointment)
      } else {
        // Mantener el más antiguo (ID menor)
        const existing = appointmentsMap.get(uniqueKey)!
        if (appointment.id < existing.id) {
          appointmentsMap.set(uniqueKey, appointment)
        }
      }
    })
    
    const uniqueAppointments = Array.from(appointmentsMap.values())

    professionals.forEach(professional => {
      grouped[professional.id] = {}
      
      dateRange.forEach(date => {
        const dateKey = format(date, "yyyy-MM-dd")
        grouped[professional.id][dateKey] = uniqueAppointments
          .filter(apt => {
            const aptDate = startOfDay(parseISO(apt.startTime))
            return apt.professionalId === professional.id && isSameDay(aptDate, date)
          })
          .sort((a, b) => {
            const timeA = parseISO(a.startTime).getTime()
            const timeB = parseISO(b.startTime).getTime()
            return timeA - timeB
          })
      })
    })
    
    return grouped
  }, [filteredAppointments, dateRange, professionals])

  // Calcular datos por profesional y día
  const professionalDayData = useMemo(() => {
    if (!professionals || !services) return []

    const data: ProfessionalDayData[] = []

    dateRange.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      
      professionals
        .filter(p => p.isActive)
        .forEach(professional => {
          const key = `${professional.id}-${dateStr}`
          const slots = availabilityData[key] || []
          const professionalAppointments = appointmentsByProfessionalAndDay[professional.id]?.[dateStr] || []
          
          // Filtrar solo turnos confirmados o pendientes (no cancelados)
          const activeAppointments = professionalAppointments.filter(
            apt => apt.status !== AppointmentStatus.CANCELLED
          )

          const occupiedSlots = activeAppointments.length
          const totalSlots = slots.length
          const occupancyPercentage = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0
          
          // Slots libres (disponibles y no ocupados)
          const occupiedTimes = new Set(
            activeAppointments.map(apt => format(parseISO(apt.startTime), 'HH:mm'))
          )
          const freeSlots = slots.filter(
            slot => slot.available && !occupiedTimes.has(slot.time)
          )

          data.push({
            professional,
            appointments: professionalAppointments,
            availableSlots: slots,
            occupiedSlots,
            totalSlots,
            occupancyPercentage,
            freeSlots,
          })
        })
    })

    return data
  }, [professionals, services, availabilityData, appointmentsByProfessionalAndDay, dateRange])

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case AppointmentStatus.PENDING:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case AppointmentStatus.CANCELLED:
        return <XCircle className="w-4 h-4 text-red-600" />
      case AppointmentStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" style={{ color: '#6E52FF' }} />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return "bg-green-50 border-green-200"
      case AppointmentStatus.PENDING:
        return "bg-yellow-50 border-yellow-200"
      case AppointmentStatus.CANCELLED:
        return "bg-red-50 border-red-200"
      case AppointmentStatus.COMPLETED:
        return "" // Se maneja con estilo inline para el color slotia
      default:
        return "bg-gray-50 border-gray-200"
    }
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

  const copyFreeSlots = (freeSlots: TimeSlot[], professionalName: string, date: Date) => {
    const dateStr = format(date, "dd/MM/yyyy")
    const slotsStr = freeSlots.slice(0, 10).map(s => s.time).join(", ")
    const text = `Horarios disponibles para ${professionalName} el ${dateStr}: ${slotsStr}${freeSlots.length > 10 ? ` y ${freeSlots.length - 10} más` : ''}`
    
    navigator.clipboard.writeText(text)
    toast.success("Horarios copiados al portapapeles")
  }

  const navigateDate = (direction: "prev" | "next") => {
    if (viewMode === "day") {
      setCurrentDate(prev => {
        const newDate = new Date(prev)
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
        return newDate
      })
    } else {
      setCurrentDate(prev => 
        direction === "next" ? addWeeks(prev, 1) : subWeeks(prev, 1)
      )
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Gestión de Turnos</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Vista {viewMode === "day" ? "diaria" : "semanal"} - Organizado por profesional
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Selector de vista */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className="rounded-md"
                >
                  Día
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="rounded-md"
                >
                  Semana
                </Button>
              </div>

              {/* Navegación */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={goToToday}
                  className="min-w-[100px]"
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Fecha actual */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <CalendarIcon className="w-5 h-5" />
              {viewMode === "day" 
                ? format(currentDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })
                : `${format(dateRange[0], "d MMM", { locale: es })} - ${format(dateRange[dateRange.length - 1], "d MMM, yyyy", { locale: es })}`
              }
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vista por profesional */}
      {viewMode === "day" ? (
        // Vista diaria por profesional
        <div className="space-y-6">
          {professionalDayData
            .filter(data => dateRange.some(d => isSameDay(d, currentDate)))
            .map((data) => {
              const dayData = professionalDayData.find(
                d => d.professional.id === data.professional.id && 
                     dateRange.some(date => isSameDay(date, currentDate))
              )
              
              if (!dayData) return null

              return (
                <Card key={data.professional.id} className="overflow-hidden">
                  <CardHeader className="border-b" style={{ background: 'linear-gradient(90deg, #6E52FF20 0%, #C7387020 100%)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#6E52FF' }}>
                          {data.professional.firstName[0]}{data.professional.lastName[0]}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{data.professional.fullName}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {dayData.occupiedSlots} turnos programados • {dayData.freeSlots.length} slots libres
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {dayData.occupancyPercentage >= 80 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : dayData.occupancyPercentage >= 50 ? (
                            <TrendingUp className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-orange-600" />
                          )}
                          <span className="text-2xl font-bold">
                            {dayData.occupancyPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Ocupación del día</p>
                        <Progress 
                          value={dayData.occupancyPercentage} 
                          className="mt-2 h-2"
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Turnos programados - Versión compacta */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Turnos a Atender ({dayData.appointments.filter(a => a.status !== AppointmentStatus.CANCELLED).length})
                      </h4>
                      
                      {dayData.appointments.filter(a => a.status !== AppointmentStatus.CANCELLED).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No hay turnos programados para este profesional
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {dayData.appointments
                            .filter(a => a.status !== AppointmentStatus.CANCELLED)
                            .map((apt) => {
                              const startTime = parseISO(apt.startTime)
                              const endTime = parseISO(apt.endTime)
                              
                              return (
                                <div
                                  key={apt.id}
                                  className={`p-2 rounded border transition-all hover:shadow-sm text-xs ${getStatusColor(apt.status)}`}
                                  style={apt.status === AppointmentStatus.COMPLETED ? { backgroundColor: '#6E52FF20', borderColor: '#6E52FF40' } : undefined}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(apt.status)}
                                      <span className="font-semibold text-xs">
                                        {format(startTime, "HH:mm")}
                                      </span>
                                    </div>
                                    {apt.status === AppointmentStatus.PENDING && (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => handleQuickAction(apt.id, "confirm")}
                                        className="h-5 px-2 text-[10px]"
                                      >
                                        ✓
                                      </Button>
                                    )}
                                  </div>
                                  <p className="font-medium text-gray-900 truncate text-xs">
                                    {apt.customer.firstName} {apt.customer.lastName}
                                  </p>
                                  <p className="text-gray-600 truncate text-[10px]">{apt.service.name}</p>
                                  {apt.service.price && (
                                    <p className="text-[10px] font-semibold text-green-700 mt-0.5">
                                      ${Number(apt.service.price).toLocaleString()}
                                    </p>
                                  )}
                                  {apt.status !== AppointmentStatus.CANCELLED && apt.status !== AppointmentStatus.COMPLETED && apt.status !== AppointmentStatus.PENDING && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleQuickAction(apt.id, "cancel")}
                                      className="h-5 px-2 text-[10px] mt-1 w-full"
                                    >
                                      Cancelar
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>

                    {/* Slots libres para publicitar */}
                    {dayData.freeSlots.length > 0 && (
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Share2 className="w-4 h-4" style={{ color: '#6E52FF' }} />
                            Slots Libres para Publicitar ({dayData.freeSlots.length})
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyFreeSlots(dayData.freeSlots, data.professional.fullName, currentDate)}
                            className="gap-2"
                          >
                            <Copy className="w-3 h-3" />
                            Copiar Horarios
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {dayData.freeSlots.slice(0, 20).map((slot, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="font-mono border" 
                              style={{ backgroundColor: '#C7387020', color: '#C73870', borderColor: '#C7387040' }}
                            >
                              {slot.time}
                            </Badge>
                          ))}
                          {dayData.freeSlots.length > 20 && (
                            <Badge variant="secondary" className="font-mono">
                              +{dayData.freeSlots.length - 20} más
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          💡 Estos horarios están disponibles y puedes promocionarlos para llenar tu agenda
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      ) : (
        // Vista semanal con porcentaje de ocupación
        <div className="space-y-4">
          {professionals?.filter(p => p.isActive).map(professional => {
            // Calcular porcentaje de ocupación semanal
            const weeklyData = dateRange.map(date => {
              const dateKey = format(date, "yyyy-MM-dd")
              const key = `${professional.id}-${dateKey}`
              const slots = availabilityData[key] || []
              const dayAppointments = appointmentsByProfessionalAndDay[professional.id]?.[dateKey] || []
              const activeAppointments = dayAppointments.filter(
                apt => apt.status !== AppointmentStatus.CANCELLED
              )
              
              const occupiedSlots = activeAppointments.length
              const totalSlots = slots.length
              const occupancyPercentage = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0
              
              return {
                date,
                dateKey,
                dayAppointments,
                activeAppointments,
                slots,
                occupiedSlots,
                totalSlots,
                occupancyPercentage,
              }
            })

            const totalOccupied = weeklyData.reduce((sum, d) => sum + d.occupiedSlots, 0)
            const totalSlots = weeklyData.reduce((sum, d) => sum + d.totalSlots, 0)
            const weeklyOccupancyPercentage = totalSlots > 0 ? (totalOccupied / totalSlots) * 100 : 0

            return (
              <Card key={professional.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#6E52FF' }}>
                        {professional.firstName[0]}{professional.lastName[0]}
                      </div>
                      {professional.fullName}
                    </CardTitle>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {weeklyOccupancyPercentage >= 80 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : weeklyOccupancyPercentage >= 50 ? (
                          <TrendingUp className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-orange-600" />
                        )}
                        <span className="text-xl font-bold">
                          {weeklyOccupancyPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Ocupación semanal</p>
                      <Progress 
                        value={weeklyOccupancyPercentage} 
                        className="mt-1 h-1.5 w-24"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyData.map((dayData) => {
                      const isCurrentDay = isToday(dayData.date)

                      return (
                        <div
                          key={dayData.dateKey}
                          className={`p-2 rounded border text-center ${
                            isCurrentDay ? "ring-2 ring-blue-500" : ""
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {format(dayData.date, "EEE", { locale: es })}
                          </p>
                          <p className="text-sm font-bold mb-1">{format(dayData.date, "d")}</p>
                          <Badge variant="secondary" className="text-xs mb-1">
                            {dayData.activeAppointments.length}
                          </Badge>
                          {dayData.totalSlots > 0 && (
                            <div className="mt-1">
                              <div className="text-[10px] text-gray-600">
                                {dayData.occupancyPercentage.toFixed(0)}%
                              </div>
                              <Progress 
                                value={dayData.occupancyPercentage} 
                                className="h-1 mt-0.5"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Resumen general */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#6E52FF' }}>
                {filteredAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length}
              </p>
              <p className="text-sm text-gray-600">Confirmados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredAppointments.filter(a => a.status === AppointmentStatus.PENDING).length}
              </p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#C73870' }}>
                {filteredAppointments.filter(a => a.status === AppointmentStatus.COMPLETED).length}
              </p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {professionalDayData.reduce((sum, d) => sum + d.freeSlots.length, 0)}
              </p>
              <p className="text-sm text-gray-600">Slots Libres</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
