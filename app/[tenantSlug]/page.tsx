"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Phone, ArrowRight, Loader2, MessageCircle } from "lucide-react"
import { useTenantBySlug } from "@/lib/api/hooks"
import Link from "next/link"

export default function TenantLandingPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params?.tenantSlug as string
  const { data: tenant, isLoading } = useTenantBySlug(tenantSlug || '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Negocio no encontrado</h1>
          <p className="text-gray-600">El link que estás buscando no existe</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header con más protagonismo para logo y nombre */}
      <div className="bg-white border-b shadow-sm" style={{ borderColor: tenant.primaryColor + '20' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            {tenant.logoUrl && (
              <img 
                src={tenant.logoUrl} 
                alt={tenant.name} 
                className="h-24 w-24 md:h-32 md:w-32 object-contain rounded-lg shadow-md"
              />
            )}
            <div className="flex-1">
              <h1 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: tenant.primaryColor }}
              >
                {tenant.name}
              </h1>
              <p className="text-lg text-gray-600">
                Reserva tu turno online de forma rápida y sencilla
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: tenant.primaryColor + '20' }}
          >
            <Calendar
              className="w-10 h-10"
              style={{ color: tenant.primaryColor }}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Reserva tu Turno Online
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Agenda tu cita de forma rápida y sencilla. Disponible 24/7.
          </p>
          <Link href={`/${tenantSlug}/book`}>
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              style={{
                backgroundColor: tenant.primaryColor,
                color: 'white',
              }}
            >
              Reservar Turno Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Info Cards - Contacto y Ubicación */}
      {(tenant.phone || tenant.address) && (
        <section className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tenant.phone && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tenant.primaryColor + '20' }}
                    >
                      <MessageCircle
                        className="w-6 h-6"
                        style={{ color: tenant.primaryColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Contacto</h3>
                      <a
                        href={`https://wa.me/${tenant.phone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium hover:underline block"
                        style={{ color: tenant.primaryColor }}
                      >
                        {tenant.phone}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Haz clic para contactar por WhatsApp
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {tenant.address && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tenant.primaryColor + '20' }}
                    >
                      <MapPin
                        className="w-6 h-6"
                        style={{ color: tenant.primaryColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Ubicación</h3>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 hover:underline block"
                      >
                        {tenant.address}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Haz clic para ver en Google Maps
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
