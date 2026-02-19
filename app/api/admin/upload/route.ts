import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Upload API called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const resourceType = (formData.get('resourceType') as string) || 'auto'

    console.log('📦 File received:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      resourceType
    })

    if (!file) {
      console.error('❌ No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Verify Cloudinary config
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary configuration missing')
      return NextResponse.json(
        { error: 'Cloudinary configuration missing' },
        { status: 500 }
      )
    }

    console.log('✅ Cloudinary config verified')

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('✅ File converted to buffer:', buffer.length, 'bytes')

    // Upload to Cloudinary
    return new Promise((resolve) => {
      console.log('📤 Starting Cloudinary upload...')
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType as 'image' | 'video' | 'auto',
          folder: 'grandson/uploads',
          use_filename: true,
          unique_filename: true,
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error)
            resolve(
              NextResponse.json(
                { error: 'Upload failed: ' + error.message },
                { status: 500 }
              )
            )
          } else {
            console.log('✅ Upload successful:', result?.secure_url)
            resolve(
              NextResponse.json({
                url: result?.secure_url,
                publicId: result?.public_id,
                type: result?.resource_type,
                width: result?.width,
                height: result?.height,
                size: result?.bytes,
              })
            )
          }
        }
      )

      uploadStream.end(buffer)
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
