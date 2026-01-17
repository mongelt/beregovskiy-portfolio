'use client'

import { useEffect, useRef, useState } from 'react'

type VideoPlayerProps = {
  videoUrl: string
  title?: string
}

// Step 15.Bug.1.1: Helper function to convert YouTube URLs to embed format
function convertYouTubeUrlToEmbed(url: string): string {
  // If already in embed format, return as-is
  if (url.includes('youtube.com/embed/')) {
    return url
  }

  let videoId: string | null = null

  // Extract video ID from various YouTube URL formats
  // Format 1: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) {
    videoId = watchMatch[1]
  }

  // Format 2: https://youtu.be/VIDEO_ID
  if (!videoId) {
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
    if (shortMatch) {
      videoId = shortMatch[1]
    }
  }

  // Format 3: https://www.youtube.com/v/VIDEO_ID (legacy format)
  if (!videoId) {
    const vMatch = url.match(/youtube\.com\/v\/([^?&]+)/)
    if (vMatch) {
      videoId = vMatch[1]
    }
  }

  // If video ID found, convert to embed format
  if (videoId) {
    // Remove any additional parameters and return clean embed URL
    return `https://www.youtube.com/embed/${videoId}`
  }

  // If no video ID found, return original URL (will show error)
  return url
}

// Step 15.Bug.1.1: Helper function to convert Vimeo URLs to embed format
function convertVimeoUrlToEmbed(url: string): string {
  // If already in embed format, return as-is
  if (url.includes('player.vimeo.com/video/')) {
    return url
  }

  // Extract video ID from Vimeo URL
  // Format: https://vimeo.com/VIDEO_ID or https://www.vimeo.com/VIDEO_ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    return `https://player.vimeo.com/video/${videoId}`
  }

  // If no video ID found, return original URL (will show error)
  return url
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 15.2: Check if URL is YouTube or Vimeo
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
  const isVimeo = videoUrl.includes('vimeo.com')
  
  // Step 15.Bug.1.1: Convert YouTube/Vimeo URLs to embed format
  const embedUrl = isYouTube ? convertYouTubeUrlToEmbed(videoUrl) : (isVimeo ? convertVimeoUrlToEmbed(videoUrl) : videoUrl)

  // Step 15.2: Initialize Video.js player (SSR-safe, only for direct video files)
  useEffect(() => {
    // Only initialize Video.js for direct video files (not YouTube/Vimeo)
    if (isYouTube || isVimeo || typeof window === 'undefined' || !containerRef.current) {
      return
    }

    let isMounted = true

    // Step 15.Bug.1.1: Wait for video element to be in DOM before initializing Video.js
    // Similar to EditorJS.tsx pattern (lines 28-45) - wait for element to appear
    const checkElement = () => {
      return videoRef.current && videoRef.current.parentNode !== null
    }

    // Dynamically import Video.js (SSR safety)
    const initPlayer = async () => {
      try {
        // Step 15.Bug.1.1: Wait for video element to be in DOM
        let attempts = 0
        const maxAttempts = 50
        while (!checkElement() && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        // Verify element is in DOM before proceeding
        if (!checkElement()) {
          console.error('Video element not found in DOM after waiting')
          if (isMounted) {
            setError('Failed to initialize video player: element not in DOM')
          }
          return
        }

        const videojs = (await import('video.js')).default

        // Clean up existing player if any
        if (playerRef.current) {
          try {
            playerRef.current.dispose()
          } catch (error) {
            console.warn('Error disposing existing Video.js player:', error)
          }
          playerRef.current = null
        }

        // Step 15.Bug.1.2: Verify element is still in DOM right before initialization
        // (After async import, element may have been removed during React re-render)
        if (!isMounted || !checkElement() || !videoRef.current) {
          // Component unmounted or element removed - abort initialization
          return
        }

        // Initialize Video.js player
        const player = videojs(videoRef.current, {
          controls: true,
          responsive: true,
          fluid: true,
          preload: 'metadata',
          playbackRates: [0.5, 1, 1.25, 1.5, 2],
          // Customize player appearance
          controlBar: {
            playToggle: true,
            volumePanel: {
              inline: false
            },
            currentTimeDisplay: true,
            timeDivider: true,
            durationDisplay: true,
            progressControl: true,
            remainingTimeDisplay: true,
            fullscreenToggle: true
          }
        })

        // Set video source
        player.src(videoUrl)

        // Add event listeners
        player.on('ready', () => {
          if (isMounted) {
            setPlayerReady(true)
            setError(null)
          }
        })

        player.on('error', () => {
          if (isMounted) {
            const error = player.error()
            setError(error ? `Video error: ${error.message || 'Unknown error'}` : 'Failed to load video')
            setPlayerReady(false)
          }
        })

        if (isMounted) {
          playerRef.current = player
        } else {
          player.dispose()
        }
      } catch (error) {
        console.error('Failed to initialize Video.js player:', error)
        if (isMounted) {
          setError('Failed to initialize video player')
          setPlayerReady(false)
        }
      }
    }

    initPlayer()

    // Cleanup function
    return () => {
      isMounted = false
      if (playerRef.current) {
        try {
          playerRef.current.dispose()
        } catch (error) {
          console.error('Error disposing Video.js player:', error)
        }
        playerRef.current = null
      }
    }
  }, [videoUrl, isYouTube, isVimeo])

  if (!videoUrl) {
    return null
  }

  // Step 15.2: Render YouTube/Vimeo with iframe (keep existing approach)
  // Step 15.Bug.1.1: Use converted embed URL instead of raw videoUrl
  // Step 15.4: Set embed width to 60% (centered) and add bottom padding for Bottom Nav
  if (isYouTube || isVimeo) {
    return (
      <div className="my-8 flex justify-center pb-20">
        <div className="aspect-video w-[60%]">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            allowFullScreen
            title={title || 'Video player'}
          />
        </div>
      </div>
    )
  }

  // Step 15.2: Render Video.js player for direct video files
  // Step 15.4: Set player width to 60% of content reader area (centered) and add bottom padding for Bottom Nav
  return (
    <div className="my-8 flex justify-center pb-20">
      <div ref={containerRef} className="w-[60%]">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-default-skin"
          playsInline
          preload="metadata"
        >
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a web browser that
            <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noopener noreferrer">
              supports HTML5 video
            </a>.
          </p>
        </video>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {/* Loading State */}
      {!playerReady && !error && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          Loading video player...
        </div>
      )}
    </div>
  )
}

