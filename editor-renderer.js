// editor-renderer.js
// Converts Editor.js JSON format to HTML for display on front page

/**
 * Render Editor.js JSON data to HTML
 * @param {object} editorData - Editor.js data format {blocks: [...]}
 * @returns {string} HTML string
 */
function renderEditorContent(editorData) {
    if (!editorData || !editorData.blocks || !Array.isArray(editorData.blocks)) {
        return '<p>Content could not be loaded.</p>';
    }

    return editorData.blocks.map(block => renderBlock(block)).join('');
}

/**
 * Render individual Editor.js block to HTML
 * @param {object} block - Editor.js block
 * @returns {string} HTML string
 */
function renderBlock(block) {
    switch (block.type) {
        case 'header':
            return renderHeader(block.data);
        case 'paragraph':
            return renderParagraph(block.data);
        case 'list':
            return renderList(block.data);
        case 'quote':
            return renderQuote(block.data);
        case 'delimiter':
            return renderDelimiter();
        case 'code':
            return renderCode(block.data);
        case 'embed':
            return renderEmbed(block.data);
        case 'image':
            return renderImage(block.data);
        default:
            console.warn('Unknown block type:', block.type);
            return '';
    }
}

/**
 * Render header block
 */
function renderHeader(data) {
    const level = data.level || 2;
    const text = data.text || '';
    return `<h${level}>${text}</h${level}>`;
}

/**
 * Render paragraph block
 */
function renderParagraph(data) {
    const text = data.text || '';
    if (!text.trim()) return '';
    return `<p>${text}</p>`;
}

/**
 * Render list block
 */
function renderList(data) {
    const style = data.style || 'unordered';
    const items = data.items || [];
    
    if (items.length === 0) return '';
    
    const tag = style === 'ordered' ? 'ol' : 'ul';
    const itemsHtml = items.map(item => {
        if (typeof item === 'string') {
            return `<li>${item}</li>`;
        } else if (item.content) {
            return `<li>${item.content}</li>`;
        }
        return '';
    }).join('');
    
    return `<${tag}>${itemsHtml}</${tag}>`;
}

/**
 * Render quote block
 */
function renderQuote(data) {
    const text = data.text || '';
    const caption = data.caption || '';
    const alignment = data.alignment || 'left';
    
    return `
        <blockquote class="editor-quote editor-quote-${alignment}">
            <p>${text}</p>
            ${caption ? `<cite>${caption}</cite>` : ''}
        </blockquote>
    `;
}

/**
 * Render delimiter block
 */
function renderDelimiter() {
    return '<div class="editor-delimiter">* * *</div>';
}

/**
 * Render code block
 */
function renderCode(data) {
    const code = data.code || '';
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
}

/**
 * Render embed block
 */
function renderEmbed(data) {
    const service = data.service || '';
    const embed = data.embed || '';
    const caption = data.caption || '';
    
    if (!embed) return '';
    
    return `
        <div class="editor-embed">
            <iframe src="${embed}" frameborder="0" allowfullscreen></iframe>
            ${caption ? `<p class="embed-caption">${caption}</p>` : ''}
        </div>
    `;
}

/**
 * Render image block
 */
function renderImage(data) {
    const url = data.file?.url || data.url || '';
    const caption = data.caption || '';
    const withBorder = data.withBorder || false;
    const stretched = data.stretched || false;
    const withBackground = data.withBackground || false;
    
    if (!url) return '';
    
    let classes = 'editor-image';
    if (withBorder) classes += ' editor-image-border';
    if (stretched) classes += ' editor-image-stretched';
    if (withBackground) classes += ' editor-image-background';
    
    return `
        <figure class="${classes}">
            <img src="${url}" alt="${caption || ''}" loading="lazy">
            ${caption ? `<figcaption>${caption}</figcaption>` : ''}
        </figure>
    `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose globally
window.renderEditorContent = renderEditorContent;