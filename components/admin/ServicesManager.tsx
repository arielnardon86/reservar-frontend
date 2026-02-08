"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  useServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService 
} from "@/lib/api/hooks"
import { Plus, Edit, Trash2, Clock, DollarSign, X, Loader2, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CreateServiceDto, UpdateServiceDto } from "@/lib/api/types"

// Misma estructura que onboarding: duraciones 1 a 24 horas (en minutos)
const DURATION_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hours = i + 1
  return { value: hours * 60, label: hours === 1 ? '1 hora' : `${hours} horas` }
})

export function ServicesManager() {
  const { data: services, isLoading } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateServiceDto>({
    name: '',
    description: '',
    duration: 60,
    price: undefined,
    isActive: true,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.duration) {
      toast.error('Nombre y duración del espacio son requeridos')
      return
    }

    try {
      await createService.mutateAsync(formData)
      toast.success('Espacio creado exitosamente')
      setFormData({
        name: '',
        description: '',
        duration: 60,
        price: undefined,
        isActive: true,
      })
      setIsCreating(false)
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear espacio')
    }
  }

  const handleUpdate = async (id: string, data: UpdateServiceDto) => {
    try {
      await updateService.mutateAsync({ id, data })
      toast.success('Espacio actualizado')
      setEditingId(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este espacio?')) return

    try {
      await deleteService.mutateAsync(id)
      toast.success('Espacio eliminado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar')
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours} hora${hours > 1 ? 's' : ''}`
    }
    return `${minutes} min`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Espacios comunes</h2>
          <p className="text-slate-400 text-sm">SUM, gimnasio, parrillas… Cada uno con su duración y precio opcional</p>
        </div>
      </div>

      {/* Formulario de creación - misma UI que onboarding */}
      {isCreating && (
        <Card className="border-2 border-emerald-500/30 bg-slate-900/50 rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Nuevo espacio</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <Label className="text-slate-300 text-xs">Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="SUM, Gimnasio, Parrilla 1"
                  className="mt-1 bg-slate-800 border-slate-700 text-white rounded-md"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Duración de la reserva</Label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="mt-1 w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Precio ($) - opcional</Label>
                <Input
                  type="number"
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Sin cargo"
                  className="mt-1 bg-slate-800 border-slate-700 text-white rounded-md"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Descripción - opcional</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || undefined })}
                placeholder="Ej: Salón de usos múltiples con aire acondicionado"
                className="mt-1 bg-slate-800 border-slate-700 text-white rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate} 
                disabled={createService.isPending}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl"
              >
                {createService.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear espacio'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-slate-700 text-slate-300 rounded-xl">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de espacios - misma estructura que onboarding (cards por espacio) */}
      {!services || services.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800 rounded-xl">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 mb-4">No hay espacios configurados</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar espacio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => (
            <Card key={service.id} className="p-4 border border-slate-700 rounded-xl bg-slate-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-emerald-400">Espacio {index + 1}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(service.id)
                      setFormData({
                        name: service.name,
                        description: service.description || '',
                        duration: service.duration,
                        price: service.price ? Number(service.price) : undefined,
                        isActive: service.isActive,
                      })
                    }}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <span className="text-xs text-slate-500">Nombre</span>
                  <p className="font-medium text-white">{service.name}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Duración</span>
                  <p className="font-medium text-white">{formatDuration(service.duration)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Precio</span>
                  <p className="font-medium text-white">{service.price ? `$${Number(service.price).toLocaleString()}` : 'Sin cargo'}</p>
                </div>
              </div>
              {service.description && (
                <div className="mt-3">
                  <span className="text-xs text-slate-500">Descripción</span>
                  <p className="text-sm text-slate-300">{service.description}</p>
                </div>
              )}
              {!service.isActive && (
                <Badge variant="secondary" className="mt-2 bg-white/20 text-white">Inactivo</Badge>
              )}
            </Card>
          ))}
          <Button
            variant="outline"
            onClick={() => setIsCreating(true)}
            className="w-full border-dashed border-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar otro espacio
          </Button>
        </div>
      )}

      {/* Modal de edición - misma UI que onboarding */}
      {editingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 py-8 min-h-0">
          <Card className="w-full max-w-md my-auto max-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-900/50 border-slate-800 rounded-xl shrink-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Editar espacio</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <Label className="text-slate-300 text-xs">Nombre *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="SUM, Gimnasio, Parrilla 1"
                    className="mt-1 bg-slate-800 border-slate-700 text-white rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Duración de la reserva</Label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="mt-1 w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:border-emerald-500"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Precio ($) - opcional</Label>
                  <Input
                    type="number"
                    value={formData.price ?? ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Sin cargo"
                    className="mt-1 bg-slate-800 border-slate-700 text-white rounded-md"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Descripción - opcional</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || undefined })}
                  placeholder="Ej: Salón de usos múltiples con aire acondicionado"
                  className="mt-1 bg-slate-800 border-slate-700 text-white rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateService.isPending}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl"
                >
                  {updateService.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)} className="border-slate-700 text-slate-300 rounded-xl">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
