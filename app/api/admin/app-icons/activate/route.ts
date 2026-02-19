import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Activer une configuration d'icônes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { iconId, userEmail } = body

    if (!iconId) {
      return NextResponse.json({ error: 'ID de l\'icône requis' }, { status: 400 })
    }

    // Récupérer les détails de l'icône à activer
    const { data: iconToActivate, error: fetchError } = await supabase
      .from('app_icons')
      .select('*')
      .eq('id', iconId)
      .single()

    if (fetchError || !iconToActivate) {
      return NextResponse.json({ error: 'Icône non trouvée' }, { status: 404 })
    }

    // Activer l'icône via la fonction SQL
    const { error: activateError } = await supabase
      .rpc('activate_app_icon', {
        icon_id: iconId,
        changed_by_email: userEmail || 'admin'
      })

    if (activateError) {
      console.error('Erreur lors de l\'activation:', activateError)
      return NextResponse.json({ error: 'Erreur lors de l\'activation' }, { status: 500 })
    }

    // Mettre à jour le manifest.json dynamiquement
    try {
      await updateManifestFile(iconToActivate)
    } catch (manifestError) {
      console.error('Erreur lors de la mise à jour du manifest:', manifestError)
      // Ne pas faire échouer la requête pour cette erreur
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Icône activée avec succès',
      activeIcon: iconToActivate
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Fonction pour mettre à jour le manifest.json
async function updateManifestFile(iconConfig: any) {
  const manifestPath = join(process.cwd(), 'public', 'manifest.json')
  
  const manifest = {
    name: "GRANDSON CLOTHES",
    short_name: "GRANDSON",
    description: "Streetwear authentique depuis la Guinée",
    start_url: "/",
    display: "standalone",
    background_color: iconConfig.background_color || "#ffffff",
    theme_color: iconConfig.theme_color || "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: iconConfig.favicon_url,
        sizes: "32x32",
        type: "image/x-icon"
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
        purpose: "apple-touch-icon"
      }
    ],
    categories: ["shopping", "lifestyle", "fashion"]
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

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}