'use client'

import { useState, useEffect, useRef } from 'react'

type AudioPlayerProps = {
  audioUrl: string
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [waveformReady, setWaveformReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<any>(null)
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !waveformRef.current || !audioUrl) {
      return
    }

    let isMounted = true

    const initWaveform = async () => {
      try {
        if (lastUrlRef.current === audioUrl && wavesurferRef.current) {
          return
        }
        const WaveSurfer = (await import('wavesurfer.js')).default

        if (wavesurferRef.current) {
          wavesurferRef.current.destroy()
          wavesurferRef.current = null
        }

        if (waveformRef.current) {
          waveformRef.current.innerHTML = ''
        }

        const wavesurfer = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: '#60a5fa',
          progressColor: '#3b82f6',
          cursorColor: '#ffffff',
          barWidth: 2,
          barRadius: 3,
          height: 100,
          normalize: true,
          backend: 'WebAudio',
          mediaControls: false,
        })

        await wavesurfer.load(audioUrl)
        lastUrlRef.current = audioUrl
        
        wavesurfer.on('play', () => {
          if (isMounted) {
            setIsPlaying(true)
          }
        })
        
        wavesurfer.on('pause', () => {
          if (isMounted) {
            setIsPlaying(false)
          }
        })
        
        wavesurfer.on('finish', () => {
          if (isMounted) {
            setIsPlaying(false)
          }
        })
        
        if (isMounted) {
          wavesurferRef.current = wavesurfer
          setWaveformReady(true)
        } else {
          wavesurfer.destroy()
        }
      } catch (error) {
        console.error('Failed to initialize waveform:', error)
        if (isMounted) {
          setWaveformReady(false)
        }
      }
    }

    initWaveform()

    return () => {
      isMounted = false
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy()
        } catch (error) {
          console.error('Error destroying wavesurfer:', error)
        }
        wavesurferRef.current = null
      }
    }
  }, [audioUrl])

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause()
    }
  }

  const handleStop = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop()
      setIsPlaying(false)
    }
  }

  if (!audioUrl) {
    return null
  }

  return (
    <div className="my-8 flex flex-col items-center space-y-4">
      <div 
        ref={waveformRef} 
        className="w-[75%] bg-gray-900 rounded-md p-4 border border-gray-800"
      />
      
      {waveformReady && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePlayPause}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleStop}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
            aria-label="Stop"
          >
            Stop
          </button>
        </div>
      )}
      
      {!waveformReady && (
        <div className="text-center text-gray-400 text-sm">
          Loading waveform...
        </div>
      )}
    </div>
  )
}

