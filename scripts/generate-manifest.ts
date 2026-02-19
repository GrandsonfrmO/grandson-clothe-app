#!/usr/bin/env tsx

/**
 * Script pour générer le manifest.json basé sur les icônes actives
 * Usage: npm run generate-manifest
 */

import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AppIcon {
  id: string
  name: string
  description?: string
  favicon_url: string
  icon_192_url: string
  icon_512_url: string
  apple_touch_icon_url: string
  maskable_icon_url?: string
  theme_color: string
  background_color: string
  is_active: boolean
}

async function generateManifest() {
  try {
    console.log('🔍 Récupération des icônes actives...')

    // Récupérer l'icône active
    const { data: activeIcon, error } = await supabase
      .from('app_icons')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erreur Supabase: ${error.message}`)
    }

    // Configuration par défaut si aucune icône active
    const iconConfig: AppIcon = activeIcon || {
      id: 'default',
      name: 'Icônes par défaut',
      description: 'Configuration par défaut',
      favicon_url: '/favicon.ico',
      icon_192_url: '/icon-192.png',
      icon_512_url: '/icon-512.png',
      apple_touch_icon_url: '/apple-icon.png',
      maskable_icon_url: '/icon-512.png',
      theme_color: '#000000',
      background_color: '#ffffff',
      is_active: true
    }

    console.log(`📱 Génération du manifest avec: ${iconConfig.name}`)

    // Générer le manifest.json
    const manifest = {
      name: "GRANDSON CLOTHES",
      short_name: "GRANDSON",
      description: "Streetwear authentique depuis la Guinée - Mode urbaine et lifestyle",
      start_url: "/",
      display: "standalone",
      background_color: iconConfig.background_color,
      theme_color: iconConfig.theme_color,
      orientation: "portrait-primary",
      scope: "/",
      lang: "fr",
      dir: "ltr",
      
      icons: [
        {
          src: iconConfig.favicon_url,
          sizes: "32x32",
          type: "image/x-icon",
          purpose: "any"
        },
        {
          src: iconConfig.icon_192_url,
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: iconConfig.icon_512_url,
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: iconConfig.apple_touch_icon_url,
          sizes: "180x180",
          type: "image/png",
          purpose: "any"
        }
      ],

      // Catégories pour les app stores
      categories: ["shopping", "lifestyle", "fashion", "business"],
      
      // Configuration PWA avancée
      display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
      
      // Raccourcis dans le menu contextuel
      shortcuts: [
        {
          name: "Explorer les produits",
          short_name: "Explorer",
          description: "Découvrir notre catalogue de streetwear",
          url: "/explorer",
          icons: [
            {
              src: iconConfig.icon_192_url,
              sizes: "192x192",
              type: "image/png"
            }
          ]
        },
        {
          name: "Mon panier",
          short_name: "Panier",
          description: "Voir mon panier d'achat",
          url: "/panier",
          icons: [
            {
              src: iconConfig.icon_192_url,
              sizes: "192x192", 
              type: "image/png"
            }
          ]
        },
        {
          name: "Mes commandes",
          short_name: "Commandes",
          description: "Suivre mes commandes",
          url: "/commandes",
          icons: [
            {
              src: iconConfig.icon_192_url,
              sizes: "192x192",
              type: "image/png"
            }
          ]
        }
      ],

      // Screenshots pour les app stores (optionnel)
      screenshots: [
        {
          src: "/screenshots/mobile-home.png",
          sizes: "390x844",
          type: "image/png",
          form_factor: "narrow",
          label: "Page d'accueil sur mobile"
        },
        {
          src: "/screenshots/desktop-home.png", 
          sizes: "1920x1080",
          type: "image/png",
          form_factor: "wide",
          label: "Page d'accueil sur desktop"
        }
      ]
    }

    // Ajouter l'icône maskable si disponible
    if (iconConfig.maskable_icon_url) {
      manifest.icons.push({
        src: iconConfig.maskable_icon_url,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      })
    }

    // Écrire le fichier manifest.json
    const manifestPath = join(process.cwd(), 'public', 'manifest.json')
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2))

    console.log('✅ Manifest.json généré avec succès!')
    console.log(`📍 Fichier: ${manifestPath}`)
    console.log(`🎨 Couleur du thème: ${iconConfig.theme_color}`)
    console.log(`🎨 Couleur de fond: ${iconConfig.background_color}`)
    console.log(`🖼️  Icônes: ${manifest.icons.length} fichiers`)

    // Afficher un résumé
    console.log('\n📋 Résumé du manifest:')
    console.log(`   • Nom: ${manifest.name}`)
    console.log(`   • Nom court: ${manifest.short_name}`)
    console.log(`   • Mode d'affichage: ${manifest.display}`)
    console.log(`   • Orientation: ${manifest.orientation}`)
    console.log(`   • Raccourcis: ${manifest.shortcuts.length}`)
    console.log(`   • Catégories: ${manifest.categories.join(', ')}`)

  } catch (error) {
    console.error('❌ Erreur lors de la génération du manifest:', error)
    process.exit(1)
  }
}

// Exécuter le script
if (require.main === module) {
  generateManifest()
}

export { generateManifest }