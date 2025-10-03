// Enhanced three-column cylinder sidebar navigation with Supabase integration

let currentCategories = [];
let currentSubcategories = [];
let currentDocuments = [];
let selectedCategory = null;
let selectedSubcategory = null;
let selectedDocument = null;

// Initialize sidebar
async function initSidebar() {
    currentCategories = await getCategories();
    renderCategories();
}

// Render categories column
function renderCategories() {
    const container = document.getElementById('categories-column');
    if (!container) return;

    if (currentCategories.length === 0) {
        container.innerHTML = '<div class="empty-message">No categories yet</div>';
        return;
    }

    container.innerHTML = currentCategories.map((cat, index) => {
        const isSelected = selectedCategory?.id === cat.id;
        const distance = selectedCategory ? Math.abs(currentCategories.indexOf(selectedCategory) - index) : 0;
        
        return `
            <div class="wheel-item ${isSelected ? 'selected' : ''}" 
                 data-distance="${distance}"
                 onclick="selectCategory(${cat.id})">
                <div class="wheel-item-content">
                    <span class="item-title">${cat.name}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Render subcategories column
function renderSubcategories() {
    const container = document.getElementById('subcategories-column');
    if (!container) return;

    if (!selectedCategory) {
        container.innerHTML = '<div class="empty-message">Select a category</div>';
        currentSubcategories = [];
        return;
    }

    currentSubcategories = selectedCategory.subcategories || [];

    if (currentSubcategories.length === 0) {
        container.innerHTML = '<div class="empty-message">No subcategories</div>';
        return;
    }

    container.innerHTML = currentSubcategories.map((sub, index) => {
        const isSelected = selectedSubcategory?.id === sub.id;
        const distance = selectedSubcategory ? Math.abs(currentSubcategories.indexOf(selectedSubcategory) - index) : 0;
        
        return `
            <div class="wheel-item ${isSelected ? 'selected' : ''}"
                 data-distance="${distance}"
                 onclick="selectSubcategory(${sub.id})">
                <div class="wheel-item-content">
                    <span class="item-title">${sub.name}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Render documents column
async function renderDocuments() {
    const container = document.getElementById('documents-column');
    if (!container) return;

    if (!selectedSubcategory) {
        container.innerHTML = '<div class="empty-message">Select a subcategory</div>';
        currentDocuments = [];
        return;
    }

    currentDocuments = await getContentBySubcategory(selectedSubcategory.id);

    if (currentDocuments.length === 0) {
        container.innerHTML = '<div class="empty-message">No content yet</div>';
        return;
    }

    container.innerHTML = currentDocuments.map((doc, index) => {
        const isSelected = selectedDocument?.id === doc.id;
        const distance = selectedDocument ? Math.abs(currentDocuments.indexOf(selectedDocument) - index) : 0;
        
        // Use sidebar title/subtitle if available, otherwise fall back to main title/subtitle
        const displayTitle = doc.sidebar_title || doc.title;
        const displaySubtitle = doc.sidebar_subtitle || doc.subtitle;
        
        return `
            <div class="wheel-item ${isSelected ? 'selected' : ''}"
                 data-distance="${distance}"
                 onclick="selectDocument(${doc.id})">
                <div class="wheel-item-content">
                    <div class="item-icon">${getContentIcon(doc.type)}</div>
                    <div class="item-text">
                        <span class="item-title">${displayTitle}</span>
                        ${displaySubtitle ? `<span class="item-subtitle">${displaySubtitle}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Select category
async function selectCategory(categoryId) {
    selectedCategory = currentCategories.find(c => c.id === categoryId);
    selectedSubcategory = null;
    selectedDocument = null;
    
    renderCategories();
    renderSubcategories();
    renderDocuments();
    clearContent();
    
    // Reorder categories to center selected
    reorderColumn('categories-column', currentCategories, selectedCategory);
}

// Select subcategory
async function selectSubcategory(subcategoryId) {
    selectedSubcategory = currentSubcategories.find(s => s.id === subcategoryId);
    selectedDocument = null;
    
    renderSubcategories();
    await renderDocuments();
    clearContent();
    
    // Reorder subcategories to center selected
    reorderColumn('subcategories-column', currentSubcategories, selectedSubcategory);
}

// Select document
async function selectDocument(documentId) {
    selectedDocument = currentDocuments.find(d => d.id === documentId);
    
    renderDocuments();
    displayContent(selectedDocument);
    
    // Reorder documents to center selected
    reorderColumn('documents-column', currentDocuments, selectedDocument);
}

// Reorder column to center selected item
function reorderColumn(columnId, items, selectedItem) {
    const container = document.getElementById(columnId);
    if (!container || !selectedItem) return;
    
    const selectedIndex = items.findIndex(item => item.id === selectedItem.id);
    if (selectedIndex === -1) return;
    
    const wheelItems = Array.from(container.querySelectorAll('.wheel-item'));
    const reorderedItems = [];
    
    // Start from selected item and alternate above/below
    reorderedItems.push(wheelItems[selectedIndex]);
    
    let above = selectedIndex - 1;
    let below = selectedIndex + 1;
    
    while (above >= 0 || below < wheelItems.length) {
        if (below < wheelItems.length) {
            reorderedItems.push(wheelItems[below]);
            below++;
        }
        if (above >= 0) {
            reorderedItems.push(wheelItems[above]);
            above--;
        }
    }
    
    // Update distances and re-append
    container.innerHTML = '';
    reorderedItems.forEach((item, index) => {
        item.setAttribute('data-distance', index);
        container.appendChild(item);
    });
}

// Display content in main area
function displayContent(content) {
    const contentArea = document.getElementById('content-display');
    if (!contentArea || !content) return;

    let contentHTML = '';

    if (content.type === 'article') {
        // Build metadata section
        let metadataHTML = '';
        
        if (content.author_name) {
            metadataHTML += `<div class="content-metadata-item"><strong>Author:</strong> ${content.author_name}</div>`;
        }
        
        if (content.publication_name) {
            metadataHTML += `<div class="content-metadata-item"><strong>Published in:</strong> ${content.publication_name}</div>`;
        }
        
        if (content.publication_date) {
            metadataHTML += `<div class="content-metadata-item"><strong>Date:</strong> ${content.publication_date}</div>`;
        }
        
        if (content.source_link) {
            metadataHTML += `<div class="content-metadata-item"><strong>Source:</strong> <a href="${content.source_link}" target="_blank" rel="noopener noreferrer">View Original Article</a></div>`;
        }
        
        contentHTML = `
            <article class="article-content">
                <header class="article-header">
                    <h1 class="article-title">${content.title}</h1>
                    ${content.subtitle ? `<p class="article-subtitle">${content.subtitle}</p>` : ''}
                    ${metadataHTML ? `<div class="article-metadata">${metadataHTML}</div>` : ''}
                </header>
                <div class="article-body">
                    ${formatArticleContent(content.content)}
                </div>
                ${content.copyright_notice ? `<footer class="article-footer"><p class="copyright-notice">${content.copyright_notice}</p></footer>` : ''}
            </article>
        `;
    } else if (content.type === 'image') {
        contentHTML = `
            <div class="image-content">
                <h1 class="content-title">${content.title}</h1>
                ${content.subtitle ? `<p class="content-subtitle">${content.subtitle}</p>` : ''}
                <div class="image-container">
                    <img src="${content.content}" alt="${content.title}" />
                </div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    } else if (content.type === 'video') {
        contentHTML = `
            <div class="video-content">
                <h1 class="content-title">${content.title}</h1>
                ${content.subtitle ? `<p class="content-subtitle">${content.subtitle}</p>` : ''}
                <div class="video-container">
                    <iframe src="${content.content}" frameborder="0" allowfullscreen></iframe>
                </div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    }

    contentArea.innerHTML = contentHTML;
}

// Clear content area
function clearContent() {
    const contentArea = document.getElementById('content-display');
    if (contentArea) {
        contentArea.innerHTML = '<div class="no-content">Select a document to view its content</div>';
    }
}

// Format article content (preserve line breaks)
function formatArticleContent(content) {
    return content
        .split('\n')
        .map(para => para.trim())
        .filter(para => para.length > 0)
        .map(para => `<p>${para}</p>`)
        .join('');
}

// Get icon for content type
function getContentIcon(type) {
    const icons = {
        article: '📄',
        image: '🖼️',
        video: '🎥'
    };
    return icons[type] || '📄';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initSidebar);