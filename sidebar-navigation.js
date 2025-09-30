// Independent Column Navigation - 20 Char Limit, Subtitle + Year

let selectedCategory = null;
let selectedSubcategory = null;
let selectedDocumentId = null;

// Truncate text to max 20 characters
function truncateText(text, maxLength = 20) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Extract year from date
function getYear(dateString) {
    const date = new Date(dateString);
    return date.getFullYear();
}

function generateEnhancedSidebar() {
    const categories = getStoredCategories();
    const categoryNav = document.getElementById('categoryNav');
    
    if (Object.keys(categories).length === 0) {
        categoryNav.innerHTML = '<div style="padding: 2rem; text-align: center; color: #8195a3; font-style: italic;">No categories yet. <a href="management/" style="color: #64b5f6;">Add some content</a> to get started!</div>';
        return;
    }
    
    let html = `
        <div class="cylinder-wheel" id="categoriesWheel"></div>
        <div class="cylinder-wheel" id="subcategoriesWheel"></div>
        <div class="cylinder-wheel" id="documentsWheel"></div>
    `;
    
    categoryNav.innerHTML = html;
}

// Reorder array to put selected item in middle (circular)
function reorderArrayForCenter(array, selectedIndex) {
    if (array.length === 0) return [];
    if (selectedIndex < 0 || selectedIndex >= array.length) selectedIndex = 0;
    
    const totalItems = array.length;
    const halfBefore = Math.floor(totalItems / 2);
    
    let reordered = [];
    for (let i = 0; i < totalItems; i++) {
        const index = (selectedIndex - halfBefore + i + totalItems) % totalItems;
        reordered.push({...array[index], distanceFromCenter: Math.abs(i - halfBefore)});
    }
    
    return reordered;
}

// Generate categories wheel
function generateCategoriesWheel(selectedCategoryName = null) {
    const categories = getStoredCategories();
    const categoriesArray = Object.keys(categories)
        .sort((a, b) => categories[a].order - categories[b].order)
        .map(name => ({name, data: categories[name]}));
    
    let selectedIndex = categoriesArray.findIndex(cat => cat.name === selectedCategoryName);
    if (selectedIndex === -1) selectedIndex = 0;
    
    const reordered = reorderArrayForCenter(categoriesArray, selectedIndex);
    
    let html = '';
    reordered.forEach((cat, index) => {
        const isActive = cat.name === selectedCategoryName || (selectedCategoryName === null && index === Math.floor(reordered.length / 2));
        const distanceClass = cat.distanceFromCenter > 2 ? 'far-from-center' : (cat.distanceFromCenter === 1 ? 'near-center' : '');
        
        html += `
            <button class="wheel-segment ${isActive ? 'active' : ''} ${distanceClass}" 
                    onclick="selectCategory('${escapeHtml(cat.name)}')"
                    title="${cat.name}">
                ${truncateText(cat.name, 20)}
            </button>
        `;
    });
    
    document.getElementById('categoriesWheel').innerHTML = html;
}

