"use client"

import { useState } from "react"
import { ServiceSelection } from "./ServiceSelection"
import { ProfessionalSelection } from "./ProfessionalSelection"
import { DateTimeSelection } from "./DateTimeSelection"
import { ClientInfoForm } from "./ClientInfoForm"
import { BookingConfirmation } from "./BookingConfirmation"
import { Progress } from "@/components/ui/progress"
import { useTenantContext } from "@/lib/context/TenantContext"
import type { Service, Professional } from "@/lib/api/types"

// Alias semántico para pádel
export type Court = Professional

export type BookingStep =
  | "service"    // Selección de duración del turno
  | "professional" // Selección de cancha (court)
  | "datetime"
  | "info"
  | "confirmation"

export interface BookingData {
  service?: Service        // Tipo de turno (duración)
  professional?: Court     // Cancha seleccionada
  date?: Date
  time?: string
  clientName?: string
  clientLastName?: string
  clientEmail?: string
}

// Labels para los pasos en contexto pádel
const STEP_LABELS: Record<BookingStep, string> = {
  service: "Duración",
  professional: "Cancha",
  datetime: "Fecha y Hora",
  info: "Tus Datos",
  confirmation: "Confirmación",
}

export function ClientBooking() {
  const { tenant } = useTenantContext()
  const [step, setStep] = useState<BookingStep>("service")
  const [bookingData, setBookingData] = useState<BookingData>({})

  const steps: BookingStep[] = [
    "service",
    "professional",
    "datetime",
    "info",
    "confirmation",
  ]
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const updateBooking = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const previousStep = () => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const resetBooking = () => {
    setBookingData({})
    setStep("service")
  }

  // Color verde pádel por defecto
  const primaryColor = tenant?.primaryColor || '#22c55e'

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <div className="text-5xl mb-4">🎾</div>
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ color: primaryColor }}
          >
            {tenant?.name || 'Reserva tu Cancha'}
          </h1>
          <p className="text-lg text-gray-600">
            Reserva tu turno de pádel en pocos pasos
          </p>
        </div>

        {/* Progress Bar con steps */}
        {step !== "confirmation" && (
          <div className="mb-8">
            {/* Step indicators */}
            <div className="flex justify-between mb-4">
              {steps.filter(s => s !== "confirmation").map((s, index) => (
                <div 
                  key={s} 
                  className={`flex flex-col items-center flex-1 ${index > 0 ? 'relative' : ''}`}
                >
                  {/* Línea conectora */}
                  {index > 0 && (
                    <div 
                      className="absolute top-4 right-1/2 w-full h-0.5"
                      style={{ 
                        backgroundColor: index <= currentStepIndex ? primaryColor : '#e5e7eb' 
                      }}
                    />
                  )}
                  {/* Círculo */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                      index <= currentStepIndex ? 'text-white' : 'text-gray-400 bg-gray-200'
                    }`}
                    style={{ 
                      backgroundColor: index <= currentStepIndex ? primaryColor : undefined
                    }}
                  >
                    {index + 1}
                  </div>
                  {/* Label */}
                  <span className={`text-xs mt-1 ${
                    index <= currentStepIndex ? 'text-gray-700 font-medium' : 'text-gray-400'
                  }`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Progress bar simple */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: primaryColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          {step === "service" && (
            <ServiceSelection
              tenant={tenant}
              onSelect={(service) => {
                updateBooking({ service })
                nextStep()
              }}
            />
          )}

          {step === "professional" && bookingData.service && (
            <ProfessionalSelection
              service={bookingData.service}
              tenant={tenant}
              onSelect={(court) => {
                updateBooking({ professional: court })
                nextStep()
              }}
              onBack={previousStep}
            />
          )}

          {step === "datetime" && bookingData.service && bookingData.professional && (
            <DateTimeSelection
              service={bookingData.service}
              professional={bookingData.professional}
              tenant={tenant}
              onSelect={(date, time) => {
                updateBooking({ date, time })
                nextStep()
              }}
              onBack={previousStep}
            />
          )}

          {step === "info" && (
            <ClientInfoForm
              tenant={tenant}
              onSubmit={(name, lastName, email) => {
                updateBooking({
                  clientName: name,
                  clientLastName: lastName,
                  clientEmail: email,
                })
                nextStep()
              }}
              onBack={previousStep}
            />
          )}

          {step === "confirmation" && (
            <BookingConfirmation
              bookingData={bookingData as Required<BookingData>}
              onNewBooking={resetBooking}
            />
          )}
        </div>
      </div>
    </div>
  )
}

