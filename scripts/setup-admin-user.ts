import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUser() {
  console.log('🔧 Configuration de l\'utilisateur admin...\n');

  try {
    // Créer l'utilisateur admin dans Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'papicamara22@gmail.com',
      password: 'pa621933747',
      email_confirm: true,
      user_metadata: {
        full_name: 'Papi Camara',
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('✅ Utilisateur admin existe déjà dans Auth');
        
        // Récupérer l'utilisateur existant
        const { data: users } = await supabase.auth.admin.listUsers();
        const adminUser = users.users.find(u => u.email === 'papicamara22@gmail.com');
        
        if (adminUser) {
          console.log(`   ID: ${adminUser.id}`);
          
          // Vérifier/créer dans la table users
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', adminUser.id)
            .single();

          if (!existingUser) {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: adminUser.id,
                email: 'papicamara22@gmail.com',
                first_name: 'Papi',
                last_name: 'Camara',
                password: 'hashed', // Placeholder, auth gère le vrai mot de passe
                role: 'admin'
              });

            if (insertError) {
              console.log('❌ Erreur création profil admin:', insertError.message);
            } else {
              console.log('✅ Profil admin créé dans la table users');
            }
          } else {
            // Mettre à jour le rôle si nécessaire
            if (existingUser.role !== 'admin') {
              await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', adminUser.id);
              console.log('✅ Rôle admin mis à jour');
            } else {
              console.log('✅ Profil admin existe déjà avec le bon rôle');
            }
          }
        }
      } else {
        console.log('❌ Erreur création utilisateur:', authError.message);
        return;
      }
    } else {
      console.log('✅ Utilisateur admin créé dans Auth');
      console.log(`   ID: ${authData.user.id}`);

      // Créer le profil dans la table users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'papicamara22@gmail.com',
          first_name: 'Papi',
          last_name: 'Camara',
          password: 'hashed', // Placeholder, auth gère le vrai mot de passe
          role: 'admin'
        });

      if (profileError) {
        console.log('❌ Erreur création profil:', profileError.message);
      } else {
        console.log('✅ Profil admin créé dans la table users');
      }
    }

    // Test de connexion
    console.log('\n🔐 Test de connexion...');
    const testClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: signInData, error: signInError } = await testClient.auth.signInWithPassword({
      email: 'papicamara22@gmail.com',
      password: 'pa621933747'
    });

    if (signInError) {
      console.log('❌ Échec connexion:', signInError.message);
    } else {
      console.log('✅ Connexion admin réussie');
      
      // Vérifier le rôle
      const { data: profile } = await testClient
        .from('users')
        .select('role')
        .eq('id', signInData.user.id)
        .single();

      console.log(`   Rôle: ${profile?.role}`);
    }

    console.log('\n✅ Configuration admin terminée!\n');
    console.log('📝 Identifiants:');
    console.log('   Email: papicamara22@gmail.com');
    console.log('   Mot de passe: pa621933747\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

setupAdminUser();
