'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Tenant } from '../api/types';
import { useAuth } from './AuthContext';

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({
  children,
  initialTenantId,
}: {
  children: React.ReactNode;
  initialTenantId?: string | null;
}) {
  const { user } = useAuth();
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Priorizar: user.tenantId > initialTenantId > localStorage
  const effectiveTenantId = user?.tenantId || initialTenantId || null;
  
  // Estado para tenantId que se inicializa solo en el cliente
  const [tenantIdState, setTenantIdState] = useState<string | null>(effectiveTenantId);

  const setTenant = (newTenant: Tenant | null) => {
    setTenantState(newTenant);
    if (newTenant) {
      apiClient.setTenantId(newTenant.id);
      console.log('[TenantContext] Tenant set, tenantId:', newTenant.id);
      // Guardar en localStorage para persistencia
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenantId', newTenant.id);
      }
    } else {
      apiClient.setTenantId(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tenantId');
      }
    }
  };

  // Marcar como montado y configurar tenantId desde usuario autenticado, URL o localStorage
  useEffect(() => {
    setMounted(true);
    
    // Priorizar: user.tenantId > initialTenantId > localStorage
    const tenantId = user?.tenantId || initialTenantId || (typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null);
    
    if (tenantId) {
      setTenantIdState(tenantId);
      apiClient.setTenantId(tenantId);
      console.log('[TenantContext] useEffect - tenantId set:', tenantId, 'from:', user?.tenantId ? 'user' : initialTenantId ? 'url' : 'localStorage');
    }
  }, [user?.tenantId, initialTenantId]);

  // Cargar tenant completo desde API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Priorizar: user.tenantId > initialTenantId > localStorage
    const tenantIdToLoad = user?.tenantId || initialTenantId || (typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null);

    if (tenantIdToLoad && !tenant) {
      setIsLoading(true);
      // Cargar tenant desde API
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenants/${tenantIdToLoad}`)
        .then((res) => {
          if (!res.ok) throw new Error('Tenant not found');
          return res.json();
        })
        .then((data: Tenant) => {
          setTenantState(data);
          apiClient.setTenantId(data.id);
        })
        .catch((error) => {
          console.error('Error loading tenant:', error);
          // Si falla, limpiar localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('tenantId');
          }
          apiClient.setTenantId(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [user?.tenantId, initialTenantId, tenant]);

  // Obtener tenantId: primero del tenant cargado, luego del estado
  const tenantId = tenant?.id || tenantIdState;

  // No renderizar contenido hasta que esté montado (evitar hidratación)
  if (!mounted) {
    return (
      <TenantContext.Provider
        value={{
          tenant: null,
          tenantId: initialTenantId || null,
          setTenant,
          isLoading: true,
        }}
      >
        {children}
      </TenantContext.Provider>
    );
  }

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenantId: tenantId || null,
        setTenant,
        isLoading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}

