// Three-Column Cylinder Sidebar Navigation with Supabase

async function initializeEnhancedSidebar() {
    try {
        const categories = await getCategories();
        const allContent = await getAllContent();
        
        const categoryNav = document.getElementById('categoryNav');
        
        if (!categories || categories.length === 0) {
            categoryNav.innerHTML = '<div class="empty-state">No categories yet. Visit the management panel to add categories.</div>';
            return;
        }
        
        // Create three-column structure using cylinder-wheel class to match CSS
        categoryNav.innerHTML = `
            <div class="cylinder-wheel" id="categoriesColumn">
                <div class="wheel-segments" id="categorySegments"></div>
            </div>
            <div class="cylinder-wheel" id="subcategoriesColumn">
                <div class="wheel-segments" id="subcategorySegments"></div>
            </div>
            <div class="cylinder-wheel" id="documentsColumn">
                <div class="wheel-segments" id="documentSegments"></div>
            </div>
        `;
        
        // Populate categories
        populateCategories(categories, allContent);
        
    } catch (error) {
        console.error('Error initializing sidebar:', error);
        document.getElementById('categoryNav').innerHTML = '<div class="error">Error loading categories</div>';
    }
}

function populateCategories(categories, allContent) {
    const categorySegments = document.getElementById('categorySegments');
    
    categories.forEach((category, index) => {
        const segment = document.createElement('button');
        segment.className = 'wheel-segment';
        segment.dataset.categoryId = category.id;
        segment.dataset.index = index;
        
        const contentCount = allContent.filter(c => c.categoryId === category.id).length;
        
        segment.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${category.name}</span>
                <span style="opacity: 0.6; font-size: 0.85rem;">${contentCount}</span>
            </div>
        `;
        
        segment.addEventListener('click', () => selectCategory(category, allContent, index));
        categorySegments.appendChild(segment);
    });
}

function selectCategory(category, allContent, categoryIndex) {
    // Update active states
    document.querySelectorAll('#categorySegments .wheel-segment').forEach((seg, idx) => {
        seg.classList.remove('active');
        if (idx === categoryIndex) {
            seg.classList.add('active');
        }
    });
    
    // Clear subcategories and documents
    document.getElementById('subcategorySegments').innerHTML = '';
    document.getElementById('documentSegments').innerHTML = '';
    
    if (category.subcategories && category.subcategories.length > 0) {
        populateSubcategories(category, allContent);
    } else {
        // No subcategories - show content directly
        const categoryContent = allContent.filter(c => c.categoryId === category.id && !c.subcategoryId);
        populateDocuments(categoryContent);
    }
}

function populateSubcategories(category, allContent) {
    const subcategorySegments = document.getElementById('subcategorySegments');
    
    category.subcategories.forEach((subcategory, index) => {
        const segment = document.createElement('button');
        segment.className = 'wheel-segment';
        segment.dataset.subcategoryId = subcategory.id;
        segment.dataset.index = index;
        
        const contentCount = allContent.filter(c => 
            c.categoryId === category.id && c.subcategoryId === subcategory.id
        ).length;
        
        segment.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${subcategory.name}</span>
                <span style="opacity: 0.6; font-size: 0.85rem;">${contentCount}</span>
            </div>
        `;
        
        segment.addEventListener('click', () => selectSubcategory(category, subcategory, allContent, index));
        subcategorySegments.appendChild(segment);
    });
}

function selectSubcategory(category, subcategory, allContent, subcategoryIndex) {
    // Update active states
    document.querySelectorAll('#subcategorySegments .wheel-segment').forEach((seg, idx) => {
        seg.classList.remove('active');
        if (idx === subcategoryIndex) {
            seg.classList.add('active');
        }
    });
    
    // Clear documents
    document.getElementById('documentSegments').innerHTML = '';
    
    // Show documents for this subcategory
    const subcategoryContent = allContent.filter(c => 
        c.categoryId === category.id && c.subcategoryId === subcategory.id
    );
    
    populateDocuments(subcategoryContent);
}

function populateDocuments(contentItems) {
    const documentSegments = document.getElementById('documentSegments');
    
    if (contentItems.length === 0) {
        documentSegments.innerHTML = '<div style="padding: 2rem 1rem; text-align: center; color: #8195a3; font-style: italic;">No content yet</div>';
        return;
    }
    
    contentItems.forEach((content, index) => {
        const segment = document.createElement('button');
        segment.className = 'wheel-segment';
        segment.dataset.contentId = content.id;
        segment.dataset.index = index;
        
        const iconClass = {
            'article': 'fa-file-alt',
            'image': 'fa-image',
            'video': 'fa-video'
        }[content.type] || 'fa-file';
        
        segment.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas ${iconClass}" style="opacity: 0.7;"></i>
                <span>${content.title}</span>
            </div>
        `;
        
        segment.addEventListener('click', () => selectDocument(content, index));
        documentSegments.appendChild(segment);
    });
}

function selectDocument(content, documentIndex) {
    // Update active states
    document.querySelectorAll('#documentSegments .wheel-segment').forEach((seg, idx) => {
        seg.classList.remove('active');
        if (idx === documentIndex) {
            seg.classList.add('active');
        }
    });
    
    displayContent(content);
}

async function displayContent(content) {
    // Update content area
    document.getElementById('contentTitle').textContent = content.title;
    document.getElementById('contentSubtitle').textContent = content.subtitle || '';
    
    const contentContainer = document.getElementById('contentContainer');
    
    if (content.type === 'article') {
        contentContainer.innerHTML = `
            <article class="article-content">
                ${content.content || '<p>No content available.</p>'}
            </article>
        `;
    } else if (content.type === 'image') {
        contentContainer.innerHTML = `
            <div class="image-content">
                <img src="${content.imageUrl}" alt="${content.title}">
                ${content.content ? `<div class="image-caption">${content.content}</div>` : ''}
            </div>
        `;
    } else if (content.type === 'video') {
        contentContainer.innerHTML = generateVideoHTML(content.videoUrl);
    }
}

async function autoSelectFirstContent() {
    try {
        const categories = await getCategories();
        const allContent = await getAllContent();
        
        if (categories.length > 0) {
            // Auto-select first category
            selectCategory(categories[0], allContent, 0);
            
            // If first category has subcategories, select first one
            if (categories[0].subcategories && categories[0].subcategories.length > 0) {
                setTimeout(() => {
                    selectSubcategory(categories[0], categories[0].subcategories[0], allContent, 0);
                }, 100);
            }
        }
    } catch (error) {
        console.error('Error auto-selecting content:', error);
    }
}