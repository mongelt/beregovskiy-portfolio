import { createClient } from '@/lib/supabase/client'

const getHtml2Pdf = async () => {
  if (typeof window === 'undefined') return null
  const html2pdf = (await import('html2pdf.js')).default
  return html2pdf
}

type ContentData = {
  id: string
  title: string
  subtitle: string | null
  author_name: string | null
  publication_name: string | null
  publication_date: string | null
  copyright_notice: string | null
  content_body: any
}

type CollectionData = {
  id: string
  slug: string
  name: string
  description: any
}

type CollectionContentItem = {
  id: string
  title: string
  subtitle: string | null
  content_body: any
  order_index: number | null
}

export async function generateArticlePDF(contentId: string): Promise<Blob> {
  const supabase = createClient()
  
  const { data: content, error } = await supabase
    .from('content')
    .select(`
      id,
      title,
      subtitle,
      author_name,
      publication_name,
      publication_date,
      copyright_notice,
      content_body
    `)
    .eq('id', contentId)
    .single()

  if (error || !content) {
    throw new Error('Content not found')
  }

  const htmlContent = createPDFHTML(content)
  
  const html2pdf = await getHtml2Pdf()
  if (!html2pdf) {
    throw new Error('PDF generation not available in this environment')
  }
  
  const options = {
    margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
    filename: `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'in' as const, 
      format: 'letter' as const, 
      orientation: 'portrait' as const
    },
    pagebreak: {
      mode: ['css', 'avoid-all', 'legacy']
    }
  }

  const pdfBlob = await html2pdf().set(options).from(htmlContent).outputPdf('blob')
  
  return pdfBlob
}

export async function generateCollectionPDF(collectionSlug: string): Promise<Blob> {
  const supabase = createClient()

  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('id, slug, name, description')
    .eq('slug', collectionSlug)
    .single()

  if (collectionError || !collection) {
    throw new Error('Collection not found')
  }

  const { data: contentRows, error: contentError } = await supabase
    .from('content_collections')
    .select('content:content_id (id, title, subtitle, content_body, order_index)')
    .eq('collection_id', collection.id)

  if (contentError) {
    throw new Error('Failed to load collection content')
  }

  const items: CollectionContentItem[] = (contentRows || [])
    .flatMap((row: { content: CollectionContentItem | CollectionContentItem[] | null }) => {
      if (!row.content) return []
      return Array.isArray(row.content) ? row.content : [row.content]
    })
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

  const htmlContent = createCollectionPDFHTML(collection, items)

  const html2pdf = await getHtml2Pdf()
  if (!html2pdf) {
    throw new Error('PDF generation not available in this environment')
  }

  const options = {
    margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
    filename: `${collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: {
      unit: 'in' as const,
      format: 'letter' as const,
      orientation: 'portrait' as const
    },
    pagebreak: {
      mode: ['css', 'avoid-all', 'legacy']
    }
  }

  const pdfBlob = await html2pdf().set(options).from(htmlContent).outputPdf('blob')

  return pdfBlob
}

function createPDFHTML(content: ContentData): string {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in 0.5in 1.2in;
        }
        
        .header {
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000;
        }
        
        .subtitle {
          font-size: 18px;
          font-style: italic;
          color: #666;
          margin-bottom: 15px;
        }
        
        .metadata {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        
        .metadata div {
          margin-bottom: 5px;
        }
        
        .content {
          font-size: 14px;
          line-height: 1.8;
        }
        
        .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
          color: #000;
          margin-top: 25px;
          margin-bottom: 15px;
        }
        
        .content h1 { font-size: 20px; }
        .content h2 { font-size: 18px; }
        .content h3 { font-size: 16px; }
        .content h4 { font-size: 14px; }
        
        .content p {
          margin-bottom: 15px;
          text-align: justify;
        }
        
        .content ul, .content ol {
          margin-bottom: 15px;
          padding-left: 0;
          list-style: none;
        }
        
        .content li {
          margin-bottom: 5px;
          line-height: 1.6;
          position: relative;
          padding-left: 20px;
        }

        .content ul > li::before {
          content: '•';
          position: absolute;
          left: 0;
          top: 0.35em;
          font-size: 0.9em;
          line-height: 1;
        }

        .content ol {
          counter-reset: pdf-ol;
        }

        .content ol > li {
          counter-increment: pdf-ol;
          padding-left: 28px;
        }

        .content ol > li::before {
          content: counter(pdf-ol) ".";
          position: absolute;
          left: 0;
          top: 0.25em;
          font-size: 0.9em;
          line-height: 1;
        }

        .content .pdf-underline {
          text-decoration: none;
          position: relative;
        }

        .content .pdf-underline::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0.7em;
          transform: translateY(1em);
          border-top: 1px solid #000;
        }

        .content .pdf-strike {
          text-decoration: none;
          position: relative;
        }

        .content .pdf-strike::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 110%;
          border-top: 1px solid #000;
        }

        .content .pdf-mark {
          position: relative;
          z-index: 0;
          padding: 0 2px;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }

        .content .pdf-mark::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0.5em;
          bottom: -0.7em;
          background: #f5e7a3;
          z-index: -1;
        }
        
        .content blockquote {
          border-left: 4px solid #ccc;
          margin: 20px 0;
          padding-left: 20px;
          font-style: italic;
          color: #666;
        }
        
        .content code {
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        
        .content pre {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
          margin: 15px 0;
        }
        
        .content pre code {
          background: none;
          padding: 0;
        }
        
        .content table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .content th, .content td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .content th {
          background-color: #f5f5f5;
          font-weight: bold;
        }

        .content table.pdf-columns,
        .content table.pdf-columns td {
          border: none !important;
        }

        .content table.pdf-columns {
          margin: 15px 0;
        }

        .pdf-block {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 16px;
          padding-bottom: 12px;
          border-top: 1px solid #ccc;
          font-size: 10px;
          color: #666;
          text-align: center;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .copyright {
          margin-top: 10px;
          font-size: 9px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${escapeHtml(content.title)}</div>
        ${content.subtitle ? `<div class="subtitle">${escapeHtml(content.subtitle)}</div>` : ''}
        
        <div class="metadata">
          ${content.author_name ? `<div><strong>Author:</strong> ${escapeHtml(content.author_name)}</div>` : ''}
          ${content.publication_name ? `<div><strong>Publication:</strong> ${escapeHtml(content.publication_name)}</div>` : ''}
          ${content.publication_date ? `<div><strong>Published:</strong> ${formatDate(content.publication_date)}</div>` : ''}
        </div>
      </div>
      
      <div class="content">
        ${renderEditorJSContent(content.content_body)}
      </div>
      
      <div class="footer">
        <div>Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
        ${content.copyright_notice ? `<div class="copyright">${escapeHtml(content.copyright_notice)}</div>` : ''}
      </div>
    </body>
    </html>
  `
}

function createCollectionPDFHTML(collection: CollectionData, items: CollectionContentItem[]): string {
  const hasDescription = Boolean(collection.description)
  const descriptionHtml = hasDescription
    ? renderEditorJSContent(collection.description)
    : ''

  const listItems = items.map((item, index) => {
    const subtitle = item.subtitle ? `<div class="collection-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''
    return `
      <div class="collection-item">
        <div class="collection-item-title">${index + 1}. ${escapeHtml(item.title)}</div>
        ${subtitle}
      </div>
    `
  }).join('')

  const contentSections = items.map((item, index) => {
    const subtitle = item.subtitle ? `<div class="collection-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''
    const body = item.content_body ? renderEditorJSContent(item.content_body) : '<p>No content available</p>'
    return `
      <div class="pdf-page-break"></div>
      <div class="collection-section">
        <div class="collection-item-title">${index + 1}. ${escapeHtml(item.title)}</div>
        ${subtitle}
        <div class="content">
          ${body}
        </div>
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }

        .header {
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000;
        }

        .collection-description {
          font-size: 14px;
          line-height: 1.7;
          margin-top: 10px;
        }

        .collection-list-title {
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0 10px;
        }

        .collection-item {
          margin-bottom: 12px;
        }

        .collection-item-title {
          font-size: 14px;
          font-weight: bold;
          color: #000;
        }

        .collection-item-subtitle {
          font-size: 12px;
          color: #666;
        }

        .collection-section {
          margin-bottom: 30px;
        }

        .pdf-page-break {
          break-before: page;
          page-break-before: always;
        }

        .content {
          font-size: 14px;
          line-height: 1.8;
        }

        .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
          color: #000;
          margin-top: 25px;
          margin-bottom: 15px;
        }

        .content h1 { font-size: 20px; }
        .content h2 { font-size: 18px; }
        .content h3 { font-size: 16px; }
        .content h4 { font-size: 14px; }

        .content p {
          margin-bottom: 15px;
          text-align: justify;
        }

        .content ul, .content ol {
          margin-bottom: 15px;
          padding-left: 0;
          list-style: none;
        }

        .content li {
          margin-bottom: 5px;
          line-height: 1.6;
          position: relative;
          padding-left: 20px;
        }

        .content ul > li::before {
          content: '•';
          position: absolute;
          left: 0;
          top: 0.35em;
          font-size: 0.9em;
          line-height: 1;
        }

        .content ol {
          counter-reset: pdf-ol;
        }

        .content ol > li {
          counter-increment: pdf-ol;
          padding-left: 28px;
        }

        .content ol > li::before {
          content: counter(pdf-ol) ".";
          position: absolute;
          left: 0;
          top: 0.25em;
          font-size: 0.9em;
          line-height: 1;
        }

        .content .pdf-underline {
          text-decoration: none;
          position: relative;
        }

        .content .pdf-underline::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0.7em;
          transform: translateY(1em);
          border-top: 1px solid #000;
        }

        .content .pdf-strike {
          text-decoration: none;
          position: relative;
        }

        .content .pdf-strike::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 110%;
          border-top: 1px solid #000;
        }

        .content .pdf-mark {
          position: relative;
          z-index: 0;
          padding: 0 2px;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }

        .content .pdf-mark::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0.5em;
          bottom: -0.7em;
          background: #f5e7a3;
          z-index: -1;
        }

        .content blockquote {
          border-left: 4px solid #ccc;
          margin: 20px 0;
          padding-left: 20px;
          font-style: italic;
          color: #666;
        }

        .content code {
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }

        .content pre {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
          margin: 15px 0;
        }

        .content pre code {
          background: none;
          padding: 0;
        }

        .content table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }

        .content th, .content td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .content th {
          background-color: #f5f5f5;
          font-weight: bold;
        }

        .content table.pdf-columns,
        .content table.pdf-columns td {
          border: none !important;
        }

        .content table.pdf-columns {
          margin: 15px 0;
        }

        .pdf-block {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${escapeHtml(collection.name)}</div>
        ${hasDescription ? `<div class="collection-description">${descriptionHtml}</div>` : ''}
      </div>

      <div class="collection-list">
        <div class="collection-list-title">Contents</div>
        ${listItems || '<div>No content items in this collection.</div>'}
      </div>

      ${contentSections}
    </body>
    </html>
  `
}

function renderEditorJSContent(data: any): string {
  if (!data || !data.blocks) return '<p>No content available</p>'
  const html = renderEditorJSBlocks(data.blocks)
  return html.trim() ? html : '<p>No content available</p>'
}

function isRenderableBlock(block: any): boolean {
  if (!block || typeof block !== 'object') return false
  switch (block.type) {
    case 'paragraph':
      return !!block.data?.text
    case 'header':
      return !!block.data?.text
    case 'list':
      return Array.isArray(block.data?.items) && block.data.items.length > 0
    case 'quote':
      return !!block.data?.text
    case 'code':
      return !!block.data?.code
    case 'table':
      return Array.isArray(block.data?.content) && block.data.content.length > 0
    case 'warning':
      return !!(block.data?.title || block.data?.message)
    case 'delimiter':
      return true
    case 'image':
      return !!(block.data?.file?.url || block.data?.url)
    case 'audio':
      return !!block.data?.url
    case 'AnyButton':
      return !!(block.data?.text || block.data?.name || block.data?.link || block.data?.url)
    case 'linkTool':
      return !!block.data?.link
    case 'embed':
      return !!(block.data?.embed || block.data?.source)
    case 'columns': {
      const cols = block.data?.cols || block.data?.columns
      return Array.isArray(cols) && cols.length > 0
    }
    default:
      return false
  }
}

function renderEditorJSBlocks(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''
  const renderable = blocks.filter(isRenderableBlock)
  return renderable.map((block: any) => {
    let html = ''
    switch (block.type) {
      case 'paragraph':
        html = `<p>${sanitizeInlineHtml(block.data.text)}</p>`
        break
      
      case 'header':
        const level = block.data.level || 1
        html = `<h${level}>${sanitizeInlineHtml(block.data.text)}</h${level}>`
        break
      
      case 'list':
        const listType = block.data.style === 'ordered' ? 'ol' : 'ul'
        const items = block.data.items.map((item: any) => 
          `<li>${sanitizeInlineHtml(item.content)}</li>`
        ).join('')
        html = `<${listType}>${items}</${listType}>`
        break
      
      case 'quote':
        html = `<blockquote>${escapeHtml(block.data.text)}</blockquote>${
          block.data?.caption
            ? `<div style="text-align: right; font-size: 12px; color: #666; margin-top: 6px;">— ${escapeHtml(block.data.caption)}</div>`
            : ''
        }`
        break
      
      case 'code':
        html = `<pre><code>${escapeHtml(block.data.code)}</code></pre>`
        break
      
      case 'table':
        if (!block.data.content || !Array.isArray(block.data.content)) return ''
        const rows = block.data.content.map((row: any[]) => 
          `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
        ).join('')
        html = `<table><tbody>${rows}</tbody></table>`
        break
      
      case 'warning':
        html = `<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <strong>⚠️ ${escapeHtml(block.data.title || 'Warning')}</strong>
          <p>${escapeHtml(block.data.message || '')}</p>
        </div>`
        break
      
      case 'delimiter':
        html = '<hr style="border: none; border-top: 2px solid #ccc; margin: 30px 0;">'
        break
      
      case 'image':
        html = `<div style="text-align: center; margin: 20px 0;">
          <img src="${block.data.file?.url || block.data.url}" alt="${escapeHtml(block.data.caption || '')}" style="max-width: 100%; height: auto;">
          ${block.data.caption ? `<p style="font-size: 12px; color: #666; margin-top: 10px;">${escapeHtml(block.data.caption)}</p>` : ''}
        </div>`
        break
      
      case 'audio':
        const audioUrl = block.data.url || ''
        if (!audioUrl) {
          return `<p style="color: #999; text-align: center; padding: 20px;">[Audio block - no URL provided]</p>`
        }
        html = `<div style="text-align: center; margin: 20px 0;">
          <audio controls style="width: 100%; max-width: 600px;">
            <source src="${escapeHtml(audioUrl)}" type="audio/mpeg">
            <source src="${escapeHtml(audioUrl)}" type="audio/mp3">
            <source src="${escapeHtml(audioUrl)}" type="audio/wav">
            <p style="color: #666; font-size: 14px;">Your browser does not support the audio element. <a href="${escapeHtml(audioUrl)}" target="_blank">Download audio</a></p>
          </audio>
          ${block.data.caption ? `<p style="font-size: 12px; color: #666; margin-top: 10px;">${escapeHtml(block.data.caption)}</p>` : ''}
        </div>`
        break

      case 'AnyButton': {
        const label = block.data?.text || block.data?.name || 'Button'
        const url = block.data?.link || block.data?.url || ''
        if (url) {
          html = `<p><a href="${escapeHtml(url)}" target="_blank" style="display: inline-block; padding: 8px 14px; border: 1px solid #333; text-decoration: none; color: #000;">${escapeHtml(label)}</a></p>`
          break
        }
        html = `<p><strong>${escapeHtml(label)}</strong></p>`
        break
      }

      case 'linkTool': {
        const url = block.data?.link || ''
        const meta = block.data?.meta || {}
        const title = meta.title || url
        const description = meta.description || ''
        html = `<div style="border: 1px solid #ddd; padding: 12px; margin: 15px 0;">
          <div style="font-weight: bold; margin-bottom: 6px;">${escapeHtml(title)}</div>
          ${description ? `<div style="font-size: 12px; color: #666; margin-bottom: 6px;">${escapeHtml(description)}</div>` : ''}
          ${url ? `<div style="font-size: 12px;"><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></div>` : ''}
        </div>`
        break
      }

      case 'embed': {
        const url = block.data?.embed || block.data?.source || ''
        const width = Number(block.data?.width) || 560
        const height = Number(block.data?.height) || 315
        if (!url) {
          return `<p style="color: #999; text-align: center; padding: 20px;">[Embed block - no URL provided]</p>`
        }
        html = `<div style="text-align: center; margin: 20px 0;">
          <iframe src="${escapeHtml(url)}" width="${width}" height="${height}" style="border: none;" allowfullscreen></iframe>
        </div>`
        break
      }

      case 'columns': {
        const cols = block.data?.cols || block.data?.columns || []
        if (!Array.isArray(cols) || cols.length === 0) return ''
        const columnHtml = cols.map((col: any) => {
          const innerBlocks = col?.blocks || []
          return `<td style="vertical-align: top; padding: 0 8px;">${renderEditorJSBlocks(innerBlocks)}</td>`
        }).join('')
        html = `<table class="pdf-columns" style="width: 100%; table-layout: fixed;"><tbody><tr>${columnHtml}</tr></tbody></table>`
        break
      }
      
      default:
        html = ''
        break
    }
    if (!html) return ''
    return `<div class="pdf-block">${html}</div>`
  }).join('')
}

