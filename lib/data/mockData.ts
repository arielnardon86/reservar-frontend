// Mock data para el turnero

export interface Service {
  id: string
  name: string
  description: string
  duration: number // minutos
  price: number
  category: string
}

export interface Professional {
  id: string
  name: string
  specialty: string
  avatar: string
  rating: number
  services: string[] // IDs de servicios
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface Appointment {
  id: string
  serviceId: string
  professionalId: string
  clientName: string
  clientEmail: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  createdAt: string
}

export const services: Service[] = [
  {
    id: "1",
    name: "Corte de Cabello",
    description: "Corte profesional con lavado incluido",
    duration: 30,
    price: 5000,
    category: "Peluquería",
  },
  {
    id: "2",
    name: "Coloración Completa",
    description: "Aplicación de color con tratamiento de nutrición",
    duration: 90,
    price: 12000,
    category: "Peluquería",
  },
  {
    id: "3",
    name: "Manicura",
    description: "Manicura completa con esmaltado semipermanente",
    duration: 45,
    price: 4000,
    category: "Estética",
  },
  {
    id: "4",
    name: "Masaje Relajante",
    description: "Masaje corporal de 60 minutos",
    duration: 60,
    price: 8000,
    category: "Spa",
  },
  {
    id: "5",
    name: "Tratamiento Facial",
    description: "Limpieza profunda e hidratación",
    duration: 60,
    price: 9000,
    category: "Estética",
  },
  {
    id: "6",
    name: "Peinado de Evento",
    description: "Peinado profesional para ocasiones especiales",
    duration: 45,
    price: 7000,
    category: "Peluquería",
  },
]

export const professionals: Professional[] = [
  {
    id: "1",
    name: "María González",
    specialty: "Estilista Senior",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 4.9,
    services: ["1", "2", "6"],
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    specialty: "Barbero Profesional",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 4.8,
    services: ["1"],
  },
  {
    id: "3",
    name: "Ana Martínez",
    specialty: "Especialista en Estética",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    rating: 5.0,
    services: ["3", "5"],
  },
  {
    id: "4",
    name: "Laura Sánchez",
    specialty: "Terapeuta de Spa",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    rating: 4.9,
    services: ["4", "5"],
  },
]

export const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)
  
  const isPast = selectedDate < today
  const isToday = selectedDate.getTime() === today.getTime()
  const currentHour = new Date().getHours()

  for (let hour = 9; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      
      let available = true
      
      if (isPast) {
        available = false
      } else if (isToday && (hour < currentHour || (hour === currentHour && minute === 0))) {
        available = false
      } else {
        // Simulamos algunos turnos ya tomados
        available = Math.random() > 0.3
      }
      
      slots.push({
        time: timeString,
        available,
      })
    }
  }
  
  return slots
}

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    serviceId: "1",
    professionalId: "1",
    clientName: "Juan Pérez",
    clientEmail: "juan@example.com",
    date: "2026-01-15",
    time: "10:00",
    status: "confirmed",
    createdAt: "2026-01-10T10:00:00",
  },
  {
    id: "2",
    serviceId: "3",
    professionalId: "3",
    clientName: "Sofía López",
    clientEmail: "sofia@example.com",
    date: "2026-01-15",
    time: "14:30",
    status: "confirmed",
    createdAt: "2026-01-09T15:30:00",
  },
  {
    id: "3",
    serviceId: "4",
    professionalId: "4",
    clientName: "Pedro García",
    clientEmail: "pedro@example.com",
    date: "2026-01-16",
    time: "11:00",
    status: "pending",
    createdAt: "2026-01-11T09:00:00",
  },
  {
    id: "4",
    serviceId: "2",
    professionalId: "1",
    clientName: "Lucía Fernández",
    clientEmail: "lucia@example.com",
    date: "2026-01-14",
    time: "16:00",
    status: "cancelled",
    createdAt: "2026-01-08T12:00:00",
  },
]

export const stats = {
  todayAppointments: 12,
  weekAppointments: 48,
  monthRevenue: 384000,
  newClients: 15,
  averageRating: 4.8,
  completionRate: 92,
}


