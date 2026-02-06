"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  useProfessionals, 
  useCreateProfessional, 
  useUpdateProfessional, 
  useDeleteProfessional 
} from "@/lib/api/hooks"
import { useServices } from "@/lib/api/hooks"
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CreateProfessionalDto, UpdateProfessionalDto } from "@/lib/api/types"

type CreateCourtDto = CreateProfessionalDto
type UpdateCourtDto = UpdateProfessionalDto

export function ProfessionalsManager() {
  const { data: courts, isLoading: loadingCourts } = useProfessionals()
  const { data: services, isLoading: loadingServices } = useServices()
  const createCourt = useCreateProfessional()
  const updateCourt = useUpdateProfessional()
  const deleteCourt = useDeleteProfessional()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateCourtDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    isActive: true,
    serviceIds: [],
  })

  const handleCreate = async () => {
    if (!formData.firstName) {
      toast.error('El nombre de la cancha es requerido')
      return
    }

    try {
      const dataToSend = {
        ...formData,
        lastName: formData.lastName || 'Pádel'
      }
      await createCourt.mutateAsync(dataToSend)
      toast.success('Cancha creada')
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        isActive: true,
        serviceIds: [],
      })
      setIsCreating(false)
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear cancha')
    }
  }

  const handleUpdate = async (id: string, data: UpdateCourtDto) => {
    try {
      await updateCourt.mutateAsync({ id, data })
      toast.success('Cancha actualizada')
      setEditingId(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cancha?')) return

    try {
      await deleteCourt.mutateAsync(id)
      toast.success('Cancha eliminada')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar')
    }
  }

  const toggleService = (serviceId: string) => {
    const currentIds = formData.serviceIds || []
    if (currentIds.includes(serviceId)) {
      setFormData({
        ...formData,
        serviceIds: currentIds.filter(id => id !== serviceId)
      })
    } else {
      setFormData({
        ...formData,
        serviceIds: [...currentIds, serviceId]
      })
    }
  }

  if (loadingCourts || loadingServices) {
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
          <h2 className="text-2xl font-bold text-white">🎾 Canchas</h2>
          <p className="text-slate-400">Administra las canchas de tu club</p>
        </div>
        {!isCreating && (
          <Button 
            className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold" 
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" />
            Nueva Cancha
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <Card className="border-2 border-emerald-500/30 bg-slate-900/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">🎾 Nueva Cancha</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Nombre *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Cancha 1"
                  className="mt-2 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Superficie</Label>
                <select
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
                >
                  <option value="Cristal">Cristal</option>
                  <option value="Muro">Muro</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Características</Label>
              <Input
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Techada, iluminación LED, climatizada"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            {services && services.length > 0 && (
              <div>
                <Label className="text-slate-300">Duraciones disponibles</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge
                      key={service.id}
                      variant={(formData.serviceIds || []).includes(service.id) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        (formData.serviceIds || []).includes(service.id) 
                          ? 'bg-emerald-500 text-white' 
                          : 'border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      {service.name} ({service.duration} min)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate} 
                disabled={createCourt.isPending}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
              >
                {createCourt.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Cancha'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-slate-700 text-slate-300">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de canchas */}
      {!courts || courts.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🎾</div>
            <p className="text-slate-400 mb-4">No hay canchas creadas</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Cancha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => {
            const isIndoor = court.bio?.toLowerCase().includes('techada') || 
                            court.bio?.toLowerCase().includes('cubierta')
            
            return (
              <Card key={court.id} className="overflow-hidden bg-slate-900/50 border-slate-800">
                {/* Header visual */}
                <div 
                  className="h-32 flex items-center justify-center relative"
                  style={{
                    background: court.isActive 
                      ? 'linear-gradient(135deg, rgb(16 185 129 / 0.3) 0%, rgb(16 185 129 / 0.1) 100%)'
                      : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                    backgroundImage: court.photoUrl ? `url(${court.photoUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!court.photoUrl && (
                    <div className="text-white text-5xl opacity-30">🎾</div>
                  )}
                  {isIndoor && (
                    <Badge className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400">
                      🏠 Techada
                    </Badge>
                  )}
                  {!court.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg">
                        Inactiva
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-white">{court.fullName}</h3>
                      {court.bio && (
                        <p className="text-sm text-slate-500">{court.bio}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-slate-400 hover:text-white hover:bg-blue-900/30"
                        onClick={() => {
                          setEditingId(court.id)
                          setFormData({
                            firstName: court.firstName,
                            lastName: court.lastName,
                            email: court.email || '',
                            phone: court.phone || '',
                            bio: court.bio || '',
                            photoUrl: court.photoUrl || '',
                            isActive: court.isActive,
                            serviceIds: [],
                          })
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => handleDelete(court.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {court.isActive ? (
                      <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-0">
                        ✓ Activa
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Inactiva
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de edición */}
      {editingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">🎾 Editar Cancha</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Nombre *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Superficie</Label>
                  <select
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
                  >
                    <option value="Cristal">Cristal</option>
                    <option value="Muro">Muro</option>
                    <option value="Mixta">Mixta</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Características</Label>
                <Input
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-2 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              {services && services.length > 0 && (
                <div>
                  <Label className="text-slate-300">Duraciones</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {services.map((service) => (
                      <Badge
                        key={service.id}
                        variant={(formData.serviceIds || []).includes(service.id) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          (formData.serviceIds || []).includes(service.id) 
                            ? 'bg-emerald-500 text-white' 
                            : 'border-slate-700 text-slate-300'
                        }`}
                        onClick={() => toggleService(service.id)}
                      >
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateCourt.isPending}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  {updateCourt.isPending ? (
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
