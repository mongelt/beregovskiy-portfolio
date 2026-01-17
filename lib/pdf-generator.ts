import { createClient } from '@/lib/supabase/client'

// Dynamic import for html2pdf to avoid SSR issues
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

export async function generateArticlePDF(contentId: string): Promise<Blob> {
  const supabase = createClient()
  
  // Fetch content data
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

  // Create HTML content for PDF
  const htmlContent = createPDFHTML(content)
  
  // Get html2pdf dynamically
  const html2pdf = await getHtml2Pdf()
  if (!html2pdf) {
    throw new Error('PDF generation not available in this environment')
  }
  
  // Configure PDF options
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
    }
  }

  // Generate PDF
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
          padding-left: 25px;
        }
        
        .content li {
          margin-bottom: 5px;
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
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          font-size: 10px;
          color: #666;
          text-align: center;
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

function renderEditorJSContent(data: any): string {
  if (!data || !data.blocks) return '<p>No content available</p>'
  
  return data.blocks.map((block: any) => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${escapeHtml(block.data.text)}</p>`
      
      case 'header':
        const level = block.data.level || 1
        return `<h${level}>${escapeHtml(block.data.text)}</h${level}>`
      
      case 'list':
        const listType = block.data.style === 'ordered' ? 'ol' : 'ul'
        const items = block.data.items.map((item: any) => 
          `<li>${escapeHtml(item.content)}</li>`
        ).join('')
        return `<${listType}>${items}</${listType}>`
      
      case 'quote':
        return `<blockquote>${escapeHtml(block.data.text)}</blockquote>`
      
      case 'code':
        return `<pre><code>${escapeHtml(block.data.code)}</code></pre>`
      
      case 'table':
        if (!block.data.content || !Array.isArray(block.data.content)) return ''
        const rows = block.data.content.map((row: any[]) => 
          `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
        ).join('')
        return `<table><tbody>${rows}</tbody></table>`
      
      case 'warning':
        return `<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <strong>⚠️ ${escapeHtml(block.data.title || 'Warning')}</strong>
          <p>${escapeHtml(block.data.message || '')}</p>
        </div>`
      
      case 'delimiter':
        return '<hr style="border: none; border-top: 2px solid #ccc; margin: 30px 0;">'
      
      case 'image':
        return `<div style="text-align: center; margin: 20px 0;">
          <img src="${block.data.file?.url || block.data.url}" alt="${escapeHtml(block.data.caption || '')}" style="max-width: 100%; height: auto;">
          ${block.data.caption ? `<p style="font-size: 12px; color: #666; margin-top: 10px;">${escapeHtml(block.data.caption)}</p>` : ''}
        </div>`
      
      case 'audio':
        // Step 14.4: Audio block - render as HTML5 audio tag (wavesurfer.js won't work in PDF)
        const audioUrl = block.data.url || ''
        if (!audioUrl) {
          return `<p style="color: #999; text-align: center; padding: 20px;">[Audio block - no URL provided]</p>`
        }
        return `<div style="text-align: center; margin: 20px 0;">
          <audio controls style="width: 100%; max-width: 600px;">
            <source src="${escapeHtml(audioUrl)}" type="audio/mpeg">
            <source src="${escapeHtml(audioUrl)}" type="audio/mp3">
            <source src="${escapeHtml(audioUrl)}" type="audio/wav">
            <p style="color: #666; font-size: 14px;">Your browser does not support the audio element. <a href="${escapeHtml(audioUrl)}" target="_blank">Download audio</a></p>
          </audio>
          ${block.data.caption ? `<p style="font-size: 12px; color: #666; margin-top: 10px;">${escapeHtml(block.data.caption)}</p>` : ''}
        </div>`
      
      default:
        return `<p>[Unsupported block type: ${block.type}]</p>`
    }
  }).join('')
}

function escapeHtml(text: string): string {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
