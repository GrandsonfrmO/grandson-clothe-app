/**
 * SEED DONNÉES FINALES POUR 100%
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSpecialOffer() {
  console.log('🎁 Création offre spéciale...');
  
  const { data, error } = await supabase
    .from('special_offer')
    .insert({
      title: 'Soldes d\'Hiver 2026',
      description: 'Jusqu\'à -50% sur toute la collection hiver',
      discount_percentage: 50,
      image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
      link_url: '/products',
      is_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  if (error) {
    console.log('⚠️  Offre existe déjà ou erreur:', error.message);
  } else {
    console.log('✅ Offre spéciale créée:', data.title);
  }
}

async function seedAppIcons() {
  console.log('🎨 Création icônes application...');
  
  const icons = [
    {
      name: 'Icône par défaut',
      description: 'Icône principale de l\'application',
      icon_192: '/icon-192x192.png',
      icon_512: '/icon-512x512.png',
      apple_icon: '/apple-icon.png',
      favicon: '/favicon.ico',
      is_active: true,
      theme: 'light'
    },
    {
      name: 'Icône sombre',
      description: 'Icône pour le mode sombre',
      icon_192: '/icon-192x192-dark.png',
      icon_512: '/icon-512x512-dark.png',
      apple_icon: '/apple-icon-dark.png',
      favicon: '/favicon-dark.ico',
      is_active: false,
      theme: 'dark'
    }
  ];

  for (const icon of icons) {
    const { data, error } = await supabase
      .from('app_icons')
      .insert(icon)
      .select()
      .single();

    if (error) {
      console.log(`⚠️  ${icon.name}: ${error.message}`);
    } else {
      console.log(`✅ ${icon.name} créée`);
    }
  }
}

async function main() {
  console.log('🚀 SEED DONNÉES FINALES POUR 100%\n');
  
  await seedSpecialOffer();
  await seedAppIcons();
  
  console.log('\n✅ SEED TERMINÉ!\n');
  console.log('Testez: npx tsx scripts/test-site-100-pourcent.ts\n');
}

main();
