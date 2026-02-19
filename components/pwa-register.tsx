'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    // Désactivé temporairement pour éviter les erreurs
    // if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    //   navigator.serviceWorker
    //     .register('/sw.js')
    //     .then((registration) => {
    //       console.log('Service Worker enregistré avec succès:', registration);
    //     })
    //     .catch((error) => {
    //       console.log('Échec de l\'enregistrement du Service Worker:', error);
    //     });
    // }
  }, []);

  return null;
}