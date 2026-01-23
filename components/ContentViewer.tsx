'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import EditorRenderer from '@/components/EditorRenderer'
import AudioPlayer from '@/components/AudioPlayer'
import VideoPlayer from '@/components/VideoPlayer'
import { generateArticlePDF } from '@/lib/pdf-generator'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import { Skeleton } from '@/components/ui/skeleton'

type ContentData = {
  id: string
  type: string
  title: string
  subtitle: string | null
  content_body: any
  image_sizes?: Record<string, { width?: number; height?: number }>
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  author_name: string | null
  publication_name: string | null
  publication_date: string | null
  source_link: string | null
  copyright_notice: string | null
  download_enabled: boolean
  download_source: 'generated' | 'external' | 'custom' | null
  external_download_url: string | null
  custom_pdf_id: string | null
}

type ContentViewerProps = {
  contentId: string | null
}

export default function ContentViewer({ contentId }: ContentViewerProps) {
  const [content, setContent] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (contentId) {
      loadContent(contentId)
    } else {
      setContent(null)
    }
  }, [contentId])

  async function loadContent(id: string) {
    setLoading(true)
    const { data } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single()
    
    setContent(data)
    setLoading(false)
  }

  async function handleDownload() {
    if (!content) return

    setDownloading(true)
    try {
      if (!content.download_enabled) {
        alert('Downloads are disabled for this content.')
        return
      }

      const resolvedSource =
        content.download_source ||
        (content.custom_pdf_id ? 'custom' : content.external_download_url ? 'external' : 'generated')

      if (resolvedSource === 'external') {
        if (!content.external_download_url) {
          alert('External download link is missing.')
          return
        }
        window.open(content.external_download_url, '_blank')
        return
      }

      if (resolvedSource === 'custom') {
        const linkedPdfId = content.custom_pdf_id || (await getLinkedPdfId('content', content.id))
        if (!linkedPdfId) {
          alert('Custom PDF is not set.')
          return
        }
        const didDownload = await downloadCustomPdfById(linkedPdfId)
        if (!didDownload) {
          throw new Error('Custom PDF not found')
        }
        return
      }

      if (content.type === 'article') {
        const pdfBlob = await generateArticlePDF(content.id)
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return
      }

      const url = content.image_url || content.video_url || content.audio_url
      if (url) {
        const link = document.createElement('a')
        link.href = url
        link.download = content.title
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  async function getLinkedPdfId(targetType: 'content', targetId: string) {
    const { data, error } = await supabase
      .from('custom_pdf_links')
      .select('pdf_id')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .limit(1)
    if (error) {
      if (error.code === '42P01') {
        return null
      }
      console.error('Failed to load custom PDF link', error)
      return null
    }
    return data?.[0]?.pdf_id || null
  }

  async function downloadCustomPdfById(pdfId: string) {
    const { data, error } = await supabase
      .from('custom_pdfs')
      .select('file_url, file_name')
      .eq('id', pdfId)
      .single()
    if (error || !data) {
      return false
    }
    const link = document.createElement('a')
    link.href = data.file_url
    link.download = data.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  }

  if (!contentId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">
          Select content from the sidebar to view it here
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-3 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-gray-400">Content not found</p>
      </motion.div>
    )
  }

  return (
    <motion.article 
      key={content.id}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {content.title}
        </h1>
        {content.subtitle && (
          <p className="text-xl text-gray-400">{content.subtitle}</p>
        )}
        
        {/* Metadata */}
        {(content.author_name || content.publication_name || content.publication_date) && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            {content.author_name && (
              <span>By {content.author_name}</span>
            )}
            {content.publication_name && (
              <span>• Published in {content.publication_name}</span>
            )}
            {content.publication_date && (
              <span>• {content.publication_date}</span>
            )}
          </div>
        )}

        {content.source_link && (
          <div className="mt-2">
            <a 
              href={content.source_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View Original Source →
            </a>
          </div>
        )}

        {/* Download Button - Top */}
        {content.download_enabled && (
          <div className="mt-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-4 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-950 font-semibold rounded-lg transition-colors text-sm"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  {content.download_source === 'external' ? '🔗 Open Link' : '⬇️ Download'}
                </>
              )}
            </button>
          </div>
        )}
      </header>

      {/* Content Body */}
      <div className="prose prose-invert max-w-none">
      {content.type === 'article' && content.content_body && (
        <EditorRenderer data={content.content_body} imageSizes={content.image_sizes} />
        )}

        {content.type === 'image' && content.image_url && (
          <div className="my-8">
            <img 
              src={content.image_url} 
              alt={content.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Step 15.3: Video content - replaced HTML5 video with Video.js VideoPlayer */}
        {content.type === 'video' && content.video_url && (
          <VideoPlayer videoUrl={content.video_url} title={content.title} />
        )}

        {/* Step 13.3: Audio content - replaced HTML5 audio with wavesurfer.js AudioPlayer */}
        {content.type === 'audio' && content.audio_url && (
          <AudioPlayer audioUrl={content.audio_url} />
        )}

        {/* Embed content rendered via EditorRenderer inside content_body */}
      </div>

      {/* Download Button */}
      {content.download_enabled && (
        <div className="mt-8 pt-8 border-t border-gray-800">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center px-6 py-3 bg-emerald-400 hover:bg-emerald-300 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-950 font-semibold rounded-lg transition-colors"
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                {content.download_source === 'external' ? '🔗 Open Link' : '⬇️ Download'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Copyright Notice */}
      {content.copyright_notice && (
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-600">{content.copyright_notice}</p>
        </div>
      )}
    </motion.article>
  )
}

