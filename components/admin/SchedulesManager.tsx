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
import { useProfessionals, useServices } from "@/lib/api/hooks"
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
  const { data: spaces } = useServices()
  const createSchedule = useCreateSchedule()
  const updateSchedule = useUpdateSchedule()
  const deleteSchedule = useDeleteSchedule()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateScheduleDto>({
    serviceId: undefined,
    professionalId: undefined,
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "23:00",
    isException: false,
  })
  const [turnos, setTurnos] = useState<{ start: string; end: string }[]>([{ start: "08:00", end: "23:00" }])

  const addTurno = () => {
    if (turnos.length >= 2) return
    setTurnos([...turnos, { start: "14:00", end: "19:00" }])
  }
  const removeTurno = (index: number) => {
    if (turnos.length <= 1) return
    setTurnos(turnos.filter((_, i) => i !== index))
  }
  const updateTurno = (index: number, field: 'start' | 'end', value: string) => {
    setTurnos(turnos.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const handleCreate = async () => {
    const valid = turnos.every(t => t.start && t.end)
    if (!valid) {
      toast.error('Cada turno debe tener hora de inicio y fin')
      return
    }

    try {
      for (const turno of turnos) {
        await createSchedule.mutateAsync({
          ...formData,
          startTime: turno.start,
          endTime: turno.end,
        })
      }
      toast.success(turnos.length > 1 ? `Se crearon ${turnos.length} horarios` : 'Horario creado')
      setFormData({
        serviceId: undefined,
        professionalId: undefined,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "23:00",
        isException: false,
      })
      setTurnos([{ start: "08:00", end: "23:00" }])
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
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">🕐 Horarios</h2>
          <p className="text-slate-400">Configura los horarios de apertura para reservas</p>
        </div>
        {!isCreating && (
          <Button 
            className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold" 
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" />
            Nuevo Horario
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <Card className="border-2 border-emerald-500/30 bg-slate-900/50">
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
                <Label className="text-slate-300">Espacio común (opcional)</Label>
                <select
                  value={formData.serviceId || ''}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value || undefined, professionalId: undefined })}
                  className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
                >
                  <option value="">Global</option>
                  {spaces?.filter(s => s.isActive).map((space) => (
                    <option key={space.id} value={space.id}>{space.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-300">Recurso (opcional)</Label>
                <select
                  value={formData.professionalId || ''}
                  onChange={(e) => setFormData({ ...formData, professionalId: e.target.value || undefined, serviceId: undefined })}
                  className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
                >
                  <option value="">Ninguno</option>
                  {courts?.filter(c => c.isActive).map((court) => (
                    <option key={court.id} value={court.id}>{court.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Día *</Label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-slate-300">Turnos (hasta 2 por día, formato 24h)</Label>
              {turnos.map((turno, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-xs text-slate-500 w-16">{turnos.length > 1 ? `Turno ${idx + 1}` : 'Horario'}</span>
                  <Input
                    type="time"
                    value={turno.start}
                    onChange={(e) => updateTurno(idx, 'start', e.target.value)}
                    className="flex-1 bg-slate-800 border-slate-700 text-white h-9"
                  />
                  <span className="text-slate-500">a</span>
                  <Input
                    type="time"
                    value={turno.end}
                    onChange={(e) => updateTurno(idx, 'end', e.target.value)}
                    className="flex-1 bg-slate-800 border-slate-700 text-white h-9"
                  />
                  {turnos.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/20" onClick={() => removeTurno(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {turnos.length < 2 && (
                <Button type="button" variant="outline" size="sm" onClick={addTurno} className="border-slate-700 text-slate-300">
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar otro turno
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate} 
                disabled={createSchedule.isPending}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
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
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-slate-700 text-slate-300">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de horarios por día */}
      {!schedules || schedules.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No hay horarios configurados</p>
            <p className="text-sm text-slate-400 mb-4">
              Tus clientes necesitan horarios para poder reservar
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Horario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {schedulesByDay.map(({ day, schedules: daySchedules }) => (
            <Card key={day.value} className={`bg-slate-900/50 border-slate-800 ${daySchedules.length === 0 ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{day.label}</span>
                  {daySchedules.length > 0 && (
                    <Badge className="bg-emerald-500 text-white">{daySchedules.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedules.length === 0 ? (
                  <p className="text-slate-400 text-sm">Sin horarios</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => {
                      const space = schedule.service || spaces?.find(s => s.id === schedule.serviceId)
                      const court = schedule.professional || courts?.find(c => c.id === schedule.professionalId)
                      const assignLabel = space?.name || court?.fullName || 'Global'
                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-2 bg-emerald-500/20 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2 text-white font-medium">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <span className="text-xs text-slate-500">{assignLabel}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-blue-900/30"
                              onClick={() => {
                                setEditingId(schedule.id)
                                setFormData({
                                  serviceId: schedule.serviceId || undefined,
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
          <Card className="w-full max-w-md bg-slate-900/50 border-slate-800">
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
                  <Label className="text-slate-300">Espacio común</Label>
                  <select
                    value={formData.serviceId || ''}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value || undefined, professionalId: undefined })}
                    className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
                  >
                    <option value="">Global</option>
                    {spaces?.filter(s => s.isActive).map((space) => (
                      <option key={space.id} value={space.id}>{space.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-slate-300">Recurso</Label>
                  <select
                    value={formData.professionalId || ''}
                    onChange={(e) => setFormData({ ...formData, professionalId: e.target.value || undefined, serviceId: undefined })}
                    className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
                  >
                    <option value="">Ninguno</option>
                    {courts?.filter(c => c.isActive).map((court) => (
                      <option key={court.id} value={court.id}>{court.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Día</Label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="mt-2 w-full h-10 px-3 bg-[#1a1a2e] border border-slate-700 rounded-md text-white"
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
                  <Label className="text-slate-300">Apertura</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Cierre</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">Para agregar más turnos al mismo día y espacio, guardá y luego creá un nuevo horario con el mismo día y espacio.</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdate(editingId, formData)}
                  disabled={updateSchedule.isPending}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
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
