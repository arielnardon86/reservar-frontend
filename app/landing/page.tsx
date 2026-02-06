"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Calendar, Building2, Clock, ArrowRight, Sparkles, LogIn, Users, CalendarDays } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">Reserv<span className="text-emerald-400">Ar</span></span>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                <LogIn className="w-4 h-4 mr-2" />
                Panel admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute top-24 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-700/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/50 mb-8">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-300">Espacios comunes para edificios y condominios</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight tracking-tight">
              Que tu consorcio
              <span className="text-emerald-400"> reserve en un click</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              SUM, gimnasio, parrillas y más. Los administradores configuran los espacios; los vecinos reservan online, sin llamados ni planillas.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/suscripcion">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base px-8 py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Suscribirme
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Espacios preview */}
      <section className="border-y border-slate-800/50 bg-slate-900/30 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-slate-500 text-sm uppercase tracking-widest mb-6">Espacios que podés ofrecer</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { label: "SUM", icon: "🏠" },
              { label: "Gimnasio", icon: "💪" },
              { label: "Parrilla", icon: "🍖" },
              { label: "Salón de eventos", icon: "🎉" },
              { label: "Quincho", icon: "🌳" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-white">
          Para administradores y vecinos
        </h2>
        <p className="text-slate-400 text-center max-w-xl mx-auto mb-14">
          Menos trabajo para el consorcio, más orden para todos.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-colors rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <Calendar className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Reservas 24/7</h3>
              <p className="text-slate-400 leading-relaxed">
                Los vecinos eligen día y horario desde el celular. Sin llamados ni planillas en papel.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-colors rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <Building2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Espacios a tu medida</h3>
              <p className="text-slate-400 leading-relaxed">
                Configurás SUM, gimnasio, parrillas y lo que tenga tu edificio. Duración y horarios por espacio.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-colors rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Todo en un solo lugar</h3>
              <p className="text-slate-400 leading-relaxed">
                Panel para el admin, link para los vecinos. Calendario claro y sin conflictos de doble reserva.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features list */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">
            Lo que incluye ReservAr
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Múltiples espacios (SUM, gimnasio, parrilla, etc.)",
              "Horarios configurables por espacio",
              "Reserva online en segundos",
              "Sin doble reserva: un horario, un vecino",
              "Link único para tu edificio",
              "Panel de administración simple",
              "Opcional: precio por uso",
              "Recordatorios por email",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto rounded-3xl p-10 md:p-14 relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              ¿Listo para ordenar las reservas de tu edificio?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Creá tu edificio en minutos. Sin tarjeta de crédito. Los vecinos empiezan a reservar cuando vos lo habilitás.
            </p>
            <Link href="/suscripcion">
              <Button size="lg" className="text-base px-8 py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl shadow-lg shadow-emerald-500/20">
                Suscribirme
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-slate-500 text-sm">
          <span className="font-semibold text-slate-400">ReservAr</span>
          <span className="hidden sm:inline">·</span>
          <span>Reservas de espacios comunes para edificios y condominios</span>
        </div>
      </footer>
    </div>
  )
}
