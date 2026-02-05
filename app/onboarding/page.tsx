"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { OnboardingWizard } from "@/components/admin/OnboardingWizard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight } from "lucide-react"

// Token que vos definís y compartís solo con quienes pagan. Ejemplo en .env.local: NEXT_PUBLIC_ONBOARDING_INVITE_TOKEN=tu-token-secreto
const INVITE_TOKEN = process.env.NEXT_PUBLIC_ONBOARDING_INVITE_TOKEN || ""

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const invite = searchParams?.get("invite") || ""

  const hasValidInvite = INVITE_TOKEN && invite === INVITE_TOKEN

  if (!INVITE_TOKEN) {
    // Si no hay token configurado, permitir onboarding (desarrollo)
    return <>{children}</>
  }

  if (!hasValidInvite) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Link de acceso requerido
          </h1>
          <p className="text-slate-400 mb-8">
            Para crear tu edificio en ReservAr necesitás un link de acceso que te enviamos al contratar el servicio. Si ya te suscribiste, revisá el email o contactanos.
          </p>
          <Link href="/suscripcion">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl">
              Quiero suscribirme
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-8">
            <Link href="/landing" className="text-slate-400 hover:text-white">Volver al inicio</Link>
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function OnboardingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingGate>
        <OnboardingWizard />
      </OnboardingGate>
    </Suspense>
  )
}
