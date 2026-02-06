"use client"

import { QuickBooking } from "@/components/client/QuickBooking"
import { TenantProvider } from "@/lib/context/TenantContext"
import { useParams } from "next/navigation"
import { useTenantBySlug } from "@/lib/api/hooks"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api/client"
import { Loader2 } from "lucide-react"

function BookPageContent() {
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string
  const { data: tenant, isLoading } = useTenantBySlug(tenantSlug || '')
  const [isReady, setIsReady] = useState(false)

  // Configurar tenantId cuando se carga el tenant - ANTES de renderizar QuickBooking
  useEffect(() => {
    if (tenant?.id) {
      console.log('[BookPage] Setting tenantId:', tenant.id)
      apiClient.setTenantId(tenant.id)
      // Pequeño delay para asegurar que el state se actualice
      setIsReady(true)
    }
  }, [tenant])

  if (isLoading || (!isReady && tenant)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="text-5xl mb-4">🏢</div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando espacios...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Edificio no encontrado</h1>
          <p className="text-gray-600">El edificio o condominio que estás buscando no existe</p>
        </div>
      </div>
    )
  }

  return (
    <TenantProvider initialTenantId={tenant.id}>
      <QuickBooking />
    </TenantProvider>
  )
}

export default function BookPage() {
  return <BookPageContent />
}

