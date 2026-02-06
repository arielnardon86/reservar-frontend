"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { OnboardingWizard } from "@/components/admin/OnboardingWizard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, ArrowRight } from "lucide-react"
import { onboardingTokensApi } from "@/lib/api/endpoints"

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const invite = searchParams?.get("invite") || ""
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    if (!invite) {
      setValidating(false)
      setValid(false)
      return
    }
    let cancelled = false
    onboardingTokensApi.validate(invite)
      .then((res) => {
        if (!cancelled) {
          setValid(res.valid)
        }
      })
      .catch(() => {
        if (!cancelled) setValid(false)
      })
      .finally(() => {
        if (!cancelled) setValidating(false)
      })
    return () => { cancelled = true }
  }, [invite])

  // Sin token en la URL
  if (!invite) {
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
            Para crear tu edificio en ReservAr necesitás un link de suscripción que te enviamos al contratar el servicio.
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

  // Validando token
  if (validating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Token inválido o ya usado
  if (!valid) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Link inválido o ya usado
          </h1>
          <p className="text-slate-400 mb-8">
            Este link de suscripción no es válido o ya fue utilizado para crear un edificio. Cada link sirve una sola vez. Si necesitás uno nuevo, contactanos.
          </p>
          <Link href="/suscripcion">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl">
              Contactar
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
        <OnboardingWizardWithInvite />
      </OnboardingGate>
    </Suspense>
  )
}

function OnboardingWizardWithInvite() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams?.get("invite") || ""
  return <OnboardingWizard inviteToken={inviteToken} />
}
