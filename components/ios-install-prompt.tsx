'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Share, Plus, Smartphone } from 'lucide-react';

export function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    setIsIOS(isIOSDevice);

    // Vérifier si déjà installé (mode standalone)
    const isStandalone = (window.navigator as any).standalone === true;
    const isInWebApp = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone || isInWebApp) {
      setIsInstalled(true);
      return;
    }

    // Montrer le prompt pour iOS après 3 secondes si pas déjà refusé
    if (isIOSDevice && isSafari && !sessionStorage.getItem('ios-install-dismissed')) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('ios-install-dismissed', 'true');
  };

  // Ne pas afficher si pas iOS, déjà installé, ou prompt fermé
  if (!isIOS || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Installer sur iPhone</CardTitle>
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
            Ajoutez GRANDSON CLOTHES à votre écran d'accueil pour un accès rapide !
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div className="flex items-center gap-2">
                <Share className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Appuyez sur le bouton Partage</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="text-sm">Sélectionnez "Ajouter à l'écran d'accueil"</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Confirmez en appuyant "Ajouter"</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDismiss} className="flex-1">
              Plus tard
            </Button>
            <Button onClick={handleDismiss} className="flex-1">
              J'ai compris
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            L'icône GRANDSON apparaîtra sur votre écran d'accueil
          </p>
        </CardContent>
      </Card>
    </div>
  );
}