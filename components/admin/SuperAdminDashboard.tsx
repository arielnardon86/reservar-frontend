"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { apiClient } from "@/lib/api/client"
import { superAdminApi } from "@/lib/api/endpoints"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Calendar,
  Users,
  Key,
  Power,
  PowerOff,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/components/ui/utils"
import Link from "next/link"
import { toast } from "sonner"

type ViewType = "metrics" | "config"

interface SystemStats {
  tenants: { total: number; active: number; inactive: number }
  users: { total: number }
  appointments: { total: number }
  customers: { total: number }
  services: { total: number }
}

interface TenantWithStats {
  id: string
  slug: string
  name: string
  email: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt: string
  stats: { users: number; services: number; appointments: number; customers: number }
}

function SuperAdminDashboardContent() {
  const [activeView, setActiveView] = useState<ViewType>("metrics")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, accessToken, logout } = useAuth()

  const [stats, setStats] = useState<SystemStats | null>(null)
  const [tenants, setTenants] = useState<TenantWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    apiClient.setAuthToken(accessToken)
  }, [accessToken])

  const loadData = async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const [statsData, tenantsData] = await Promise.all([
        superAdminApi.getStats(),
        superAdminApi.getTenants(),
      ])
      setStats(statsData)
      setTenants(tenantsData)
    } catch (error: any) {
      toast.error(error?.message || "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [accessToken])

  const handleActivate = async (tenantId: string) => {
    setActionLoading(tenantId)
    try {
      await superAdminApi.activateTenant(tenantId)
      toast.success("Edificio activado")
      loadData()
    } catch (error: any) {
      toast.error(error?.message || "Error al activar")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeactivate = async (tenantId: string) => {
    setActionLoading(tenantId)
    try {
      await superAdminApi.deactivateTenant(tenantId)
      toast.success("Edificio inactivado")
      loadData()
    } catch (error: any) {
      toast.error(error?.message || "Error al inactivar")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (tenantId: string, tenantName: string) => {
    if (!confirm(`¿Eliminar permanentemente "${tenantName}"? Esta acción no se puede deshacer.`))
      return
    setActionLoading(tenantId)
    try {
      await superAdminApi.deleteTenant(tenantId)
      toast.success("Edificio eliminado")
      loadData()
    } catch (error: any) {
      toast.error(error?.message || "Error al eliminar")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPasswords = async (tenantId: string, tenantName: string) => {
    if (!confirm(`¿Blanquear contraseñas de todos los usuarios de "${tenantName}"? Se generarán nuevas contraseñas que deberás comunicar manualmente.`))
      return
    setActionLoading(tenantId)
    try {
      const res = await superAdminApi.resetTenantPasswords(tenantId)
      const count = res.resetUsers?.length ?? 0
      if (count > 0) {
        const usersList = res.resetUsers.map((u: any) => `${u.email}: ${u.newPassword}`).join("\n")
        alert(`Contraseñas reseteadas. Nuevas contraseñas:\n\n${usersList}\n\nGuárdalas y comunícalas a cada usuario.`)
      }
      toast.success(res.message || "Contraseñas reseteadas")
    } catch (error: any) {
      toast.error(error?.message || "Error al resetear contraseñas")
    } finally {
      setActionLoading(null)
    }
  }

  const menuItems = [
    { id: "metrics" as ViewType, label: "Métricas", icon: BarChart3 },
    { id: "config" as ViewType, label: "Configuración", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex">
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
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">Super Admin</span>
                  <p className="text-[10px] text-slate-500">Panel central</p>
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
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-amber-400")} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            {user && (
              <div className="mb-3 px-2">
                <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                <p className="text-xs text-amber-400/80">Super Administrador</p>
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
                    {activeView === "metrics" ? "Métricas" : "Configuración"}
                  </h1>
                  <p className="text-sm text-slate-400">
                    {activeView === "metrics"
                      ? "Reservas y estadísticas globales"
                      : "Edificios y usuarios"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-950 min-h-screen">
          <div className="p-4 sm:p-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              </div>
            ) : activeView === "metrics" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400">Total reservas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-amber-400">
                        {stats?.appointments?.total ?? 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">En todos los edificios</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400">Edificios</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-white">
                        {stats?.tenants?.total ?? 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats?.tenants?.active ?? 0} activos
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400">Usuarios admin</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-white">
                        {stats?.users?.total ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 border-slate-800">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-slate-400">Clientes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-white">
                        {stats?.customers?.total ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="bg-slate-900/80 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-400" />
                      Edificios creados
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Ver, inactivar, activar o eliminar edificios. Blanquear contraseñas de usuarios.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tenants.length === 0 ? (
                      <p className="text-slate-400 py-8 text-center">No hay edificios registrados</p>
                    ) : (
                      <div className="space-y-3">
                        {tenants.map((t) => (
                          <div
                            key={t.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                          >
                            <div>
                              <p className="font-semibold text-white">{t.name}</p>
                              <p className="text-sm text-slate-400">{t.email}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {t.stats.appointments} reservas · {t.stats.services} espacios · {t.stats.users} usuarios
                              </p>
                              <span
                                className={cn(
                                  "inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium",
                                  t.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600/50 text-slate-400"
                                )}
                              >
                                {t.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {t.isActive ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                                  onClick={() => handleDeactivate(t.id)}
                                  disabled={actionLoading === t.id}
                                >
                                  {actionLoading === t.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <PowerOff className="w-4 h-4 mr-1" />
                                  )}
                                  Inactivar
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                                  onClick={() => handleActivate(t.id)}
                                  disabled={actionLoading === t.id}
                                >
                                  {actionLoading === t.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Power className="w-4 h-4 mr-1" />
                                  )}
                                  Activar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-500/50 text-slate-300 hover:bg-slate-700/50"
                                onClick={() => handleResetPasswords(t.id, t.name)}
                                disabled={actionLoading === t.id}
                                title="Blanquear contraseñas de usuarios de este edificio"
                              >
                                {actionLoading === t.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Key className="w-4 h-4 mr-1" />
                                )}
                                Blanquear claves
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                onClick={() => handleDelete(t.id, t.name)}
                                disabled={actionLoading === t.id}
                              >
                                {actionLoading === t.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-1" />
                                )}
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export function SuperAdminDashboard() {
  return <SuperAdminDashboardContent />
}
