'use client'

/**
 * Stage 15 — Thumbnail Capture Page
 * /admin/menu/thumbnails
 *
 * List view: table of all content items with thumbnail status.
 * Capture view: render content_body in read-only BlockNote, crop + capture
 *               via html2canvas, upload to Cloudinary, save URL to Supabase.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Dynamic imports — both require browser APIs
const BlockNoteReadOnly = dynamic(
  () => import('@/components/editor/BlockNoteReadOnly'),
  { ssr: false, loading: () => <div className="text-gray-500 text-sm p-4">Loading content…</div> }
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentItem {
  id: string
  title: string
  menu_thumbnail_url: string | null
  content_body?: any
}

// Crop dimensions (logical pixels) — matches prototype spec
const CROP_W = 340
const CROP_H = 222

/** Extracts the Cloudinary public_id from a secure_url (any path format, no transforms). */
function extractCloudinaryPublicId(url: string): string | null {
  const after = url.split('/image/upload/')[1]
  if (!after) return null
  const withoutVersion = after.replace(/^v\d+\//, '')
  return withoutVersion.replace(/\.[^/.]+$/, '') || null
}

// Zoom-out factor applied to the BlockNote content before capture.
// The content renders at CROP_W / CONTENT_ZOOM = 510px (1.5× wider),
// then is scaled down via CSS zoom to fit the 340px capture frame.
// This shows 50% more document area, matching the prototype zoom level.
const CONTENT_ZOOM = 2 / 3

// ---------------------------------------------------------------------------
// List row
// ---------------------------------------------------------------------------

function ThumbnailRow({
  item,
  onSetThumbnail,
}: {
  item: ContentItem
  onSetThumbnail: (id: string) => void
}) {
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50">
      <td className="px-4 py-3 text-gray-200 max-w-xs truncate">{item.title}</td>
      <td className="px-4 py-3">
        {item.menu_thumbnail_url ? (
          <div className="flex items-center gap-3">
            <img
              src={item.menu_thumbnail_url}
              alt="thumb"
              width={68}
              height={44}
              className="rounded object-cover border border-gray-700"
              style={{ width: 68, height: 44 }}
            />
            <span className="text-xs text-emerald-400">Set</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">No thumbnail</span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onSetThumbnail(item.id)}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
        >
          Set thumbnail
        </button>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Capture tool
// ---------------------------------------------------------------------------

function CaptureTool({
  item,
  onClose,
  onSaved,
}: {
  item: ContentItem
  onClose: () => void
  onSaved: (id: string, url: string) => void
}) {
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Hidden unzoomed capture target — html2canvas cannot handle CSS zoom on ancestors.
  // We keep the visible zoomed picker for framing, and capture from this instead.
  const captureRef = useRef<HTMLDivElement>(null)
  const [capturing, setCapturing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const hasContent =
    item.content_body && Array.isArray(item.content_body) && item.content_body.length > 0

  async function handleCapture() {
    if (!captureRef.current) return
    setCapturing(true)
    setStatus(null)
    setPreviewUrl(null)

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default

      // Wait for all fonts to finish loading before capturing,
      // otherwise custom web fonts fall back to system fonts in the canvas.
      await document.fonts.ready

      // The hidden capture div is unzoomed (full 510px width, no CSS zoom).
      // Map the visible picker's scroll position to the unzoomed coordinate space:
      // visible scrollTop is in zoomed pixels → divide by CONTENT_ZOOM to get unzoomed pixels.
      const visibleScrollTop = scrollRef.current?.scrollTop ?? 0
      const captureScrollY = visibleScrollTop / CONTENT_ZOOM

      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        // Capture CROP_W / CONTENT_ZOOM unzoomed pixels wide, which equals CROP_W zoomed pixels.
        width: Math.round(CROP_W / CONTENT_ZOOM),
        height: Math.round(CROP_H / CONTENT_ZOOM),
        y: captureScrollY,
        logging: false,
        backgroundColor: '#c7c7c2',
      })

      // Show preview
      setPreviewUrl(canvas.toDataURL('image/png'))
      setCapturing(false)
    } catch (err) {
      console.error('Capture error:', err)
      setStatus('Capture failed — see console')
      setCapturing(false)
    }
  }

  async function handleUpload() {
    if (!previewUrl) return
    setUploading(true)
    setStatus(null)

    try {
      // Delete the existing Cloudinary asset before uploading the new one.
      // Extracts public_id from the stored URL so old assets (any path format) are cleaned up.
      if (item.menu_thumbnail_url) {
        const oldPublicId = extractCloudinaryPublicId(item.menu_thumbnail_url)
        if (oldPublicId) {
          await fetch('/api/cloudinary-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id: oldPublicId }),
          })
          // Deletion errors are non-fatal — proceed with upload regardless.
        }
      }

      // Convert data URL to blob
      const res = await fetch(previewUrl)
      const blob = await res.blob()
      const file = new File([blob], 'menu-thumbnail.png', { type: 'image/png' })

      // Upload to Cloudinary — same params as other uploads in the project
      // (unsigned preset, no folder/public_id overrides).
      // The old asset was already deleted above, so no orphan accumulates.
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const uploadData = await uploadRes.json()

      if (!uploadData.secure_url) {
        console.error('Cloudinary response:', uploadData)
        throw new Error(uploadData?.error?.message || 'Cloudinary upload failed')
      }

      // Save to Supabase
      const { error } = await supabase
        .from('content')
        .update({ menu_thumbnail_url: uploadData.secure_url })
        .eq('id', item.id)

      if (error) throw error

      setStatus('Saved!')
      onSaved(item.id, uploadData.secure_url)
    } catch (err: any) {
      console.error('Upload error:', err)
      setStatus(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Set Thumbnail</h2>
          <p className="text-sm text-gray-400 mt-0.5 max-w-xl truncate">{item.title}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          ← Back to list
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* Content preview + crop area */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400">
            Scroll within the frame to position the thumbnail area ({CROP_W}×{CROP_H}px).
          </p>

          {/* Crop frame container */}
          <div className="relative" style={{ width: CROP_W }}>
            {/* Scrollable content window — user scrolls to position */}
            <div
              ref={scrollRef}
              className="overflow-y-auto overflow-x-hidden"
              style={{
                width: CROP_W,
                height: CROP_H,
                background: '#c7c7c2',
                border: '2px solid #fc5454',
                borderRadius: 4,
                position: 'relative',
              }}
            >
              {/* contentRef: 340px wide — html2canvas target, coordinate origin */}
              <div ref={contentRef} style={{ width: CROP_W, background: '#c7c7c2', color: '#1a1a1a' }}>
                {hasContent ? (
                  /*
                   * Zoom-out wrapper: BlockNote renders at CROP_W / CONTENT_ZOOM = 510px
                   * (1.5× the capture width), then CSS zoom shrinks it to 340px visually.
                   * Result: 50% more document area visible in the same crop frame.
                   * Matches the prototype's document-to-thumbnail scale ratio.
                   */
                  <div style={{ width: Math.round(CROP_W / CONTENT_ZOOM), zoom: CONTENT_ZOOM }}>
                    <BlockNoteReadOnly content={item.content_body} />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center h-full text-gray-600 text-sm"
                    style={{ height: CROP_H }}
                  >
                    No content body available for this item
                  </div>
                )}
              </div>
            </div>

            {/* Crop label */}
            <div
              className="text-xs text-red-400/80 mt-1 text-right"
              style={{ width: CROP_W }}
            >
              {CROP_W}×{CROP_H}px capture area
            </div>
          </div>

          {/*
           * Hidden unzoomed capture target.
           * Rendered at the true 510px width with no CSS zoom so html2canvas
           * gets clean, undistorted DOM measurements.
           * position:fixed keeps it out of document flow; opacity:0 + pointer-events:none
           * make it invisible and non-interactive.
           */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: '-9999px',
              width: Math.round(CROP_W / CONTENT_ZOOM),
              background: '#c7c7c2',
              color: '#1a1a1a',
              pointerEvents: 'none',
              zIndex: -1,
            }}
            ref={captureRef}
          >
            {hasContent && <BlockNoteReadOnly content={item.content_body} />}
          </div>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={capturing || !hasContent}
            className="bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded transition-colors"
          >
            {capturing ? 'Capturing…' : 'Capture'}
          </button>
        </div>

        {/* Preview + upload */}
        {previewUrl && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400">Preview (shown at half scale):</p>
            <img
              src={previewUrl}
              alt="Captured thumbnail preview"
              style={{
                width: CROP_W / 2,
                height: CROP_H / 2,
                objectFit: 'cover',
                border: '1px solid #374151',
                borderRadius: 4,
              }}
            />
            <div className="flex gap-3 items-center">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded transition-colors"
              >
                {uploading ? 'Uploading…' : 'Save thumbnail'}
              </button>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Recapture
              </button>
            </div>
            {status && (
              <p
                className={`text-sm ${status === 'Saved!' ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {status}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ThumbnailsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('content')
      .select('id, title, menu_thumbnail_url')
      .order('title')

    if (error) {
      setError(error.message)
    } else {
      setItems(data ?? [])
    }
    setLoading(false)
  }

  const handleSetThumbnail = useCallback(
    async (id: string) => {
      // Load the full content_body for this item
      const { data, error } = await supabase
        .from('content')
        .select('id, title, menu_thumbnail_url, content_body')
        .eq('id', id)
        .single()

      if (error || !data) {
        alert('Failed to load content: ' + error?.message)
        return
      }
      setActiveItem(data)
    },
    [supabase]
  )

  const handleSaved = useCallback((id: string, url: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, menu_thumbnail_url: url } : item))
    )
    setActiveItem(null)
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/menu" className="hover:text-gray-300 transition-colors">
          Menu Admin
        </Link>
        <span>/</span>
        <span className="text-gray-300">Thumbnails</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Menu Thumbnails</h1>
        <p className="text-gray-400 text-sm mt-1">
          Set the thumbnail image displayed on ThumbCards in the dynamic menu.
        </p>
      </div>

      {activeItem ? (
        <CaptureTool
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onSaved={handleSaved}
        />
      ) : (
        <>
          {loading && (
            <div className="text-gray-400 text-sm py-8 text-center">Loading content…</div>
          )}
          {error && (
            <div className="text-red-400 text-sm py-4 bg-red-900/20 rounded px-4">{error}</div>
          )}
          {!loading && !error && (
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900">
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Title</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Thumbnail</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        No content items found.
                      </td>
                    </tr>
                  )}
                  {items.map((item) => (
                    <ThumbnailRow
                      key={item.id}
                      item={item}
                      onSetThumbnail={handleSetThumbnail}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && !error && items.length > 0 && (
            <p className="text-xs text-gray-600 mt-3">
              {items.filter((i) => i.menu_thumbnail_url).length} of {items.length} items have
              thumbnails set.
            </p>
          )}
        </>
      )}
    </div>
  )
}
