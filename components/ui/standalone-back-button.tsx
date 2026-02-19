'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './button'

interface StandaloneBackButtonProps {
  fallbackUrl?: string
  className?: string
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  label?: string
  position?: 'fixed' | 'static'
  iconOnly?: boolean
}

export function StandaloneBackButton({ 
  fallbackUrl = '/', 
  className = '',
  variant = 'ghost',
  size = 'icon',
  label = 'Retour',
  position = 'static',
  iconOnly = true
}: StandaloneBackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Vérifier s'il y a un historique de navigation
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback vers l'URL spécifiée si pas d'historique
      router.push(fallbackUrl)
    }
  }

  const positionClasses = position === 'fixed' 
    ? 'fixed top-4 left-4 z-50' 
    : ''

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`flex items-center justify-center gap-2 transition-all duration-200 hover:scale-110 ${positionClasses} ${className}`}
      aria-label={label}
      title={label}
    >
      <ArrowLeft className="h-5 w-5" />
      {!iconOnly && size !== 'icon' && label}
    </Button>
  )
}