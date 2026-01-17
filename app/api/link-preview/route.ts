import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint for Editor.js Link Tool plugin
 * Fetches metadata (title, description, image) for a given URL
 * 
 * Supports both GET (with query parameter ?url=...) and POST (with body { url: string })
 * Expected response: { success: 1, meta: { title, description, image: { url: string } } }
 */

/**
 * Helper function to fetch and return link metadata
 * Shared by both GET and POST handlers
 */
async function fetchLinkMetadata(urlString: string) {
  // Validate URL format
  let validatedUrl: URL
  try {
    validatedUrl = new URL(urlString)
  } catch {
    return NextResponse.json(
      { success: 0, message: 'Invalid URL format' },
      { status: 400 }
    )
  }

  // Fetch the URL to extract metadata
  try {
    const response = await fetch(validatedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
      // Set timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extract metadata from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : validatedUrl.hostname

    // Try to find meta description
    const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']/i) ||
                     html.match(/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']/i)
    const description = descMatch ? descMatch[1].trim() : ''

    // Try to find og:image or first image
    const imageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i)
    let image = imageMatch ? imageMatch[1].trim() : ''
    
    // If image is relative, make it absolute
    if (image && !image.startsWith('http')) {
      image = new URL(image, validatedUrl.origin).toString()
    }

    // Return in format expected by @editorjs/link
    // Format: { success: 1, meta: { title, description, image: { url: "" } } }
    return NextResponse.json({
      success: 1,
      meta: {
        title: title || validatedUrl.hostname,
        description: description || '',
        image: {
          url: image || ''
        },
      },
    })
  } catch (fetchError) {
    // If fetch fails, return basic info in correct format
    return NextResponse.json({
      success: 1,
      meta: {
        title: validatedUrl.hostname,
        description: '',
        image: {
          url: ''
        },
      },
    })
  }
}

/**
 * GET handler - @editorjs/link plugin sends GET requests with ?url= query parameter
 */
export async function GET(request: NextRequest) {
  try {
    // Extract URL from query parameter
    const url = request.nextUrl.searchParams.get('url')

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: 0, message: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // URL is already decoded by Next.js from query parameter
    return await fetchLinkMetadata(url)
  } catch (error) {
    console.error('Link preview API error (GET):', error)
    return NextResponse.json(
      { success: 0, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST handler - for backwards compatibility
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: 0, message: 'URL is required' },
        { status: 400 }
      )
    }

    return await fetchLinkMetadata(url)
  } catch (error) {
    console.error('Link preview API error (POST):', error)
    return NextResponse.json(
      { success: 0, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

