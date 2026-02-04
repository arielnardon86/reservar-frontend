"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Calendar, Users, TrendingUp, ArrowRight, Star, LogIn, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center shadow-lg border border-blue-700/30">
              <span className="text-xl">🎾</span>
            </div>
            <span className="font-bold text-white text-lg">PadelTurn</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-blue-200/70 hover:text-white hover:bg-blue-900/30">
              <LogIn className="w-4 h-4 mr-2" />
              Soy Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative">
        {/* Background decoration - court lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#0a4d8c]/10" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[#0a4d8c]/10" />
        </div>
        
        {/* Paleta y pelota animadas */}
        <div className="absolute top-16 right-16 md:right-32">
          {/* Paleta */}
          <div className="relative w-20 h-32 animate-[swing_2s_ease-in-out_infinite] origin-bottom">
            <svg viewBox="0 0 80 140" className="w-full h-full drop-shadow-lg">
              {/* Mango */}
              <rect x="32" y="90" width="16" height="50" rx="4" fill="#1a1a2e" />
              <rect x="34" y="92" width="12" height="46" rx="3" fill="#2a2a3e" />
              {/* Grip lines */}
              <line x1="34" y1="100" x2="46" y2="100" stroke="#0a4d8c" strokeWidth="2" />
              <line x1="34" y1="110" x2="46" y2="110" stroke="#0a4d8c" strokeWidth="2" />
              <line x1="34" y1="120" x2="46" y2="120" stroke="#0a4d8c" strokeWidth="2" />
              <line x1="34" y1="130" x2="46" y2="130" stroke="#0a4d8c" strokeWidth="2" />
              {/* Cabeza de la paleta */}
              <ellipse cx="40" cy="45" rx="38" ry="44" fill="#0a4d8c" />
              <ellipse cx="40" cy="45" rx="34" ry="40" fill="#1a6fc2" />
              {/* Agujeros */}
              {[...Array(5)].map((_, row) => (
                [...Array(4)].map((_, col) => (
                  <circle 
                    key={`${row}-${col}`}
                    cx={18 + col * 15} 
                    cy={20 + row * 14} 
                    r="4" 
                    fill="#0a0a12"
                    opacity="0.6"
                  />
                ))
              ))}
              {/* Borde highlight */}
              <ellipse cx="40" cy="45" rx="34" ry="40" fill="none" stroke="#ccff00" strokeWidth="2" opacity="0.3" />
            </svg>
          </div>
          {/* Pelota */}
          <div className="absolute -left-4 top-8 w-8 h-8 rounded-full bg-[#ccff00] shadow-lg shadow-[#ccff00]/40 animate-[bounce_2s_ease-in-out_infinite]">
            {/* Línea de la pelota */}
            <div className="absolute inset-1 rounded-full border-2 border-[#b8e600] opacity-50" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 60% 100%, 40% 100%)' }} />
          </div>
        </div>
        
        {/* Segunda pelota decorativa */}
        <div className="absolute bottom-20 left-20 w-6 h-6 rounded-full bg-[#ccff00]/30 blur-sm animate-pulse" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a4d8c]/20 border border-blue-900/30 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-sm text-blue-200/70">Sistema de turnos para canchas de pádel</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Gestiona tu club de pádel
            <span className="text-[#ccff00]"> en minutos</span>
          </h1>
          <p className="text-xl text-blue-200/60 mb-10 max-w-2xl mx-auto">
            Reduce llamadas telefónicas, visualiza todas las canchas de un vistazo y permite que tus clientes reserven 24/7.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 justify-center">
              <Link href="/onboarding">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a0a12] font-bold shadow-lg shadow-[#ccff00]/20"
                >
                  Comenzar gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/padel-club">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-blue-900/40 text-blue-200/70 hover:bg-blue-900/20 hover:text-white">
                  Ver demo
                </Button>
              </Link>
            </div>
            <Link href="/login" className="text-sm text-blue-300/50 hover:text-white transition-colors mt-2">
              ¿Ya eres administrador? <span className="text-[#ccff00] font-medium">Iniciar sesión</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-[#12121f] border-blue-900/30 hover:border-[#ccff00]/20 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#0a4d8c]/30 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-[#ccff00]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Reservas 24/7</h3>
              <p className="text-blue-300/50">
                Tus clientes reservan online a cualquier hora. Ahorra hasta 2 horas diarias en llamadas.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#12121f] border-blue-900/30 hover:border-[#ccff00]/20 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#0a4d8c]/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#ccff00]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Más ocupación</h3>
              <p className="text-blue-300/50">
                Visualiza todas las canchas de un vistazo. No pierdas reservas por no poder atender.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#12121f] border-blue-900/30 hover:border-[#ccff00]/20 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-[#0a4d8c]/30 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#ccff00]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Súper rápido</h3>
              <p className="text-blue-300/50">
                Reserva en segundos. Timeline visual para elegir cancha, hora y duración de un vistazo.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Todo lo que necesitas en un solo lugar
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Configuración en menos de 10 minutos",
              "Personalización completa (logo, colores)",
              "Gestión de múltiples canchas",
              "Horarios flexibles y configurables",
              "Turnos de 60, 90 o 120 minutos",
              "Dashboard con reportes y estadísticas",
              "Base de clientes automática",
              "Integración con calendarios (.ics)",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3 bg-[#12121f] p-4 rounded-xl border border-blue-900/20">
                <div className="w-5 h-5 rounded-full bg-[#ccff00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#ccff00]" />
                </div>
                <span className="text-blue-200/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center bg-[#12121f] p-8 rounded-2xl border border-blue-900/30">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#ccff00] text-[#ccff00]" />
            ))}
          </div>
          <p className="text-lg text-blue-200/70 mb-4">
            "En menos de 10 minutos tenía mi sistema de reservas funcionando. Mis jugadores reservan online y yo ahorro horas cada día."
          </p>
          <p className="text-sm text-blue-300/40">- Club de Pádel Las Palmas</p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center rounded-2xl p-12 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2]" />
          
          {/* Court lines decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-white" />
            <div className="absolute inset-4 border-2 border-white rounded-lg" />
          </div>
          
          {/* Paleta y pelota en el CTA */}
          <div className="absolute top-4 right-6 md:right-12 hidden sm:block">
            <div className="relative w-12 h-18 animate-[swing_2s_ease-in-out_infinite] origin-bottom">
              <svg viewBox="0 0 80 140" className="w-full h-full drop-shadow-lg">
                <rect x="32" y="90" width="16" height="50" rx="4" fill="#0a0a12" opacity="0.5" />
                <ellipse cx="40" cy="45" rx="38" ry="44" fill="white" opacity="0.2" />
                <ellipse cx="40" cy="45" rx="34" ry="40" fill="white" opacity="0.1" />
                {[0,1,2,3,4].map((row) => (
                  [0,1,2,3].map((col) => (
                    <circle 
                      key={`cta-${row}-${col}`}
                      cx={18 + col * 15} 
                      cy={20 + row * 14} 
                      r="4" 
                      fill="#0a4d8c"
                      opacity="0.4"
                    />
                  ))
                ))}
              </svg>
            </div>
            <div className="absolute -left-3 top-3 w-6 h-6 rounded-full bg-[#ccff00] shadow-lg shadow-[#ccff00]/50 animate-[ballBounce_2s_ease-in-out_infinite]" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              ¿Listo para profesionalizar tu club? 🎾
            </h2>
            <p className="text-xl mb-8 text-blue-100/80">
              Comienza gratis. Sin tarjeta de crédito. Configuración en minutos.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="text-lg px-8 py-6 bg-[#ccff00] hover:bg-[#d4ff33] text-[#0a0a12] font-bold shadow-lg shadow-[#ccff00]/30">
                Comenzar ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-blue-900/20">
        <div className="flex items-center justify-center gap-3 text-blue-300/40 text-sm">
          <span className="text-xl">🎾</span>
          <span>PadelTurn - Sistema de reservas para canchas de pádel</span>
        </div>
      </footer>
    </div>
  )
}
