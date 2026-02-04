"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowRight, Loader2, MessageCircle, Clock, Users, Sparkles } from "lucide-react"
import { useTenantBySlug, useProfessionals } from "@/lib/api/hooks"
import Link from "next/link"
import { useEffect } from "react"
import { apiClient } from "@/lib/api/client"

export default function TenantLandingPage() {
  const params = useParams()
  const router = useRouter()
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
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ccff00]/30 border-t-[#ccff00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-200/60">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎾</div>
          <h1 className="text-2xl font-bold text-white mb-2">Club no encontrado</h1>
          <p className="text-blue-300/50">El club de pádel que estás buscando no existe</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Hero Section - Simula cancha de pádel */}
      <div className="relative overflow-hidden">
        {/* Background con gradiente azul cancha */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a4d8c] via-[#1a5fa8] to-[#0a4d8c]" />
        
        {/* Líneas de cancha decorativas */}
        <div className="absolute inset-0">
          {/* Línea central vertical */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white/20" />
          {/* Línea horizontal superior */}
          <div className="absolute top-1/4 left-0 right-0 h-[2px] bg-white/10" />
          {/* Línea horizontal inferior */}
          <div className="absolute bottom-1/4 left-0 right-0 h-[2px] bg-white/10" />
          {/* Borde exterior */}
          <div className="absolute inset-6 md:inset-12 border-2 border-white/10 rounded-xl" />
        </div>
        
        {/* Efecto glassmorphism en los "cristales" */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-black/50 to-transparent" />
        
        {/* Paleta y pelota animadas - esquina derecha */}
        <div className="absolute top-8 right-8 md:top-12 md:right-20 hidden sm:block">
          {/* Paleta */}
          <div className="relative w-16 h-24 md:w-20 md:h-32 animate-[swing_2.5s_ease-in-out_infinite] origin-bottom">
            <svg viewBox="0 0 80 140" className="w-full h-full drop-shadow-2xl">
              {/* Mango */}
              <rect x="32" y="90" width="16" height="50" rx="4" fill="#1a1a2e" />
              <rect x="34" y="92" width="12" height="46" rx="3" fill="#2a2a3e" />
              {/* Grip lines */}
              <line x1="34" y1="100" x2="46" y2="100" stroke="#ccff00" strokeWidth="2" opacity="0.5" />
              <line x1="34" y1="110" x2="46" y2="110" stroke="#ccff00" strokeWidth="2" opacity="0.5" />
              <line x1="34" y1="120" x2="46" y2="120" stroke="#ccff00" strokeWidth="2" opacity="0.5" />
              <line x1="34" y1="130" x2="46" y2="130" stroke="#ccff00" strokeWidth="2" opacity="0.5" />
              {/* Cabeza de la paleta */}
              <ellipse cx="40" cy="45" rx="38" ry="44" fill="#0a4d8c" />
              <ellipse cx="40" cy="45" rx="34" ry="40" fill="url(#courtGradient)" />
              <defs>
                <linearGradient id="courtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a6fc2" />
                  <stop offset="100%" stopColor="#0a4d8c" />
                </linearGradient>
              </defs>
              {/* Agujeros */}
              {[0,1,2,3,4].map((row) => (
                [0,1,2,3].map((col) => (
                  <circle 
                    key={`hole-${row}-${col}`}
                    cx={18 + col * 15} 
                    cy={20 + row * 14} 
                    r="4" 
                    fill="#0a0a12"
                    opacity="0.7"
                  />
                ))
              ))}
              {/* Borde highlight */}
              <ellipse cx="40" cy="45" rx="34" ry="40" fill="none" stroke="#ccff00" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>
          {/* Pelota rebotando */}
          <div className="absolute -left-6 top-6 w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#ccff00] shadow-xl shadow-[#ccff00]/50 animate-[ballBounce_2.5s_ease-in-out_infinite]">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e6ff4d] to-[#99cc00]" />
              <div className="absolute w-full h-1 bg-white/30 top-1/2 -translate-y-1/2 rotate-45" />
            </div>
          </div>
        </div>
        
        {/* Segunda pelota decorativa abajo izquierda */}
        <div className="absolute bottom-24 left-12 w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#ccff00]/40 shadow-lg shadow-[#ccff00]/20 animate-pulse" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            {tenant.logoUrl ? (
              <img 
                src={tenant.logoUrl} 
                alt={tenant.name} 
                className="h-24 w-24 md:h-32 md:w-32 object-contain rounded-2xl shadow-2xl mx-auto mb-8 bg-white/10 backdrop-blur-sm p-3 border border-white/20"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20">
                <span className="text-5xl md:text-6xl">🎾</span>
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              {tenant.name}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/80 mb-10">
              Reserva tu cancha de pádel en segundos
            </p>
            
            <Link href={`/${tenantSlug}/book`}>
              <Button
                size="lg"
                className="text-lg px-10 py-7 bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a0a12] font-bold shadow-2xl shadow-[#ccff00]/30 hover:shadow-[#ccff00]/50 transition-all transform hover:scale-105 rounded-xl"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Reservar Cancha Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="#0a0a12"
            />
          </svg>
        </div>
      </div>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center bg-[#12121f] border-blue-900/30 hover:border-[#ccff00]/30 transition-all hover:shadow-lg hover:shadow-[#ccff00]/5">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0a4d8c]/30 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-[#ccff00]" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Reserva 24/7</h3>
              <p className="text-blue-300/50 text-sm">
                Reserva tu cancha en cualquier momento, desde cualquier lugar
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-[#12121f] border-blue-900/30 hover:border-[#ccff00]/30 transition-all hover:shadow-lg hover:shadow-[#ccff00]/5">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0a4d8c]/30 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-[#ccff00]" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Súper Rápido</h3>
              <p className="text-blue-300/50 text-sm">
                Ve toda la disponibilidad de un vistazo y reserva en segundos
              </p>
            </CardContent>
          </Card>

          <Card className="text-center bg-[#12121f] border-blue-900/30 hover:border-[#ccff00]/30 transition-all hover:shadow-lg hover:shadow-[#ccff00]/5">
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0a4d8c]/30 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#ccff00]" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Confirmación Instantánea</h3>
              <p className="text-blue-300/50 text-sm">
                Recibe tu confirmación por email inmediatamente
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Info Cards - Contacto y Ubicación */}
      {(tenant.phone || tenant.address) && (
        <section className="container mx-auto px-4 py-8 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">📍 Encuéntranos</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tenant.phone && (
              <Card className="bg-[#12121f] border-blue-900/30 hover:border-blue-700/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0a4d8c]/30 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-[#ccff00]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 text-white">WhatsApp</h3>
                      <a
                        href={`https://wa.me/${tenant.phone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium text-[#ccff00] hover:text-[#d4ff33] block transition-colors"
                      >
                        {tenant.phone}
                      </a>
                      <p className="text-sm text-blue-300/40 mt-1">
                        Toca para contactarnos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {tenant.address && (
              <Card className="bg-[#12121f] border-blue-900/30 hover:border-blue-700/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0a4d8c]/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#ccff00]" />
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
                        className="text-sm text-blue-200/70 hover:text-white block transition-colors"
                      >
                        {tenant.address}
                      </a>
                      <p className="text-sm text-blue-300/40 mt-1">
                        Toca para abrir en Google Maps
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <div className="py-16 bg-gradient-to-t from-[#0a4d8c]/20 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿Listo para jugar? 🎾
          </h2>
          <p className="text-blue-300/50 mb-8">
            Reserva tu cancha en menos de 30 segundos
          </p>
          <Link href={`/${tenantSlug}/book`}>
            <Button
              size="lg"
              className="text-lg px-10 py-7 bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a0a12] font-bold shadow-2xl shadow-[#ccff00]/30 hover:shadow-[#ccff00]/50 transition-all rounded-xl"
            >
              Ver Disponibilidad
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
