#!/usr/bin/env node

/**
 * Script de test pour vérifier les erreurs d'hydration
 * Lance le serveur de dev et vérifie les logs
 */

const { spawn } = require('child_process')

console.log('🔍 Test des erreurs d\'hydration...\n')

const dev = spawn('pnpm', ['dev'], {
  stdio: 'pipe',
  shell: true
})

let hasHydrationError = false
let serverReady = false

dev.stdout.on('data', (data) => {
  const output = data.toString()
  console.log(output)
  
  if (output.includes('Local:')) {
    serverReady = true
    console.log('\n✅ Serveur démarré avec succès')
    console.log('📝 Ouvrez http://localhost:3000 dans votre navigateur')
    console.log('🔍 Vérifiez la console du navigateur pour les erreurs d\'hydration')
    console.log('\n⏱️  Le script s\'arrêtera automatiquement dans 30 secondes...\n')
    
    setTimeout(() => {
      console.log('\n⏹️  Arrêt du serveur...')
      dev.kill()
      
      if (hasHydrationError) {
        console.log('\n❌ Des erreurs d\'hydration ont été détectées')
        process.exit(1)
      } else {
        console.log('\n✅ Aucune erreur d\'hydration détectée dans les logs')
        console.log('💡 Vérifiez manuellement la console du navigateur')
        process.exit(0)
      }
    }, 30000)
  }
})

dev.stderr.on('data', (data) => {
  const output = data.toString()
  console.error(output)
  
  if (output.toLowerCase().includes('hydration') || 
      output.toLowerCase().includes('hydrate')) {
    hasHydrationError = true
    console.error('\n⚠️  ERREUR D\'HYDRATION DÉTECTÉE!\n')
  }
})

dev.on('close', (code) => {
  if (!serverReady) {
    console.error('\n❌ Le serveur n\'a pas pu démarrer')
    process.exit(1)
  }
})

// Gestion de l'interruption
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Arrêt du test...')
  dev.kill()
  process.exit(0)
})
