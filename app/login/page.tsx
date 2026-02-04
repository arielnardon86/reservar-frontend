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
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid lines like court */}
        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-[#0a4d8c]/20" />
        <div className="absolute top-0 bottom-0 right-1/4 w-px bg-[#0a4d8c]/20" />
        <div className="absolute left-0 right-0 top-1/3 h-px bg-[#0a4d8c]/20" />
        <div className="absolute left-0 right-0 bottom-1/3 h-px bg-[#0a4d8c]/20" />
        
        {/* Paleta y pelota animadas - esquina superior derecha */}
        <div className="absolute top-16 right-10 md:right-20 hidden sm:block opacity-60">
          <div className="relative w-14 h-20 animate-[swing_3s_ease-in-out_infinite] origin-bottom">
            <svg viewBox="0 0 80 140" className="w-full h-full drop-shadow-lg">
              <rect x="32" y="90" width="16" height="50" rx="4" fill="#1a1a2e" />
              <ellipse cx="40" cy="45" rx="38" ry="44" fill="#0a4d8c" />
              <ellipse cx="40" cy="45" rx="34" ry="40" fill="#1a6fc2" />
              {[0,1,2,3,4].map((row) => (
                [0,1,2,3].map((col) => (
                  <circle 
                    key={`h-${row}-${col}`}
                    cx={18 + col * 15} 
                    cy={20 + row * 14} 
                    r="4" 
                    fill="#0a0a12"
                    opacity="0.6"
                  />
                ))
              ))}
              <ellipse cx="40" cy="45" rx="34" ry="40" fill="none" stroke="#ccff00" strokeWidth="2" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute -left-4 top-4 w-6 h-6 rounded-full bg-[#ccff00] shadow-lg shadow-[#ccff00]/40 animate-[ballBounce_3s_ease-in-out_infinite]" />
        </div>
        
        {/* Pelota decorativa abajo */}
        <div className="absolute bottom-24 left-16 w-5 h-5 rounded-full bg-[#ccff00]/30 blur-sm animate-pulse" />
      </div>
      
      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a4d8c] to-[#1a6fc2] flex items-center justify-center shadow-lg border border-blue-700/30">
          <span className="text-xl">🎾</span>
        </div>
        <span className="font-bold text-white">PadelTurn</span>
      </div>
      
      <Card className="w-full max-w-md bg-[#12121f] border-blue-900/30 shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#0a4d8c]/30 flex items-center justify-center mb-4 border border-blue-700/30">
            <Mail className="w-8 h-8 text-[#ccff00]" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Iniciar Sesión</CardTitle>
          <CardDescription className="text-blue-300/50">
            Ingresa tu email y te enviaremos un link mágico para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-200/70">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                className="bg-[#1a1a2e] border-blue-900/40 text-white placeholder:text-blue-300/30 focus:border-[#ccff00]/50 focus:ring-[#ccff00]/20"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-[#0a0a12] font-semibold bg-[#ccff00] hover:bg-[#d4ff33]" 
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
          
          <div className="mt-6 p-4 bg-[#0a4d8c]/20 rounded-xl border border-blue-900/30">
            <p className="text-sm text-blue-200/60">
              <strong className="text-[#ccff00]">Nota:</strong> En desarrollo, el link mágico aparecerá en la consola del navegador y en una alerta.
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
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ccff00]/30 border-t-[#ccff00] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
