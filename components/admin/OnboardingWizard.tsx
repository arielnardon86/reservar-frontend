"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building2, 
  Palette, 
  Briefcase, 
  User, 
  Clock,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  MapPin,
  Lock
} from "lucide-react"
import { toast } from "sonner"
import { useCreateTenant, useCreateService, useCreateSchedule } from "@/lib/api/hooks"
import { useRouter } from "next/navigation"
import { PhoneInput } from "@/components/ui/phone-input"
import { LocationPicker } from "@/components/ui/location-picker"

type OnboardingStep = 
  | "welcome"
  | "business"
  | "spaces"
  | "schedule"
  | "password"
  | "complete"

interface Space {
  id: string
  name: string
  duration: number
  price?: number
}

type DaySchedule = {
  enabled: boolean
  turnos: { start: string; end: string }[]
}

interface OnboardingData {
  businessName: string
  email: string
  phone?: string
  address?: string
  latitude?: number
  longitude?: number
  logoUrl?: string
  spaces: Space[]
  schedule: { [key: string]: DaySchedule }
}

const steps: OnboardingStep[] = [
  "welcome",
  "business",
  "spaces",
  "schedule",
  "password",
  "complete",
]

// Duración de la reserva: 1 a 24 horas (valores en minutos)
const DURATION_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hours = i + 1
  return { value: hours * 60, label: hours === 1 ? "1 hora" : `${hours} horas` }
})

const generateId = () => Math.random().toString(36).substr(2, 9)

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const DEFAULT_TURNOS: Record<string, { start: string; end: string }[]> = {
  monday: [{ start: "08:00", end: "23:00" }],
  tuesday: [{ start: "08:00", end: "23:00" }],
  wednesday: [{ start: "08:00", end: "23:00" }],
  thursday: [{ start: "08:00", end: "23:00" }],
  friday: [{ start: "08:00", end: "23:00" }],
  saturday: [{ start: "09:00", end: "22:00" }],
  sunday: [{ start: "09:00", end: "20:00" }],
}

function defaultSchedule(): OnboardingData["schedule"] {
  return Object.fromEntries(
    DAY_KEYS.map((key) => [
      key,
      { enabled: true, turnos: [...(DEFAULT_TURNOS[key] || [{ start: "08:00", end: "23:00" }])] },
    ])
  )
}

// Formato 24 h: opciones cada 30 min (00:00, 00:30, 01:00, ... 23:30) + 23:59 para cierre
const HOUR_OPTIONS_24: { value: string; label: string }[] = []
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, "0")
  HOUR_OPTIONS_24.push({ value: `${hh}:00`, label: `${hh}:00` })
  HOUR_OPTIONS_24.push({ value: `${hh}:30`, label: `${hh}:30` })
}
const END_HOUR_OPTIONS_24 = [...HOUR_OPTIONS_24, { value: "23:59", label: "23:59" }]
// Asegurar que un valor exista en la lista (para valores legacy)
function toStartOption(v: string) {
  return HOUR_OPTIONS_24.some((o) => o.value === v) ? v : "08:00"
}
function toEndOption(v: string) {
  return END_HOUR_OPTIONS_24.some((o) => o.value === v) ? v : "23:00"
}

