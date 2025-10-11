// Enhanced three-column cylinder sidebar navigation with Supabase integration

let currentCategories = [];
let currentSubcategories = [];
let currentDocuments = [];
let selectedCategory = null;
let selectedSubcategory = null;
let selectedDocument = null;

// Initialize enhanced sidebar (called from index.html)
async function initializeEnhancedSidebar() {
    await initSidebar();
}

// Auto-select first content item (called from index.html)
async function autoSelectFirstContent() {
    // Try to select first category, subcategory, and content
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

// Initialize sidebar
async function initSidebar() {
    currentCategories = await getCategories();
    console.log('Loaded categories:', currentCategories);
    
    renderCategories();
    renderSubcategories();
    renderDocuments();
}

// Render categories column using wheel-segment class
function renderCategories() {
    const container = document.getElementById('categories-column');
    if (!container) return;

    if (currentCategories.length === 0) {
        container.innerHTML = '<div class="loading">No categories yet</div>';
        return;
    }

    container.innerHTML = currentCategories.map((cat, index) => {
        const isSelected = selectedCategory?.id === cat.id;
        const distance = selectedCategory ? Math.abs(currentCategories.indexOf(selectedCategory) - index) : 999;
        
        let distanceClass = '';
        if (distance === 0) {
            distanceClass = 'active';
        } else if (distance === 1) {
            distanceClass = 'near-center';
        } else if (distance >= 3) {
            distanceClass = 'far-from-center';
        }
        
        return `
            <div class="wheel-segment ${distanceClass}" data-category-id="${cat.id}">
                ${cat.name}
            </div>
        `;
    }).join('');
    
    // Add click listeners
    container.querySelectorAll('.wheel-segment').forEach(segment => {
        segment.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-category-id');
            selectCategory(categoryId);
        });
    });
}

// Render subcategories column using wheel-segment class
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
        const isSelected = selectedSubcategory?.id === sub.id;
        const distance = selectedSubcategory ? Math.abs(currentSubcategories.indexOf(selectedSubcategory) - index) : 999;
        
        let distanceClass = '';
        if (distance === 0) {
            distanceClass = 'active';
        } else if (distance === 1) {
            distanceClass = 'near-center';
        } else if (distance >= 3) {
            distanceClass = 'far-from-center';
        }
        
        return `
            <div class="wheel-segment ${distanceClass}" data-subcategory-id="${sub.id}">
                ${sub.name}
            </div>
        `;
    }).join('');
    
    // Add click listeners
    container.querySelectorAll('.wheel-segment').forEach(segment => {
        segment.addEventListener('click', function() {
            const subcategoryId = this.getAttribute('data-subcategory-id');
            selectSubcategory(subcategoryId);
        });
    });
}

// Render documents column using wheel-segment class
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
        const isSelected = selectedDocument?.id === doc.id;
        const distance = selectedDocument ? Math.abs(currentDocuments.indexOf(selectedDocument) - index) : 999;
        
        let distanceClass = '';
        if (distance === 0) {
            distanceClass = 'active';
        } else if (distance === 1) {
            distanceClass = 'near-center';
        } else if (distance >= 3) {
            distanceClass = 'far-from-center';
        }
        
        // Use sidebar title/subtitle if available, otherwise fall back to main title/subtitle
        const displayTitle = doc.sidebar_title || doc.title;
        const icon = getContentIcon(doc.type);
        
        return `
            <div class="wheel-segment ${distanceClass}" data-document-id="${doc.id}">
                ${icon} ${displayTitle}
            </div>
        `;
    }).join('');
    
    // Add click listeners
    container.querySelectorAll('.wheel-segment').forEach(segment => {
        segment.addEventListener('click', function() {
            const documentId = this.getAttribute('data-document-id');
            selectDocument(documentId);
        });
    });
}

// Select category - KEEPING ID AS STRING (UUID)
async function selectCategory(categoryId) {
    selectedCategory = currentCategories.find(c => c.id === categoryId);
    selectedSubcategory = null;
    selectedDocument = null;
    
    console.log('Selected category:', selectedCategory);
    
    renderCategories();
    renderSubcategories();
    renderDocuments();
    clearContent();
}

// Select subcategory - KEEPING ID AS STRING (UUID)
async function selectSubcategory(subcategoryId) {
    selectedSubcategory = currentSubcategories.find(s => s.id === subcategoryId);
    selectedDocument = null;
    
    console.log('Selected subcategory:', selectedSubcategory);
    
    renderSubcategories();
    await renderDocuments();
    clearContent();
}

// Select document - KEEPING ID AS STRING (UUID)
async function selectDocument(documentId) {
    selectedDocument = currentDocuments.find(d => d.id === documentId);
    
    console.log('Selected document:', selectedDocument);
    
    renderDocuments();
    displayContent(selectedDocument);
}

// Display content in main area
function displayContent(content) {
    const contentArea = document.getElementById('contentContainer');
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
                    <img src="${content.content}" alt="${content.title}" loading="lazy" />
                </div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    } else if (content.type === 'video') {
        // Detect if Cloudinary video or YouTube embed
        const isCloudinaryVideo = content.content.includes('cloudinary.com') && content.content.includes('/video/');
        
        contentHTML = `
            <div class="video-content">
                <h1 class="content-title">${content.title}</h1>
                ${content.subtitle ? `<p class="content-subtitle">${content.subtitle}</p>` : ''}
                <div class="video-container">
                    ${isCloudinaryVideo ? 
                        `<video controls preload="metadata">
                            <source src="${content.content}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>` :
                        `<iframe src="${content.content}" frameborder="0" allowfullscreen></iframe>`
                    }
                </div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    } else if (content.type === 'audio') {
        contentHTML = `
            <div class="audio-content">
                <h1 class="content-title">${content.title}</h1>
                ${content.subtitle ? `<p class="content-subtitle">${content.subtitle}</p>` : ''}
                <div class="audio-container">
                    <audio controls preload="metadata">
                        <source src="${content.audio_url}" type="audio/mpeg">
                        <source src="${content.audio_url}" type="audio/wav">
                        <source src="${content.audio_url}" type="audio/ogg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                ${content.copyright_notice ? `<p class="copyright-notice">${content.copyright_notice}</p>` : ''}
            </div>
        `;
    }

    contentArea.innerHTML = contentHTML;
}

// Clear content area
function clearContent() {
    const contentArea = document.getElementById('contentContainer');
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="welcome-message">
                <h3>Select Content</h3>
                <p>Choose a document from the sidebar to view its content.</p>
            </div>
        `;
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
        video: '🎥',
        audio: '🎵'
    };
    return icons[type] || '📄';
}

// Initialize on page load (backup in case index.html doesn't call it)
document.addEventListener('DOMContentLoaded', async function() {
    // Only initialize if the main portfolio page is loaded
    if (document.getElementById('categoryNav')) {
        console.log('Sidebar navigation initializing...');
        await initializeEnhancedSidebar();
        await autoSelectFirstContent();
        console.log('Sidebar navigation ready!');
    }
});