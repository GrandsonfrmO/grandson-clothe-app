import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// DELETE - Supprimer une configuration d'icônes spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Vérifier que ce n'est pas l'icône active
    const { data: iconToDelete, error: fetchError } = await supabase
      .from('app_icons')
      .select('is_active, name')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Icône non trouvée' }, { status: 404 })
    }

    if (iconToDelete.is_active) {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'icône active. Activez d\'abord une autre icône.' },
        { status: 400 }
      )
    }

    // Supprimer l'icône
    const { error: deleteError } = await supabase
      .from('app_icons')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Set d'icônes "${iconToDelete.name}" supprimé avec succès` 
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET - Récupérer une configuration d'icônes spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { data: icon, error } = await supabase
      .from('app_icons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Icône non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ icon })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une configuration d'icônes spécifique
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Supprimer l'ID du body pour éviter les conflits
    const { id: _, ...updateData } = body

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

    return NextResponse.json({ 
      icon: updatedIcon,
      message: 'Icône mise à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}