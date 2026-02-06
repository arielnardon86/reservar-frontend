"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowRight, MessageCircle, Clock, Users, Sparkles, Building2 } from "lucide-react"
import { useTenantBySlug } from "@/lib/api/hooks"
import Link from "next/link"
import { useEffect } from "react"
import { apiClient } from "@/lib/api/client"

export default function TenantLandingPage() {
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string
  const { data: tenant, isLoading } = useTenantBySlug(tenantSlug || '')

  // Configurar tenantId cuando se carga el tenant
  useEffect(() => {
    if (tenant?.id) {
      apiClient.setTenantId(tenant.id)
    }
  }, [tenant])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-white mb-2">Edificio no encontrado</h1>
          <p className="text-slate-400">El edificio o consorcio que estás buscando no existe</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero - misma paleta que landing */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute top-24 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-700/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 md:top-14 md:right-16 hidden sm:block">
          <Building2 className="w-16 h-16 md:w-20 md:h-20 text-slate-700" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            {tenant.logoUrl ? (
              <img 
                src={tenant.logoUrl} 
                alt={tenant.name} 
                className="h-24 w-24 md:h-32 md:w-32 object-contain rounded-2xl shadow-2xl mx-auto mb-8 bg-white/5 backdrop-blur-sm p-3 border border-slate-700/50"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Building2 className="w-12 h-12 md:w-16 md:h-16 text-emerald-400" />
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              {tenant.name}
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 mb-10">
              Reservá espacios comunes en segundos
            </p>
            <Link href={`/${tenantSlug}/book`}>
              <Button
                size="lg"
                className="text-lg px-10 py-7 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-2xl shadow-emerald-500/20 transition-all transform hover:scale-105 rounded-xl"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Reservar espacio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#020617" />
          </svg>
        </div>
      </div>

      {/* Features - cards estilo landing */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Reserva 24/7</h3>
              <p className="text-slate-400 text-sm">
                Reservá espacios comunes en cualquier momento, desde cualquier lugar
              </p>
            </CardContent>
          </Card>
          <Card className="text-center bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Súper rápido</h3>
              <p className="text-slate-400 text-sm">
                Mirá la disponibilidad de un vistazo y reservá en segundos
              </p>
            </CardContent>
          </Card>
          <Card className="text-center bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Confirmación instantánea</h3>
              <p className="text-slate-400 text-sm">
                Recibí tu confirmación por email al instante
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {(tenant.phone || tenant.address) && (
        <section className="container mx-auto px-4 py-8 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">📍 Encuéntranos</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tenant.phone && (
              <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                      <MessageCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 text-white">WhatsApp</h3>
                      <a
                        href={`https://wa.me/${tenant.phone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium text-emerald-400 hover:text-emerald-300 block transition-colors"
                      >
                        {tenant.phone}
                      </a>
                      <p className="text-sm text-slate-500 mt-1">Toca para contactarnos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {tenant.address && (
              <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                      <MapPin className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 text-white">Dirección</h3>
                      <a
                        href={
                          tenant.latitude && tenant.longitude
                            ? `https://www.google.com/maps?q=${tenant.latitude},${tenant.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.address || '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-300 hover:text-white block transition-colors"
                      >
                        {tenant.address}
                      </a>
                      <p className="text-sm text-slate-500 mt-1">Toca para abrir en Google Maps</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      <div className="py-16 border-t border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿Listo para reservar? 🏢
          </h2>
          <p className="text-slate-400 mb-8">
            Reservá tu espacio en menos de 30 segundos
          </p>
          <Link href={`/${tenantSlug}/book`}>
            <Button
              size="lg"
              className="text-lg px-10 py-7 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 rounded-xl"
            >
              Ver disponibilidad
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
