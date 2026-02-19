import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// GET - Récupérer l'icône active (API publique)
export async function GET() {
  try {
    const { data: activeIcon, error } = await supabase
      .from('app_icons')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la récupération de l\'icône active:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Si aucune icône active, retourner les valeurs par défaut
    if (!activeIcon) {
      return NextResponse.json({
        icon: {
          id: 'default',
          name: 'Icônes par défaut',
          favicon_url: '/favicon.ico',
          icon_192_url: '/icon-192.png',
          icon_512_url: '/icon-512.png',
          apple_touch_icon_url: '/apple-icon.png',
          maskable_icon_url: '/icon-512.png',
          theme_color: '#000000',
          background_color: '#ffffff',
          is_active: true
        }
      })
    }

    return NextResponse.json({ icon: activeIcon })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Cache les réponses pendant 5 minutes
export const revalidate = 300