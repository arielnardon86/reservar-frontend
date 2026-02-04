"use client"

import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Suspense } from "react"

function DashboardContent() {
  return <AdminDashboard />
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500/30 border-t-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando...</p>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  )
}

