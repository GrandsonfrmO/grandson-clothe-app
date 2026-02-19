import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'
import path from 'path'

async function cleanDev() {
  console.log('🧹 Nettoyage des fichiers de développement...')
  
  const foldersToClean = [
    '.next',
    'node_modules/.cache',
    '.turbo'
  ]
  
  for (const folder of foldersToClean) {
    const folderPath = path.join(process.cwd(), folder)
    
    if (existsSync(folderPath)) {
      console.log(`🗑️ Suppression de ${folder}...`)
      try {
        rmSync(folderPath, { recursive: true, force: true })
        console.log(`✅ ${folder} supprimé`)
      } catch (error) {
        console.log(`⚠️ Impossible de supprimer ${folder}:`, error)
      }
    } else {
      console.log(`ℹ️ ${folder} n'existe pas`)
    }
  }
  
  console.log('\n🎉 Nettoyage terminé !')
  console.log('💡 Tu peux maintenant relancer: npm run dev')
}

cleanDev().catch(console.error)