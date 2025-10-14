// Enhanced three-column cylinder sidebar navigation with Supabase integration

let currentCategories = [];
let currentSubcategories = [];
let currentDocuments = [];
let selectedCategory = null;
let selectedSubcategory = null;
let selectedDocument = null;

async function initializeEnhancedSidebar() {
    await initSidebar();
}

async function autoSelectFirstContent() {
    if (currentCategories.length > 0) {
        await selectCategory(currentCategories[0].id);
        if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
            await selectSubcategory(selectedCategory.subcategories[0].id);
            if (currentDocuments.length > 0) {
                await selectDocument(currentDocuments[0].id);
            }
        }
    }
}

async function initSidebar() {
    currentCategories = await getCategories();
    renderCategories();
    renderSubcategories();
    renderDocuments();
}

function renderCategories() {
    const container = document.getElementById('categories-column');
    if (!container) return;
    if (currentCategories.length === 0) {
        container.innerHTML = '<div class="loading">No categories yet</div>';
        return;
    }
    container.innerHTML = currentCategories.map((cat, index) => {
        const distance = selectedCategory ? Math.abs(currentCategories.indexOf(selectedCategory) - index) : 999;
        let distanceClass = distance === 0 ? 'active' : distance === 1 ? 'near-center' : distance >= 3 ? 'far-from-center' : '';
        return `<div class="wheel-segment ${distanceClass}" data-category-id="${cat.id}">${cat.name}</div>`;
    }).join('');
    container.querySelectorAll('.wheel-segment').forEach(segment => {
        segment.addEventListener('click', function() {
            selectCategory(this.getAttribute('data-category-id'));
        });
    });
}

function renderSubcategories() {
    const container = document.getElementById('subcategories-column');
    if (!container) return;
    if (!selectedCategory) {
        container.innerHTML = '<div class="loading">Select a category</div>';
        currentSubcategories = [];
        return;
    }
    currentSubcategories = selectedCategory.subcategories || [];
    if (currentSubcategories.length === 0) {
        container.innerHTML = '<div class="loading">No subcategories</div>';
        return;
    }
    container.innerHTML = currentSubcategories.map((sub, index) => {
        const distance = selectedSubcategory ? Math.abs(currentSubcategories.indexOf(selectedSubcategory) - index) : 999;
        let distanceClass = distance === 0 ? 'active' : distance === 1 ? 'near-center' : distance >= 3 ? 'far-from-center' : '';
        return `<div class="wheel-segment ${distanceClass}" data-subcategory-id="${sub.id}">${sub.name}</div>`;
    }).join('');
    container.querySelectorAll('.wheel-segment').forEach(segment => {
        segment.addEventListener('click', function() {
            selectSubcategory(this.getAttribute('data-subcategory-id'));
        });
    });
}

async function renderDocuments() {
    const container = document.getElementById('documents-column');
    if (!container) return;
    if (!selectedSubcategory) {
        container.innerHTML = '<div class="loading">Select a subcategory</div>';
        currentDocuments = [];
        return;
    }
    currentDocuments = await getContentBySubcategory(selectedSubcategory.id);
    if (currentDocuments.length === 0) {
        container.innerHTML = '<div class="loading">No content yet</div>';
        return;
    }
    container.innerHTML = currentDocuments.map((doc, index) => {
        const distance = selectedDocument ? Math.abs(currentDocuments.indexOf(selectedDocument) - index) : 999;
        let distanceClass = distance === 0 ? 'active' : distance === 1 ? 'near-center' : distance >= 3 ? 'far-from-center' : '';
        const displayTitle = doc.sidebar_title || doc.title;
        const icon = getContentIcon(doc.type);
        return `<div class="wheel-segment ${distanceClass}" data-document-id="${doc.id}">${icon} ${displayTitle}</div>`;
    }).join('');
    container.querySelectorAll('.wheel-segment').forEach(segment => {
        segment.addEventListener('click', function() {
            selectDocument(this.getAttribute('data-document-id'));
        });
    });
}

async function selectCategory(categoryId) {
    selectedCategory = currentCategories.find(c => c.id === categoryId);
    selectedSubcategory = null;
    selectedDocument = null;
    renderCategories();
    renderSubcategories();
    renderDocuments();
    clearContent();
}

async function selectSubcategory(subcategoryId) {
    selectedSubcategory = currentSubcategories.find(s => s.id === subcategoryId);
    selectedDocument = null;
    renderSubcategories();
    await renderDocuments();
    clearContent();
}

async function selectDocument(documentId) {
    selectedDocument = currentDocuments.find(d => d.id === documentId);
    renderDocuments();
    displayContent(selectedDocument);
}

