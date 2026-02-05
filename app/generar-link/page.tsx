"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Loader2, ArrowLeft, Link2 } from "lucide-react"
import { onboardingTokensApi } from "@/lib/api/endpoints"
import { toast } from "sonner"
import NextLink from "next/link"

export default function GenerarLinkPage() {
  const [adminSecret, setAdminSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminSecret.trim()) {
      toast.error("Ingresá la clave de administrador")
      return
    }
    setLoading(true)
    setGeneratedLink(null)
    try {
      const res = await onboardingTokensApi.create(adminSecret)
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const link = `${baseUrl}/onboarding?invite=${res.token}`
      setGeneratedLink(link)
      toast.success("Link generado correctamente")
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || "Error al generar link"
      toast.error(msg.includes("Clave") ? msg : "Error al generar link. Verificá la clave.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast.success("Link copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-white">Generar link de suscripción</CardTitle>
              <p className="text-sm text-slate-400 mt-0.5">
                Creá un link de un solo uso para que alguien cree su edificio
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <Label className="text-slate-300">Clave de administrador</Label>
              <Input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Tu clave secreta"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Configurada en el backend como ONBOARDING_ADMIN_SECRET
              </p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar link"
              )}
            </Button>
          </form>

          {generatedLink && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <Label className="text-slate-300">Link generado (válido para un solo uso)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generatedLink}
                  className="bg-slate-800 border-slate-700 text-slate-300 text-sm font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0 border-slate-700 hover:bg-slate-800"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Enviá este link al suscriptor. Una vez que cree su edificio, el link deja de funcionar.
              </p>
            </div>
          )}

          <NextLink href="/landing">
            <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </NextLink>
        </CardContent>
      </Card>
    </div>
  )
}
