'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { IOSInstallPrompt } from './ios-install-prompt';

export function IOSInstallButton() {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Détecter iOS
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    setIsIOS(isIOSDevice && isSafari);

    // Vérifier si déjà installé
    const isStandalone = (window.navigator as any).standalone === true;
    const isInWebApp = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsInstalled(isStandalone || isInWebApp);
  }, [isMounted]);

  // Ne rien afficher pendant le rendu serveur
  if (!isMounted) {
    return null;
  }

  // Ne pas afficher si pas iOS ou déjà installé
  if (!isIOS || isInstalled) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowInstructions(true)}
        className="text-xs px-2 py-1 h-auto"
      >
        <Download className="w-3 h-3 mr-1" />
        Installer
      </Button>

      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-4">Installer GRANDSON CLOTHES</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <span className="text-sm">Appuyez sur le bouton Partage ⬆️</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">2</span>
                </div>
                <span className="text-sm">Sélectionnez "Ajouter à l'écran d'accueil"</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xs">3</span>
                </div>
                <span className="text-sm">Confirmez en appuyant "Ajouter"</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowInstructions(false)}
              className="w-full"
            >
              J'ai compris
            </Button>
          </div>
        </div>
      )}
    </>
  );
}