// Cliente API para comunicarse con el backend NestJS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Log de la URL base al cargar (solo en cliente)
if (typeof window !== 'undefined') {
  console.log('[API Client] Base URL configurada:', API_BASE_URL);
  console.log('[API Client] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'NO CONFIGURADA');
}

export interface ApiError {
  message: string;
  statusCode: number;
}

class ApiClient {
  private baseUrl: string;
  private tenantId: string | null = null;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setTenantId(tenantId: string | null) {
    this.tenantId = tenantId;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Normalizar URL: eliminar doble slash y asegurar formato correcto
    let normalizedBaseUrl = this.baseUrl.trim().replace(/\/+$/, ''); // Eliminar trailing slashes y espacios
    
    // Si la baseUrl está vacía o es solo '/', usar localhost por defecto
    if (!normalizedBaseUrl || normalizedBaseUrl === '/') {
      normalizedBaseUrl = 'http://localhost:3001';
      console.warn('[API Client] Base URL vacía o inválida, usando localhost por defecto');
    }
    
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Construir URL y eliminar cualquier doble slash (excepto después de '://')
    let url = `${normalizedBaseUrl}${normalizedEndpoint}`;
    url = url.replace(/([^:]\/)\/+/g, '$1'); // Reemplazar múltiples slashes con uno solo (excepto después de ':')
    
    // Log para debugging
    if (url.includes('//') && !url.includes('://')) {
      console.error('[API Client] ⚠️ URL mal formada detectada:', url);
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar JWT si está disponible (para super admin)
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Agregar tenant ID si está disponible
    // Los endpoints públicos y super-admin no requieren tenantId
    const isPublicEndpoint = endpoint.includes('/tenants/slug/') || 
                             endpoint.includes('/tenants?') ||
                             endpoint === '/tenants' && options.method === 'GET' ||
                             endpoint.includes('/auth/') ||
                             endpoint.includes('/super-admin/');
    
    if (this.tenantId) {
      (headers as Record<string, string>)['x-tenant-id'] = this.tenantId;
      console.log('[API Client] Sending request with tenantId:', this.tenantId, 'to:', url);
    } else if (!isPublicEndpoint) {
      // Solo mostrar warning si no es un endpoint público
      console.warn('[API Client] No tenantId set for request to:', url);
    }

    // Validar que la URL base no sea localhost en producción
    if (typeof window !== 'undefined' && this.baseUrl.includes('localhost')) {
      console.error('[API Client] ⚠️ ADVERTENCIA: Intentando conectarse a localhost en producción. Verifica NEXT_PUBLIC_API_URL en Vercel.');
    }

    // Log detallado de la request
    console.log('[API Client] Request details:', {
      method: options.method || 'GET',
      url,
      baseUrl: this.baseUrl,
      endpoint,
      hasTenantId: !!this.tenantId,
      headers: Object.keys(headers),
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Agregar mode y credentials para CORS
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        // NestJS validation errors tienen este formato
        if (errorData.message && Array.isArray(errorData.message)) {
          errorData.message = errorData.message.join(', ');
        }

        const error: ApiError = {
          message: errorData.message || response.statusText,
          statusCode: response.status,
        };
        throw error;
      }

      // Si la respuesta está vacía (204 No Content), retornar null
      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (error: any) {
      // Capturar errores de red (Failed to fetch, CORS, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[API Client] Error de red al conectar con:', url);
        console.error('[API Client] Base URL configurada:', this.baseUrl);
        console.error('[API Client] Verifica que:');
        console.error('  1. NEXT_PUBLIC_API_URL está configurada en Vercel');
        console.error('  2. El backend está desplegado y accesible');
        console.error('  3. CORS está configurado correctamente en el backend');
        
        const networkError: ApiError = {
          message: this.baseUrl.includes('localhost') 
            ? 'Error de conexión: La aplicación está intentando conectarse a localhost. Por favor, configura NEXT_PUBLIC_API_URL en Vercel con la URL de tu backend en producción.'
            : `Error de conexión: No se pudo conectar con el servidor (${this.baseUrl}). Verifica que el backend esté desplegado y accesible.`,
          statusCode: 0,
        };
        throw networkError;
      }
      
      // Re-lanzar otros errores (ya procesados arriba)
      throw error;
    }
  }

  // GET
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

