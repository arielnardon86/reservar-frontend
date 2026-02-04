// Endpoints del API organizados por módulo

import { apiClient } from './client';
import type {
  Tenant,
  CreateTenantDto,
  UpdateTenantDto,
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  Professional,
  CreateProfessionalDto,
  UpdateProfessionalDto,
  Schedule,
  CreateScheduleDto,
  Customer,
  CreateCustomerDto,
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AvailabilityQuery,
  TimeSlot,
  LoginDto,
  VerifyTokenDto,
  AuthResponse,
} from './types';

// ============================================
// TENANTS
// ============================================

export const tenantsApi = {
  getAll: () => apiClient.get<Tenant[]>('/tenants'),
  getById: (id: string) => apiClient.get<Tenant>(`/tenants/${id}`),
  create: (data: CreateTenantDto) => apiClient.post<Tenant>('/tenants', data),
  update: (id: string, data: UpdateTenantDto) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/tenants/${id}`),
  getBySlug: (slug: string) => apiClient.get<Tenant>(`/tenants/slug/${slug}`),
};

// ============================================
// SERVICES
// ============================================

export const servicesApi = {
  getAll: () => apiClient.get<Service[]>('/services'),
  getById: (id: string) => apiClient.get<Service>(`/services/${id}`),
  create: (data: CreateServiceDto) =>
    apiClient.post<Service>('/services', data),
  update: (id: string, data: UpdateServiceDto) =>
    apiClient.patch<Service>(`/services/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/services/${id}`),
};

// ============================================
// PROFESSIONALS
// ============================================

export const professionalsApi = {
  getAll: () => apiClient.get<Professional[]>('/professionals'),
  getById: (id: string) => apiClient.get<Professional>(`/professionals/${id}`),
  create: (data: CreateProfessionalDto) =>
    apiClient.post<Professional>('/professionals', data),
  update: (id: string, data: UpdateProfessionalDto) =>
    apiClient.patch<Professional>(`/professionals/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/professionals/${id}`),
};

// ============================================
// SCHEDULES
// ============================================

export const schedulesApi = {
  getAll: () => apiClient.get<Schedule[]>('/schedules'),
  getById: (id: string) => apiClient.get<Schedule>(`/schedules/${id}`),
  create: (data: CreateScheduleDto) =>
    apiClient.post<Schedule>('/schedules', data),
  update: (id: string, data: Partial<CreateScheduleDto>) =>
    apiClient.patch<Schedule>(`/schedules/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/schedules/${id}`),
};

// ============================================
// CUSTOMERS
// ============================================

export const customersApi = {
  getAll: () => apiClient.get<Customer[]>('/customers'),
  getById: (id: string) => apiClient.get<Customer>(`/customers/${id}`),
  create: (data: CreateCustomerDto) =>
    apiClient.post<Customer>('/customers', data),
  update: (id: string, data: Partial<CreateCustomerDto>) =>
    apiClient.patch<Customer>(`/customers/${id}`, data),
};

// ============================================
// APPOINTMENTS
// ============================================

export const appointmentsApi = {
  getAll: () => apiClient.get<Appointment[]>('/appointments'),
  getById: (id: string) => apiClient.get<Appointment>(`/appointments/${id}`),
  create: (data: CreateAppointmentDto) =>
    apiClient.post<Appointment>('/appointments', data),
  // Endpoint público para clientes (usa tenantSlug)
  createPublic: (tenantSlug: string, data: CreateAppointmentDto) =>
    apiClient.post<Appointment>(`/appointments?tenantSlug=${tenantSlug}`, data),
  update: (id: string, data: UpdateAppointmentDto) =>
    apiClient.patch<Appointment>(`/appointments/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/appointments/${id}`),
  getAvailability: (tenantSlug: string, query: AvailabilityQuery) => {
    const params = new URLSearchParams({
      tenantSlug,
      professionalId: query.professionalId,
      serviceId: query.serviceId,
      date: query.date,
    });
    return apiClient.get<TimeSlot[]>(`/appointments/availability?${params.toString()}`);
  },
  // Público: Obtener appointments del día (para visualización)
  getDayAppointments: (tenantSlug: string, date: string) => {
    return apiClient.get<any[]>(`/appointments/day?tenantSlug=${tenantSlug}&date=${date}`);
  },
};

// ============================================
// AUTH
// ============================================

export const authApi = {
  login: (data: LoginDto) =>
    apiClient.post<{ message: string; magicLink?: string }>('/auth/login', data),
  verifyToken: (token: string) => {
    // El backend espera el token como query parameter en GET /auth/callback
    return apiClient.get<AuthResponse>(`/auth/callback?token=${token}`);
  },
};

