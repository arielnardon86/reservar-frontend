"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AppointmentsCalendar } from "./AppointmentsCalendar"
import { MetricsDashboard } from "./MetricsDashboard"
import { AppointmentsManager } from "./AppointmentsManager"
import { ServicesManager } from "./ServicesManager"
import { ProfessionalsManager } from "./ProfessionalsManager"
import { SettingsPanel } from "./SettingsPanel"
import { SchedulesManager } from "./SchedulesManager"
import { TenantProvider, useTenantContext } from "@/lib/context/TenantContext"
import { useAuth } from "@/lib/context/AuthContext"
import {
  Calendar,
  Briefcase,
  Users,
  Settings,
  Loader2,
  Clock,
  LogOut,
  BarChart3,
  CalendarDays,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/utils"
import Link from "next/link"

type ViewType = "calendar" | "metrics" | "appointments" | "services" | "professionals" | "schedules" | "settings"

function AdminDashboardContent() {
  const [activeView, setActiveView] = useState<ViewType>("calendar")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { tenantId, isLoading } = useTenantContext()
  const { user, logout } = useAuth()

  // Cerrar sidebar en mobile cuando cambia la vista
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [activeView])

  // Mostrar loading mientras se carga el tenant
  if (isLoading || !tenantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#6E52FF' }} />
          <p className="text-gray-600">Cargando información del negocio...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: "calendar" as ViewType, label: "Gestión", icon: CalendarDays },
    { id: "metrics" as ViewType, label: "Métricas", icon: BarChart3 },
    { id: "appointments" as ViewType, label: "Lista de Turnos", icon: Calendar },
    { id: "services" as ViewType, label: "Servicios", icon: Briefcase },
    { id: "professionals" as ViewType, label: "Profesionales", icon: Users },
    { id: "schedules" as ViewType, label: "Horarios", icon: Clock },
    { id: "settings" as ViewType, label: "Configuración", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeView) {
      case "calendar":
        return <AppointmentsCalendar />
      case "metrics":
        return <MetricsDashboard />
      case "appointments":
        return <AppointmentsManager />
      case "services":
        return <ServicesManager />
      case "professionals":
        return <ProfessionalsManager />
      case "schedules":
        return <SchedulesManager />
      case "settings":
        return <SettingsPanel />
      default:
        return <AppointmentsCalendar />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <img 
                  src="/agendalo-logo.svg" 
                  alt="slotia" 
                  className="h-10 w-auto"
                />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeView === item.id
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  style={activeView === item.id ? { backgroundColor: '#6E52FF' } : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            {user && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">{user.tenant?.name}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {menuItems.find((item) => item.id === activeView)?.label || "Panel"}
                  </h1>
                  <p className="text-sm text-gray-600">Gestiona tu negocio de manera eficiente</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  // Usar tenantId del usuario autenticado o del URL
  const tenantIdFromUrl = searchParams?.get('tenantId')
  const tenantId = user?.tenantId || tenantIdFromUrl

  return (
    <TenantProvider initialTenantId={tenantId}>
      <AdminDashboardContent />
    </TenantProvider>
  )
}
