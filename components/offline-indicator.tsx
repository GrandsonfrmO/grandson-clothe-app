'use client';

import { usePWA } from '@/hooks/use-pwa';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 border-yellow-200">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-yellow-800">
          Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
        </AlertDescription>
      </Alert>
    </div>
  );
}