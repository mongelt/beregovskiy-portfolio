// Enhanced Sidebar Navigation - Shows individual content items under subcategories
// This file handles the enhanced sidebar hierarchy and content selection

// Generate enhanced sidebar with individual content items
function generateEnhancedSidebar() {
    const categories = getStoredCategories();
    const categoryNav = document.getElementById('categoryNav');
    
    if (Object.keys(categories).length === 0) {
        categoryNav.innerHTML = '<div class="no-categories">No categories yet. <a href="admin/">Add some content</a> to get started!</div>';
        return;
    }
    
    let html = '';
    
    Object.keys(categories)
        .sort((a, b) => categories[a].order - categories[b].order)
        .forEach(catName => {
            html += `<div class="category-group">`;
            html += `<h3 class="category-title">${catName}</h3>`;
            html += `<div class="subcategory-container">`;
            
            const subcats = categories[catName].subcategories;
            Object.keys(subcats)
                .sort((a, b) => subcats[a].order - subcats[b].order)
                .forEach(subName => {
                    // Get content for this subcategory
                    const contentItems = getContentByCategory(catName, subName);
                    
                    html += `<div class="subcategory-section">`;
                    html += `<button class="subcategory-btn" onclick="toggleSubcategory('${catName}', '${subName}')">
                        <span class="subcategory-name">${subName}</span>
                        <span class="content-count">(${contentItems.length})</span>
                        <i class="fas fa-chevron-down subcategory-arrow"></i>
                    </button>`;
                    
                    html += `<div class="content-items-list" id="content-list-${sanitizeId(catName)}-${sanitizeId(subName)}" style="display: none;">`;
                    
                    if (contentItems.length === 0) {
                        html += `<div class="no-content-message">
                            <i class="fas fa-plus-circle"></i>
                            <span>No content yet</span>
                        </div>`;
                    } else {
                        contentItems.forEach(item => {
                            // Use sidebar title if available, otherwise use main title
                            const sidebarTitle = item.sidebarTitle || item.title;
                            const sidebarSubtitle = item.sidebarSubtitle || '';
                            
                            html += `<button class="content-item-btn" onclick="showContentItem(${item.id})" data-content-id="${item.id}">
                                <div class="content-item-preview">
                                    <div class="content-item-icon">
                                        ${getContentIcon(item.type)}
                                    </div>
                                    <div class="content-item-info">
                                        <div class="content-item-title">${sidebarTitle}</div>
                                        ${sidebarSubtitle ? `<div class="content-item-subtitle">${sidebarSubtitle}</div>` : ''}
                                        <div class="content-item-meta">
                                            <span class="content-type-badge">${item.type.toUpperCase()}</span>
                                            <span class="content-date">${formatDate(item.dateCreated)}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>`;
                        });
                    }
                    
                    html += `</div></div>`;
                });
            
            html += `</div></div>`;
        });
    
    categoryNav.innerHTML = html;
}

// Toggle subcategory expansion/collapse
function toggleSubcategory(category, subcategory) {
    const listId = `content-list-${sanitizeId(category)}-${sanitizeId(subcategory)}`;
    const contentList = document.getElementById(listId);
    const arrow = event.target.querySelector('.subcategory-arrow') || event.target.parentElement.querySelector('.subcategory-arrow');
    const button = event.target.classList.contains('subcategory-btn') ? event.target : event.target.closest('.subcategory-btn');
    
    if (contentList.style.display === 'none') {
        // Expand
        contentList.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
        button.classList.add('expanded');
    } else {
        // Collapse
        contentList.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
        button.classList.remove('expanded');
    }
}

// Show individual content item
function showContentItem(contentId) {
    const allContent = getAllContent();
    const contentItem = allContent.find(item => item.id == contentId);
    
    if (!contentItem) {
        console.error('Content item not found:', contentId);
        return;
    }
    
    // Update content area
    const container = document.getElementById('contentContainer');
    const title = document.getElementById('contentTitle');
    const subtitle = document.getElementById('contentSubtitle');
    
    // Use main title/subtitle for content area (not sidebar versions)
    title.textContent = contentItem.title;
    subtitle.textContent = `${contentItem.category} → ${contentItem.subcategory} • ${contentItem.type.toUpperCase()} • ${formatDate(contentItem.dateCreated)}`;
    
    let html = `
        <article class="content-item-full">
            <header class="content-item-header">
                <h3>${contentItem.title}</h3>
                <div class="content-meta">
                    <span class="content-type">${contentItem.type.toUpperCase()}</span>
                    <span class="content-date">${formatDate(contentItem.dateCreated)}</span>
                </div>
            </header>
            
            ${contentItem.mediaUrl && contentItem.type === 'image' ? 
                `<div class="content-media">
                    <img src="${contentItem.mediaUrl}" alt="${contentItem.title}">
                </div>` : ''}
            
            ${contentItem.mediaUrl && contentItem.type === 'video' ? 
                generateVideoHTML(contentItem.mediaUrl) : ''}
            
            <div class="content-body">
                ${contentItem.content}
            </div>
        </article>
    `;
    
    container.innerHTML = html;
    
    // Update sidebar selection
    updateSidebarSelection(contentId);
    
    // Scroll to top of content area
    document.querySelector('.content-area').scrollTop = 0;
}

// Update sidebar selection highlighting
function updateSidebarSelection(activeContentId) {
    // Remove all active states
    document.querySelectorAll('.content-item-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active state to selected item
    const activeBtn = document.querySelector(`[data-content-id="${activeContentId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        
        // Ensure the subcategory is expanded
        const contentList = activeBtn.closest('.content-items-list');
        if (contentList && contentList.style.display === 'none') {
            const subcategoryBtn = contentList.previousElementSibling;
            const arrow = subcategoryBtn.querySelector('.subcategory-arrow');
            
            contentList.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
            subcategoryBtn.classList.add('expanded');
        }
    }
}

// Get appropriate icon for content type
function getContentIcon(type) {
    const icons = {
        'article': '<i class="fas fa-file-text"></i>',
        'image': '<i class="fas fa-image"></i>',
        'video': '<i class="fas fa-video"></i>'
    };
    return icons[type] || '<i class="fas fa-file"></i>';
}

// Sanitize strings for use as HTML IDs
function sanitizeId(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Initialize enhanced sidebar when DOM is loaded
function initializeEnhancedSidebar() {
    generateEnhancedSidebar();
}

// Auto-select first content item if none selected
function autoSelectFirstContent() {
    const firstContentBtn = document.querySelector('.content-item-btn');
    if (firstContentBtn) {
        const contentId = firstContentBtn.getAttribute('data-content-id');
        showContentItem(contentId);
    }
}