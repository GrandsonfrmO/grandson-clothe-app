'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Pop-up d'installation désactivé
    // if (isInstallable && !isInstalled) {
    //   // Attendre un peu avant de montrer le prompt pour une meilleure UX
    //   const timer = setTimeout(() => {
    //     if (!sessionStorage.getItem('pwa-prompt-dismissed')) {
    //       setShowPrompt(true);
    //     }
    //   }, 5000);
    //
    //   return () => clearTimeout(timer);
    // }
  }, [isInstallable, isInstalled]);

  const handleInstallClick = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Ne pas montrer à nouveau pendant cette session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou si pas installable
  if (!showPrompt || isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Installer l'application</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Installez GRANDSON CLOTHES pour une expérience optimale et un accès rapide depuis votre écran d'accueil.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Installer
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Plus tard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}