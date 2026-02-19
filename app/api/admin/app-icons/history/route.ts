import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Récupérer l'historique des changements d'icônes
export async function GET() {
  try {
    const { data: history, error } = await supabase
      .from('app_icons_history')
      .select(`
        *,
        icon:app_icons!app_icons_history_icon_id_fkey(name),
        previous_icon:app_icons!app_icons_history_previous_icon_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}