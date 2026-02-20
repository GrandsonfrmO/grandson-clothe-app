#!/usr/bin/env tsx
/**
 * Script pour appliquer les migrations de performance
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// ✅ Charger les variables d'environnement depuis .env.local
config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Vérification des variables d\'environnement...')
console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Défini' : '❌ Manquant'}`)
console.log(`   SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Défini' : '❌ Manquant'}`)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Variables d\'environnement manquantes')
  console.error('Assurez-vous que .env.local contient:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSqlDirectly(sql: string) {
  try {
    // Utiliser l'API REST de Supabase pour exécuter du SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey!,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return { success: true }
  } catch (error: any) {
    // Si la fonction RPC n'existe pas, essayer avec le client Supabase
    const { error: supabaseError } = await supabase.rpc('exec_sql', { query: sql })
    if (supabaseError) {
      throw supabaseError
    }
    return { success: true }
  }
}

async function applyMigration(filePath: string, name: string) {
  console.log(`\n📝 Application de ${name}...`)
  
  try {
    const sql = fs.readFileSync(filePath, 'utf-8')
    
    // Split par statement pour exécution séquentielle
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    let successCount = 0
    let skipCount = 0
    
    for (const statement of statements) {
      if (!statement || statement.length < 10) continue
      
      try {
        await executeSqlDirectly(statement + ';')
        successCount++
      } catch (error: any) {
        // Ignorer les erreurs "already exists"
        if (error.message?.includes('already exists') || 
            error.message?.includes('existe déjà') ||
            error.code === '42P07' || // relation already exists
            error.code === '42710') { // object already exists
          skipCount++
          console.log(`   ⚠️  Déjà existant, ignoré`)
        } else {
          console.error(`   ❌ Erreur:`, error.message)
          throw error
        }
      }
    }
    
    console.log(`✅ ${name} appliquée: ${successCount} statements exécutés, ${skipCount} ignorés`)
    return true
  } catch (error: any) {
    console.error(`❌ Erreur lors de l'application de ${name}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Application des migrations de performance...\n')
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  
  // Migrations à appliquer
  const migrations = [
    {
      file: '20260210_add_performance_indexes.sql',
      name: 'Index de performance'
    },
    {
      file: '20260211_add_materialized_views.sql',
      name: 'Vues matérialisées'
    }
  ]
  
  let successCount = 0
  
  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration.file)
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${migration.file} non trouvé, ignoré`)
      continue
    }
    
    const success = await applyMigration(filePath, migration.name)
    if (success) successCount++
  }
  
  console.log(`\n✅ ${successCount}/${migrations.length} migrations appliquées`)
  
  // Rafraîchir les vues matérialisées
  console.log('\n🔄 Rafraîchissement des vues matérialisées...')
  
  const views = [
    'mv_product_stats',
    'mv_category_stats',
    'mv_order_stats',
    'mv_user_stats'
  ]
  
  for (const view of views) {
    try {
      await executeSqlDirectly(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view};`)
      console.log(`   ✅ ${view} rafraîchie`)
    } catch (error: any) {
      // Si CONCURRENTLY échoue, essayer sans
      try {
        await executeSqlDirectly(`REFRESH MATERIALIZED VIEW ${view};`)
        console.log(`   ✅ ${view} rafraîchie (sans CONCURRENTLY)`)
      } catch (e: any) {
        console.log(`   ⚠️  ${view} non disponible ou erreur: ${e.message}`)
      }
    }
  }
  
  console.log('\n🎉 Migrations de performance terminées!')
  console.log('\n📊 PROCHAINES ÉTAPES:')
  console.log('   1. Nettoyer le cache: rm -rf .next')
  console.log('   2. Rebuilder: npm run build')
  console.log('   3. Tester: npm run start')
  console.log('   4. Analyser: lighthouse http://localhost:3000')
}

main().catch(console.error)
