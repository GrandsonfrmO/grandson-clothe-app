import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zyhqiwaudcilqwrcckdq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aHFpd2F1ZGNpbHF3cmNja2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE1NjYyNSwiZXhwIjoyMDg1NzMyNjI1fQ.ubuFLkzLZ06ufH8gNsKEpWDz7r_mc4fS9eFWnu6Oi3w'

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeMigration() {
  try {
    console.log('🔄 Executing SQL migration...')

    // Use the query method to execute raw SQL
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE models
        ADD COLUMN IF NOT EXISTS email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        
        CREATE INDEX IF NOT EXISTS idx_models_email ON models(email);
      `
    })

    if (error) {
      console.error('❌ RPC Error:', error)
      console.log('\n📝 Trying alternative approach...')
      
      // Try using the query builder with a workaround
      // We'll update the schema by modifying existing records
      const { data: models, error: fetchError } = await supabase
        .from('models')
        .select('*')
        .limit(1)
      
      if (fetchError) {
        console.error('Fetch error:', fetchError)
      } else {
        console.log('✅ Models table is accessible')
        console.log('\n⚠️  Note: Email and phone columns need to be added manually via Supabase dashboard')
        console.log('Go to: https://app.supabase.com/project/zyhqiwaudcilqwrcckdq/editor/models')
        console.log('\nRun this SQL in the SQL Editor:')
        console.log(`
ALTER TABLE models
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_models_email ON models(email);
        `)
      }
    } else {
      console.log('✅ Migration executed successfully!')
      console.log('✨ Email and phone columns added to models table')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

executeMigration()
