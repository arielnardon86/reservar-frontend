"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppointments } from "@/lib/api/hooks"
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Briefcase,
  UserPlus,
  Repeat,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, startOfWeek, eachWeekOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { parseISO } from "date-fns"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function MetricsDashboard() {
  const { data: appointments, isLoading } = useAppointments()

  // Calcular métricas principales
  const metrics = useMemo(() => {
    if (!appointments) return null

    const now = new Date()
    const thisMonth = appointments.filter(apt => {
      const aptDate = parseISO(apt.startTime)
      return aptDate.getMonth() === now.getMonth() && 
             aptDate.getFullYear() === now.getFullYear()
    })

    const lastMonth = appointments.filter(apt => {
      const aptDate = parseISO(apt.startTime)
      const lastMonthDate = subMonths(now, 1)
      return aptDate.getMonth() === lastMonthDate.getMonth() && 
             aptDate.getFullYear() === lastMonthDate.getFullYear()
    })

    // Facturación
    const thisMonthRevenue = thisMonth
      .filter(apt => apt.status === "COMPLETED" && apt.service.price)
      .reduce((sum, apt) => sum + Number(apt.service.price), 0)

    const lastMonthRevenue = lastMonth
      .filter(apt => apt.status === "COMPLETED" && apt.service.price)
      .reduce((sum, apt) => sum + Number(apt.service.price), 0)

    const revenueChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    // Clientes únicos
    const thisMonthCustomers = new Set(thisMonth.map(apt => apt.customerId)).size
    const lastMonthCustomers = new Set(lastMonth.map(apt => apt.customerId)).size
    const customersChange = lastMonthCustomers > 0
      ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
      : 0

    // Turnos totales
    const thisMonthAppointments = thisMonth.length
    const lastMonthAppointments = lastMonth.length
    const appointmentsChange = lastMonthAppointments > 0
      ? ((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100
      : 0

    // Tasa de completado
    const completed = appointments.filter(apt => apt.status === "COMPLETED").length
    const total = appointments.length
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    // Clientes nuevos este mes
    const allCustomers = new Set(appointments.map(apt => apt.customerId))
    const thisMonthNewCustomers = thisMonth.filter(apt => {
      // Es nuevo si es su primer turno
      const firstAppointment = appointments
        .filter(a => a.customerId === apt.customerId)
        .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())[0]
      return firstAppointment?.id === apt.id && 
             parseISO(apt.startTime).getMonth() === now.getMonth()
    }).length

    // Tasa de recurrencia
    const recurringCustomers = Array.from(allCustomers).filter(customerId => {
      const customerAppointments = appointments.filter(apt => apt.customerId === customerId)
      return customerAppointments.length > 1
    }).length
    const recurrenceRate = allCustomers.size > 0 
      ? (recurringCustomers / allCustomers.size) * 100 
      : 0

    return {
      revenue: {
        current: thisMonthRevenue,
        change: revenueChange,
      },
      customers: {
        current: thisMonthCustomers,
        change: customersChange,
        new: thisMonthNewCustomers,
      },
      appointments: {
        current: thisMonthAppointments,
        change: appointmentsChange,
      },
      completionRate,
      recurrenceRate,
    }
  }, [appointments])

  // Datos para gráficos
  const monthlyData = useMemo(() => {
    if (!appointments) return []

    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.startTime)
        return aptDate.getMonth() === monthDate.getMonth() && 
               aptDate.getFullYear() === monthDate.getFullYear()
      })

      const revenue = monthAppointments
        .filter(apt => apt.status === "COMPLETED" && apt.service.price)
        .reduce((sum, apt) => sum + Number(apt.service.price), 0)

      months.push({
        month: format(monthDate, "MMM", { locale: es }),
        turnos: monthAppointments.length,
        ingresos: revenue,
        clientes: new Set(monthAppointments.map(apt => apt.customerId)).size,
      })
    }

    return months
  }, [appointments])

  const weeklyData = useMemo(() => {
    if (!appointments) return []

    const now = new Date()
    const weeks = eachWeekOfInterval(
      { start: subMonths(now, 1), end: now },
      { weekStartsOn: 1 }
    )

    return weeks.map(weekStart => {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.startTime)
        return aptDate >= weekStart && aptDate <= weekEnd
      })

      const revenue = weekAppointments
        .filter(apt => apt.status === "COMPLETED" && apt.service.price)
        .reduce((sum, apt) => sum + Number(apt.service.price), 0)

      return {
        semana: format(weekStart, "d MMM", { locale: es }),
        turnos: weekAppointments.length,
        ingresos: revenue,
      }
    })
  }, [appointments])

  const servicesData = useMemo(() => {
    if (!appointments) return []

    const serviceCounts: Record<string, number> = {}
    appointments.forEach(apt => {
      const serviceName = apt.service.name
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
    })

    return Object.entries(serviceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [appointments])

  const statusData = useMemo(() => {
    if (!appointments) return []

    const statusCounts: Record<string, number> = {}
    appointments.forEach(apt => {
      statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name === "CONFIRMED" ? "Confirmado" : 
            name === "PENDING" ? "Pendiente" :
            name === "COMPLETED" ? "Completado" :
            name === "CANCELLED" ? "Cancelado" : name,
      value,
    }))
  }, [appointments])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Facturación del Mes
            </CardTitle>
            <DollarSign className="w-4 h-4" style={{ color: '#C73870' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.revenue.current.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {metrics.revenue.change >= 0 ? (
                <ArrowUpRight className="w-3 h-3" style={{ color: '#C73870' }} />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              )}
              <span style={{ color: metrics.revenue.change >= 0 ? '#C73870' : '#ef4444' }}>
                {Math.abs(metrics.revenue.change).toFixed(1)}% vs mes anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes del Mes
            </CardTitle>
            <Users className="w-4 h-4" style={{ color: '#6E52FF' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customers.current}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {metrics.customers.change >= 0 ? (
                <ArrowUpRight className="w-3 h-3" style={{ color: '#C73870' }} />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              )}
              <span style={{ color: metrics.customers.change >= 0 ? '#C73870' : '#ef4444' }}>
                {Math.abs(metrics.customers.change).toFixed(1)}% vs mes anterior
              </span>
              <span className="text-gray-500 ml-2">
                ({metrics.customers.new} nuevos)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Turnos del Mes
            </CardTitle>
            <Calendar className="w-4 h-4" style={{ color: '#6E52FF' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.appointments.current}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {metrics.appointments.change >= 0 ? (
                <ArrowUpRight className="w-3 h-3" style={{ color: '#C73870' }} />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              )}
              <span style={{ color: metrics.appointments.change >= 0 ? '#C73870' : '#ef4444' }}>
                {Math.abs(metrics.appointments.change).toFixed(1)}% vs mes anterior
              </span>
            </div>
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
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">De todos los turnos</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tasa de Recurrencia
            </CardTitle>
            <Repeat className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recurrenceRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Clientes que vuelven</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes Nuevos
            </CardTitle>
            <UserPlus className="w-4 h-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customers.new}</div>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facturación Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Facturación Mensual (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="ingresos" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crecimiento de Turnos */}
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Turnos (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="turnos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Turnos"
                />
                <Line
                  type="monotone"
                  dataKey="clientes"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Clientes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Servicios Más Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Estado de Turnos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias Semanales */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias Semanales (Último mes)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="turnos"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Turnos"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ingresos"
                stroke="#10b981"
                strokeWidth={2}
                name="Ingresos ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


