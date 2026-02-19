import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupAdminPassword() {
  console.log('🔧 Configuration du mot de passe admin...\n');

  try {
    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('✅ Mot de passe hashé');

    // Mettre à jour l'utilisateur admin
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        role: 'admin'
      })
      .eq('email', 'admin@example.com')
      .select();

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('✅ Mot de passe admin mis à jour');
    console.log('📝 Identifiants:');
    console.log('   Email: admin@example.com');
    console.log('   Mot de passe: admin123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

setupAdminPassword();
