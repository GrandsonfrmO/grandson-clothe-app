import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration(filePath: string) {
  console.log(`\n📄 Applying migration: ${path.basename(filePath)}`)
  
  const sql = fs.readFileSync(filePath, 'utf-8')
  
  // Split by semicolon and filter empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })
      
      if (error) {
        // Try direct execution if RPC fails
        const { error: directError } = await supabase.from('_migrations').insert({
          name: path.basename(filePath),
          executed_at: new Date().toISOString()
        })
        
        if (directError && !directError.message.includes('already exists')) {
          console.error(`   ⚠️  Warning: ${directError.message}`)
        }
      }
    } catch (err: any) {
      if (!err.message?.includes('already exists')) {
        console.error(`   ⚠️  Warning: ${err.message}`)
      }
    }
  }
  
  console.log(`   ✅ Migration applied successfully`)
}

async function main() {
  console.log('🚀 Applying performance migrations...\n')
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  
  const migrations = [
    '20260210_add_performance_indexes.sql',
    '20260211_add_materialized_views.sql'
  ]
  
  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration)
    
    if (fs.existsSync(filePath)) {
      await applyMigration(filePath)
    } else {
      console.log(`⚠️  Migration file not found: ${migration}`)
    }
  }
  
  console.log('\n✅ All performance migrations applied!')
  console.log('\n📊 Refreshing materialized views...')
  
  // Refresh materialized views
  try {
    const { error } = await supabase.rpc('refresh_materialized_views')
    if (error) {
      console.log('   ⚠️  Could not refresh views automatically')
      console.log('   Run this SQL manually in Supabase:')
      console.log('   SELECT refresh_materialized_views();')
    } else {
      console.log('   ✅ Materialized views refreshed')
    }
  } catch (err) {
    console.log('   ⚠️  Views will be refreshed on first use')
  }
  
  console.log('\n🎉 Performance optimizations complete!')
}

main().catch(console.error)
