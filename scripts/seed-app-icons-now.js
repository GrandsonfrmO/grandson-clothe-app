const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: { schema: 'public' },
    auth: { persistSession: false }
  }
);

async function seedAppIcons() {
  console.log('\n🎨 Peuplement de la table app_icons...\n');

  // Créer 3 icônes de test
  const icons = [
    {
      name: 'Logo Noir GRANDSON',
      description: 'Logo noir classique',
      favicon_url: '/favicon.ico',
      icon_192_url: '/icon-192.png',
      icon_512_url: '/icon-512.png',
      apple_touch_icon_url: '/apple-icon.png',
      theme_color: '#000000',
      background_color: '#FFFFFF',
      is_active: true
    },
    {
      name: 'Logo Rouge GRANDSON',
      description: 'Logo rouge dynamique',
      favicon_url: 'https://via.placeholder.com/32/FF0000/FFFFFF?text=G',
      icon_192_url: 'https://via.placeholder.com/192/FF0000/FFFFFF?text=G',
      icon_512_url: 'https://via.placeholder.com/512/FF0000/FFFFFF?text=G',
      apple_touch_icon_url: 'https://via.placeholder.com/180/FF0000/FFFFFF?text=G',
      theme_color: '#FF0000',
      background_color: '#FFFFFF',
      is_active: false
    },
    {
      name: 'Logo Bleu GRANDSON',
      description: 'Logo bleu moderne',
      favicon_url: 'https://via.placeholder.com/32/0000FF/FFFFFF?text=G',
      icon_192_url: 'https://via.placeholder.com/192/0000FF/FFFFFF?text=G',
      icon_512_url: 'https://via.placeholder.com/512/0000FF/FFFFFF?text=G',
      apple_touch_icon_url: 'https://via.placeholder.com/180/0000FF/FFFFFF?text=G',
      theme_color: '#0000FF',
      background_color: '#FFFFFF',
      is_active: false
    }
  ];

  console.log(`📦 Création de ${icons.length} icônes...\n`);

  for (const icon of icons) {
    try {
      // Utiliser l'API REST directement
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/app_icons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(icon)
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ ${icon.name}`);
        console.log(`   ID: ${created[0]?.id || 'N/A'}`);
        console.log(`   Theme: ${icon.theme_color}\n`);
      } else {
        const error = await response.text();
        if (error.includes('duplicate') || error.includes('unique')) {
          console.log(`⚠️  ${icon.name} (existe déjà)\n`);
        } else {
          console.log(`❌ ${icon.name}`);
          console.log(`   Erreur: ${error}\n`);
        }
      }
    } catch (err) {
      console.log(`❌ ${icon.name}`);
      console.log(`   Exception: ${err.message}\n`);
    }
  }

  // Vérifier les icônes créées
  console.log('🔍 Vérification...\n');

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/app_icons?select=*`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (response.ok) {
      const allIcons = await response.json();
      console.log(`✅ Total icônes: ${allIcons.length}\n`);

      allIcons.forEach((icon, index) => {
        const status = icon.is_active ? '🟢 ACTIVE' : '⚪ Inactive';
        console.log(`${index + 1}. ${status} - ${icon.name}`);
        console.log(`   Theme: ${icon.theme_color}`);
        console.log(`   Favicon: ${icon.favicon_url}\n`);
      });
    } else {
      console.log('❌ Erreur vérification:', await response.text());
    }
  } catch (err) {
    console.log('❌ Exception vérification:', err.message);
  }

  console.log('='.repeat(70));
  console.log('🎉 Peuplement terminé!');
  console.log('='.repeat(70) + '\n');

  console.log('📝 PROCHAINES ÉTAPES:\n');
  console.log('1. Démarrer le serveur: npm run dev');
  console.log('2. Aller sur: http://localhost:3000/admin/app-icons');
  console.log('3. Vous verrez les 3 icônes créées');
  console.log('4. Cliquer sur "Activer" pour changer l\'icône');
  console.log('5. Rafraîchir la page pour voir le changement\n');
}

seedAppIcons();
