"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AppointmentsCalendar } from "./AppointmentsCalendar"
import { MetricsDashboard } from "./MetricsDashboard"
import { AppointmentsManager } from "./AppointmentsManager"
import { ServicesManager } from "./ServicesManager"
import { SettingsPanel } from "./SettingsPanel"
import { SchedulesManager } from "./SchedulesManager"
import { SuperAdminDashboard } from "./SuperAdminDashboard"
import { TenantProvider, useTenantContext } from "@/lib/context/TenantContext"
import { useAuth } from "@/lib/context/AuthContext"
import {
  Calendar,
  Settings,
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

type ViewType = "calendar" | "metrics" | "appointments" | "services" | "schedules" | "settings"

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando información del edificio...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: "calendar" as ViewType, label: "Gestión", icon: CalendarDays },
    { id: "metrics" as ViewType, label: "Métricas", icon: BarChart3 },
    { id: "appointments" as ViewType, label: "Reservas", icon: Calendar },
    { id: "services" as ViewType, label: "Espacios", icon: Clock },
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
      case "schedules":
        return <SchedulesManager />
      case "settings":
        return <SettingsPanel />
      default:
        return <AppointmentsCalendar />
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <Link href="/landing" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">Reserv<span className="text-emerald-400">Ar</span></span>
                  <p className="text-[10px] text-slate-500">Panel admin</p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

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
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-emerald-400")} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            {user && (
              <div className="mb-3 px-2">
                <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                <p className="text-xs text-slate-500">{user.tenant?.name || tenant?.name}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full gap-2 bg-transparent border-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/40"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    {menuItems.find((item) => item.id === activeView)?.label || "Panel"}
                  </h1>
                  <p className="text-sm text-slate-400">Gestioná tu edificio y espacios comunes</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-400">En línea</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950 min-h-screen">
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

  // Super admin ve solo Métricas y Configuración
  if (user?.isSuperAdmin) {
    return <SuperAdminDashboard />
  }

  // Usar tenantId del usuario autenticado o del URL
  const tenantIdFromUrl = searchParams?.get('tenantId')
  const tenantId = user?.tenantId || tenantIdFromUrl

  return (
    <TenantProvider initialTenantId={tenantId}>
      <AdminDashboardContent />
    </TenantProvider>
  )
}
