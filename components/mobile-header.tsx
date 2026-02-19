"use client"

import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SidebarMenu } from "./sidebar-menu"
import { NotificationsPanel } from "./notifications-panel"
import { IOSInstallButton } from "./ios-install-button"

interface MobileHeaderProps {
  title?: string
  showBack?: boolean
  backUrl?: string
}

export function MobileHeader({ title, showBack = false, backUrl = "/" }: MobileHeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [hasNotification] = useState(true)

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            {showBack ? (
              <BackButton 
                fallbackUrl={backUrl}
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-secondary/80 transition-colors"
              />
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg hover:bg-secondary/80 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            {title ? (
              <h1 className="text-lg font-semibold">{title}</h1>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-sm">GC</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight leading-none">GRANDSON</span>
                  <span className="text-[10px] text-muted-foreground tracking-widest">CLOTHES</span>
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <IOSInstallButton />
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl relative"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="w-5 h-5" />
              {hasNotification && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </>
  )
}
