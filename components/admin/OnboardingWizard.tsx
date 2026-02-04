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
  MapPin
} from "lucide-react"
import { toast } from "sonner"
import { useCreateTenant, useCreateService, useCreateProfessional, useCreateSchedule } from "@/lib/api/hooks"
import { useRouter } from "next/navigation"
import { PhoneInput } from "@/components/ui/phone-input"
import { LocationPicker } from "@/components/ui/location-picker"

type OnboardingStep = 
  | "welcome"
  | "business"
  | "courts"
  | "pricing"
  | "schedule"
  | "complete"

interface Court {
  id: string
  name: string
  type: string
  features: string
}

interface Duration {
  id: string
  minutes: number
  label: string
  price: number
}

interface OnboardingData {
  businessName: string
  email: string
  phone?: string
  address?: string
  latitude?: number
  longitude?: number
  logoUrl?: string
  courts: Court[]
  durations: Duration[]
  schedule: {
    [key: string]: { start: string; end: string; enabled: boolean }
  }
}

const steps: OnboardingStep[] = [
  "welcome",
  "business",
  "courts",
  "pricing",
  "schedule",
  "complete",
]

const generateId = () => Math.random().toString(36).substr(2, 9)

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdTenantSlug, setCreatedTenantSlug] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({
    businessName: "",
    email: "",
    courts: [
      { id: generateId(), name: "Cancha 1", type: "Cristal", features: "Techada, Iluminación LED" },
    ],
    durations: [
      { id: generateId(), minutes: 60, label: "1 hora", price: 15000 },
      { id: generateId(), minutes: 90, label: "1 hora 30 min", price: 20000 },
      { id: generateId(), minutes: 120, label: "2 horas", price: 25000 },
    ],
    schedule: {
      monday: { start: "08:00", end: "23:00", enabled: true },
      tuesday: { start: "08:00", end: "23:00", enabled: true },
      wednesday: { start: "08:00", end: "23:00", enabled: true },
      thursday: { start: "08:00", end: "23:00", enabled: true },
      friday: { start: "08:00", end: "23:00", enabled: true },
      saturday: { start: "09:00", end: "22:00", enabled: true },
      sunday: { start: "09:00", end: "20:00", enabled: true },
    },
  })

  const createTenant = useCreateTenant()
  const createService = useCreateService()
  const createProfessional = useCreateProfessional()
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

  const addCourt = () => {
    const courtNum = data.courts.length + 1
    updateData({
      courts: [
        ...data.courts,
        { id: generateId(), name: `Cancha ${courtNum}`, type: "Cristal", features: "" }
      ]
    })
  }

  const removeCourt = (id: string) => {
    if (data.courts.length > 1) {
      updateData({
        courts: data.courts.filter(c => c.id !== id)
      })
    }
  }

  const updateCourt = (id: string, updates: Partial<Court>) => {
    updateData({
      courts: data.courts.map(c => c.id === id ? { ...c, ...updates } : c)
    })
  }

  const addDuration = () => {
    const lastDuration = data.durations[data.durations.length - 1]
    const newMinutes = lastDuration ? lastDuration.minutes + 30 : 60
    const hours = Math.floor(newMinutes / 60)
    const mins = newMinutes % 60
    const label = mins > 0 ? `${hours} hora${hours > 1 ? 's' : ''} ${mins} min` : `${hours} hora${hours > 1 ? 's' : ''}`
    
    updateData({
      durations: [
        ...data.durations,
        { id: generateId(), minutes: newMinutes, label, price: lastDuration?.price || 15000 }
      ]
    })
  }

  const removeDuration = (id: string) => {
    if (data.durations.length > 1) {
      updateData({
        durations: data.durations.filter(d => d.id !== id)
      })
    }
  }

  const updateDuration = (id: string, updates: Partial<Duration>) => {
    updateData({
      durations: data.durations.map(d => {
        if (d.id !== id) return d
        const updated = { ...d, ...updates }
        // Auto-update label when minutes change
        if (updates.minutes !== undefined) {
          const hours = Math.floor(updates.minutes / 60)
          const mins = updates.minutes % 60
          updated.label = mins > 0 
            ? `${hours} hora${hours > 1 ? 's' : ''} ${mins} min` 
            : `${hours} hora${hours > 1 ? 's' : ''}`
        }
        return updated
      })
    })
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    
    try {
      // 1. Crear Tenant
      const tenantSlug = data.businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const tenant = await createTenant.mutateAsync({
        slug: tenantSlug,
        name: data.businessName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        primaryColor: "#0a4d8c",
        secondaryColor: "#ccff00",
        logoUrl: data.logoUrl,
      })
      
      setCreatedTenantSlug(tenantSlug)
      
      // Configurar tenant en el API client
      const { apiClient } = await import("@/lib/api/client")
      apiClient.setTenantId(tenant.id)
      
      // 2. Crear Servicios (duraciones)
      const services = []
      
      for (const duration of data.durations.sort((a, b) => a.minutes - b.minutes)) {
        const service = await createService.mutateAsync({
          name: duration.label,
          duration: duration.minutes,
          price: duration.price,
        })
        services.push(service)
      }
      
      // 3. Crear Canchas (como profesionales)
      const serviceIds = services.map(s => s.id)
      
      for (const court of data.courts) {
        const professional = await createProfessional.mutateAsync({
          firstName: court.name,
          lastName: court.type,
          bio: court.features,
          serviceIds,
        })
        
        // 4. Crear Horarios para cada cancha
        const dayMap: { [key: string]: number } = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 0,
        }
        
        for (const [dayKey, dayData] of Object.entries(data.schedule)) {
          if (dayData.enabled) {
            await createSchedule.mutateAsync({
              professionalId: professional.id,
              dayOfWeek: dayMap[dayKey],
              startTime: dayData.start,
              endTime: dayData.end,
            })
          }
        }
      }
      
      // Guardar tenantId en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenantId', tenant.id)
      }
      
      toast.success("¡Tu club de pádel está listo!")
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(data.email)}`)
      }, 2000)
      
    } catch (error: any) {
      console.error("Error creating tenant:", error)
      
      let errorMessage = "Error al crear el club. Por favor intenta de nuevo."
      
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
    ? `${typeof window !== 'undefined' ? window.location.host : 'padelturn.com'}/${createdTenantSlug}`
    : data.businessName 
    ? `localhost:3000/${data.businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    : "localhost:3000/tu-club"

  const copyLink = () => {
    navigator.clipboard.writeText(`http://${tenantUrl}`)
    toast.success("Link copiado al portapapeles")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a4d8c] via-[#1565a8] to-[#1a6fc2] py-12 px-4">
      {/* Decoración */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />
        <div className="absolute inset-20 border border-white/5 rounded-3xl" />
        <div className="absolute top-20 right-20 w-8 h-8 rounded-full bg-[#ccff00]/20 animate-pulse" />
        <div className="absolute bottom-40 left-32 w-6 h-6 rounded-full bg-[#ccff00]/30 animate-bounce" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Progress Bar */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm text-white/70">
              <span>Paso {currentStepIndex} de {steps.length - 2}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#ccff00] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <Card className="shadow-2xl bg-white/95 backdrop-blur border-0">
          <CardContent className="p-8">
            {/* Welcome Step */}
            {currentStep === "welcome" && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-5xl">🎾</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-[#0a4d8c]">¡Bienvenido a PadelTurn!</h2>
                  <p className="text-gray-600 text-lg">
                    En menos de 5 minutos tendrás tu sistema de reservas funcionando
                  </p>
                </div>
                <div className="space-y-4 pt-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-left bg-[#0a4d8c]/5 p-3 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#0a4d8c]" />
                    </div>
                    <span className="text-gray-700">Configura tus canchas</span>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-[#0a4d8c]/5 p-3 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#0a4d8c]" />
                    </div>
                    <span className="text-gray-700">Define precios por duración</span>
                  </div>
                  <div className="flex items-center gap-3 text-left bg-[#0a4d8c]/5 p-3 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#0a4d8c]" />
                    </div>
                    <span className="text-gray-700">Comparte el link y recibe reservas</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={nextStep} 
                  className="mt-8 bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c] font-bold shadow-lg shadow-[#ccff00]/30"
                >
                  Comenzar configuración
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Business Step */}
            {currentStep === "business" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0a4d8c] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0a4d8c]">Tu Club de Pádel</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName" className="text-gray-700">Nombre del Club *</Label>
                    <Input
                      id="businessName"
                      value={data.businessName}
                      onChange={(e) => updateData({ businessName: e.target.value })}
                      placeholder="Ej: Pádel Club Norte"
                      className="mt-2 border-gray-300 focus:border-[#0a4d8c] focus:ring-[#0a4d8c]/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email de Contacto *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData({ email: e.target.value })}
                      placeholder="contacto@tuclub.com"
                      className="mt-2 border-gray-300 focus:border-[#0a4d8c] focus:ring-[#0a4d8c]/20"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Usaremos este email para acceso al panel de administración
                    </p>
                  </div>
                  <PhoneInput
                    value={data.phone || ''}
                    onChange={(value) => updateData({ phone: value })}
                    label="WhatsApp del Club"
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
                    className="bg-[#0a4d8c] hover:bg-[#0a4d8c]/90 text-white"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Courts Step */}
            {currentStep === "courts" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0a4d8c] flex items-center justify-center">
                    <span className="text-xl">🎾</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0a4d8c]">Tus Canchas</h2>
                    <p className="text-sm text-gray-500">Agrega todas las canchas de tu club</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {data.courts.map((court, index) => (
                    <div key={court.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-[#0a4d8c]">Cancha {index + 1}</span>
                        {data.courts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCourt(court.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Nombre</Label>
                          <Input
                            value={court.name}
                            onChange={(e) => updateCourt(court.id, { name: e.target.value })}
                            placeholder="Cancha 1"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Tipo de superficie</Label>
                          <select
                            value={court.type}
                            onChange={(e) => updateCourt(court.id, { type: e.target.value })}
                            className="mt-1 w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:border-[#0a4d8c] focus:ring-[#0a4d8c]/20"
                          >
                            <option value="Cristal">Cristal</option>
                            <option value="Muro">Muro</option>
                            <option value="Mixta">Mixta</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Características</Label>
                          <Input
                            value={court.features}
                            onChange={(e) => updateCourt(court.id, { features: e.target.value })}
                            placeholder="Techada, Iluminación"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addCourt}
                    className="w-full border-dashed border-2 border-[#0a4d8c]/30 text-[#0a4d8c] hover:bg-[#0a4d8c]/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar otra cancha
                  </Button>
                </div>
                
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep} className="border-gray-300">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={data.courts.length === 0 || data.courts.some(c => !c.name)}
                    className="bg-[#0a4d8c] hover:bg-[#0a4d8c]/90 text-white"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Pricing Step */}
            {currentStep === "pricing" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0a4d8c] flex items-center justify-center">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0a4d8c]">Duraciones y Precios</h2>
                    <p className="text-sm text-gray-500">Configura las duraciones disponibles y sus precios</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {data.durations
                    .sort((a, b) => a.minutes - b.minutes)
                    .map((duration, index) => (
                    <div key={duration.id} className="p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-[#0a4d8c]/5 to-transparent">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-20">
                              <Label className="text-xs text-gray-500">Minutos</Label>
                              <select
                                value={duration.minutes}
                                onChange={(e) => updateDuration(duration.id, { minutes: parseInt(e.target.value) })}
                                className="w-full h-9 px-2 border border-gray-300 rounded-md text-sm focus:border-[#0a4d8c]"
                              >
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>1 hora</option>
                                <option value={90}>1:30 hs</option>
                                <option value={120}>2 horas</option>
                                <option value={150}>2:30 hs</option>
                                <option value={180}>3 horas</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs text-gray-500">Nombre</Label>
                              <Input
                                value={duration.label}
                                onChange={(e) => updateDuration(duration.id, { label: e.target.value })}
                                className="h-9"
                                placeholder="Ej: Turno 1 hora"
                              />
                            </div>
                            <div className="w-32">
                              <Label className="text-xs text-gray-500">Precio</Label>
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-1">$</span>
                                <Input
                                  type="number"
                                  value={duration.price}
                                  onChange={(e) => updateDuration(duration.id, { price: parseInt(e.target.value) || 0 })}
                                  className="h-9 text-right font-semibold"
                                />
                              </div>
                            </div>
                            {data.durations.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDuration(duration.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-4"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addDuration}
                    className="w-full border-dashed border-2 border-[#0a4d8c]/30 text-[#0a4d8c] hover:bg-[#0a4d8c]/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar otra duración
                  </Button>
                </div>
                
                <div className="p-4 bg-[#ccff00]/20 rounded-xl border border-[#ccff00]/30">
                  <p className="text-sm text-[#0a4d8c]">
                    <strong>💡 Tip:</strong> Podés agregar duraciones especiales como turnos de 45 min para clases, o 3 horas para torneos.
                  </p>
                </div>
                
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep} className="border-gray-300">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={data.durations.length === 0}
                    className="bg-[#0a4d8c] hover:bg-[#0a4d8c]/90 text-white"
                  >
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Schedule Step */}
            {currentStep === "schedule" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0a4d8c] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0a4d8c]">Horarios del Club</h2>
                    <p className="text-sm text-gray-500">Configura los horarios de apertura</p>
                  </div>
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
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl bg-white">
                      <div className="w-24">
                        <span className="font-medium text-gray-700">{label}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={data.schedule[key].start}
                          onChange={(e) =>
                            updateData({
                              schedule: {
                                ...data.schedule,
                                [key]: { ...data.schedule[key], start: e.target.value },
                              },
                            })
                          }
                          disabled={!data.schedule[key].enabled}
                          className="w-28"
                        />
                        <span className="text-gray-400">a</span>
                        <Input
                          type="time"
                          value={data.schedule[key].end}
                          onChange={(e) =>
                            updateData({
                              schedule: {
                                ...data.schedule,
                                [key]: { ...data.schedule[key], end: e.target.value },
                              },
                            })
                          }
                          disabled={!data.schedule[key].enabled}
                          className="w-28"
                        />
                      </div>
                      <Button
                        variant={data.schedule[key].enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateData({
                            schedule: {
                              ...data.schedule,
                              [key]: { ...data.schedule[key], enabled: !data.schedule[key].enabled },
                            },
                          })
                        }
                        className={data.schedule[key].enabled 
                          ? "bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c]" 
                          : "border-gray-300 text-gray-500"
                        }
                      >
                        {data.schedule[key].enabled ? "Abierto" : "Cerrado"}
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep} className="border-gray-300">
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button 
                    onClick={nextStep}
                    className="bg-[#0a4d8c] hover:bg-[#0a4d8c]/90 text-white"
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
                <div className="w-24 h-24 rounded-2xl bg-[#ccff00] flex items-center justify-center mx-auto shadow-xl shadow-[#ccff00]/30">
                  <CheckCircle2 className="w-12 h-12 text-[#0a4d8c]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-[#0a4d8c]">¡Tu Club está Listo! 🎾</h2>
                  <p className="text-gray-600 text-lg">
                    Comparte este link con tus jugadores para que reserven
                  </p>
                </div>
                
                {/* Resumen */}
                <div className="bg-[#0a4d8c]/5 rounded-xl p-4 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-[#0a4d8c] mb-3">Resumen:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Club:</span>
                      <span className="font-medium">{data.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Canchas:</span>
                      <span className="font-medium">{data.courts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duraciones:</span>
                      <span className="font-medium">{data.durations.length} opciones</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      {data.durations.sort((a, b) => a.minutes - b.minutes).map(d => (
                        <div key={d.id} className="flex justify-between text-xs text-gray-500">
                          <span>{d.label}</span>
                          <span>${d.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Card className="bg-gradient-to-r from-[#0a4d8c] to-[#1a6fc2] text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <LinkIcon className="w-5 h-5" />
                      <span className="font-semibold">Tu link de reservas:</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={`http://${tenantUrl}`}
                        readOnly
                        className="bg-white text-gray-900 flex-1"
                      />
                      <Button variant="secondary" onClick={copyLink} className="bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c]">
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
                    className="bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c] font-bold shadow-lg shadow-[#ccff00]/30"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Creando tu club...
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
