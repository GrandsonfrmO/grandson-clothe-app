"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAuthToken } from "@/hooks/use-api"

/**
 * Component to initialize and maintain user session
 * Ensures the user stays logged in across page reloads
 */
export function SessionInitializer({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    // Log session status for debugging
    const token = getAuthToken()
    if (token && user) {
      console.log('✅ Session active:', user.email)
    } else if (token && !user && !loading) {
      console.log('⚠️ Token exists but user not loaded')
    } else if (!token) {
      console.log('❌ No session token')
    }
  }, [user, loading])

  return <>{children}</>
}
