"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { countries, getCountryByCode, type Country } from "@/lib/data/countries"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  countryCode?: string // Código de país por defecto (ej: 'AR')
}

export function PhoneInput({
  value = '',
  onChange,
  label = 'Teléfono',
  placeholder = '11 1234-5678',
  required = false,
  countryCode = 'AR',
}: PhoneInputProps) {
  // Parsear el valor actual para extraer prefijo y número
  const parsePhoneValue = (phone: string) => {
    if (!phone) return { country: getCountryByCode(countryCode) || countries[0], number: '' }
    
    // Buscar si el valor ya incluye un prefijo
    for (const country of countries) {
      if (phone.startsWith(country.dialCode)) {
        return {
          country,
          number: phone.replace(country.dialCode, '').trim(),
        }
      }
    }
    
    // Si no tiene prefijo, usar el país por defecto
    return {
      country: getCountryByCode(countryCode),
      number: phone,
    }
  }

  const { country: initialCountry, number: initialNumber } = parsePhoneValue(value)
  const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry || countries[0])
  const [phoneNumber, setPhoneNumber] = useState(initialNumber)

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode) || countries[0]
    setSelectedCountry(country)
    const fullNumber = country.dialCode + (phoneNumber ? ' ' + phoneNumber : '')
    onChange?.(fullNumber)
  }

  const handleNumberChange = (input: string) => {
    // Validar: no permitir que empiece con 0 o 15 (para Argentina)
    let cleaned = input.replace(/\D/g, '') // Solo números
    
    // Si es Argentina y empieza con 0, quitar
    if (selectedCountry.code === 'AR' && cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1)
    }
    
    // Si es Argentina y empieza con 15, quitar
    if (selectedCountry.code === 'AR' && cleaned.startsWith('15')) {
      cleaned = cleaned.slice(2)
    }
    
    setPhoneNumber(cleaned)
    
    // Formatear el número completo
    const fullNumber = selectedCountry.dialCode + (cleaned ? ' ' + cleaned : '')
    onChange?.(fullNumber)
  }

  // Actualizar cuando cambia el valor externo
  useEffect(() => {
    const { country, number } = parsePhoneValue(value)
    if (country) {
      setSelectedCountry(country)
    }
    setPhoneNumber(number)
  }, [value])

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && '*'}</Label>}
      <div className="flex gap-2">
        <Select
          value={selectedCountry.code}
          onValueChange={handleCountryChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-gray-500">{country.dialCode}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
      </div>
      {selectedCountry.code === 'AR' && (
        <p className="text-xs text-gray-500">
          Ingresa el número sin el 0 inicial ni el 15. Ej: 11 1234-5678
        </p>
      )}
    </div>
  )
}

