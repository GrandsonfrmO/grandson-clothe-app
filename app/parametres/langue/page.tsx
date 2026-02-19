"use client"

import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useState } from "react"

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

export default function LanguagePage() {
  const [selectedLanguage, setSelectedLanguage] = useState("fr")

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Langue" showBack />
      
      <main className="px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Sélectionnez votre langue</h2>
          <p className="text-sm text-muted-foreground">
            Choisissez la langue d'affichage de l'application
          </p>
        </div>

        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                selectedLanguage === lang.code
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              {selectedLanguage === lang.code && (
                <Check className="w-5 h-5 text-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            💡 La langue sélectionnée sera appliquée à votre prochaine visite
          </p>
        </div>

        <Button className="w-full rounded-xl h-12">
          Appliquer les modifications
        </Button>
      </main>

      <BottomNav />
    </div>
  )
}
