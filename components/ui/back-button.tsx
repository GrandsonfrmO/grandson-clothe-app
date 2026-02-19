'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface BackButtonProps {
  href?: string
  fallbackUrl?: string
  label?: string
  className?: string
  variant?: 'default' | 'ghost' | 'minimal' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function BackButton({ 
  href,
  fallbackUrl,
  label = 'Retour', 
  className,
  variant = 'default',
  size = 'default',
  showLabel = true
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else if (fallbackUrl) {
      router.push(fallbackUrl)
    } else {
      router.back()
    }
  }

  if (size === 'icon') {
    return (
      <Button
        variant={variant as any}
        size="icon"
        onClick={handleBack}
        className={cn('rounded-lg', className)}
        aria-label={label}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
    )
  }

  const variants = {
    default: 'flex items-center gap-2 text-foreground hover:text-accent transition-colors',
    ghost: 'flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors',
    minimal: 'flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors',
    outline: 'flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/10 transition-colors'
  }

  return (
    <button
      onClick={handleBack}
      className={cn(variants[variant], className)}
      aria-label={label}
    >
      <ArrowLeft className="w-5 h-5" />
      {showLabel && <span>{label}</span>}
    </button>
  )
}
