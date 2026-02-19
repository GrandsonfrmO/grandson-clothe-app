/**
 * Configuration simple de la base de données
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function setup() {
  console.log('🔧 Configuration de la base de données...\n')
  
  // 1. Créer user_settings si n'existe pas
  console.log('1. Vérification table user_settings...')
  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('id')
    .limit(1)
  
  if (settingsError) {
    if (settingsError.message.includes('does not exist') || settingsError.code === 'PGRST204') {
      console.log('   ⚠️  Table user_settings n\'existe pas')
      console.log('   📝 Créez-la manuellement dans Supabase SQL Editor avec:')
      console.log(`
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  privacy_mode BOOLEAN DEFAULT false,
  data_collection BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
      `)
    } else {
      console.log('   ✅ Table user_settings existe')
    }
  } else {
    console.log('   ✅ Table user_settings existe')
  }
  
  // 2. Vérifier les autres tables
  console.log('\n2. Vérification des tables principales...')
  const tables = ['users', 'products', 'orders', 'categories']
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('id')
      .limit(1)
    
    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`)
    } else {
      console.log(`   ✅ ${table}`)
    }
  }
  
  console.log('\n✅ Vérification terminée!')
}

setup()
