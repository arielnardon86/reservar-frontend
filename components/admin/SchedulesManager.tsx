"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  useSchedules, 
  useCreateSchedule, 
  useUpdateSchedule, 
  useDeleteSchedule 
} from "@/lib/api/hooks"
import { useProfessionals } from "@/lib/api/hooks"
import { Plus, Edit, Trash2, X, Loader2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { CreateScheduleDto } from "@/lib/api/types"

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 0, label: "Domingo", short: "Dom" },
]

export function SchedulesManager() {
  const { data: schedules, isLoading } = useSchedules()
  const { data: courts } = useProfessionals()
  const createSchedule = useCreateSchedule()
  const updateSchedule = useUpdateSchedule()
  const deleteSchedule = useDeleteSchedule()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateScheduleDto>({
    professionalId: undefined,
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "23:00",
    isException: false,
  })

  const handleCreate = async () => {
    if (!formData.startTime || !formData.endTime) {
      toast.error('Hora de inicio y fin son requeridas')
      return
    }

    try {
      await createSchedule.mutateAsync(formData)
      toast.success('Horario creado')
      setFormData({
        professionalId: undefined,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "23:00",
        isException: false,
      })
      setIsCreating(false)
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear horario')
    }
  }

  const handleUpdate = async (id: string, data: Partial<CreateScheduleDto>) => {
    try {
      await updateSchedule.mutateAsync({ id, data })
      toast.success('Horario actualizado')
      setEditingId(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este horario?')) return

    try {
      await deleteSchedule.mutateAsync(id)
      toast.success('Horario eliminado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar')
    }
  }

  const schedulesByDay = DAYS_OF_WEEK.map(day => ({
    day,
    schedules: schedules?.filter(s => s.dayOfWeek === day.value) || [],
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#0a4d8c]/20 border-t-[#0a4d8c] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">🕐 Horarios del Club</h2>
          <p className="text-blue-200/60">Configura los horarios de apertura para reservas</p>
        </div>
        {!isCreating && (
          <Button 
            className="gap-2 bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c] font-semibold" 
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" />
            Nuevo Horario
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <Card className="border-2 border-[#ccff00]/30 bg-[#12121f]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">🕐 Nuevo Horario</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-200/70">Cancha (opcional)</Label>
                <select
                  value={formData.professionalId || ''}
                  onChange={(e) => setFormData({ ...formData, professionalId: e.target.value || undefined })}
                  className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-blue-900/40 rounded-md text-white"
                >
                  <option value="">Todas las canchas (global)</option>
                  {courts?.filter(c => c.isActive).map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.fullName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-blue-200/40 mt-1">
                  Dejá vacío para aplicar a todas
                </p>
              </div>
              <div>
                <Label className="text-blue-200/70">Día *</Label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-blue-900/40 rounded-md text-white"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-200/70">Apertura *</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-2 bg-[#1a1a2e] border-blue-900/40 text-white"
                />
              </div>
              <div>
                <Label className="text-blue-200/70">Cierre *</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-2 bg-[#1a1a2e] border-blue-900/40 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate} 
                disabled={createSchedule.isPending}
                className="bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c] font-semibold"
              >
                {createSchedule.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Horario'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-blue-900/40 text-blue-200/70">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de horarios por día */}
      {!schedules || schedules.length === 0 ? (
        <Card className="bg-[#12121f] border-blue-900/30">
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-blue-200/30 mx-auto mb-4" />
            <p className="text-blue-200/60 mb-4">No hay horarios configurados</p>
            <p className="text-sm text-blue-200/40 mb-4">
              Tus clientes necesitan horarios para poder reservar
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Horario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {schedulesByDay.map(({ day, schedules: daySchedules }) => (
            <Card key={day.value} className={`bg-[#12121f] border-blue-900/30 ${daySchedules.length === 0 ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{day.label}</span>
                  {daySchedules.length > 0 && (
                    <Badge className="bg-[#0a4d8c] text-white">{daySchedules.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedules.length === 0 ? (
                  <p className="text-blue-200/40 text-sm">Sin horarios</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => {
                      const court = schedule.professional || courts?.find(c => c.id === schedule.professionalId)
                      
                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-2 bg-[#0a4d8c]/20 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2 text-white font-medium">
                              <Clock className="w-3 h-3 text-[#ccff00]" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            {court ? (
                              <span className="text-xs text-blue-200/50">{court.fullName}</span>
                            ) : (
                              <span className="text-xs text-[#ccff00]">Todas</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-200/60 hover:text-white hover:bg-blue-900/30"
                              onClick={() => {
                                setEditingId(schedule.id)
                                setFormData({
                                  professionalId: schedule.professionalId || undefined,
                                  dayOfWeek: schedule.dayOfWeek,
                                  startTime: schedule.startTime,
                                  endTime: schedule.endTime,
                                  isException: schedule.isException,
                                })
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
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
          <Card className="w-full max-w-md bg-[#12121f] border-blue-900/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">🕐 Editar Horario</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200/70">Cancha</Label>
                  <select
                    value={formData.professionalId || ''}
                    onChange={(e) => setFormData({ ...formData, professionalId: e.target.value || undefined })}
                    className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-blue-900/40 rounded-md text-white"
                  >
                    <option value="">Todas</option>
                    {courts?.filter(c => c.isActive).map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-blue-200/70">Día</Label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-blue-900/40 rounded-md text-white"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200/70">Apertura</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-2 bg-[#1a1a2e] border-blue-900/40 text-white"
                  />
                </div>
                <div>
                  <Label className="text-blue-200/70">Cierre</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-2 bg-[#1a1a2e] border-blue-900/40 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateSchedule.isPending}
                  className="bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a4d8c] font-semibold"
                >
                  {updateSchedule.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)} className="border-blue-900/40 text-blue-200/70">
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
