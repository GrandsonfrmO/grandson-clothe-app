/**
 * Réinitialiser le mot de passe admin
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Charger les variables d'environnement
config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetAdminPassword() {
  console.log('🔐 Réinitialisation du mot de passe admin...\n')
  
  try {
    // Hash du nouveau mot de passe
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    console.log('📝 Nouveau mot de passe hashé')
    
    // Mise à jour du mot de passe
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        is_verified: true 
      })
      .eq('email', 'admin@grandsonclothes.com')
      .select()
    
    if (error) {
      console.error('❌ Erreur:', error.message)
      return
    }
    
    if (!data || data.length === 0) {
      console.log('❌ Utilisateur admin non trouvé!')
      return
    }
    
    console.log('✅ Mot de passe admin réinitialisé avec succès!')
    console.log('\n📋 Identifiants:')
    console.log('   Email: admin@grandsonclothes.com')
    console.log('   Mot de passe: admin123')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

resetAdminPassword()
