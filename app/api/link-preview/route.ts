import { NextRequest, NextResponse } from 'next/server'


async function fetchLinkMetadata(urlString: string) {
  let validatedUrl: URL
  try {
    validatedUrl = new URL(urlString)
  } catch {
    return NextResponse.json(
      { success: 0, message: 'Invalid URL format' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(validatedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : validatedUrl.hostname

    // Extract description (try meta description first, then og:description)
    const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']/i) ||
                     html.match(/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']+)["\']/i)
    const description = descMatch ? descMatch[1].trim() : ''

    // Extract favicon from multiple sources
    let favicon = ''
    
    // Try link rel="icon" or rel="shortcut icon"
    const faviconMatch = html.match(/<link[^>]*rel=["\'](?:icon|shortcut icon)["\'][^>]*href=["\']([^"\']+)["\']/i) ||
                        html.match(/<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\'](?:icon|shortcut icon)["\']/i)
    if (faviconMatch) {
      favicon = faviconMatch[1].trim()
    } else {
      // Try apple-touch-icon as fallback
      const appleIconMatch = html.match(/<link[^>]*rel=["\']apple-touch-icon["\'][^>]*href=["\']([^"\']+)["\']/i) ||
                            html.match(/<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']apple-touch-icon["\']/i)
      if (appleIconMatch) {
        favicon = appleIconMatch[1].trim()
      } else {
        // Fallback to default favicon.ico location
        favicon = new URL('/favicon.ico', validatedUrl.origin).toString()
      }
    }
    
    // Convert relative favicon URL to absolute
    if (favicon && !favicon.startsWith('http')) {
      favicon = new URL(favicon, validatedUrl.origin).toString()
    }

    // Extract preview image from multiple sources (priority order)
    let image = ''
    
    // 1. Try Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i) ||
                       html.match(/<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']/i)
    if (ogImageMatch) {
      image = ogImageMatch[1].trim()
    } else {
      // 2. Try Twitter Card image
      const twitterImageMatch = html.match(/<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)["\']/i) ||
                               html.match(/<meta[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']twitter:image["\']/i)
      if (twitterImageMatch) {
        image = twitterImageMatch[1].trim()
      } else {
        // 3. Try to find first large image in content (img tags with reasonable size)
        const imgMatch = html.match(/<img[^>]*src=["\']([^"\']+)["\'][^>]*>/i)
        if (imgMatch) {
          image = imgMatch[1].trim()
        }
      }
    }
    
    // Convert relative image URL to absolute
    if (image && !image.startsWith('http')) {
      image = new URL(image, validatedUrl.origin).toString()
    }

    return NextResponse.json({
      success: 1,
      meta: {
        title: title || validatedUrl.hostname,
        description: description || '',
        image: {
          url: image || ''
        },
        favicon: favicon || ''
      },
    })
  } catch (fetchError) {
    // On error, still return basic info with default favicon
    const defaultFavicon = new URL('/favicon.ico', validatedUrl.origin).toString()
    return NextResponse.json({
      success: 1,
      meta: {
        title: validatedUrl.hostname,
        description: '',
        image: {
          url: ''
        },
        favicon: defaultFavicon
      },
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: 0, message: 'URL parameter is required' },
        { status: 400 }
      )
    }

    return await fetchLinkMetadata(url)
  } catch (error) {
    console.error('Link preview API error (GET):', error)
    return NextResponse.json(
      { success: 0, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

