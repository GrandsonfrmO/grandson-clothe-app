"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { PWADemoPanel } from "@/components/pwa-demo-panel"
import { SmartInstallPrompt } from "@/components/smart-install-prompt"
import { PWARegister } from "@/components/pwa-register"
import { OfflineIndicator } from "@/components/offline-indicator"

export default function PWADemoPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PWARegister />
      <OfflineIndicator />
      <MobileHeader title="Démonstration PWA" showBack />
      
      <main className="px-4 py-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">PWA GRANDSON CLOTHES</h1>
            <p className="text-muted-foreground">
              Testez l'installation de l'application sur votre appareil
            </p>
          </div>
          
          <PWADemoPanel />
        </div>
      </main>

      <BottomNav />
      <SmartInstallPrompt />
    </div>
  )
}