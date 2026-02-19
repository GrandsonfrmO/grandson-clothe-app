'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Monitor, 
  Share, 
  MoreVertical,
  Download,
  X
} from 'lucide-react';

interface BrowserInfo {
  name: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isSafari: boolean;
}

export function PWAInstructions() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    let browserName = 'Navigateur';
    if (isChrome) browserName = 'Chrome';
    else if (isSafari) browserName = 'Safari';
    else if (/Edg/.test(userAgent)) browserName = 'Edge';
    else if (/Firefox/.test(userAgent)) browserName = 'Firefox';

    setBrowserInfo({
      name: browserName,
      isMobile,
      isIOS,
      isAndroid,
      isChrome,
      isSafari
    });
  }, []);

  if (!browserInfo || !showInstructions) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowInstructions(true)}
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Comment installer l'application ?
      </Button>
    );
  }

  const getInstructions = () => {
    if (browserInfo.isIOS && browserInfo.isSafari) {
      return {
        title: "Installation sur iPhone/iPad",
        icon: Smartphone,
        steps: [
          {
            icon: Share,
            text: "Appuyez sur le bouton Partage en bas de l'écran"
          },
          {
            icon: Download,
            text: "Sélectionnez 'Ajouter à l'écran d'accueil'"
          },
          {
            icon: Smartphone,
            text: "Confirmez en appuyant sur 'Ajouter'"
          }
        ]
      };
    }

    if (browserInfo.isAndroid && (browserInfo.isChrome || browserInfo.name === 'Edge')) {
      return {
        title: "Installation sur Android",
        icon: Smartphone,
        steps: [
          {
            icon: Download,
            text: "Un popup d'installation apparaîtra automatiquement"
          },
          {
            icon: Smartphone,
            text: "Cliquez sur 'Installer' ou 'Ajouter à l'écran d'accueil'"
          },
          {
            icon: Download,
            text: "L'app sera ajoutée à votre écran d'accueil"
          }
        ]
      };
    }

    if (!browserInfo.isMobile) {
      return {
        title: "Installation sur ordinateur",
        icon: Monitor,
        steps: [
          {
            icon: Download,
            text: "Cliquez sur l'icône d'installation dans la barre d'adresse"
          },
          {
            icon: MoreVertical,
            text: "Ou utilisez le menu navigateur > 'Installer GRANDSON CLOTHES'"
          },
          {
            icon: Monitor,
            text: "L'application s'ouvrira dans une fenêtre dédiée"
          }
        ]
      };
    }

    return {
      title: "Installation générale",
      icon: Smartphone,
      steps: [
        {
          icon: MoreVertical,
          text: "Ouvrez le menu de votre navigateur"
        },
        {
          icon: Download,
          text: "Cherchez 'Ajouter à l'écran d'accueil' ou 'Installer'"
        },
        {
          icon: Smartphone,
          text: "Suivez les instructions de votre navigateur"
        }
      ]
    };
  };

  const instructions = getInstructions();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <instructions.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{instructions.title}</CardTitle>
                <CardDescription>
                  {browserInfo.name} sur {browserInfo.isMobile ? 'mobile' : 'ordinateur'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {instructions.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium">{index + 1}</span>
              </div>
              <div className="flex items-start gap-3 flex-1">
                <step.icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm">{step.text}</p>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Une fois installée, l'application fonctionnera même hors ligne et vous recevrez des notifications pour les nouveautés.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}