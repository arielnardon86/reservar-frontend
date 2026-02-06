"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  useAppointments, 
  useUpdateAppointment, 
  useDeleteAppointment 
} from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AppointmentStatus } from "@/lib/api/types"

export function AppointmentsManager() {
  const { data: appointments, isLoading } = useAppointments()
  const updateAppointment = useUpdateAppointment()
  const deleteAppointment = useDeleteAppointment()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState<string | null>(null)

  const getStatusBadge = (status: AppointmentStatus) => {
    const variants = {
      CONFIRMED: { variant: "default" as const, label: "Confirmado", icon: CheckCircle },
      PENDING: { variant: "secondary" as const, label: "Pendiente", icon: Clock },
      CANCELLED: { variant: "destructive" as const, label: "Cancelado", icon: XCircle },
      COMPLETED: { variant: "default" as const, label: "Completado", icon: CheckCircle },
      NO_SHOW: { variant: "destructive" as const, label: "No asistió", icon: XCircle },
    }
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleConfirm = async (id: string) => {
    try {
      await updateAppointment.mutateAsync({
        id,
        data: { status: AppointmentStatus.CONFIRMED, isConfirmed: true },
      })
      toast.success('Turno confirmado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al confirmar turno')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar este turno?')) return

    try {
      await updateAppointment.mutateAsync({
        id,
        data: { 
          status: AppointmentStatus.CANCELLED,
          cancelledAt: new Date().toISOString(),
          cancelledBy: 'admin',
        },
      })
      toast.success('Turno cancelado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al cancelar turno')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return

    try {
      await deleteAppointment.mutateAsync(id)
      toast.success('Turno eliminado')
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar turno')
    }
  }

  // Eliminar turnos duplicados basándose en una combinación única de campos
  // Usar un Map para mejor rendimiento y garantizar unicidad
  type AppointmentType = NonNullable<typeof appointments>[number]
  const appointmentsMap = new Map<string, AppointmentType>()
  
  appointments?.forEach((appointment) => {
    // Crear una clave única basada en: customer, service, professional, startTime (redondeado a minuto)
    const startTime = new Date(appointment.startTime)
    const roundedTime = new Date(startTime)
    roundedTime.setSeconds(0, 0) // Redondear a minutos para capturar duplicados cercanos
    
    const uniqueKey = `${appointment.customerId}-${appointment.serviceId}-${appointment.professionalId}-${roundedTime.toISOString()}`
    
    // Si no existe un turno con esta clave, agregarlo
    // Si existe, mantener el primero (más antiguo)
    if (!appointmentsMap.has(uniqueKey)) {
      appointmentsMap.set(uniqueKey, appointment)
    } else {
      // Si ya existe, mantener el que tenga el ID más antiguo (menor)
      const existing = appointmentsMap.get(uniqueKey)!
      if (appointment.id < existing.id) {
        appointmentsMap.set(uniqueKey, appointment)
      }
    }
  })
  
  const uniqueAppointments = Array.from(appointmentsMap.values())

  const filteredAppointments = uniqueAppointments.filter((appointment) => {
    if (filterDate) {
      const aptDate = format(new Date(appointment.startTime), 'yyyy-MM-dd')
      if (aptDate !== filterDate) return false
    }
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      appointment.customer.firstName.toLowerCase().includes(search) ||
      appointment.customer.lastName.toLowerCase().includes(search) ||
      appointment.customer.email.toLowerCase().includes(search) ||
      appointment.service.name.toLowerCase().includes(search) ||
      (appointment.professional?.fullName?.toLowerCase().includes(search)) ||
      (appointment.departamento?.toLowerCase().includes(search)) ||
      (appointment.piso?.toLowerCase().includes(search))
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de reservas</h2>
          <p className="text-slate-400">Administra todos los turnos agendados</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente, email, espacio, depto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm text-slate-400 whitespace-nowrap">Ver por día:</label>
              <Input
                type="date"
                value={filterDate || ''}
                onChange={(e) => setFilterDate(e.target.value || null)}
                className="w-40 bg-slate-800 border-slate-700 text-white"
              />
              {filterDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterDate(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Ver todos
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Reservas ({filteredAppointments.length}){filterDate ? ` · ${format(new Date(filterDate), "d 'de' MMMM", { locale: es })}` : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {filterDate ? `No hay reservas el ${format(new Date(filterDate), "d 'de' MMMM", { locale: es })}` : searchTerm ? 'No se encontraron turnos' : 'No hay turnos agendados aún'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Cliente</TableHead>
                  <TableHead className="text-slate-400">Servicio</TableHead>
                  <TableHead className="text-slate-400">Depto / Piso</TableHead>
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400">Hora</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const startDate = new Date(appointment.startTime)
                  const endDate = new Date(appointment.endTime)
                  
                  return (
                    <TableRow key={appointment.id} className="border-slate-800 text-slate-200">
                      <TableCell className="font-medium">
                        <div>{appointment.customer.firstName} {appointment.customer.lastName}</div>
                        <div className="text-xs text-slate-500">{appointment.customer.email}</div>
                      </TableCell>
                      <TableCell>{appointment.service.name}</TableCell>
                      <TableCell className="text-slate-400">
                        {appointment.departamento || appointment.piso
                          ? `${appointment.departamento || '-'} / ${appointment.piso || '-'}`
                          : appointment.professional?.fullName ?? '-'}
                      </TableCell>
                      <TableCell>
                        {format(startDate, "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => handleConfirm(appointment.id)}>
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            {appointment.status !== 'CANCELLED' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleCancel(appointment.id)}
                              >
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(appointment.id)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
