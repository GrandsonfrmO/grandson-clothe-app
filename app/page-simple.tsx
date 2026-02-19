"use client"

import { MobileHeaderSimple } from "@/components/mobile-header-simple"
import { BottomNav } from "@/components/bottom-nav"

export default function HomeSimple() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileHeaderSimple />
      
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Page d'accueil simplifiée</h1>
        <p className="text-gray-600 mb-6">Si cette page s'affiche, le problème vient des autres composants.</p>
        
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="font-semibold">Section 1</h2>
            <p>Contenu de test</p>
          </div>
          
          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="font-semibold">Section 2</h2>
            <p>Contenu de test</p>
          </div>
          
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h2 className="font-semibold">Section 3</h2>
            <p>Contenu de test</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}