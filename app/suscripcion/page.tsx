"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageCircle, ArrowLeft, Building2, Check } from "lucide-react"
import Link from "next/link"

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "reservar.app.ok@gmail.com"
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || ""
const CONTACT_WHATSAPP = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || ""

export default function SuscripcionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">Reserv<span className="text-emerald-400">Ar</span></span>
            </Link>
            <Link href="/landing">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">Servicio para administradores de consorcio</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            ReservAr es un servicio de pago
          </h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Para crear tu edificio y dar de alta a tu consorcio necesitás un link de acceso. 
            Contactanos y te enviamos el link para que configures tu edificio en minutos.
          </p>

          <Card className="bg-slate-900/50 border-slate-800 text-left mb-10">
            <CardContent className="p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-semibold text-white">¿Cómo obtener tu acceso?</h2>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">1</span>
                  Escribinos por email o WhatsApp indicando que querés dar de alta tu edificio.
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">2</span>
                  Te enviamos el link de creación y las instrucciones de pago.
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">3</span>
                  Accedés al link, configurás tu edificio y listo: los vecinos pueden reservar.
                </li>
              </ul>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Solicitud de acceso - ReservAr`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Escribir por email
                </a>
                {CONTACT_WHATSAPP && (
                  <a
                    href={`https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, '')}?text=Hola, quiero solicitar acceso a ReservAr para mi consorcio.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-semibold transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contactar por WhatsApp
                  </a>
                )}
              </div>
              <p className="text-sm text-slate-500 pt-2">
                Email: <strong className="text-slate-400">{CONTACT_EMAIL}</strong>
                {CONTACT_PHONE && <> · Tel: <strong className="text-slate-400">{CONTACT_PHONE}</strong></>}
              </p>
            </CardContent>
          </Card>

          <Link href="/login">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
              Ya tengo cuenta — Ir al panel
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