// Generate subcategories wheel - only regenerates when category changes
function generateSubcategoriesWheel(categoryName, selectedSubcategoryName = null, forceRegenerate = false) {
    const categories = getStoredCategories();
    const category = categories[categoryName];
    
    if (!category) return;
    
    // Check if we need to regenerate
    const currentWheel = document.getElementById('subcategoriesWheel');
    if (!forceRegenerate && currentWheel.dataset.categoryName === categoryName && selectedSubcategoryName === null) {
        return; // Don't regenerate if same category and no specific selection
    }
    
    currentWheel.dataset.categoryName = categoryName;
    
    const subcats = category.subcategories;
    const subcatsArray = Object.keys(subcats)
        .sort((a, b) => subcats[a].order - subcats[b].order)
        .map(name => ({name, data: subcats[name]}));
    
    let selectedIndex = subcatsArray.findIndex(sub => sub.name === selectedSubcategoryName);
    if (selectedIndex === -1) selectedIndex = 0;
    
    const reordered = reorderArrayForCenter(subcatsArray, selectedIndex);
    
    let html = '';
    reordered.forEach((sub, index) => {
        const contentCount = getContentByCategory(categoryName, sub.name).length;
        const isActive = sub.name === selectedSubcategoryName || (selectedSubcategoryName === null && index === Math.floor(reordered.length / 2));
        const distanceClass = sub.distanceFromCenter > 2 ? 'far-from-center' : (sub.distanceFromCenter === 1 ? 'near-center' : '');
        
        html += `
            <button class="wheel-segment ${isActive ? 'active' : ''} ${distanceClass}" 
                    onclick="selectSubcategory('${escapeHtml(categoryName)}', '${escapeHtml(sub.name)}')"
                    title="${sub.name}">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; overflow: hidden;">
                    <span style="flex: 1; overflow: hidden; text-overflow: ellipsis;">${truncateText(sub.name, 15)}</span>
                    <span style="flex-shrink: 0; font-size: 0.7rem; color: #8195a3; background: rgba(100, 181, 246, 0.1); padding: 0.1rem 0.3rem; border-radius: 4px; margin-left: 0.3rem;">${contentCount}</span>
                </div>
            </button>
        `;
    });
    
    currentWheel.innerHTML = html;
}

