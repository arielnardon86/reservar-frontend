"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  format, 
  addDays, 
  startOfDay, 
  isSameDay,
} from "date-fns"
import { es } from "date-fns/locale"
import { 
  Loader2, 
  CheckCircle2, 
  X, 
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Mail,
} from "lucide-react"
import { useServices, useDayAppointments } from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import { useParams } from "next/navigation"
import { appointmentsApi } from "@/lib/api/endpoints"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import type { Service, TimeSlot, AppointmentStatus } from "@/lib/api/types"
import { cn } from "@/lib/utils"

// Constantes
const HOUR_START = 8
const HOUR_END = 24
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_DURATION = 30
const TOTAL_SLOTS = (TOTAL_HOURS * 60) / SLOT_DURATION

// Tipos: reserva por espacio común (sin profesional/recurso)
interface BookingSelection {
  space: Service
  date: Date
  startTime: string
  endTime: string
  duration: number
}

interface OccupiedBlock {
  startSlot: number
  endSlot: number
}

interface DurationOption {
  minutes: number
  label: string
  endTime: string
  available: boolean
  service: Service | null
}

// Helpers
const generateDays = () => {
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startOfDay(new Date()), i))
  }
  return days
}

const slotToTime = (slot: number): string => {
  const totalMinutes = HOUR_START * 60 + slot * SLOT_DURATION
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const timeToSlot = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m
  return (totalMinutes - HOUR_START * 60) / SLOT_DURATION
}

const slotToPercent = (slot: number): number => {
  return (slot / TOTAL_SLOTS) * 100
}

