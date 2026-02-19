"use client"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Test Page - Ça fonctionne !</h1>
      <p className="text-gray-700 mb-4">Si tu vois ce texte, le site fonctionne.</p>
      <div className="bg-blue-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Problèmes possibles :</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Erreurs JavaScript dans la console (F12)</li>
          <li>Composants manquants</li>
          <li>Problèmes de CSS/Tailwind</li>
        </ul>
      </div>
      <div className="mt-6">
        <a href="/" className="text-blue-500 hover:underline">Retour à la page d'accueil</a>
      </div>
    </div>
  )
}