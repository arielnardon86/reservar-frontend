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
  const { tenantId, isLoading, tenant } = useTenantContext()
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
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ccff00]/30 border-t-[#ccff00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-200/60">Cargando información del negocio...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: "calendar" as ViewType, label: "Gestión", icon: CalendarDays },
    { id: "metrics" as ViewType, label: "Métricas", icon: BarChart3 },
    { id: "appointments" as ViewType, label: "Reservas", icon: Calendar },
    { id: "services" as ViewType, label: "Duración y Precios", icon: Clock },
    { id: "professionals" as ViewType, label: "Canchas", icon: Users },
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a4d8c] via-[#1565a8] to-[#1a6fc2] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center shadow-lg border border-blue-700/30">
                  <span className="text-xl">🎾</span>
                </div>
                <div>
                  <span className="font-bold text-white text-sm">PadelTurn</span>
                  <p className="text-[10px] text-blue-300/40">Admin Panel</p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-blue-200/70 hover:text-white hover:bg-blue-900/30"
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
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-[#ccff00]")} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10">
            {user && (
              <div className="mb-3 px-2">
                <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                <p className="text-xs text-blue-300/40">{user.tenant?.name || tenant?.name}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full gap-2 bg-transparent border-white/20 text-white/70 hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/40"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden text-blue-200/70 hover:text-white hover:bg-blue-900/30"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    {menuItems.find((item) => item.id === activeView)?.label || "Panel"}
                  </h1>
                  <p className="text-sm text-white/70">Gestiona tu club de pádel</p>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span className="text-xs text-white/70">En línea</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a4d8c] via-[#1565a8] to-[#1a6fc2] min-h-screen">
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
