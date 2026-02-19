'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoginDialog } from './login-dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginDialog(true)
    }
  }, [user, loading])

  const handleLoginSuccess = () => {
    setShowLoginDialog(false)
  }

  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <h2 className="text-2xl font-bold">Connexion requise</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à cette page
            </p>
          </div>
        </div>
        <LoginDialog 
          open={showLoginDialog} 
          onOpenChange={setShowLoginDialog}
        />
      </>
    )
  }

  return <>{children}</>
}