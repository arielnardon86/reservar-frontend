"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import type { Tenant } from "@/lib/api/types"

interface ClientInfoFormProps {
  tenant?: Tenant | null
  onSubmit: (name: string, lastName: string, email: string) => void
  onBack: () => void
}

export function ClientInfoForm({ tenant, onSubmit, onBack }: ClientInfoFormProps) {
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && lastName && email) {
      onSubmit(name, lastName, email)
    }
  }

  const isValid = name.trim() && lastName.trim() && email.trim().includes("@")

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-4 gap-2"
        style={{
          color: tenant?.primaryColor || '#22c55e',
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Button>

      <h2 className="text-2xl font-bold mb-2">👤 Tus Datos</h2>
      <p className="text-gray-600 mb-6">
        Completa tus datos para confirmar la reserva de cancha
      </p>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Tu apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-sm text-gray-500">
            Te enviaremos la confirmación a este correo
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={!isValid} 
          className="w-full" 
          size="lg"
          style={{
            backgroundColor: tenant?.primaryColor || '#22c55e',
            color: 'white',
          }}
        >
          🎾 Confirmar Reserva
        </Button>
      </form>
    </div>
  )
}


