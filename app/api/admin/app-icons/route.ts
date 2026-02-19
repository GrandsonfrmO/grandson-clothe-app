import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Récupérer toutes les icônes
export async function GET() {
  try {
    const { data: icons, error } = await supabase
      .from('app_icons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des icônes:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ icons })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle configuration d'icônes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      favicon_url,
      icon_192_url,
      icon_512_url,
      apple_touch_icon_url,
      maskable_icon_url,
      theme_color,
      background_color
    } = body

    // Validation
    if (!name || !favicon_url || !icon_192_url || !icon_512_url || !apple_touch_icon_url) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    const { data: newIcon, error } = await supabase
      .from('app_icons')
      .insert({
        name,
        description,
        favicon_url,
        icon_192_url,
        icon_512_url,
        apple_touch_icon_url,
        maskable_icon_url,
        theme_color: theme_color || '#000000',
        background_color: background_color || '#ffffff',
        is_active: false
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de l\'icône:', error)
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    return NextResponse.json({ icon: newIcon }, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une configuration d'icônes
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { data: updatedIcon, error } = await supabase
      .from('app_icons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ icon: updatedIcon })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une configuration d'icônes
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Vérifier que ce n'est pas l'icône active
    const { data: activeIcon } = await supabase
      .from('app_icons')
      .select('id')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (activeIcon) {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'icône active' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('app_icons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression:', error)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}