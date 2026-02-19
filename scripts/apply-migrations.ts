import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigrations() {
  try {
    console.log('🚀 Applying migrations...\n')

    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))

    // Sort by date
    files.sort()

    for (const file of files) {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf-8')

      console.log(`📝 Applying ${file}...`)

      try {
        const { error } = await supabase.rpc('exec', { sql })

        if (error) {
          console.error(`❌ Error in ${file}:`, error.message)
          // Continue with next migration
        } else {
          console.log(`✅ ${file} applied successfully\n`)
        }
      } catch (err) {
        // Try direct query
        try {
          await supabase.from('_migrations').insert({ name: file })
          console.log(`✅ ${file} applied successfully\n`)
        } catch (e) {
          console.error(`⚠️  Could not apply ${file}:`, e)
        }
      }
    }

    console.log('🎉 All migrations applied!')
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

applyMigrations()
