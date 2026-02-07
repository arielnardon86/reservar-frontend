"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/endpoints"

export interface AuthUser {
  id: string
  email: string
  name?: string
  tenantId: string
  isSuperAdmin?: boolean
  tenant?: {
    id: string
    name: string
    slug: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser | null) => void
  setAccessToken: (token: string | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [accessToken, setAccessTokenState] = useState<string | null>(null)

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token)
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  // Cargar usuario y token desde localStorage al montar
  useEffect(() => {
    const loadAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('auth_user')
          const storedToken = localStorage.getItem('auth_token')
          if (storedUser) setUser(JSON.parse(storedUser))
          if (storedToken) setAccessTokenState(storedToken)
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    loadAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    if (data.user) {
      setUser(data.user as AuthUser)
      if ((data as any).access_token) {
        setAccessToken((data as any).access_token)
      }
      router.push('/admin/dashboard')
    }
  }


  const logout = () => {
    setUser(null)
    setAccessTokenState(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    router.push('/login')
  }

  const setUserState = (newUser: AuthUser | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('auth_user')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        setUser: setUserState,
        setAccessToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Exportar verifyToken para usar en la página de callback
export { AuthProvider as default }
