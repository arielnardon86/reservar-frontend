"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/endpoints"

export interface AuthUser {
  id: string
  email: string
  name?: string
  tenantId: string
  tenant?: {
    id: string
    name: string
    slug: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const loadUser = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('auth_user')
          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error)
        localStorage.removeItem('auth_user')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    if (data.user) {
      setUser(data.user as AuthUser)
      router.push('/admin/dashboard')
    }
  }


  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
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
        isLoading,
        login,
        logout,
        setUser: setUserState,
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
