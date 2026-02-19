#!/usr/bin/env node

/**
 * Script de vérification des corrections appliquées
 * Vérifie que toutes les optimisations sont en place
 */

import * as fs from 'fs'
import * as path from 'path'

interface CheckResult {
  name: string
  status: 'success' | 'warning' | 'error'
  message: string
}

const results: CheckResult[] = []

function check(name: string, condition: boolean, successMsg: string, errorMsg: string) {
  results.push({
    name,
    status: condition ? 'success' : 'error',
    message: condition ? successMsg : errorMsg
  })
}

function checkFileExists(filePath: string, description: string) {
  const fullPath = path.join(process.cwd(), filePath)
  const exists = fs.existsSync(fullPath)
  check(
    description,
    exists,
    `✅ ${description}`,
    `❌ ${description} - Fichier manquant: ${filePath}`
  )
  return exists
}

function checkFileContent(filePath: string, searchString: string, description: string) {
  const fullPath = path.join(process.cwd(), filePath)
  if (!fs.existsSync(fullPath)) {
    check(description, false, '', `❌ ${description} - Fichier non trouvé`)
    return false
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8')
  const found = content.includes(searchString)
  check(
    description,
    found,
    `✅ ${description}`,
    `❌ ${description} - Contenu non trouvé: ${searchString}`
  )
  return found
}

console.log('🔍 Vérification des corrections appliquées...\n')

// 1. Vérifier les Server Components
console.log('📄 1. Server Components')
checkFileContent(
  'app/explorer/page.tsx',
  'export default async function',
  'Explorer page est un Server Component'
)
checkFileContent(
  'app/explorer/page.tsx',
  'export const revalidate',
  'Explorer page a la revalidation configurée'
)
checkFileContent(
  'app/produit/[id]/page.tsx',
  'export default async function',
  'Product page est un Server Component'
)
checkFileContent(
  'app/produit/[id]/page.tsx',
  'generateMetadata',
  'Product page a generateMetadata'
)
console.log('')

// 2. Vérifier les composants clients
console.log('🎨 2. Composants Clients')
checkFileExists(
  'components/explorer/explorer-client.tsx',
  'Explorer client component existe'
)
checkFileExists(
  'components/product/product-client.tsx',
  'Product client component existe'
)
checkFileContent(
  'components/explorer/explorer-client.tsx',
  '"use client"',
  'Explorer client a la directive "use client"'
)
checkFileContent(
  'components/product/product-client.tsx',
  '"use client"',
  'Product client a la directive "use client"'
)
console.log('')

// 3. Vérifier les optimisations d'images
console.log('🖼️  3. Optimisation Images')
checkFileContent(
  'components/home/hero-banner.tsx',
  'import Image from "next/image"',
  'Hero banner utilise Next.js Image'
)
checkFileContent(
  'components/home/hero-banner.tsx',
  'priority={index === 0}',
  'Hero banner a priority pour première image'
)
console.log('')

// 4. Vérifier les hooks optimisés
console.log('🪝 4. Hooks Optimisés')
checkFileContent(
  'hooks/use-api.ts',
  'initialData',
  'useProducts supporte initialData'
)
checkFileContent(
  'hooks/use-api.ts',
  'skip',
  'useProducts supporte skip option'
)
console.log('')

// 5. Vérifier les scripts
console.log('📜 5. Scripts')
checkFileExists(
  'scripts/apply-performance-migrations-now.ts',
  'Script de migrations SQL existe'
)
checkFileExists(
  'scripts/apply-all-corrections.ps1',
  'Script PowerShell existe'
)
checkFileExists(
  'scripts/apply-all-corrections.sh',
  'Script Bash existe'
)
console.log('')

// 6. Vérifier la documentation
console.log('📚 6. Documentation')
checkFileExists(
  'CORRECTIONS_ANALYSE_BRUTE_APPLIQUEES.md',
  'Documentation des corrections existe'
)
checkFileExists(
  'GUIDE_CORRECTIONS_PERFORMANCE.md',
  'Guide de performance existe'
)
checkFileExists(
  'SYNTHESE_RAPIDE_CORRECTIONS.md',
  'Synthèse rapide existe'
)
console.log('')

// 7. Vérifier la configuration Next.js
console.log('⚙️  7. Configuration Next.js')
checkFileContent(
  'next.config.mjs',
  'swcMinify: true',
  'SWC minification activée'
)
checkFileContent(
  'next.config.mjs',
  'compress: true',
  'Compression activée'
)
checkFileContent(
  'next.config.mjs',
  'optimizePackageImports',
  'Optimisation des imports configurée'
)
console.log('')

// 8. Vérifier les migrations SQL
console.log('🗄️  8. Migrations SQL')
checkFileExists(
  'supabase/migrations/20260210_add_performance_indexes.sql',
  'Migration des index existe'
)
checkFileExists(
  'supabase/migrations/20260211_add_materialized_views.sql',
  'Migration des vues matérialisées existe'
)
console.log('')

// Résumé
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 RÉSUMÉ\n')

const successCount = results.filter(r => r.status === 'success').length
const errorCount = results.filter(r => r.status === 'error').length
const totalCount = results.length

console.log(`✅ Réussis: ${successCount}/${totalCount}`)
console.log(`❌ Échecs: ${errorCount}/${totalCount}`)
console.log(`📈 Taux de réussite: ${Math.round((successCount / totalCount) * 100)}%`)
console.log('')

if (errorCount > 0) {
  console.log('❌ ERREURS DÉTECTÉES:\n')
  results
    .filter(r => r.status === 'error')
    .forEach(r => console.log(`  ${r.message}`))
  console.log('')
  console.log('⚠️  Certaines corrections ne sont pas appliquées correctement.')
  console.log('   Veuillez vérifier les fichiers mentionnés ci-dessus.')
  process.exit(1)
} else {
  console.log('🎉 TOUTES LES CORRECTIONS SONT EN PLACE !')
  console.log('')
  console.log('✅ Le site est prêt pour:')
  console.log('   • Build de production')
  console.log('   • Tests de performance')
  console.log('   • Déploiement')
  console.log('')
  console.log('🚀 Prochaines étapes:')
  console.log('   1. npm run build')
  console.log('   2. npm run start')
  console.log('   3. lighthouse http://localhost:3000')
  console.log('')
}
