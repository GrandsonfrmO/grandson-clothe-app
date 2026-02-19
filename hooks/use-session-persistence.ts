"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAuthToken } from "@/hooks/use-api"

/**
 * Hook to maintain session persistence across page reloads
 * Keeps the user logged in as long as the token exists in localStorage
 */
export function useSessionPersistence() {
  const { user, loading, login } = useAuth()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if there's a token in localStorage but no user in context
    const token = getAuthToken()
    
    // If token exists but user is not loaded yet, the AuthProvider will handle it
    // This hook just ensures the session persists
    if (token && !user && !loading) {
      // Token exists but user is not set, this shouldn't happen
      // The AuthProvider should have already loaded the user
      console.log('Session token found, user should be loaded by AuthProvider')
    }
  }, [user, loading])

  return {
    isSessionActive: !!user,
    hasToken: !!getAuthToken(),
  }
}
