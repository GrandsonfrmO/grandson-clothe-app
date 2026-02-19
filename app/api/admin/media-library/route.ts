import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/simple-auth'
import { v2 as cloudinary } from 'cloudinary'

// Middleware to check admin role
async function requireAdmin(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user || user.role !== 'admin') {
    return null
  }
  return user
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    // Check if Cloudinary is configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        files: [],
        message: 'Cloudinary not configured'
      })
    }

    // Get all resources from the grandson/uploads folder
    const result = await new Promise((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: 'upload',
          prefix: 'grandson/uploads',
          max_results: 500,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
    })

    const files = (result as any).resources || []
    
    return NextResponse.json({
      files: files.map((file: any) => ({
        public_id: file.public_id,
        secure_url: file.secure_url,
        resource_type: file.resource_type,
        width: file.width,
        height: file.height,
        bytes: file.bytes,
        created_at: file.created_at,
        format: file.format,
      })),
    })
  } catch (error) {
    console.error('Error fetching media library:', error)
    // Return empty array instead of error if Cloudinary is not configured
    return NextResponse.json({
      files: [],
      message: 'Cloudinary not configured or folder not found'
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Accès administrateur requis' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { publicId } = body

    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing publicId' },
        { status: 400 }
      )
    }

    // Determine resource type from public_id
    const isVideo = publicId.includes('video') || publicId.endsWith('.mp4') || publicId.endsWith('.webm')
    const resourceType = isVideo ? 'video' : 'image'

    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