function renderEditorJsContent(content) {
    if (!content) return '<p>No content available.</p>';
    
    let blocks;
    
    // Handle different storage formats
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            blocks = Array.isArray(parsed) ? parsed : (parsed.blocks || []);
        } catch (e) {
            // Not JSON - treat as plain text
            return content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
        }
    } else if (Array.isArray(content)) {
        blocks = content;
    } else if (content.blocks && Array.isArray(content.blocks)) {
        blocks = content.blocks;
    } else {
        return '<p>Invalid content format.</p>';
    }
    
    if (!blocks.length) return '<p>No content.</p>';
    
    return blocks.map(block => {
        if (!block || !block.type) return '';
        
        switch(block.type) {
            case 'paragraph':
                return `<p>${block.data?.text || ''}</p>`;
            case 'header':
                const level = block.data?.level || 2;
                return `<h${level}>${block.data?.text || ''}</h${level}>`;
            case 'list':
                const items = (block.data?.items || []).map(item => `<li>${item}</li>`).join('');
                return block.data?.style === 'ordered' ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
            case 'quote':
                return `<blockquote><p>${block.data?.text || ''}</p>${block.data?.caption ? `<cite>${block.data.caption}</cite>` : ''}</blockquote>`;
            case 'code':
                return `<pre><code>${block.data?.code || ''}</code></pre>`;
            case 'delimiter':
                return '<hr>';
            case 'image':
                return `<figure><img src="${block.data?.file?.url || block.data?.url || ''}" alt="${block.data?.caption || ''}"><figcaption>${block.data?.caption || ''}</figcaption></figure>`;
            case 'embed':
                return `<div class="embed-container"><iframe src="${block.data?.embed || block.data?.source || ''}" frameborder="0" allowfullscreen></iframe></div>`;
            default:
                return '';
        }
    }).join('');
}

function displayContent(content) {
    const contentArea = document.getElementById('contentContainer');
    if (!contentArea || !content) return;

    let contentHTML = '';

    if (content.type === 'article') {
        let metadataHTML = '';
        if (content.author_name) metadataHTML += `<div class="content-metadata-item"><strong>Author:</strong> ${content.author_name}</div>`;
        if (content.publication_name) metadataHTML += `<div class="content-metadata-item"><strong>Published in:</strong> ${content.publication_name}</div>`;
        if (content.publication_date) metadataHTML += `<div class="content-metadata-item"><strong>Date:</strong> ${content.publication_date}</div>`;
        if (content.source_link) metadataHTML += `<div class="content-metadata-item"><strong>Source:</strong> <a href="${content.source_link}" target="_blank">View Original</a></div>`;
        
        const articleBody = renderEditorJsContent(content.content);
        
        contentHTML = `
            <article class="article-content">
                <header class="article-header">
                    <h1 class="article-title">${content.title}</h1>
                    ${content.subtitle ? `<p class="article-subtitle">${content.subtitle}</p>` : ''}
                    ${metadataHTML ? `<div class="article-metadata">${metadataHTML}</div>` : ''}
                </header>
                <div class="article-body">${articleBody}</div>
                ${content.copyright_notice ? `<footer class="article-footer"><p class="copyright-notice">${content.copyright_notice}</p></footer>` : ''}
            </article>
        `;
    } else if (content.type === 'image') {
        contentHTML = `
            <div class="image-content">
                <h1 class="content-title">${content.title}</h1>
                ${content.subtitle ? `<p class="content-subtitle">${content.subtitle}</p>` : ''}
                <div class="image-container"><img src="${content.content}" alt="${content.title}" loading="lazy" /></div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    } else if (content.type === 'video') {
        const isCloudinary = content.content.includes('cloudinary.com') && content.content.includes('/video/');
        contentHTML = `
            <div class="video-content">
                <h1 class="content-title">${content.title}</h1>
                ${content.subtitle ? `<p class="content-subtitle">${content.subtitle}</p>` : ''}
                <div class="video-container">
                    ${isCloudinary ? `<video controls preload="metadata"><source src="${content.content}" type="video/mp4"></video>` : `<iframe src="${content.content}" frameborder="0" allowfullscreen></iframe>`}
                </div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    } else if (content.type === 'audio') {
        contentHTML = `
            <div class="audio-content">
                <h1 class="content-title">${content.title}</h1>
                ${content.subtitle ? `<p class="content-subtitle">${content.subtitle}</p>` : ''}
                <div class="audio-container"><audio controls preload="metadata"><source src="${content.audio_url}" type="audio/mpeg"></audio></div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    }

    contentArea.innerHTML = contentHTML;
}

function clearContent() {
    const contentArea = document.getElementById('contentContainer');
    if (contentArea) {
        contentArea.innerHTML = '<div class="welcome-message"><h3>Select Content</h3><p>Choose a document from the sidebar.</p></div>';
    }
}

function getContentIcon(type) {
    return { article: '📄', image: '🖼️', video: '🎥', audio: '🎵' }[type] || '📄';
}

document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('categoryNav')) {
        await initializeEnhancedSidebar();
        await autoSelectFirstContent();
    }
});