// Generate documents wheel - only regenerates when subcategory changes
function generateDocumentsWheel(categoryName, subcategoryName, selectedContentId = null, forceRegenerate = false) {
    const contentItems = getContentByCategory(categoryName, subcategoryName);
    
    const currentWheel = document.getElementById('documentsWheel');
    
    if (contentItems.length === 0) {
        currentWheel.innerHTML = '<div style="padding: 2rem 1rem; text-align: center; color: #8195a3; font-style: italic; font-size: 0.85rem;">No documents yet</div>';
        return;
    }
    
    // Check if we need to regenerate
    if (!forceRegenerate && currentWheel.dataset.subcategoryName === subcategoryName && selectedContentId === null) {
        return;
    }
    
    currentWheel.dataset.subcategoryName = subcategoryName;
    
    let selectedIndex = contentItems.findIndex(item => item.id == selectedContentId);
    if (selectedIndex === -1) selectedIndex = 0;
    
    const reordered = reorderArrayForCenter(contentItems, selectedIndex);
    
    let html = '';
    reordered.forEach((item, index) => {
        const title = truncateText(item.sidebarTitle || item.title, 20);
        const subtitle = truncateText(item.sidebarSubtitle || '', 20); // Use subtitle instead of type
        const year = getYear(item.dateCreated); // Use year instead of full date
        const isActive = item.id == selectedContentId || (selectedContentId === null && index === Math.floor(reordered.length / 2));
        const distanceClass = item.distanceFromCenter > 2 ? 'far-from-center' : (item.distanceFromCenter === 1 ? 'near-center' : '');
        
        html += `
            <button class="wheel-segment ${isActive ? 'active' : ''} ${distanceClass}" 
                    onclick="showContentItem(${item.id})" 
                    data-content-id="${item.id}"
                    title="${item.sidebarTitle || item.title}">
                <div style="display: flex; align-items: flex-start; gap: 0.5rem; overflow: hidden;">
                    <div style="flex-shrink: 0; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border-radius: 3px; background: linear-gradient(135deg, rgba(100, 181, 246, 0.2), rgba(30, 136, 229, 0.1)); color: #64b5f6; font-size: 0.65rem;">
                        ${getContentIcon(item.type)}
                    </div>
                    <div style="flex: 1; min-width: 0; text-align: left; overflow: hidden;">
                        <div style="font-size: 0.9rem; font-weight: 600; color: inherit; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${title}
                        </div>
                        ${subtitle ? `<div style="font-size: 0.7rem; color: #8195a3; line-height: 1.2; font-style: italic; margin-top: 0.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${subtitle}</div>` : ''}
                        <div style="font-size: 0.65rem; color: #8195a3; margin-top: 0.2rem;">
                            ${year}
                        </div>
                    </div>
                </div>
            </button>
        `;
    });
    
    currentWheel.innerHTML = html;
}

// Handle category selection - only regenerates category wheel
function selectCategory(categoryName) {
    selectedCategory = categoryName;
    
    // Only regenerate categories wheel
    generateCategoriesWheel(categoryName);
    
    // Regenerate subcategories for new category
    const categories = getStoredCategories();
    const category = categories[categoryName];
    if (category && category.subcategories) {
        const firstSubcategory = Object.keys(category.subcategories)
            .sort((a, b) => category.subcategories[a].order - category.subcategories[b].order)[0];
        
        if (firstSubcategory) {
            selectedSubcategory = firstSubcategory;
            generateSubcategoriesWheel(categoryName, firstSubcategory, true);
            
            // Load documents for first subcategory
            const contentItems = getContentByCategory(categoryName, firstSubcategory);
            if (contentItems.length > 0) {
                selectedDocumentId = contentItems[0].id;
                generateDocumentsWheel(categoryName, firstSubcategory, contentItems[0].id, true);
                setTimeout(() => showContentItem(contentItems[0].id), 10);
            }
        }
    }
}

// Handle subcategory selection - only regenerates subcategory wheel
function selectSubcategory(categoryName, subcategoryName) {
    selectedCategory = categoryName;
    selectedSubcategory = subcategoryName;
    
    // Only regenerate subcategories wheel
    generateSubcategoriesWheel(categoryName, subcategoryName, true);
    
    // Load documents for selected subcategory
    const contentItems = getContentByCategory(categoryName, subcategoryName);
    if (contentItems.length > 0) {
        selectedDocumentId = contentItems[0].id;
        generateDocumentsWheel(categoryName, subcategoryName, contentItems[0].id, true);
        setTimeout(() => showContentItem(contentItems[0].id), 10);
    } else {
        document.getElementById('documentsWheel').innerHTML = '<div style="padding: 2rem 1rem; text-align: center; color: #8195a3; font-style: italic; font-size: 0.85rem;">No documents yet</div>';
        
        const container = document.getElementById('contentContainer');
        const title = document.getElementById('contentTitle');
        const subtitle = document.getElementById('contentSubtitle');
        
        title.textContent = subcategoryName;
        subtitle.textContent = `${categoryName} → ${subcategoryName}`;
        
        container.innerHTML = `
            <div class="welcome-message">
                <h3>${subcategoryName}</h3>
                <p>No documents in this subcategory yet. <a href="management/" style="color: #64b5f6;">Add some content</a> to get started.</p>
            </div>
        `;
    }
}

// Show content item - only regenerates documents wheel
function showContentItem(contentId) {
    const allContent = getAllContent();
    const contentItem = allContent.find(item => item.id == contentId);
    
    if (!contentItem) {
        console.error('Content item not found:', contentId);
        return;
    }
    
    selectedDocumentId = contentId;
    
    // Only regenerate documents wheel
    generateDocumentsWheel(contentItem.category, contentItem.subcategory, contentId, true);
    
    // Update content area
    const container = document.getElementById('contentContainer');
    const title = document.getElementById('contentTitle');
    const subtitle = document.getElementById('contentSubtitle');
    
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
    document.querySelector('.content-area').scrollTop = 0;
}

function getContentIcon(type) {
    const icons = {
        'article': '<i class="fas fa-file-text"></i>',
        'image': '<i class="fas fa-image"></i>',
        'video': '<i class="fas fa-video"></i>'
    };
    return icons[type] || '<i class="fas fa-file"></i>';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function initializeEnhancedSidebar() {
    generateEnhancedSidebar();
}

function autoSelectFirstContent() {
    const categories = getStoredCategories();
    const firstCategory = Object.keys(categories).sort((a, b) => categories[a].order - categories[b].order)[0];
    
    if (firstCategory) {
        setTimeout(() => selectCategory(firstCategory), 50);
    }
}