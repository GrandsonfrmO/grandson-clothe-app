import { NextRequest, NextResponse } from 'next/server';
import { generateUploadSignature } from '@/lib/cloudinary';

/**
 * Generate Cloudinary upload signature for client-side uploads
 * This endpoint should be protected and only accessible to authenticated users
 */
export async function POST(request: NextRequest) {
  try {
    const { folder } = await request.json();

    // Validate that user is authenticated (add your auth check here)
    // const session = await getSession(request);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const timestamp = Math.floor(Date.now() / 1000);
    const { signature, timestamp: ts } = generateUploadSignature(
      timestamp,
      folder
    );

    return NextResponse.json({
      signature,
      timestamp: ts,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Upload signature error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
