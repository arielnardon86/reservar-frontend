"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppointments } from "@/lib/api/hooks"
import { useTenantContext } from "@/lib/context/TenantContext"
import { useTenant } from "@/lib/api/hooks"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Link as LinkIcon,
  Copy,
  QrCode,
  Loader2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { format, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { es } from "date-fns/locale"

export function DashboardOverview() {
  const { tenant, tenantId } = useTenantContext()
  const { data: appointments, isLoading: loadingAppointments } = useAppointments()
  const { data: tenantData } = useTenant(tenantId || '')

  // Calcular estadísticas
  const today = new Date()
  const todayAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.startTime)
    return isSameDay(aptDate, today)
  }).length || 0

  const monthRevenue = appointments?.reduce((total, apt) => {
    const aptDate = new Date(apt.startTime)
    if (aptDate.getMonth() === today.getMonth() && apt.status === 'COMPLETED') {
      return total + (apt.service.price ? Number(apt.service.price) : 0)
    }
    return total
  }, 0) || 0

  // Clientes únicos
  const uniqueCustomers = new Set(appointments?.map(apt => apt.customerId)).size

  // Tasa de completado
  const completedAppointments = appointments?.filter(apt => apt.status === 'COMPLETED').length || 0
  const totalAppointments = appointments?.length || 0
  const completionRate = totalAppointments > 0 
    ? Math.round((completedAppointments / totalAppointments) * 100) 
    : 0

  // Datos para gráficos (últimos 7 días)
  const weekStart = startOfWeek(today, { locale: es })
  const weekDays = eachDayOfInterval({ start: weekStart, end: today })
  
  const weekData = weekDays.map(day => {
    const dayAppointments = appointments?.filter(apt => {
      const aptDate = new Date(apt.startTime)
      return isSameDay(aptDate, day)
    }) || []
    
    const dayRevenue = dayAppointments.reduce((total, apt) => {
      if (apt.status === 'COMPLETED' && apt.service.price) {
        return total + Number(apt.service.price)
      }
      return total
    }, 0)

    return {
      day: format(day, "EEE", { locale: es }),
      turnos: dayAppointments.length,
      ingresos: dayRevenue,
    }
  })

  const recentAppointments = appointments?.slice(0, 5) || []
  const tenantSlug = tenantData?.slug || tenant?.slug || 'tu-negocio'
  const tenantUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${tenantSlug}`
    : `turnero.com/${tenantSlug}`

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${tenantUrl}`)
    toast.success("Link copiado al portapapeles")
  }

  if (loadingAppointments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Link para Compartir - DESTACADO */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <LinkIcon className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-lg">Tu Turnero está Activo</h3>
              <p className="text-sm opacity-90">Comparte este link con tus clientes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={`https://${tenantUrl}`}
              readOnly
              className="bg-white text-gray-900 flex-1"
            />
            <Button variant="secondary" onClick={copyLink} size="icon">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon">
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reservas hoy
            </CardTitle>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments}</div>
            <p className="text-xs text-gray-500 mt-1">Reservas programadas para hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ingresos del Mes
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ingresos de turnos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes Totales
            </CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Clientes únicos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tasa de Completado
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {completedAppointments} de {totalAppointments} turnos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservas por día (esta semana)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="turnos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos Semanales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay turnos recientes
            </div>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => {
                const startDate = new Date(appointment.startTime)
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          appointment.status === "CONFIRMED"
                            ? "bg-green-500"
                            : appointment.status === "PENDING"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-semibold">
                          {appointment.customer.firstName} {appointment.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.service.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {format(startDate, "dd/MM/yyyy", { locale: es })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(startDate, "HH:mm")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
