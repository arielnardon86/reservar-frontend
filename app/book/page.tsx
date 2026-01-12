"use client"

import { Suspense } from "react"
import { ClientBooking } from "@/components/client/ClientBooking"
import { TenantProvider } from "@/lib/context/TenantContext"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

// Forzar renderizado dinámico (usa searchParams)
export const dynamic = 'force-dynamic'

function BookPageContent() {
  const searchParams = useSearchParams()
  const tenantId = searchParams?.get('tenantId')

  return (
    <TenantProvider initialTenantId={tenantId}>
      <ClientBooking />
    </TenantProvider>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <BookPageContent />
    </Suspense>
  )
}

