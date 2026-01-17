'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { generateArticlePDF } from '@/lib/pdf-generator'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'
import { Skeleton } from '@/components/ui/skeleton'

type DownloadableContent = {
  id: string
  type: string
  title: string
  subtitle: string | null
  author_name: string | null
  publication_name: string | null
  publication_date: string | null
  external_download_url: string | null
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  content_body: any
}

type CustomPDF = {
  id: string
  title: string
  description: string | null
  file_url: string
  file_name: string
  category: string
  is_featured: boolean
  created_at: string
}

export default function DownloadsTab() {
  const [content, setContent] = useState<DownloadableContent[]>([])
  const [customPDFs, setCustomPDFs] = useState<CustomPDF[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [downloading, setDownloading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadDownloadableContent()
    loadCustomPDFs()
  }, [])

  async function loadDownloadableContent() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          id,
          type,
          title,
          subtitle,
          author_name,
          publication_name,
          publication_date,
          external_download_url,
          image_url,
          video_url,
          audio_url,
          content_body
        `)
        .eq('download_enabled', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error loading downloadable content:', error)
    }
  }

  async function loadCustomPDFs() {
    try {
      const { data, error } = await supabase
        .from('custom_pdfs')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setCustomPDFs(data || [])
    } catch (error) {
      console.error('Error loading custom PDFs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesType
  })

  const filteredCustomPDFs = customPDFs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pdf.description && pdf.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || filterType === 'custom-pdf'
    return matchesSearch && matchesType
  })

  const handleDownload = async (item: DownloadableContent) => {
    setDownloading(item.id)
    try {
      if (item.external_download_url) {
        // External link - open in new tab
        window.open(item.external_download_url, '_blank')
      } else if (item.type === 'article') {
        // Generate PDF for articles
        const pdfBlob = await generateArticlePDF(item.id)
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // For other types, download the media file directly
        const url = item.image_url || item.video_url || item.audio_url
        if (url) {
          const link = document.createElement('a')
          link.href = url
          link.download = item.title
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleCustomPDFDownload = (pdf: CustomPDF) => {
    const link = document.createElement('a')
    link.href = pdf.file_url
    link.download = pdf.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄'
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      default: return '📁'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-900/50 text-blue-300'
      case 'image': return 'bg-green-900/50 text-green-300'
      case 'video': return 'bg-purple-900/50 text-purple-300'
      case 'audio': return 'bg-orange-900/50 text-orange-300'
      default: return 'bg-gray-900/50 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto p-8"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Downloads</h1>
        <p className="text-gray-400">Download or access all your available content</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search downloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="article">Articles</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="custom-pdf">Custom PDFs</option>
        </select>
      </div>

      {filteredContent.length === 0 && filteredCustomPDFs.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
          <p className="text-gray-400 mb-4">
            {content.length === 0 && customPDFs.length === 0
              ? "No downloadable content available" 
              : "No content matches your search criteria"
            }
          </p>
          {content.length === 0 && customPDFs.length === 0 && (
            <p className="text-gray-500 text-sm">
              Enable downloads for content items in the admin panel or upload custom PDFs
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Custom PDFs Section */}
          {filteredCustomPDFs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">📄 Custom PDFs</h3>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredCustomPDFs.map((pdf, index) => (
                  <motion.div 
                    key={pdf.id} 
                    variants={staggerItem}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📄</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300">
                          {pdf.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {pdf.title}
                      </h3>
                      {pdf.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {pdf.description}
                        </p>
                      )}
                      
                      {/* File Info */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>File: {pdf.file_name}</p>
                        <p>Uploaded: {new Date(pdf.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Download Button */}
                    <Button
                      onClick={() => handleCustomPDFDownload(pdf)}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                    >
                      📄 Download PDF
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Content Items Section */}
          {filteredContent.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">📚 Content Downloads</h3>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredContent.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    variants={staggerItem}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-900/20 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {item.subtitle}
                        </p>
                      )}
                      
                      {/* Publication Info */}
                      {(item.author_name || item.publication_name || item.publication_date) && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {item.author_name && <p>By {item.author_name}</p>}
                          {item.publication_name && <p>Published in {item.publication_name}</p>}
                          {item.publication_date && (
                            <p>{new Date(item.publication_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Download Button */}
                    <Button
                      onClick={() => handleDownload(item)}
                      disabled={downloading === item.id}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-950 font-semibold"
                    >
                      {downloading === item.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : item.external_download_url ? (
                        <>
                          🔗 Open Link
                        </>
                      ) : item.type === 'article' ? (
                        <>
                          📄 Download PDF
                        </>
                      ) : (
                        <>
                          ⬇️ Download
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {(content.length > 0 || customPDFs.length > 0) && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredContent.length + filteredCustomPDFs.length} of {content.length + customPDFs.length} downloadable items
        </div>
      )}
    </motion.div>
  )
}