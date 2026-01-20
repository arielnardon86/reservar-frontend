"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams?.get('email') || ''
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, router])

  // Prellenar email si viene de onboarding
  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      toast.success('Tu usuario ha sido creado. Ingresa tu email para recibir el magic link.')
    }
  }, [emailFromUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Por favor ingresa tu email')
      return
    }

    setIsLoading(true)
    try {
      await login(email)
      toast.success('¡Revisa tu email! Te enviamos un link mágico para iniciar sesión.')
      setEmail("") // Limpiar el campo
    } catch (error: any) {
      toast.error(error?.message || 'Error al enviar magic link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <img 
          src="/agendalo-logo.svg" 
          alt="slotia" 
          className="h-12 w-auto"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#6E52FF20' }}>
            <Mail className="w-8 h-8" style={{ color: '#6E52FF' }} />
          </div>
          <CardTitle className="text-2xl font-bold" style={{ color: '#1D1C2C' }}>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos un link mágico para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-white" 
              style={{ backgroundColor: '#6E52FF' }}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Magic Link
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> En desarrollo, el link mágico aparecerá en la consola del navegador y en una alerta.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
