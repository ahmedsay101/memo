import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request, { params }) {
  try {
    const { path } = params
    
    // Reconstruct the file path
    const fullPath = Array.isArray(path) ? path.join('/') : path
    const filePath = join(process.cwd(), 'public', 'uploads', fullPath)
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // Read the file
    const imageBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const ext = fullPath.split('.').pop()?.toLowerCase()
    let contentType = 'image/jpeg' // default
    
    switch (ext) {
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
    }
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Error serving image', { status: 500 })
  }
}