/** Normaliza un día del schedule: si viene con formato viejo { start, end, enabled } sin turnos, lo convierte a { enabled, turnos }. */
function normalizeDaySchedule(day: unknown, key: string): DaySchedule {
  if (day && typeof day === "object" && "turnos" in day && Array.isArray((day as DaySchedule).turnos)) {
    return day as DaySchedule
  }
  const legacy = day as { start?: string; end?: string; enabled?: boolean } | undefined
  const start = legacy?.start ?? DEFAULT_TURNOS[key]?.[0]?.start ?? "08:00"
  const end = legacy?.end ?? DEFAULT_TURNOS[key]?.[0]?.end ?? "23:00"
  return {
    enabled: legacy?.enabled !== false,
    turnos: [{ start, end }],
  }
}

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdTenantSlug, setCreatedTenantSlug] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [data, setData] = useState<OnboardingData>({
    businessName: "",
    email: "",
    spaces: [
      { id: generateId(), name: "SUM", duration: 120 },
      { id: generateId(), name: "Gimnasio", duration: 60 },
      { id: generateId(), name: "Parrilla 1", duration: 180 },
    ],
    schedule: defaultSchedule(),
  })

  const createTenant = useCreateTenant()
  const createService = useCreateService()
  const createSchedule = useCreateSchedule()

  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const previousStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const addSpace = () => {
    const num = data.spaces.length + 1
    updateData({
      spaces: [
        ...data.spaces,
        { id: generateId(), name: `Espacio ${num}`, duration: 120 }
      ]
    })
  }

  const removeSpace = (id: string) => {
    if (data.spaces.length > 1) {
      updateData({
        spaces: data.spaces.filter(s => s.id !== id)
      })
    }
  }

  const updateSpace = (id: string, updates: Partial<Space>) => {
    updateData({
      spaces: data.spaces.map(s => s.id === id ? { ...s, ...updates } : s)
    })
  }

  const addTurno = (dayKey: string) => {
    const day = normalizeDaySchedule(data.schedule[dayKey], dayKey)
    updateData({
      schedule: {
        ...data.schedule,
        [dayKey]: {
          enabled: day.enabled,
          turnos: [...day.turnos, { start: "14:00", end: "19:00" }],
        },
      },
    })
  }

  const removeTurno = (dayKey: string, turnoIndex: number) => {
    const day = normalizeDaySchedule(data.schedule[dayKey], dayKey)
    const turnos = day.turnos.filter((_, i) => i !== turnoIndex)
    updateData({
      schedule: {
        ...data.schedule,
        [dayKey]: {
          enabled: day.enabled,
          turnos: turnos.length ? turnos : [{ start: "08:00", end: "23:00" }],
        },
      },
    })
  }

  const updateTurno = (dayKey: string, turnoIndex: number, updates: { start?: string; end?: string }) => {
    const day = normalizeDaySchedule(data.schedule[dayKey], dayKey)
    const turnos = [...day.turnos]
    turnos[turnoIndex] = { ...turnos[turnoIndex], ...updates }
    updateData({
      schedule: {
        ...data.schedule,
        [dayKey]: { enabled: day.enabled, turnos },
      },
    })
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    
    try {
      // 1. Crear Tenant
      const tenantSlug = data.businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      if (!password || password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres")
        setIsSubmitting(false)
        return
      }
      if (password !== passwordConfirm) {
        toast.error("Las contraseñas no coinciden")
        setIsSubmitting(false)
        return
      }
      const tenant = await createTenant.mutateAsync({
        slug: tenantSlug,
        name: data.businessName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        primaryColor: "#10b981",
        secondaryColor: "#34d399",
        logoUrl: data.logoUrl,
        password,
      })
      
      setCreatedTenantSlug(tenantSlug)
      
      // Configurar tenant en el API client
      const { apiClient } = await import("@/lib/api/client")
      apiClient.setTenantId(tenant.id)
      
      // 2. Crear Espacios comunes (cada uno es un Service)
      const dayMap: { [key: string]: number } = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      }

      for (const space of data.spaces) {
        const service = await createService.mutateAsync({
          name: space.name,
          duration: space.duration,
          price: space.price,
        })

        // 3. Crear Horarios para este espacio (serviceId): un registro por turno; si cierre < apertura = hasta madrugada (2 registros)
        for (const dayKey of DAY_KEYS) {
          const dayData = normalizeDaySchedule(data.schedule[dayKey], dayKey)
          if (!dayData.enabled || !dayData.turnos?.length) continue
          const dayOfWeek = dayMap[dayKey]
          for (const turno of dayData.turnos) {
            const startM = turno.start.slice(0, 2) === "24" ? 0 : parseInt(turno.start.slice(0, 2), 10) * 60 + parseInt(turno.start.slice(3), 10)
            const endM = turno.end.slice(0, 2) === "24" ? 24 * 60 : parseInt(turno.end.slice(0, 2), 10) * 60 + parseInt(turno.end.slice(3), 10)
            if (endM > startM) {
              await createSchedule.mutateAsync({
                serviceId: service.id,
                dayOfWeek,
                startTime: turno.start,
                endTime: turno.end,
              })
            } else {
              // Hasta la madrugada: día actual hasta 23:59; si end no es 00:00, día siguiente 00:00 hasta end
              await createSchedule.mutateAsync({
                serviceId: service.id,
                dayOfWeek,
                startTime: turno.start,
                endTime: "23:59",
              })
              if (turno.end !== "00:00") {
                const nextDay = (dayOfWeek + 1) % 7
                await createSchedule.mutateAsync({
                  serviceId: service.id,
                  dayOfWeek: nextDay,
                  startTime: "00:00",
                  endTime: turno.end,
                })
              }
            }
          }
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('tenantId', tenant.id)
      }

      toast.success("¡Tu edificio está listo! Iniciá sesión con tu email y contraseña.")
      setPassword("")
      setPasswordConfirm("")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
      
    } catch (error: any) {
      console.error("Error creating tenant:", error)
      
      let errorMessage = "Error al crear el edificio. Por favor intenta de nuevo."
      
      if (error?.message) {
        if (typeof error.message === 'string') {
          errorMessage = error.message
        } else if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ')
        }
      }
      
      toast.error(errorMessage)
      setIsSubmitting(false)
    }
  }

  const tenantUrl = createdTenantSlug
    ? `${typeof window !== 'undefined' ? window.location.host : 'reservar.com'}/${createdTenantSlug}`
    : data.businessName 
    ? `localhost:3000/${data.businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    : "localhost:3000/tu-edificio"

  const copyLink = () => {
    navigator.clipboard.writeText(`http://${tenantUrl}`)
    toast.success("Link copiado al portapapeles")
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm text-slate-400">
              <span>Paso {currentStepIndex} de {steps.length - 2}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Card className="shadow-2xl bg-white border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            {/* Welcome Step */}
            {currentStep === "welcome" && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Building2 className="w-12 h-12 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-slate-900">Bienvenido a ReservAr</h2>
                  <p className="text-slate-600 text-lg">
                    En pocos minutos tendrás las reservas de tu edificio funcionando
                  </p>
                </div>
                <div className="space-y-4 pt-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">Datos de tu edificio o consorcio</span>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">Espacios comunes (SUM, gimnasio, parrillas…)</span>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">Link para que los vecinos reserven</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={nextStep} 
                  className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Comenzar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Business Step */}
            {currentStep === "business" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Tu edificio o consorcio</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName" className="text-gray-700">Nombre del edificio *</Label>
                    <Input
                      id="businessName"
                      value={data.businessName}
                      onChange={(e) => updateData({ businessName: e.target.value })}
                      placeholder="Ej: Torre Pacifico, Consorcio Las Palmas"
                      className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email de administración *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData({ email: e.target.value })}
                      placeholder="admin@edificio.com"
                      className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Se usa para acceder al panel de administración
                    </p>
                  </div>
                  <PhoneInput
                    value={data.phone || ''}
                    onChange={(value) => updateData({ phone: value })}
                    label="Teléfono / WhatsApp"
                    placeholder="11 1234-5678"
                    countryCode="AR"
                  />
                  <LocationPicker
                    value={data.address || ''}
                    onChange={(address, lat, lng) => {
                      updateData({
                        address,
                        latitude: lat,
                        longitude: lng,
                      })
                    }}
                    label="Dirección"
                    placeholder="Av. del Libertador 1234, Buenos Aires"
                  />
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep} className="border-gray-300">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!data.businessName || !data.email}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Spaces Step */}
            {currentStep === "spaces" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Espacios comunes</h2>
                    <p className="text-sm text-gray-500">SUM, gimnasio, parrillas… Cada uno con su duración y precio opcional</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {data.spaces.map((space, index) => (
                    <div key={space.id} className="p-4 border border-gray-200 rounded-xl bg-slate-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-emerald-700">Espacio {index + 1}</span>
                        {data.spaces.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSpace(space.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <Label className="text-xs text-gray-500">Nombre *</Label>
                          <Input
                            value={space.name}
                            onChange={(e) => updateSpace(space.id, { name: e.target.value })}
                            placeholder="SUM, Gimnasio, Parrilla 1"
                            className="mt-1 border-gray-300 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Duración de la reserva</Label>
                          <select
                            value={space.duration}
                            onChange={(e) => updateSpace(space.id, { duration: parseInt(e.target.value) })}
                            className="mt-1 w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:border-emerald-500 focus:ring-emerald-500/20"
                          >
                            {DURATION_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Precio ($) - opcional</Label>
                          <Input
                            type="number"
                            value={space.price ?? ''}
                            onChange={(e) => updateSpace(space.id, { price: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="Sin cargo"
                            className="mt-1 border-gray-300 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addSpace}
                    className="w-full border-dashed border-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar otro espacio
                  </Button>
                </div>
                
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep} className="border-gray-300 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={data.spaces.length === 0 || data.spaces.some(s => !s.name)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Schedule Step - Formato 24 h, dos turnos por día, cierre post medianoche */}
            {currentStep === "schedule" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Horarios de los espacios</h2>
                    <p className="text-sm text-gray-500">Apertura y cierre por día en <strong>formato 24 h</strong>. Podés definir hasta dos turnos por día (ej. mañana y tarde). Se aplica a todos los espacios.</p>
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 space-y-1">
                  <p className="text-xs font-medium text-amber-800">Cierre a la madrugada</p>
                  <p className="text-xs text-gray-600">Si el cierre es anterior a la apertura (ej. apertura 22:00, cierre 02:00), se considera abierto hasta la madrugada del día siguiente.</p>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
                  <span>Formato 24 h</span>
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">00:00 – 23:59</span>
                </div>
                <div className="space-y-3">
                  {Object.entries({
                    monday: "Lunes",
                    tuesday: "Martes",
                    wednesday: "Miércoles",
                    thursday: "Jueves",
                    friday: "Viernes",
                    saturday: "Sábado",
                    sunday: "Domingo",
                  }).map(([key, label]) => {
                    const day = normalizeDaySchedule(data.schedule[key], key)
                    const turnos = day.turnos.length ? day.turnos : [{ start: "08:00", end: "23:00" }]
                    return (
                      <div key={key} className="p-4 border border-gray-200 rounded-xl bg-white space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <span className="font-medium text-gray-700">{label}</span>
                          </div>
                          <Button
                            variant={day.enabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const next = normalizeDaySchedule(data.schedule[key], key)
                              updateData({
                                schedule: {
                                  ...data.schedule,
                                  [key]: { ...next, enabled: !next.enabled },
                                },
                              })
                            }}
                            className={day.enabled
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                              : "border-gray-300 text-gray-500 rounded-xl"
                            }
                          >
                            {day.enabled ? "Abierto" : "Cerrado"}
                          </Button>
                        </div>
                        {day.enabled && (
                          <div className="pl-0 md:pl-24 space-y-3 border-l-2 border-gray-100 md:ml-2 md:pl-6">
                            {turnos.map((turno, idx) => (
                              <div key={idx} className="flex items-center gap-2 flex-wrap gap-y-2">
                                <span className="text-xs font-medium text-gray-500 w-16 shrink-0">
                                  {turnos.length > 1 ? (idx === 0 ? "Turno 1" : "Turno 2") : "Horario"}
                                </span>
                                <select
                                  value={toStartOption(turno.start)}
                                  onChange={(e) => updateTurno(key, idx, { start: e.target.value })}
                                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-emerald-500 focus:ring-emerald-500/20 w-24 font-mono"
                                  aria-label="Apertura (24 h)"
                                >
                                  {HOUR_OPTIONS_24.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                                <span className="text-gray-400 text-sm">a</span>
                                <select
                                  value={toEndOption(turno.end)}
                                  onChange={(e) => updateTurno(key, idx, { end: e.target.value })}
                                  className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-emerald-500 focus:ring-emerald-500/20 w-24 font-mono"
                                  aria-label="Cierre (24 h)"
                                >
                                  {END_HOUR_OPTIONS_24.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                                {turnos.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTurno(key, idx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {turnos.length < 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTurno(key)}
                                className="border-2 border-dashed border-emerald-400 text-emerald-600 hover:bg-emerald-50 font-medium"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar segundo turno
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep} className="border-gray-300 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button 
                    onClick={nextStep}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Password Step - Contraseña del administrador */}
            {currentStep === "password" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Creá tu contraseña</h2>
                    <p className="text-sm text-gray-500">La vas a usar para entrar al panel de administración (email + contraseña)</p>
                  </div>
                </div>
                <div className="max-w-md space-y-4">
                  <div>
                    <Label className="text-gray-700">Contraseña *</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="mt-1 border-gray-300 focus:border-emerald-500 rounded-xl"
                      minLength={8}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Repetir contraseña *</Label>
                    <Input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Repetí la contraseña"
                      className="mt-1 border-gray-300 focus:border-emerald-500 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep} className="border-gray-300 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={password.length < 8 || password !== passwordConfirm}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {currentStep === "complete" && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-slate-900">Tu edificio está listo</h2>
                  <p className="text-gray-600 text-lg">
                    Compartí este link con los vecinos para que reserven espacios
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 text-left max-w-md mx-auto border border-slate-200">
                  <h3 className="font-semibold text-emerald-700 mb-3">Resumen</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edificio:</span>
                      <span className="font-medium">{data.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Espacios:</span>
                      <span className="font-medium">{data.spaces.length}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                      {data.spaces.map(s => (
                        <div key={s.id} className="flex justify-between text-xs text-gray-500">
                          <span>{s.name}</span>
                          <span>{s.duration} min{s.price != null ? ` · $${s.price.toLocaleString()}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Card className="bg-slate-900 text-white border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <LinkIcon className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold">Link de reservas para vecinos:</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={`http://${tenantUrl}`}
                        readOnly
                        className="bg-slate-800 border-slate-700 text-white flex-1 rounded-xl"
                      />
                      <Button onClick={copyLink} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="pt-6">
                  <Button 
                    size="lg" 
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Creando tu edificio...
                      </>
                    ) : (
                      <>
                        Finalizar y acceder al panel
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