const addMinutesToTime = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60)
  const newM = (total % 60 + 60) % 60
  const hCap = Math.max(0, Math.min(23, newH))
  return `${String(hCap).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

// El backend devuelve un slot por bloque (ej. "11:00" para 240 min). El frontend necesita
// cada segmento de 30 min marcado como disponible para pintar bloques verdes.
const expandSlotToSegments = (startTime: string, durationMinutes: number, segmentMinutes: number = SLOT_DURATION): string[] => {
  const [h, m] = startTime.split(':').map(Number)
  let totalMins = h * 60 + m
  const endMins = totalMins + durationMinutes
  const segments: string[] = []
  while (totalMins < endMins) {
    const hh = Math.floor(totalMins / 60) % 24
    const mm = totalMins % 60
    segments.push(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
    totalMins += segmentMinutes
  }
  return segments
}

export function QuickBooking() {
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string
  const { tenant } = useTenantContext()
  const queryClient = useQueryClient()
  
  const { data: services, isLoading: loadingServices } = useServices()
  
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [availabilityMap, setAvailabilityMap] = useState<Map<string, boolean>>(new Map())
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  
  const [activeSelection, setActiveSelection] = useState<{
    spaceId: string
    startSlot: number
    space: Service
  } | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<BookingSelection | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [bookingForm, setBookingForm] = useState({ name: "", lastName: "", email: "", departamento: "", piso: "" })
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  
  const days = useMemo(() => generateDays(), [])
  const activeSpaces = useMemo(() => services?.filter(s => s.isActive) || [], [services])
  
  const dateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate])
  const { data: dayAppointmentsData } = useDayAppointments(tenantSlug, dateStr)
  
  const dayAppointments = useMemo(() => {
    if (!dayAppointmentsData || !activeSpaces.length) return {}
    const bySpace: Record<string, any[]> = {}
    activeSpaces.forEach(space => {
      bySpace[space.id] = dayAppointmentsData.filter(
        apt => apt.serviceId === space.id && !apt.professionalId
      )
    })
    return bySpace
  }, [dayAppointmentsData, activeSpaces])
  const sortedServices = useMemo(() => {
    if (!services) return []
    return [...services].filter(s => s.isActive).sort((a, b) => a.duration - b.duration)
  }, [services])

  const hours = useMemo(() => {
    const h = []
    for (let i = HOUR_START; i < HOUR_END; i++) {
      h.push(i)
    }
    return h
  }, [])

  useEffect(() => {
    const loadAllAvailability = async () => {
      if (!activeSpaces.length || !tenantSlug) return
      setLoadingAvailability(true)
      const newMap = new Map<string, boolean>()
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      try {
        const promises = activeSpaces.map(async (space) => {
          try {
            const slots = await appointmentsApi.getAvailability(tenantSlug, {
              serviceId: space.id,
              date: dateStr,
            })
            const duration = space.duration ?? 30
            slots.forEach((slot: TimeSlot) => {
              if (slot.available) {
                const segmentTimes = expandSlotToSegments(slot.time, duration, SLOT_DURATION)
                segmentTimes.forEach(t => newMap.set(`${space.id}-${t}`, true))
              } else {
                newMap.set(`${space.id}-${slot.time}`, false)
              }
            })
          } catch (e) {
            console.error(`Error espacio ${space.id}:`, e)
          }
        })
        await Promise.all(promises)
        setAvailabilityMap(newMap)
      } catch (error) {
        console.error("Error disponibilidad:", error)
      } finally {
        setLoadingAvailability(false)
      }
    }
    loadAllAvailability()
  }, [activeSpaces, selectedDate, tenantSlug])

  const isSlotInPast = (slotIndex: number): boolean => {
    if (!isSameDay(selectedDate, new Date())) return false
    const time = slotToTime(slotIndex)
    const [h, m] = time.split(':').map(Number)
    
    // slotToTime genera horas locales (8, 9, 10, ..., 23) que se muestran en la interfaz
    // Estas horas son hora local, no UTC. Necesitamos comparar en hora local.
    const now = new Date()
    const slotDate = new Date(selectedDate)
    slotDate.setHours(h, m, 0, 0)
    slotDate.setSeconds(0, 0)
    
    // Comparar en hora local
    // Un slot está en el pasado si su hora local es menor que la hora actual local
    return slotDate.getTime() < now.getTime()
  }

  // Disponibilidad por franja exacta (HH:mm); el backend solo devuelve slots dentro de horarios abiertos
  const isSlotTimeInMapAvailable = (spaceId: string, timeLocal: string): boolean => {
    const [h, m] = timeLocal.split(':').map(Number)
    const d = new Date(selectedDate)
    d.setHours(h, m, 0, 0)
    const timeUTC = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
    const v = availabilityMap.get(`${spaceId}-${timeUTC}`)
    if (v !== undefined) return v === true
    return availabilityMap.get(`${spaceId}-${timeLocal}`) === true
  }

  // Bloques ocupados por reservas (debe estar antes de getAvailableBlocks que lo usa)
  const getOccupiedBlocks = (spaceId: string): OccupiedBlock[] => {
    const blocks: OccupiedBlock[] = []
    const appointments = dayAppointments[spaceId] || []
    appointments.forEach(apt => {
      const start = new Date(apt.startTime)
      const end = new Date(apt.endTime)
      const startHour = start.getHours()
      const startMin = start.getMinutes()
      const endHour = end.getHours()
      const endMin = end.getMinutes()
      const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      const startSlot = timeToSlot(startTimeStr)
      const endSlot = startSlot + (durationMinutes / SLOT_DURATION)
      blocks.push({ startSlot, endSlot })
    })
    const pastSlots: number[] = []
    for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
      if (isSlotInPast(slot)) {
        const isCovered = blocks.some(block => slot >= block.startSlot && slot < block.endSlot)
        if (!isCovered) pastSlots.push(slot)
      }
    }
    if (pastSlots.length > 0) {
      let currentPastBlock: OccupiedBlock | null = null
      pastSlots.forEach(slot => {
        if (!currentPastBlock) {
          currentPastBlock = { startSlot: slot, endSlot: slot + 1 }
        } else if (slot === currentPastBlock.endSlot) {
          currentPastBlock.endSlot = slot + 1
        } else {
          blocks.push(currentPastBlock)
          currentPastBlock = { startSlot: slot, endSlot: slot + 1 }
        }
      })
      if (currentPastBlock) blocks.push(currentPastBlock)
    }
    return blocks.sort((a, b) => a.startSlot - b.startSlot)
  }

  // Bloques disponibles: misma duración que el espacio, alineados desde la apertura, sin superponer reservas
  const getAvailableBlocks = (space: Service): OccupiedBlock[] => {
    const durationSlots = Math.floor(space.duration / SLOT_DURATION)
    if (durationSlots < 1 || durationSlots > TOTAL_SLOTS) return []
    const reserved = getOccupiedBlocks(space.id)
    let openingSlot: number | null = null
    for (let s = 0; s < TOTAL_SLOTS; s++) {
      if (isSlotInPast(s)) continue
      const timeStr = slotToTime(s)
      if (isSlotTimeInMapAvailable(space.id, timeStr)) {
        openingSlot = s
        break
      }
    }
    if (openingSlot == null) return []
    const blocks: OccupiedBlock[] = []
    for (let k = 0; ; k++) {
      const startSlot = openingSlot + k * durationSlots
      const endSlot = startSlot + durationSlots
      if (endSlot > TOTAL_SLOTS) break
      const anyPast = Array.from({ length: durationSlots }, (_, i) => startSlot + i).some(isSlotInPast)
      if (anyPast) continue
      const allInSchedule = Array.from({ length: durationSlots }, (_, i) => slotToTime(startSlot + i)).every(
        t => isSlotTimeInMapAvailable(space.id, t)
      )
      if (!allInSchedule) continue
      const overlaps = reserved.some(
        r => !(endSlot <= r.startSlot || startSlot >= r.endSlot)
      )
      if (overlaps) continue
      blocks.push({ startSlot, endSlot })
    }
    return blocks
  }

  type SlotStatus = 'available' | 'reserved' | 'unavailable'
  const getSlotStatus = (space: Service, slotIndex: number): SlotStatus => {
    const reserved = getOccupiedBlocks(space.id)
    if (reserved.some(b => slotIndex >= b.startSlot && slotIndex < b.endSlot)) return 'reserved'
    const availableBlocks = getAvailableBlocksCached(space)
    if (availableBlocks.some(b => slotIndex >= b.startSlot && slotIndex < b.endSlot)) return 'available'
    return 'unavailable'
  }

  const availableBlocksBySpaceId = useMemo(() => {
    const map: Record<string, OccupiedBlock[]> = {}
    activeSpaces.forEach(space => {
      map[space.id] = getAvailableBlocks(space)
    })
    return map
  }, [activeSpaces, selectedDate, availabilityMap, dayAppointments])

  const getAvailableBlocksCached = (space: Service) => availableBlocksBySpaceId[space.id] ?? []

  const getAvailableBlockAtSlot = (space: Service, slotIndex: number): OccupiedBlock | null => {
    const blocks = getAvailableBlocksCached(space)
    return blocks.find(b => slotIndex >= b.startSlot && slotIndex < b.endSlot) ?? null
  }

  const getDurationOptions = (space: Service, startSlot: number): DurationOption[] => {
    const block = getAvailableBlocksCached(space).find(b => b.startSlot === startSlot)
    if (!block) return []
    const endTime = slotToTime(block.endSlot)
    const label = space.duration === 60 ? "1 hora" : space.duration === 90 ? "1h 30m" : `${space.duration / 60} horas`
    return [{
      minutes: space.duration,
      label,
      endTime,
      available: true,
      service: space
    }]
  }

  const handleTimelineClick = (space: Service, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = (x / rect.width) * 100
    const rawSlot = (percent / 100) * TOTAL_SLOTS
    const slot = Math.floor(rawSlot)
    if (slot < 0 || slot >= TOTAL_SLOTS) return
    const block = getAvailableBlockAtSlot(space, slot)
    if (!block) return
    if (activeSelection?.spaceId === space.id && activeSelection?.startSlot === block.startSlot) {
      setActiveSelection(null)
      return
    }
    setActiveSelection({ spaceId: space.id, startSlot: block.startSlot, space })
  }

  const handleSelectDuration = (option: DurationOption) => {
    if (!activeSelection || !option.available || !option.service) return
    const startTime = slotToTime(activeSelection.startSlot)
    setSelectedSlot({
      space: activeSelection.space,
      date: selectedDate,
      startTime,
      endTime: option.endTime,
      duration: option.minutes,
    })
    setActiveSelection(null)
    setShowModal(true)
  }

  const handleCloseSelection = () => setActiveSelection(null)

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !bookingForm.name || !bookingForm.lastName || !bookingForm.email || !bookingForm.departamento || !bookingForm.piso) {
      toast.error("Completa todos los campos")
      return
    }

    setIsBooking(true)
    try {
      // Usar fecha/hora local del navegador (no UTC) para evitar problemas de timezone
      const [hours, minutes] = selectedSlot.startTime.split(':').map(Number)
      const dateStr = format(selectedSlot.date, 'yyyy-MM-dd')
      const [year, month, day] = dateStr.split('-').map(Number)
      // Crear fecha local (no UTC) para que coincida con lo que ve el usuario
      const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0)

      const appointment = await appointmentsApi.createPublic(tenantSlug, {
        customerFirstName: bookingForm.name,
        customerLastName: bookingForm.lastName,
        customerEmail: bookingForm.email,
        serviceId: selectedSlot.space.id,
        startTime: startTime.toISOString(),
        status: 'CONFIRMED' as AppointmentStatus,
        departamento: bookingForm.departamento,
        piso: bookingForm.piso,
      })

      // Esperar un momento para asegurar que la transacción se complete
      await new Promise(resolve => setTimeout(resolve, 100))

      // Invalidar queries de disponibilidad y appointments para refrescar
      // React Query se encargará de recargarlas automáticamente
      queryClient.invalidateQueries({ 
        queryKey: ['availability'],
        exact: false,
      })
      
      // Invalidar también la query de appointments del día
      queryClient.invalidateQueries({
        queryKey: ['appointmentsByDay', tenantSlug, dateStr],
      })

      setBookingSuccess(true)
      toast.success("¡Reserva confirmada!")
      
      // Marcar como no disponibles los slots reservados (claves en UTC como devuelve el backend)
      setAvailabilityMap(prev => {
        const newMap = new Map(prev)
        const spaceId = selectedSlot.space.id
        const [startH, startM] = selectedSlot.startTime.split(':').map(Number)
        const [endH, endM] = selectedSlot.endTime.split(':').map(Number)
        const startMins = startH * 60 + startM
        const endMins = endH * 60 + endM
        for (let min = startMins; min < endMins; min += SLOT_DURATION) {
          const h = Math.floor(min / 60) % 24
          const m = min % 60
          const d = new Date(selectedSlot.date)
          d.setHours(h, m, 0, 0)
          const utc = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
          newMap.set(`${spaceId}-${utc}`, false)
        }
        return newMap
      })
    } catch (error: any) {
      console.error("Error al reservar:", error)
      toast.error(error?.message || "Error al reservar")
    } finally {
      setIsBooking(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedSlot(null)
    setBookingForm({ name: "", lastName: "", email: "", departamento: "", piso: "" })
    setBookingSuccess(false)
  }

  if (loadingServices) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80">Cargando espacios...</p>
        </div>
      </div>
    )
  }

  if (!activeSpaces.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-xl font-semibold text-white">Sin espacios configurados</h2>
          <p className="text-white/70 mt-2">El administrador aún no ha cargado espacios comunes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-700/50" />
        <div className="absolute inset-10 border border-slate-800/50 rounded-xl" />
      </div>

      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {tenant?.name || 'Reservar espacios comunes'}
                </h1>
                <p className="text-sm text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tenant?.address || 'Selecciona fecha y horario'}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Reserva en segundos
            </div>
          </div>
        </div>
      </div>

      {/* Selector de fecha - scroll horizontal en móvil */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-[81px] z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const idx = days.findIndex(d => isSameDay(d, selectedDate))
                if (idx > 0) {
                  setSelectedDate(days[idx - 1])
                  handleCloseSelection()
                }
              }}
              disabled={isSameDay(selectedDate, days[0])}
              className="text-slate-400 hover:text-white hover:bg-slate-800 h-10 w-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex gap-2 shrink-0">
              {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDate(day)
                      handleCloseSelection()
                    }}
                    className={cn(
                      "flex flex-col items-center px-3 sm:px-4 py-2 rounded-xl transition-all shrink-0 min-w-[56px]",
                      isSelected 
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {format(day, 'EEE', { locale: es })}
                    </span>
                    <span className="text-lg font-bold">
                      {format(day, 'd')}
                    </span>
                    {isToday && (
                      <span className={cn(
                        "text-[9px] font-bold uppercase",
                        isSelected ? "text-slate-950" : "text-emerald-400"
                      )}>
                        Hoy
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const idx = days.findIndex(d => isSameDay(d, selectedDate))
                if (idx < days.length - 1) {
                  setSelectedDate(days[idx + 1])
                  handleCloseSelection()
                }
              }}
              disabled={isSameDay(selectedDate, days[days.length - 1])}
              className="text-slate-400 hover:text-white hover:bg-slate-800 h-10 w-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline - scroll horizontal en móvil para ver todos los horarios */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl overflow-x-auto">
          <div className="flex border-b border-slate-700 bg-slate-800 min-w-[min(100%,800px)] sm:min-w-0">
            <div className="w-32 sm:w-48 shrink-0 p-3 sm:p-4 border-r border-slate-700">
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Espacios</span>
            </div>
            <div className="flex flex-1" style={{ minWidth: `${hours.length * 48}px` }}>
              {hours.map((h) => (
                <div 
                  key={h}
                  className="flex-1 min-w-[48px] p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-slate-400 border-r border-slate-700 last:border-r-0"
                >
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {loadingAvailability && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            )}
            
            {activeSpaces.map((space) => {
              const occupiedBlocks = getOccupiedBlocks(space.id)
              const isActive = activeSelection?.spaceId === space.id
              const selectedBlock = isActive && activeSelection ? getAvailableBlocksCached(space).find(b => b.startSlot === activeSelection.startSlot) : null
              return (
                <div
                  key={space.id}
                  className="flex border-b border-slate-700 last:border-b-0 bg-slate-800/60"
                >
                  <div className="w-32 sm:w-48 shrink-0 p-3 sm:p-4 border-r border-slate-700 flex flex-col justify-center bg-slate-800">
                    <div className="font-semibold text-white text-sm sm:text-base">{space.name}</div>
                    {space.description && (
                      <div className="text-[10px] sm:text-xs text-slate-300 mt-0.5 line-clamp-2" title={space.description}>{space.description}</div>
                    )}
                    <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{space.duration} min</div>
                  </div>
                  <div
                    className="flex-1 h-14 sm:h-16 min-w-[min(100%,800px)] sm:min-w-0 relative cursor-pointer select-none"
                    style={{ minWidth: `${hours.length * 48}px` }}
                    onClick={(e) => handleTimelineClick(space, e)}
                  >
                    {/* Franjas: verde = bloque disponible (duración del espacio), rojo = reservado, gris = no disponible */}
                    <div className="absolute inset-0">
                      {Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => {
                        const status = getSlotStatus(space, slotIndex)
                        const left = slotToPercent(slotIndex)
                        const width = (1 / TOTAL_SLOTS) * 100
                        return (
                          <div
                            key={slotIndex}
                            className="absolute top-0 bottom-0"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor:
                                status === 'available'
                                  ? 'rgb(16 185 129 / 0.65)'
                                  : status === 'reserved'
                                    ? 'rgb(239 68 68 / 0.85)'
                                    : 'rgb(51 65 85 / 0.65)',
                            }}
                          />
                        )
                      })}
                    </div>
                    
                    {/* Bloques ocupados - etiqueta sobre la franja roja */}
                    {occupiedBlocks.map((block, i) => {
                      const durationSlots = block.endSlot - block.startSlot
                      const durationMinutes = durationSlots * SLOT_DURATION
                      const isLongDuration = durationMinutes >= 90
                      const startTime = slotToTime(block.startSlot)
                      const endTime = slotToTime(block.endSlot)
                      
                      // Buscar el appointment correspondiente para mostrar info
                      const appointment = dayAppointments[space.id]?.find(apt => {
                        const aptStart = new Date(apt.startTime)
                        const aptStartHour = aptStart.getHours()
                        const aptStartMin = aptStart.getMinutes()
                        const aptStartStr = `${aptStartHour.toString().padStart(2, '0')}:${aptStartMin.toString().padStart(2, '0')}`
                        return aptStartStr === startTime
                      })
                      
                      return (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 rounded-sm border border-red-700/80 bg-red-500/90 shadow-sm z-10"
                          style={{
                            left: `${slotToPercent(block.startSlot)}%`,
                            width: `${slotToPercent(block.endSlot) - slotToPercent(block.startSlot)}%`,
                          }}
                          title={appointment ? `${startTime} - ${endTime} (${durationMinutes} min)` : `${startTime} - ${endTime}`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-white">
                              {durationMinutes >= 90 ? `${Math.round(durationMinutes / 60 * 10) / 10}h` : durationMinutes >= 60 ? '1h' : 'Reservado'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Bloque seleccionado */}
                    {selectedBlock && (
                      <div 
                        className="absolute top-1 bottom-1 rounded border-2 border-emerald-400 bg-emerald-500/30 z-20"
                        style={{
                          left: `${slotToPercent(selectedBlock.startSlot)}%`,
                          width: `${slotToPercent(selectedBlock.endSlot) - slotToPercent(selectedBlock.startSlot)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Leyenda de colores */}
          <div className="flex flex-wrap items-center justify-center gap-4 px-5 py-3 bg-slate-800/80 border-t border-slate-700 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded bg-emerald-500/80" />
              <span className="text-slate-300">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded bg-red-500/80" />
              <span className="text-slate-300">Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded bg-slate-600/80" />
              <span className="text-slate-300">No disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popup de duración */}
      {activeSelection && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" 
            onClick={handleCloseSelection} 
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-2xl shadow-2xl p-5 min-w-[300px] pointer-events-auto animate-in fade-in zoom-in-95 duration-150 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{activeSelection.space.name}</p>
                  {activeSelection.space.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{activeSelection.space.description}</p>
                  )}
                  <p className="text-lg font-bold text-emerald-600 mt-2">
                    {slotToTime(activeSelection.startSlot)} – {getDurationOptions(activeSelection.space, activeSelection.startSlot)[0]?.endTime ?? addMinutesToTime(slotToTime(activeSelection.startSlot), activeSelection.space.duration)}
                  </p>
                </div>
                <button
                  onClick={handleCloseSelection}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {getDurationOptions(activeSelection.space, activeSelection.startSlot)
                  .filter(opt => opt.available)
                  .map((opt) => (
                  <button
                    key={opt.minutes}
                    onClick={() => handleSelectDuration(opt)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <span className="font-semibold">{opt.label}</span>
                    {opt.service != null && (
                      <span className="font-bold">
                        {opt.service.price != null ? `$${Number(opt.service.price).toLocaleString()}` : 'Sin cargo'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de reserva */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl animate-in fade-in zoom-in duration-200 border-0">
            <CardContent className="p-0">
              {!bookingSuccess ? (
                <>
                  <div className="p-6 bg-slate-800 border-b border-slate-700 rounded-t-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">🏢 Confirmar reserva</h3>
                        <p className="text-slate-400 text-sm mt-1">Ingresá tus datos</p>
                      </div>
                      <button onClick={handleCloseModal} className="text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Espacio</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedSlot.space.name}</p>
                        {selectedSlot.space.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{selectedSlot.space.description}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500">Duración</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {selectedSlot.duration < 60
                            ? `${selectedSlot.duration} min`
                            : selectedSlot.duration % 60 === 0
                              ? selectedSlot.duration === 60
                                ? "1 hora"
                                : `${selectedSlot.duration / 60} horas`
                              : `${Math.floor(selectedSlot.duration / 60)}h ${selectedSlot.duration % 60}min`}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Fecha</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">{format(selectedSlot.date, "EEEE d/MM", { locale: es })}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Horario</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="text-slate-600">Costo</span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedSlot.space.price != null ? `$${Number(selectedSlot.space.price).toLocaleString()}` : 'Sin cargo'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-600 flex items-center gap-2">
                          <User className="w-3 h-3" /> Nombre
                        </Label>
                        <Input
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Juan"
                          className="mt-1 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-600">Apellido</Label>
                        <Input
                          value={bookingForm.lastName}
                          onChange={(e) => setBookingForm(p => ({ ...p, lastName: e.target.value }))}
                          placeholder="Pérez"
                          className="mt-1 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Email
                      </Label>
                      <Input
                        type="email"
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="juan@email.com"
                        className="mt-1 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-600">Departamento *</Label>
                        <Input
                          value={bookingForm.departamento}
                          onChange={(e) => setBookingForm(p => ({ ...p, departamento: e.target.value }))}
                          placeholder="Ej: 3B"
                          className="mt-1 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-600">Piso *</Label>
                        <Input
                          value={bookingForm.piso}
                          onChange={(e) => setBookingForm(p => ({ ...p, piso: e.target.value }))}
                          placeholder="Ej: 2"
                          className="mt-1 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCloseModal} 
                        className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                        disabled={isBooking}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={isBooking || !bookingForm.name || !bookingForm.lastName || !bookingForm.email || !bookingForm.departamento || !bookingForm.piso}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl"
                      >
                        {isBooking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirmar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Listo!</h3>
                  <p className="text-gray-500 mb-6">Confirmación enviada a {bookingForm.email}</p>
                  
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left text-sm border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-500">Espacio</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedSlot.space.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Horario</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCloseModal} 
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl"
                  >
                    Nueva reserva
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
