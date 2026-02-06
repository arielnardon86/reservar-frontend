"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download, Link as LinkIcon, Loader2, Building2 } from "lucide-react"
import { toast } from "sonner"
import { useTenantContext } from "@/lib/context/TenantContext"
import { useTenant, useUpdateTenant } from "@/lib/api/hooks"
import type { UpdateTenantDto } from "@/lib/api/types"
import { PhoneInput } from "@/components/ui/phone-input"
import { LocationPicker } from "@/components/ui/location-picker"

export function SettingsPanel() {
  const { tenantId } = useTenantContext()
  const { data: tenant, isLoading: loadingTenant } = useTenant(tenantId || '')
  const updateTenant = useUpdateTenant()

  const [formData, setFormData] = useState<UpdateTenantDto>({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
  })

  // Cargar datos del tenant cuando se carga
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        latitude: tenant.latitude,
        longitude: tenant.longitude,
        logoUrl: tenant.logoUrl || '',
        primaryColor: tenant.primaryColor || '#3b82f6',
        secondaryColor: tenant.secondaryColor || '#10b981',
      })
    }
  }, [tenant])

  const handleSaveGeneral = async () => {
    if (!tenantId) {
      toast.error('No se encontró el ID del negocio')
      return
    }

    try {
      await updateTenant.mutateAsync({
        id: tenantId,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
      })
      toast.success('Información guardada exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al guardar los cambios')
    }
  }

  const handleSaveBranding = async () => {
    if (!tenantId) {
      toast.error('No se encontró el ID del negocio')
      return
    }

    try {
      await updateTenant.mutateAsync({
        id: tenantId,
        data: {
          logoUrl: formData.logoUrl,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        },
      })
      toast.success('Personalización guardada exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al guardar los cambios')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${tenant?.slug || 'turnero'}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const bookingLink = tenant?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${tenant.slug}`
    : ''

  if (loadingTenant) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudo cargar la información del negocio</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="text-gray-600">Personaliza tu sistema de turnos</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Personalización</TabsTrigger>
          <TabsTrigger value="sharing">Compartir</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
              <CardDescription>Datos básicos de tu establecimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del Negocio *</Label>
                <Input
                  id="businessName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de tu negocio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PhoneInput
                  value={formData.phone || ''}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  label="Teléfono"
                  placeholder="11 1234-5678"
                  countryCode="AR"
                />
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@tunegocio.com"
                  />
                </div>
              </div>
              <LocationPicker
                value={formData.address || ''}
                onChange={(address, lat, lng) => {
                  setFormData({
                    ...formData,
                    address,
                    latitude: lat,
                    longitude: lng,
                  })
                }}
                label="Dirección"
                placeholder="Calle, número, ciudad"
              />

              <Button
                onClick={handleSaveGeneral}
                disabled={updateTenant.isPending || !formData.name || !formData.email}
              >
                {updateTenant.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidad Visual</CardTitle>
                <CardDescription>Personaliza los colores y logo de tu turnero</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
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
                              setFormData({ ...formData, logoUrl: base64String })
                              toast.success('Logo cargado exitosamente')
                            }
                            reader.onerror = () => {
                              toast.error('Error al cargar la imagen')
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => document.getElementById('logo')?.click()}
                          className="flex-1"
                        >
                          {formData.logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                        </Button>
                        {formData.logoUrl && (
                          <Button
                            variant="ghost"
                            type="button"
                            size="sm"
                            onClick={() => setFormData({ ...formData, logoUrl: '' })}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                      </p>
                      {/* Opción alternativa: URL */}
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">O pega una URL de imagen:</p>
                        <Input
                          placeholder="https://ejemplo.com/logo.png"
                          value={formData.logoUrl?.startsWith('http') ? formData.logoUrl : ''}
                          onChange={(e) => {
                            const v = e.target.value
                            if (v.startsWith('http')) {
                              setFormData({ ...formData, logoUrl: v })
                            } else if (v === '' && formData.logoUrl?.startsWith('http')) {
                              setFormData({ ...formData, logoUrl: '' })
                            }
                          }}
                          className="text-xs bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Color Primario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input value={formData.primaryColor} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Color Secundario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor || '#10b981'}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input value={formData.secondaryColor || '#10b981'} readOnly />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveBranding}
                  disabled={updateTenant.isPending}
                >
                  {updateTenant.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Aplicar Cambios'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview en Tiempo Real */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>Así se verá tu turnero</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="p-6 rounded-lg text-white text-center"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    <h3 className="font-bold text-xl mb-2">{formData.name || tenant.name}</h3>
                    <p className="text-sm opacity-90">Reserva tu turno</p>
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-10 rounded"
                      style={{ backgroundColor: formData.primaryColor, opacity: 0.1 }}
                    />
                    <div
                      className="h-10 rounded"
                      style={{ backgroundColor: formData.secondaryColor || '#10b981', opacity: 0.1 }}
                    />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Ejemplo de botón:</p>
                    <Button
                      style={{
                        backgroundColor: formData.primaryColor,
                        color: "white",
                      }}
                    >
                      Reservar Turno
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Link de Reserva</CardTitle>
                <CardDescription>Comparte este link con tus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={bookingLink} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(bookingLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Tu slug actual: <strong>{tenant.slug}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  El slug no se puede cambiar después de crear el negocio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Código QR</CardTitle>
                <CardDescription>Para imprimir y mostrar en tu local</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div id="qr-code" className="flex justify-center p-4 bg-white border rounded-lg">
                  {bookingLink ? (
                    <QRCodeSVG value={bookingLink} size={200} />
                  ) : (
                    <p className="text-gray-500">Cargando...</p>
                  )}
                </div>
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={downloadQR}
                  disabled={!bookingLink}
                >
                  <Download className="w-4 h-4" />
                  Descargar QR
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recordatorios Automáticos</CardTitle>
              <CardDescription>Configura cuándo enviar recordatorios a tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recordatorio 24 horas antes</p>
                  <p className="text-sm text-gray-600">Email y notificación</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recordatorio 2 horas antes</p>
                  <p className="text-sm text-gray-600">Solo notificación</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Confirmación de turno</p>
                  <p className="text-sm text-gray-600">Email inmediato al reservar</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificación al admin</p>
                  <p className="text-sm text-gray-600">Cuando se crea un turno nuevo</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  ⚠️ Las notificaciones estarán disponibles próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
