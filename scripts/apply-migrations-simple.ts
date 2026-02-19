#!/usr/bin/env tsx
/**
 * Script simplifié pour appliquer les migrations de performance
 * Utilise directement le client Postgres
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Charger les variables d'environnement
config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Application des migrations de performance...\n')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('📝 Les migrations SQL doivent être appliquées manuellement via Supabase Dashboard\n')
  console.log('🔗 Ouvrez: https://supabase.com/dashboard/project/zyhqiwaudcilqwrcckdq/editor\n')
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  
  const migrations = [
    '20260210_add_performance_indexes.sql',
    '20260211_add_materialized_views.sql'
  ]
  
  console.log('📋 Migrations à appliquer:\n')
  
  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration)
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${migration} non trouvé`)
      continue
    }
    
    const sql = fs.readFileSync(filePath, 'utf-8')
    
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📄 ${migration}`)
    console.log('='.repeat(60))
    console.log(sql)
    console.log('='.repeat(60))
  }
  
  console.log('\n\n✅ INSTRUCTIONS:')
  console.log('   1. Copiez le SQL ci-dessus')
  console.log('   2. Ouvrez Supabase SQL Editor')
  console.log('   3. Collez et exécutez le SQL')
  console.log('   4. Les erreurs "already exists" sont normales')
  console.log('\n🔗 Lien direct: https://supabase.com/dashboard/project/zyhqiwaudcilqwrcckdq/editor')
  
  // Vérifier si les index existent déjà
  console.log('\n\n🔍 Vérification des index existants...')
  
  try {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .like('indexname', 'idx_%')
      .limit(10)
    
    if (error) {
      console.log('⚠️  Impossible de vérifier les index (normal si pg_indexes n\'est pas accessible)')
    } else if (data && data.length > 0) {
      console.log(`✅ ${data.length} index trouvés:`)
      data.forEach((idx: any) => console.log(`   - ${idx.indexname}`))
    } else {
      console.log('⚠️  Aucun index de performance trouvé - migrations à appliquer')
    }
  } catch (e) {
    console.log('⚠️  Vérification des index non disponible')
  }
  
  console.log('\n🎉 Script terminé!')
}

main().catch(console.error)
