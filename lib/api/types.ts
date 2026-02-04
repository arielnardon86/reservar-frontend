// Tipos TypeScript para las entidades del backend
// Adaptado para sistema de reservas de canchas de pádel

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily?: string;
  timezone: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  slug: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  timezone?: string;
  locale?: string;
}

export interface UpdateTenantDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  timezone?: string;
  locale?: string;
}

/**
 * Service representa un Tipo de Turno en el contexto de pádel.
 * - name: Nombre del turno (ej: "Turno 1 hora", "Turno 90 minutos")
 * - duration: Duración en minutos (60, 90, 120)
 * - price: Precio del turno
 */
export interface Service {
  id: string;
  tenantId: string;
  name: string;        // Nombre del tipo de turno
  description?: string;
  duration: number;    // Duración en minutos (60, 90, 120)
  price?: number;      // Precio por turno
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Alias semántico para tipos de turno de pádel
export type TurnoDuration = Service;

export interface CreateServiceDto {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  isActive?: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

/**
 * Professional representa una Cancha en el contexto de pádel.
 * - firstName: Nombre de la cancha (ej: "Cancha 1", "Cancha Central")
 * - lastName: Tipo de superficie (ej: "Cristal", "Hormigón", "Césped")
 * - fullName: Nombre completo (ej: "Cancha 1 Cristal")
 * - bio: Características (ej: "Techada, iluminación LED")
 * - photoUrl: Imagen de la cancha
 */
export interface Professional {
  id: string;
  tenantId: string;
  firstName: string;   // Nombre de la cancha
  lastName: string;    // Tipo de superficie
  fullName: string;    // Nombre completo
  email?: string;
  phone?: string;
  photoUrl?: string;   // Imagen de la cancha
  bio?: string;        // Características (techada, iluminación, etc.)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Alias semántico: Court = Cancha de pádel
export type Court = Professional;

export interface CreateProfessionalDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  isActive?: boolean;
  serviceIds?: string[];
}

export interface UpdateProfessionalDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  isActive?: boolean;
  serviceIds?: string[];
}

export interface Schedule {
  id: string;
  tenantId?: string;
  professionalId?: string;
  professional?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  dayOfWeek: number; // 0-6 (Domingo-Sábado)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breaks?: Array<{ start: string; end: string }>;
  isException: boolean;
  exceptionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDto {
  professionalId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breaks?: Array<{ start: string; end: string }>;
  isException?: boolean;
  exceptionDate?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}

/**
 * Appointment representa una Reserva de cancha de pádel.
 * - service: Tipo de turno (duración)
 * - professional: Cancha reservada
 * - customer: Jugador que reservó
 */
export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  customer: Customer;        // Jugador
  serviceId: string;
  service: Service;          // Tipo de turno (duración)
  professionalId: string;
  professional: Professional; // Cancha reservada
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  isConfirmed: boolean;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  reminderSentAt?: string;
  confirmationSentAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Alias semántico: Reserva de cancha
export type CourtReservation = Appointment;

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export interface CreateAppointmentDto {
  // Datos del cliente (si no existe, se crea automáticamente)
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  // Datos del turno
  serviceId: string;
  professionalId: string;
  startTime: string; // ISO string
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentDto {
  status?: AppointmentStatus;
  isConfirmed?: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  notes?: string;
}

export interface AvailabilityQuery {
  professionalId: string;
  serviceId: string;
  date: string; // ISO date string (yyyy-MM-dd)
}

export interface TimeSlot {
  time: string; // Formato "HH:mm"
  available: boolean;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
}

export interface LoginDto {
  email: string;
}

export interface VerifyTokenDto {
  token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    tenantId: string;
    tenant?: Tenant;
  };
  jwt?: string;
}