function escapeHtml(text: string): string {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function sanitizeInlineHtml(text: string): string {
  if (!text) return ''
  const container = document.createElement('div')
  container.innerHTML = text

  const forbiddenTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'])
  const allowedAttrsByTag: Record<string, string[]> = {
    A: ['href', 'target', 'rel', 'title'],
    SPAN: ['class']
  }

  const inlineClassMap: Record<string, string> = {
    U: 'pdf-underline',
    S: 'pdf-strike',
    STRIKE: 'pdf-strike',
    DEL: 'pdf-strike',
    MARK: 'pdf-mark'
  }

  Object.entries(inlineClassMap).forEach(([tagName, className]) => {
    const nodes = Array.from(container.getElementsByTagName(tagName))
    nodes.forEach((node) => {
      const span = document.createElement('span')
      span.className = className
      span.innerHTML = node.innerHTML
      node.replaceWith(span)
    })
  })

  const elements = Array.from(container.querySelectorAll('*'))
  elements.forEach((element) => {
    if (forbiddenTags.has(element.tagName)) {
      element.remove()
      return
    }

    const allowedAttrs = allowedAttrsByTag[element.tagName] || []
    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const isEvent = name.startsWith('on')
      const isAllowed = allowedAttrs.includes(attr.name)
      if (isEvent || !isAllowed) {
        element.removeAttribute(attr.name)
      }
    })

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || ''
      const safeHref =
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('/') ||
        href.startsWith('#')
      if (!safeHref) {
        element.removeAttribute('href')
      }

      const target = element.getAttribute('target')
      if (target === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer')
      }
    }
  })

  return container.innerHTML
}
