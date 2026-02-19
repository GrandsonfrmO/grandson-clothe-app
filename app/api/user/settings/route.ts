import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateRequest } from '@/lib/simple-auth'
import { z } from 'zod'

const settingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  newsletter: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
  privacyMode: z.boolean().default(false),
  dataCollection: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Get user settings from table
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Return default settings if none exist
    const defaultSettings = {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      newsletter: false,
      marketingEmails: false,
      privacyMode: false,
      dataCollection: true,
    }

    return NextResponse.json({
      settings: settings || defaultSettings,
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    // Check if settings exist
    const { data: existingSettings } = await supabaseAdmin
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result
    if (existingSettings) {
      // Update existing settings
      result = await supabaseAdmin
        .from('user_settings')
        .update({
          email_notifications: validatedData.emailNotifications,
          sms_notifications: validatedData.smsNotifications,
          push_notifications: validatedData.pushNotifications,
          newsletter: validatedData.newsletter,
          marketing_emails: validatedData.marketingEmails,
          privacy_mode: validatedData.privacyMode,
          data_collection: validatedData.dataCollection,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Create new settings
      result = await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: user.id,
          email_notifications: validatedData.emailNotifications,
          sms_notifications: validatedData.smsNotifications,
          push_notifications: validatedData.pushNotifications,
          newsletter: validatedData.newsletter,
          marketing_emails: validatedData.marketingEmails,
          privacy_mode: validatedData.privacyMode,
          data_collection: validatedData.dataCollection,
        })
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    return NextResponse.json({
      message: 'Paramètres mis à jour avec succès',
      settings: {
        emailNotifications: result.data.email_notifications,
        smsNotifications: result.data.sms_notifications,
        pushNotifications: result.data.push_notifications,
        newsletter: result.data.newsletter,
        marketingEmails: result.data.marketing_emails,
        privacyMode: result.data.privacy_mode,
        dataCollection: result.data.data_collection,
      },
    })
  } catch (error) {
    console.error('Update settings error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}
