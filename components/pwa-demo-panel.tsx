'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Download, 
  Check, 
  AlertCircle,
  Info
} from 'lucide-react';

export function PWADemoPanel() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [pwaStatus, setPwaStatus] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Détecter l'appareil et le navigateur
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);

    let browserName = 'Autre';
    if (isChrome) browserName = 'Chrome';
    else if (isSafari) browserName = 'Safari';
    else if (isEdge) browserName = 'Edge';
    else if (isFirefox) browserName = 'Firefox';

    let deviceType = 'Desktop';
    if (isIOS) deviceType = 'iPhone/iPad';
    else if (isAndroid) deviceType = 'Android';

    setDeviceInfo({
      browser: browserName,
      device: deviceType,
      isIOS,
      isAndroid,
      isMobile: isIOS || isAndroid,
      supportsAutoInstall: (isChrome || isEdge) && !isIOS
    });

    // Vérifier le statut PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    setPwaStatus({
      isInstalled,
      hasServiceWorker,
      canInstall: !isInstalled && hasServiceWorker
    });

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!deviceInfo || !pwaStatus) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Chargement des informations PWA...</div>
        </CardContent>
      </Card>
    );
  }

  const getInstallInstructions = () => {
    if (deviceInfo.isIOS) {
      return {
        title: "Installation iPhone/iPad",
        steps: [
          "Appuyez sur le bouton Partage ⬆️",
          "Sélectionnez 'Ajouter à l'écran d'accueil'",
          "Confirmez en appuyant 'Ajouter'"
        ],
        note: "Le popup iOS apparaît automatiquement après 3 secondes"
      };
    } else if (deviceInfo.supportsAutoInstall) {
      return {
        title: "Installation automatique",
        steps: [
          "Attendez le popup d'installation (5 secondes)",
          "Cliquez 'Installer'",
          "L'app s'ajoute automatiquement"
        ],
        note: "Installation en un clic !"
      };
    } else {
      return {
        title: "Installation manuelle",
        steps: [
          "Menu navigateur > 'Installer l'application'",
          "Ou 'Ajouter à l'écran d'accueil'",
          "Suivez les instructions du navigateur"
        ],
        note: "Varie selon le navigateur"
      };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Statut de l'appareil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {deviceInfo.isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            Informations de l'appareil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Appareil :</span>
            <Badge variant="outline">{deviceInfo.device}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Navigateur :</span>
            <Badge variant="outline">{deviceInfo.browser}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Connexion :</span>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "En ligne" : "Hors ligne"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut PWA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Statut PWA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Application installée :</span>
            <div className="flex items-center gap-2">
              {pwaStatus.isInstalled ? <Check className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-orange-500" />}
              <Badge variant={pwaStatus.isInstalled ? "default" : "secondary"}>
                {pwaStatus.isInstalled ? "Installée" : "Non installée"}
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Service Worker :</span>
            <div className="flex items-center gap-2">
              {pwaStatus.hasServiceWorker ? <Check className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
              <Badge variant={pwaStatus.hasServiceWorker ? "default" : "destructive"}>
                {pwaStatus.hasServiceWorker ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Installation automatique :</span>
            <Badge variant={deviceInfo.supportsAutoInstall ? "default" : "secondary"}>
              {deviceInfo.supportsAutoInstall ? "Supportée" : "Manuelle"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Instructions d'installation */}
      {!pwaStatus.isInstalled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {instructions.title}
            </CardTitle>
            <CardDescription>{instructions.note}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Message de succès si installé */}
      {pwaStatus.isInstalled && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Application installée !</h3>
                <p className="text-sm text-green-600">
                  GRANDSON CLOTHES fonctionne maintenant comme une application native.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fonctionnalités PWA */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités PWA activées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Installation sur appareil</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Mode hors ligne</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Interface plein écran</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Raccourcis d'application</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Cache intelligent</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Détection multi-plateforme</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}