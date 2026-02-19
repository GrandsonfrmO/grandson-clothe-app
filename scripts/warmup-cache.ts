#!/usr/bin/env tsx

/**
 * 🔥 WARMUP DU CACHE
 * 
 * Précharge le cache avec les données les plus fréquemment consultées
 * À exécuter au démarrage de l'application pour des performances instantanées
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface WarmupTask {
  name: string
  url: string
  priority: number
}

const tasks: WarmupTask[] = [
  // Priorité 1 - Données critiques
  { name: 'Produits vedette', url: '/api/products?featured=true', priority: 1 },
  { name: 'Catégories', url: '/api/categories', priority: 1 },
  { name: 'Offre spéciale', url: '/api/special-offer', priority: 1 },
  
  // Priorité 2 - Données importantes
  { name: 'Tous les produits (page 1)', url: '/api/products?limit=50', priority: 2 },
  { name: 'Produits populaires', url: '/api/products?sort=popular&limit=20', priority: 2 },
  { name: 'Nouveaux produits', url: '/api/products?sort=newest&limit=20', priority: 2 },
  
  // Priorité 3 - Données secondaires
  { name: 'Galerie', url: '/api/gallery', priority: 3 },
  { name: 'Vidéos', url: '/api/videos', priority: 3 },
  { name: 'Modèles', url: '/api/models', priority: 3 },
]

async function warmupEndpoint(task: WarmupTask): Promise<boolean> {
  try {
    const start = Date.now()
    const response = await fetch(`${API_URL}${task.url}`)
    const duration = Date.now() - start

    if (response.ok) {
      const cacheHeader = response.headers.get('X-Cache')
      console.log(`   ✅ ${task.name} - ${duration}ms ${cacheHeader ? `[${cacheHeader}]` : ''}`)
      return true
    } else {
      console.log(`   ❌ ${task.name} - Erreur ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ ${task.name} - Erreur réseau`)
    return false
  }
}

async function warmupByPriority(priority: number): Promise<void> {
  const priorityTasks = tasks.filter(t => t.priority === priority)
  
  console.log(`\n🔥 Priorité ${priority} (${priorityTasks.length} tâches)`)
  
  // Exécuter en parallèle pour cette priorité
  const results = await Promise.all(
    priorityTasks.map(task => warmupEndpoint(task))
  )
  
  const success = results.filter(r => r).length
  console.log(`   ${success}/${priorityTasks.length} réussies`)
}

async function runWarmup() {
  console.log('🔥 WARMUP DU CACHE\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const startTime = Date.now()

  // Vérifier que le serveur est accessible
  try {
    await fetch(`${API_URL}/api/health`)
  } catch (error) {
    console.log('\n❌ ERREUR: Le serveur n\'est pas accessible')
    console.log(`   URL: ${API_URL}`)
    console.log('   Assurez-vous que le serveur est démarré\n')
    process.exit(1)
  }

  // Warmup par priorité (séquentiel entre priorités, parallèle dans chaque priorité)
  for (let priority = 1; priority <= 3; priority++) {
    await warmupByPriority(priority)
  }

  const totalTime = Date.now() - startTime

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ WARMUP TERMINÉ\n')
  console.log(`   Temps total: ${totalTime}ms`)
  console.log(`   Tâches: ${tasks.length}`)
  console.log('\n🎉 Le cache est maintenant chaud!')
  console.log('⚡ Les prochaines requêtes seront INSTANTANÉES\n')
}

// Exécution
runWarmup().catch(console.error)
