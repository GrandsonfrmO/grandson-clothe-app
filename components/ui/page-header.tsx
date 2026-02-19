'use client'

import { BackButton } from './back-button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  showBack?: boolean
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  showBack = true,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('bg-background border-b border-border', className)}>
      <div className="px-4 py-4 space-y-3">
        {showBack && (
          <BackButton href={backHref} label={backLabel} variant="ghost" />
        )}
        
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
