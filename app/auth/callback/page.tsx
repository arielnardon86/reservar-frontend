"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AuthUser } from "@/lib/context/AuthContext"

// Forzar renderizado dinámico (no pre-renderizar en build)
export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { setUser } = useAuth()

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error')
        setErrorMessage('No se proporcionó un token válido')
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/callback?token=${token}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Token inválido o expirado')
        }

        const data = await response.json()
        
        if (data.user) {
          // Actualizar el estado del usuario en el contexto
          setUser(data.user as AuthUser)
          
          setStatus('success')
          
          // Redirigir después de un breve delay
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 1500)
        } else {
          throw new Error('No se recibió información del usuario')
        }
      } catch (error: any) {
        console.error('Token verification error:', error)
        setStatus('error')
        setErrorMessage(error?.message || 'Error al verificar el token')
      }
    }

    verifyToken()
  }, [token, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              <h2 className="text-xl font-semibold">Verificando tu acceso...</h2>
              <p className="text-gray-600">Por favor espera un momento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-600">Error de Verificación</h2>
              <p className="text-gray-600">{errorMessage}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.push('/login')} variant="outline">
                  Volver al Login
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-600">¡Acceso Verificado!</h2>
            <p className="text-gray-600">Redirigiendo al panel de administración...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              <h2 className="text-xl font-semibold">Cargando...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
