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

// Misma UI que onboarding: formato 24 h, opciones cada 30 min
const HOUR_OPTIONS_24: { value: string; label: string }[] = []
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, "0")
  HOUR_OPTIONS_24.push({ value: `${hh}:00`, label: `${hh}:00` })
  HOUR_OPTIONS_24.push({ value: `${hh}:30`, label: `${hh}:30` })
}
const END_HOUR_OPTIONS_24 = [...HOUR_OPTIONS_24, { value: "23:59", label: "23:59" }]
function toStartOption(v: string) {
  return HOUR_OPTIONS_24.some((o) => o.value === v) ? v : "08:00"
}
function toEndOption(v: string) {
  return END_HOUR_OPTIONS_24.some((o) => o.value === v) ? v : "23:00"
}

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
  const [applyToAllDays, setApplyToAllDays] = useState(false)

  const addTurno = () => {
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
      const daysToCreate = applyToAllDays ? [0, 1, 2, 3, 4, 5, 6] : [formData.dayOfWeek]
      let created = 0
      for (const dayOfWeek of daysToCreate) {
        for (const turno of turnos) {
          await createSchedule.mutateAsync({
            ...formData,
            dayOfWeek,
            startTime: turno.start,
            endTime: turno.end,
          })
          created++
        }
      }
      toast.success(created > 1 ? `Se crearon ${created} horarios` : 'Horario creado')
      setFormData({
        serviceId: undefined,
        professionalId: undefined,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "23:00",
        isException: false,
      })
      setTurnos([{ start: "08:00", end: "23:00" }])
      setApplyToAllDays(false)
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Horarios de los espacios</h2>
          <p className="text-slate-400 text-sm">Apertura y cierre por día en formato 24 h. Podés definir todos los turnos que necesites por día.</p>
        </div>
      </div>
      {!isCreating && (
        <div className="flex justify-end">
          <Button 
            className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl" 
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4" />
            Nuevo horario
          </Button>
        </div>
      )}

      {/* Formulario de creación - misma UI que onboarding */}
      {isCreating && (
        <Card className="border-2 border-emerald-500/30 bg-slate-900/50 rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Nuevo horario</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200/50 bg-amber-500/10 px-3 py-2 space-y-1">
              <p className="text-xs font-medium text-amber-200">Cierre a la madrugada</p>
              <p className="text-xs text-slate-400">Si el cierre es anterior a la apertura (ej. apertura 22:00, cierre 02:00), se considera abierto hasta la madrugada del día siguiente.</p>
            </div>
            <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
              <span>Formato 24 h</span>
              <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded">00:00 – 23:59</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={applyToAllDays}
                onChange={(e) => setApplyToAllDays(e.target.checked)}
                className="rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
              />
              <span className="text-sm text-slate-300">Aplicar mismo horario y turnos a todos los días</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Espacio común (opcional)</Label>
                <select
                  value={formData.serviceId || ''}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value || undefined, professionalId: undefined })}
                  className="mt-2 w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-emerald-500"
                >
                  <option value="">Global (todos los espacios)</option>
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
                  className="mt-2 w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-emerald-500"
                >
                  <option value="">Ninguno</option>
                  {courts?.filter(c => c.isActive).map((court) => (
                    <option key={court.id} value={court.id}>{court.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            {!applyToAllDays && (
              <div>
                <Label className="text-slate-300">Día *</Label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="mt-2 w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-emerald-500"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-3">
              <Label className="text-slate-300">Turnos (formato 24 h)</Label>
              {turnos.map((turno, idx) => (
                <div key={idx} className="flex items-center gap-2 flex-wrap gap-y-2 p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 w-16 shrink-0">
                    {turnos.length > 1 ? `Turno ${idx + 1}` : 'Horario'}
                  </span>
                  <select
                    value={toStartOption(turno.start)}
                    onChange={(e) => updateTurno(idx, 'start', e.target.value)}
                    className="h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-white focus:border-emerald-500 w-24 font-mono"
                  >
                    {HOUR_OPTIONS_24.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <span className="text-slate-500 text-sm">a</span>
                  <select
                    value={toEndOption(turno.end)}
                    onChange={(e) => updateTurno(idx, 'end', e.target.value)}
                    className="h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-white focus:border-emerald-500 w-24 font-mono"
                  >
                    {END_HOUR_OPTIONS_24.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {turnos.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTurno(idx)} className="text-red-500 hover:text-red-400 hover:bg-red-500/20 h-9">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTurno} className="border-2 border-dashed border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-medium rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Agregar turno
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreate} 
                disabled={createSchedule.isPending}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl"
              >
                {createSchedule.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear horario'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="border-slate-700 text-slate-300 rounded-xl">
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
              <div className="flex items-center gap-2">
                <Label className="text-slate-300 w-16">Horario</Label>
                <select
                  value={toStartOption(formData.startTime)}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-white focus:border-emerald-500 w-24 font-mono"
                >
                  {HOUR_OPTIONS_24.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span className="text-slate-500 text-sm">a</span>
                <select
                  value={toEndOption(formData.endTime)}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-white focus:border-emerald-500 w-24 font-mono"
                >
                  {END_HOUR_OPTIONS_24.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
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
