const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedMissingData() {
  console.log('\n🌱 Peuplement des données manquantes...\n');

  // 1. Homepage Content
  console.log('📄 Homepage Content...');
  
  const homepageContent = [
    {
      section_key: 'hero_banner',
      title: 'Hero Banner',
      subtitle: 'Main banner on homepage',
      description: 'Main banner section',
      is_active: true
    },
    {
      section_key: 'new_drop',
      title: 'NEW DROP',
      subtitle: 'Collection 2026',
      description: 'New collection banner',
      is_active: true
    },
    {
      section_key: 'street_vibes',
      title: 'STREET VIBES',
      subtitle: 'Made in Guinea',
      description: 'Street vibes collection',
      is_active: true
    },
    {
      section_key: 'quick_categories',
      title: 'Quick Categories',
      subtitle: 'Quick category shortcuts',
      description: 'Quick category section',
      is_active: true
    },
    {
      section_key: 'featured_products',
      title: 'Featured Products',
      subtitle: 'Featured products section',
      description: 'Featured products',
      is_active: true
    },
    {
      section_key: 'promo_card',
      title: 'Promo Card',
      subtitle: 'Promotional card',
      description: 'Special offer card',
      is_active: true
    },
    {
      section_key: 'trending_section',
      title: 'Trending Section',
      subtitle: 'Trending products',
      description: 'Trending products',
      is_active: true
    },
    {
      section_key: 'videos_section',
      title: 'Videos Section',
      subtitle: 'Videos showcase',
      description: 'Videos section',
      is_active: true
    }
  ];

  for (const content of homepageContent) {
    const { error } = await supabase
      .from('homepage_content')
      .upsert(content, { onConflict: 'section_key' });

    if (error) {
      console.log(`   ❌ ${content.section_key}: ${error.message}`);
    } else {
      console.log(`   ✅ ${content.section_key}`);
    }
  }

  // 2. App Icons par défaut
  console.log('\n🎨 App Icons...');

  const { data: existingIcons } = await supabase
    .from('app_icons')
    .select('*')
    .limit(1);

  if (!existingIcons || existingIcons.length === 0) {
    const defaultIcon = {
      name: 'Logo par défaut',
      description: 'Set d\'icônes par défaut pour GRANDSON CLOTHES',
      favicon_url: '/favicon.ico',
      icon_192_url: '/icon-192.png',
      icon_512_url: '/icon-512.png',
      apple_touch_icon_url: '/apple-icon.png',
      theme_color: '#000000',
      background_color: '#ffffff',
      is_active: true
    };

    const { error } = await supabase
      .from('app_icons')
      .insert(defaultIcon);

    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log('   ✅ Icône par défaut créée');
    }
  } else {
    console.log('   ⚠️  Icône déjà existante');
  }

  // 3. Vérifier et afficher les statistiques
  console.log('\n📊 Statistiques finales...\n');

  const tables = [
    'homepage_content',
    'app_icons',
    'gallery',
    'videos',
    'models',
    'special_offers'
  ];

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    console.log(`   ${table.padEnd(25)} ${(count || 0).toString().padStart(3)} enregistrements`);
  }

  console.log('\n✨ Données peuplées avec succès!\n');
}

seedMissingData().catch(console.error);
