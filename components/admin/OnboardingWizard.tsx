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
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useCreateTenant, useCreateService, useCreateProfessional, useCreateSchedule } from "@/lib/api/hooks"
import { useRouter } from "next/navigation"
import { PhoneInput } from "@/components/ui/phone-input"
import { LocationPicker } from "@/components/ui/location-picker"

type OnboardingStep = 
  | "welcome"
  | "business"
  | "branding"
  | "service"
  | "professional"
  | "schedule"
  | "complete"

interface OnboardingData {
  businessName: string
  email: string
  phone?: string
  address?: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  professionalName: string
  professionalLastName: string
  schedule: {
    [key: string]: { start: string; end: string; enabled: boolean }
  }
}

const steps: OnboardingStep[] = [
  "welcome",
  "business",
  "branding",
  "service",
  "professional",
  "schedule",
  "complete",
]

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({
    businessName: "",
    email: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#10b981",
    serviceName: "",
    serviceDuration: 30,
    servicePrice: 0,
    professionalName: "",
    professionalLastName: "",
    schedule: {
      monday: { start: "09:00", end: "18:00", enabled: true },
      tuesday: { start: "09:00", end: "18:00", enabled: true },
      wednesday: { start: "09:00", end: "18:00", enabled: true },
      thursday: { start: "09:00", end: "18:00", enabled: true },
      friday: { start: "09:00", end: "18:00", enabled: true },
      saturday: { start: "09:00", end: "13:00", enabled: false },
      sunday: { start: "09:00", end: "13:00", enabled: false },
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
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        logoUrl: data.logoUrl,
      })
      
      setCreatedTenantId(tenant.id)
      
      // Configurar tenant en el API client
      const { apiClient } = await import("@/lib/api/client")
      apiClient.setTenantId(tenant.id)
      
      // 2. Crear Servicio
      const service = await createService.mutateAsync({
        name: data.serviceName,
        duration: data.serviceDuration,
        price: data.servicePrice > 0 ? data.servicePrice : undefined,
      })
      
      // 3. Crear Profesional
      const professional = await createProfessional.mutateAsync({
        firstName: data.professionalName,
        lastName: data.professionalLastName,
        serviceIds: [service.id],
      })
      
      // 4. Crear Horarios
      const dayMap: { [key: string]: number } = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      }
      
      for (const [dayKey, dayLabel] of Object.entries({
        monday: "Lunes",
        tuesday: "Martes",
        wednesday: "Miércoles",
        thursday: "Jueves",
        friday: "Viernes",
        saturday: "Sábado",
        sunday: "Domingo",
      })) {
        const scheduleData = data.schedule[dayKey]
        if (scheduleData.enabled) {
          await createSchedule.mutateAsync({
            professionalId: professional.id,
            dayOfWeek: dayMap[dayKey],
            startTime: scheduleData.start,
            endTime: scheduleData.end,
          })
        }
      }
      
      // Guardar tenantId en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenantId', tenant.id)
      }
      
      toast.success("¡Tu turnero está listo! Tu usuario admin ha sido creado automáticamente.")
      
      // Redirigir al login después de un breve delay
      // El usuario fue creado automáticamente con el email del tenant
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(data.email)}`)
      }, 2000)
      
    } catch (error: any) {
      console.error("Error creating tenant:", error)
      
      // Extraer mensaje de error más amigable
      let errorMessage = "Error al crear el turnero. Por favor intenta de nuevo."
      
      if (error?.message) {
        // Si el error viene del backend con formato de validación
        if (typeof error.message === 'string') {
          errorMessage = error.message
        } else if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ')
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage)
      setIsSubmitting(false)
    }
  }

  const tenantUrl = createdTenantId && data.businessName
    ? `${typeof window !== 'undefined' ? window.location.host : 'turnero.com'}/${data.businessName.toLowerCase().replace(/\s+/g, "-")}`
    : data.businessName 
    ? `turnero.com/${data.businessName.toLowerCase().replace(/\s+/g, "-")}`
    : "turnero.com/tu-negocio"

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${tenantUrl}`)
    toast.success("Link copiado al portapapeles")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Paso {currentStepIndex} de {steps.length - 2}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Welcome Step */}
            {currentStep === "welcome" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">¡Bienvenido a Turnero!</h2>
                  <p className="text-gray-600 text-lg">
                    En menos de 10 minutos tendrás tu turnero funcionando
                  </p>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-left">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Configuración paso a paso guiada</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Preview en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Valores por defecto inteligentes</span>
                  </div>
                </div>
                <Button size="lg" onClick={nextStep} className="mt-8">
                  Comenzar configuración
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Business Step */}
            {currentStep === "business" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Información de tu Negocio</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Nombre del Negocio *</Label>
                    <Input
                      id="businessName"
                      value={data.businessName}
                      onChange={(e) => updateData({ businessName: e.target.value })}
                      placeholder="Ej: Clínica Médica Mendoza"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email de Contacto *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData({ email: e.target.value })}
                      placeholder="ejemplo@tunegocio.com"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Usaremos este email para notificaciones y acceso al panel
                    </p>
                  </div>
                  <PhoneInput
                    value={data.phone || ''}
                    onChange={(value) => updateData({ phone: value })}
                    label="Teléfono"
                    placeholder="11 1234-5678"
                    countryCode="AR"
                  />
                  <LocationPicker
                    value={data.address || ''}
                    onChange={(address) => updateData({ address })}
                    label="Dirección"
                    placeholder="Calle, número, ciudad"
                  />
                  <div>
                    <Label htmlFor="logo">Logo (opcional)</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {data.logoUrl ? (
                          <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              // Validar tamaño (max 5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error('La imagen es demasiado grande. Máximo 5MB')
                                return
                              }
                              // Validar tipo
                              if (!file.type.startsWith('image/')) {
                                toast.error('Por favor selecciona un archivo de imagen')
                                return
                              }
                              // Convertir a base64
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                const base64String = reader.result as string
                                updateData({ logoUrl: base64String })
                                toast.success('Logo cargado exitosamente')
                              }
                              reader.onerror = () => {
                                toast.error('Error al cargar la imagen')
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => document.getElementById('logo')?.click()}
                        >
                          {data.logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                        </Button>
                        {data.logoUrl && (
                          <Button
                            variant="ghost"
                            type="button"
                            size="sm"
                            onClick={() => updateData({ logoUrl: undefined })}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                    </p>
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button onClick={nextStep} disabled={!data.businessName || !data.email}>
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branding Step */}
            {currentStep === "branding" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Personalización Visual</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Color Primario</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={data.primaryColor}
                          onChange={(e) => updateData({ primaryColor: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input value={data.primaryColor} readOnly className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Color Secundario</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={data.secondaryColor}
                          onChange={(e) => updateData({ secondaryColor: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input value={data.secondaryColor} readOnly className="flex-1" />
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-6 bg-white">
                    <h3 className="font-semibold mb-4">Preview</h3>
                    <div 
                      className="p-4 rounded-lg text-white text-center"
                      style={{ backgroundColor: data.primaryColor }}
                    >
                      <h4 className="font-bold text-lg">{data.businessName || "Tu Negocio"}</h4>
                      <p className="text-sm opacity-90 mt-2">Reserva tu turno</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div 
                        className="h-10 rounded"
                        style={{ backgroundColor: data.primaryColor, opacity: 0.1 }}
                      />
                      <div 
                        className="h-10 rounded"
                        style={{ backgroundColor: data.secondaryColor, opacity: 0.1 }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button onClick={nextStep}>
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Service Step */}
            {currentStep === "service" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Tu Primer Servicio</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="serviceName">Nombre del Servicio *</Label>
                    <Input
                      id="serviceName"
                      value={data.serviceName}
                      onChange={(e) => updateData({ serviceName: e.target.value })}
                      placeholder="Ej: Consulta Médica General"
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceDuration">Duración (minutos) *</Label>
                      <Input
                        id="serviceDuration"
                        type="number"
                        value={data.serviceDuration}
                        onChange={(e) => updateData({ serviceDuration: parseInt(e.target.value) || 30 })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="servicePrice">Precio (opcional)</Label>
                      <Input
                        id="servicePrice"
                        type="number"
                        value={data.servicePrice}
                        onChange={(e) => updateData({ servicePrice: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button onClick={nextStep} disabled={!data.serviceName}>
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Professional Step */}
            {currentStep === "professional" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Profesional</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="professionalName">Nombre *</Label>
                      <Input
                        id="professionalName"
                        value={data.professionalName}
                        onChange={(e) => updateData({ professionalName: e.target.value })}
                        placeholder="Carlos"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="professionalLastName">Apellido *</Label>
                      <Input
                        id="professionalLastName"
                        value={data.professionalLastName}
                        onChange={(e) => updateData({ professionalLastName: e.target.value })}
                        placeholder="Mendoza"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Puedes agregar más profesionales después desde el panel de administración.
                  </p>
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button onClick={nextStep} disabled={!data.professionalName || !data.professionalLastName}>
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
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Horarios de Atención</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Configura los horarios en los que atiendes. Puedes modificarlos después.
                  </p>
                  {Object.entries({
                    monday: "Lunes",
                    tuesday: "Martes",
                    wednesday: "Miércoles",
                    thursday: "Jueves",
                    friday: "Viernes",
                    saturday: "Sábado",
                    sunday: "Domingo",
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label className="font-medium">{label}</Label>
                      </div>
                      <div className="flex items-center gap-2">
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
                          className="w-32"
                        />
                        <span className="text-gray-500">-</span>
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
                          className="w-32"
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
                      >
                        {data.schedule[key].enabled ? "Activo" : "Inactivo"}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Atrás
                  </Button>
                  <Button onClick={nextStep}>
                    Continuar
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {currentStep === "complete" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">¡Tu Turnero está Listo!</h2>
                  <p className="text-gray-600 text-lg">
                    Comparte este link con tus clientes para que reserven turnos
                  </p>
                </div>
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <LinkIcon className="w-5 h-5" />
                      <span className="font-semibold">Tu link de turnos:</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={`https://${tenantUrl}`}
                        readOnly
                        className="bg-white text-gray-900 flex-1"
                      />
                      <Button variant="secondary" onClick={copyLink}>
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
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Creando tu turnero...
                      </>
                    ) : (
                      <>
                        Ir al Dashboard
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

