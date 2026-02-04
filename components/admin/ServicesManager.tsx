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
import { Plus, Edit, Trash2, Clock, DollarSign, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CreateServiceDto, UpdateServiceDto } from "@/lib/api/types"

// Duraciones típicas para espacios comunes (SUM, Gimnasio, Parrilla, etc.)
const SPACE_DURATIONS = [
  { value: 60, label: '1 hora' },
  { value: 90, label: '1:30 hs' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
]

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">🏢 Espacios comunes</h2>
          <p className="text-slate-400">SUM, Gimnasio, Parrillas y otros espacios reservables</p>
        </div>
        {!isCreating && (
          <Button 
            className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold" 
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" />
            Nuevo espacio
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <Card className="border-2 border-emerald-500/30 bg-slate-900/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">🏢 Nuevo espacio</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Nombre *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: SUM, Gimnasio, Parrilla 1"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Duración *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PADEL_DURATIONS.map((duration) => (
                  <Button
                    key={duration.value}
                    type="button"
                    variant={formData.duration === duration.value ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, duration: duration.value })}
                    className={formData.duration === duration.value 
                      ? "bg-emerald-500 text-white" 
                      : "border-slate-700 text-slate-300 hover:bg-slate-700"
                    }
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {duration.label}
                  </Button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-slate-500">Personalizada:</span>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  className="w-24 bg-slate-800 border-slate-700 text-white"
                  min={15}
                  step={15}
                />
                <span className="text-sm text-slate-500">minutos</span>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Precio ($) - opcional</Label>
              <Input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Sin cargo si está vacío"
                className="mt-2 w-48 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate} 
                disabled={createService.isPending}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
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
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-slate-700 text-slate-300">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de duraciones */}
      {!services || services.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">⏱️</div>
            <p className="text-slate-400 mb-4">No hay duraciones configuradas</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Duración
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden bg-slate-900/50 border-slate-800">
              <div 
                className="py-4 px-6 text-white flex items-center justify-between"
                style={{
                  background: service.isActive 
                    ? 'linear-gradient(135deg, rgb(16 185 129 / 0.3) 0%, rgb(16 185 129 / 0.1) 100%)'
                    : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
                }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">{formatDuration(service.duration)}</span>
                </div>
                {!service.isActive && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Inactivo
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-slate-400 hover:text-white hover:bg-blue-900/30"
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
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {service.price && (
                  <div className="flex items-center gap-1 text-xl font-bold text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                    <span>{Number(service.price).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">⏱️ Editar Duración</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Duración</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PADEL_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      type="button"
                      variant={formData.duration === duration.value ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, duration: duration.value })}
                      className={formData.duration === duration.value 
                        ? "bg-emerald-500 text-white" 
                        : "border-slate-700 text-slate-300"
                      }
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  className="mt-2 w-32 bg-slate-800 border-slate-700 text-white"
                  min={15}
                  step={15}
                />
              </div>
              <div>
                <Label className="text-slate-300">Precio ($)</Label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="mt-2 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateService.isPending}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
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
                <Button variant="outline" onClick={() => setEditingId(null)} className="border-slate-700 text-slate-300">
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
