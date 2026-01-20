"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Calendar, Users, TrendingUp, ArrowRight, Star, LogIn } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header con logo slotia y acceso admin */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/agendalo-logo.svg" 
              alt="slotia" 
              className="h-12 w-auto"
            />
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" style={{ color: '#3A3942' }} className="hover:bg-gray-100">
              <LogIn className="w-4 h-4 mr-2" />
              Soy Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#1D1C2C' }}>
            Gestiona tus turnos online
            <span style={{ color: '#6E52FF' }}> en minutos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Reduce llamadas telefónicas, aumenta tu ocupación y profesionaliza tu negocio con nuestro sistema de turnos online.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 justify-center">
              <Link href="/onboarding">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 text-white"
                  style={{ backgroundColor: '#6E52FF' }}
                >
                  Comenzar gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver demo
              </Button>
            </div>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2">
              ¿Ya eres administrador? <span style={{ color: '#6E52FF' }} className="font-medium">Iniciar sesión</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#6E52FF20' }}>
                <Calendar className="w-6 h-6" style={{ color: '#6E52FF' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce llamadas</h3>
              <p className="text-gray-600">
                Tus clientes reservan online 24/7. Ahorra hasta 2 horas diarias en llamadas telefónicas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#C7387020' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#C73870' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aumenta ocupación</h3>
              <p className="text-gray-600">
                Reservas disponibles las 24 horas. No pierdas turnos por no poder atender llamadas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#6E52FF20' }}>
                <Users className="w-6 h-6" style={{ color: '#6E52FF' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Profesionaliza</h3>
              <p className="text-gray-600">
                Imagen moderna y confiable. Personaliza con tu logo y colores. Construye tu base de clientes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que necesitas en un solo lugar
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Configuración en menos de 10 minutos",
              "Personalización completa (logo, colores)",
              "Gestión de múltiples profesionales",
              "Horarios flexibles y configurables",
              "Recordatorios automáticos por email",
              "Dashboard con reportes y estadísticas",
              "Base de clientes automática",
              "Integración con calendarios (.ics)",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C73870' }} />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-lg text-gray-700 mb-2">
            "En menos de 10 minutos tenía mi turnero funcionando. Mis clientes reservan online y yo ahorro horas cada día."
          </p>
          <p className="text-sm text-gray-500">- Dr. Carlos Mendoza, Clínica Médica</p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div 
          className="max-w-3xl mx-auto text-center rounded-2xl p-12 text-white"
          style={{ 
            background: 'linear-gradient(135deg, #6E52FF 0%, #C73870 100%)' 
          }}
        >
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para profesionalizar tu negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comienza gratis. Sin tarjeta de crédito. Configuración en minutos.
          </p>
          <Link href="/onboarding">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Comenzar ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}


