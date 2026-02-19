import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try to add columns by attempting to update with the new fields
    // This will fail if columns don't exist, but we can catch that
    console.log('Attempting to add email and phone columns...')

    // First, let's check if we can query the table with these columns
    const { data: testData, error: testError } = await supabase
      .from('models')
      .select('email, phone')
      .limit(1)

    if (testError && testError.message.includes('email')) {
      console.log('Columns do not exist, attempting to add them...')
      
      // Try using the query method with raw SQL
      // Note: This requires a function to be created in Supabase
      // For now, we'll return instructions
      return NextResponse.json({
        status: 'columns_missing',
        message: 'Email and phone columns need to be added',
        sql: `
          ALTER TABLE models
          ADD COLUMN IF NOT EXISTS email VARCHAR(255),
          ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
          
          CREATE INDEX IF NOT EXISTS idx_models_email ON models(email);
        `,
        instructions: 'Please run the SQL above in your Supabase SQL Editor'
      }, { status: 200 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Columns already exist or migration completed'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
