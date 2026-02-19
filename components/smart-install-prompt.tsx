'use client';

import { useState, useEffect } from 'react';
import { PWAInstallPrompt } from './pwa-install-prompt';
import { IOSInstallPrompt } from './ios-install-prompt';

export function SmartInstallPrompt() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const userAgent = navigator.userAgent;
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/Android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, [isMounted]);

  if (!isMounted) return null;

  // Afficher le composant approprié selon l'appareil
  if (deviceType === 'ios') {
    return <IOSInstallPrompt />;
  }

  // Pour Android et Desktop, utiliser le composant PWA standard
  return <PWAInstallPrompt />;
}