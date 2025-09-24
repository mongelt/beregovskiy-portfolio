// Enhanced Content Management - Edit, Delete, and Advanced Operations
// This handles editing existing content, deleting items, and category management

// Global variables for edit mode
let editingContentId = null;
let editingCategoryName = null;
let editingSubcategoryName = null;

// Load and display all content for management
function loadContentManagement() {
    const allContent = getAllContent();
    const contentList = document.getElementById('contentList');
    
    if (!contentList) return;
    
    if (allContent.length === 0) {
        contentList.innerHTML = `
            <div class="no-content-management">
                <h3>No content yet</h3>
                <p>Create your first piece of content using the form above.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="content-management-grid">';
    
    allContent.forEach(item => {
        html += `
            <div class="content-management-item" data-content-id="${item.id}">
                <div class="content-item-header">
                    <div class="content-type-indicator ${item.type}">${item.type.toUpperCase()}</div>
                    <div class="content-actions">
                        <button class="edit-btn" onclick="editContent(${item.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteContent(${item.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="content-item-body">
                    <h4>${item.title}</h4>
                    <div class="content-meta">
                        <span class="category">${item.category} → ${item.subcategory}</span>
                        <span class="date">${formatDate(item.dateCreated)}</span>
                    </div>
                    <div class="content-preview">
                        ${getContentPreview(item.content)}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    contentList.innerHTML = html;
}

// Get content preview (first 150 characters)
function getContentPreview(content) {
    const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML
    if (textContent.length <= 150) return textContent;
    return textContent.substring(0, 150) + '...';
}

// Edit existing content
function editContent(contentId) {
    const allContent = getAllContent();
    const contentItem = allContent.find(item => item.id == contentId);
    
    if (!contentItem) {
        alert('Content not found!');
        return;
    }
    
    // Set global edit mode
    editingContentId = contentId;
    
    // Populate form with existing data
    const form = document.getElementById('contentForm');
    if (form) {
        form.querySelector('#contentTitle').value = contentItem.title;
        form.querySelector('#contentType').value = contentItem.type;
        form.querySelector('#mediaUrl').value = contentItem.mediaUrl || '';
        form.querySelector('#contentCategory').value = contentItem.category;
        
        // Update subcategories and select the right one
        updateSubcategoryOptions(contentItem.category);
        setTimeout(() => {
            form.querySelector('#contentSubcategory').value = contentItem.subcategory;
        }, 100);
        
        // Set rich text editor content
        setEditorContent(contentItem.content);
        
        // Update form appearance
        updateFormForEditMode(true);
        
        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete content with confirmation
function deleteContent(contentId) {
    const allContent = getAllContent();
    const contentItem = allContent.find(item => item.id == contentId);
    
    if (!contentItem) {
        alert('Content not found!');
        return;
    }
    
    const confirmation = confirm(
        `Are you sure you want to delete "${contentItem.title}"?\n\n` +
        `This action cannot be undone.`
    );
    
    if (!confirmation) return;
    
    // Remove from storage
    const portfolioContent = getStoredContent();
    const contentType = contentItem.type + 's';
    const contentArray = portfolioContent[contentType];
    
    const itemIndex = contentArray.findIndex(item => item.id == contentId);
    if (itemIndex > -1) {
        contentArray.splice(itemIndex, 1);
        saveContent(portfolioContent);
        
        // Refresh displays
        loadContentManagement();
        
        // Show success message
        showStatusMessage(`"${contentItem.title}" has been deleted.`, 'success');
    }
}

// Update form appearance for edit mode
function updateFormForEditMode(isEditMode) {
    const form = document.getElementById('contentForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const cancelBtn = document.getElementById('cancelEditBtn');
    
    if (isEditMode) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Content';
        submitBtn.className = 'update-btn';
        
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }
        
        // Add edit mode indicator
        const existingIndicator = document.getElementById('editModeIndicator');
        if (existingIndicator) existingIndicator.remove();
        
        const indicator = document.createElement('div');
        indicator.id = 'editModeIndicator';
        indicator.className = 'edit-mode-indicator';
        indicator.innerHTML = '<i class="fas fa-edit"></i> Editing Mode - Update existing content';
        form.insertBefore(indicator, form.firstChild);
        
    } else {
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Content';
        submitBtn.className = 'add-btn';
        
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
        
        // Remove edit mode indicator
        const indicator = document.getElementById('editModeIndicator');
        if (indicator) indicator.remove();
    }
}

// Cancel edit mode
function cancelEdit() {
    editingContentId = null;
    
    // Clear form
    const form = document.getElementById('contentForm');
    if (form) {
        form.reset();
        clearEditor();
        updateFormForEditMode(false);
    }
}

// Enhanced form submission to handle both add and edit
function handleContentSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contentData = {
        title: formData.get('title'),
        content: getEditorContent(),
        type: formData.get('type'),
        mediaUrl: formData.get('mediaUrl') || '',
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        sidebarTitle: formData.get('sidebarTitle') || formData.get('title'),
        sidebarSubtitle: formData.get('sidebarSubtitle') || ''
    };
    
    // Validation
    if (!contentData.title.trim()) {
        showStatusMessage('Please enter a title.', 'error');
        return;
    }
    
    if (!contentData.content.trim()) {
        showStatusMessage('Please enter some content.', 'error');
        return;
    }
    
    if (!contentData.category || !contentData.subcategory) {
        showStatusMessage('Please select a category and subcategory.', 'error');
        return;
    }
    
    if (editingContentId) {
        // Update existing content
        updateExistingContent(editingContentId, contentData);
    } else {
        // Add new content
        addContent(contentData);
    }
    
    // Reset form and refresh
    e.target.reset();
    clearEditor();
    editingContentId = null;
    updateFormForEditMode(false);
    loadContentManagement();
    
    const action = editingContentId ? 'updated' : 'added';
    showStatusMessage(`Content "${contentData.title}" has been ${action} successfully!`, 'success');
}

// Update existing content in storage
function updateExistingContent(contentId, newData) {
    const portfolioContent = getStoredContent();
    
    // Find the content across all types
    let foundItem = null;
    let foundArray = null;
    
    ['articles', 'images', 'videos'].forEach(type => {
        const array = portfolioContent[type];
        const item = array.find(item => item.id == contentId);
        if (item) {
            foundItem = item;
            foundArray = array;
        }
    });
    
    if (foundItem && foundArray) {
        // Update the item
        Object.assign(foundItem, newData);
        foundItem.dateModified = new Date().toISOString().split('T')[0];
        
        saveContent(portfolioContent);
    }
}

// Category Management Functions
function loadCategoryManagement() {
    const categories = getStoredCategories();
    const categoryList = document.getElementById('categoryList');
    
    if (!categoryList) return;
    
    if (Object.keys(categories).length === 0) {
        categoryList.innerHTML = `
            <div class="no-categories-management">
                <h3>No categories yet</h3>
                <p>Create your first category using the form above.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="category-management-grid">';
    
    Object.keys(categories)
        .sort((a, b) => categories[a].order - categories[b].order)
        .forEach(catName => {
            const category = categories[catName];
            const subcategoryCount = Object.keys(category.subcategories).length;
            const contentCount = getContentByCategory(catName).length;
            
            html += `
                <div class="category-management-item">
                    <div class="category-item-header">
                        <h4>${catName}</h4>
                        <div class="category-actions">
                            <button class="edit-btn" onclick="editCategory('${catName}')" title="Edit Category">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteCategory('${catName}')" title="Delete Category">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="category-stats">
                        <span class="stat">${subcategoryCount} subcategories</span>
                        <span class="stat">${contentCount} items</span>
                    </div>
                    
                    <div class="subcategory-list">
                        ${Object.keys(category.subcategories).map(subName => 
                            `<span class="subcategory-tag">${subName}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        });
    
    html += '</div>';
    categoryList.innerHTML = html;
}

// Delete category with confirmation
function deleteCategory(categoryName) {
    const contentCount = getContentByCategory(categoryName).length;
    
    let confirmationMessage = `Are you sure you want to delete the category "${categoryName}"?`;
    
    if (contentCount > 0) {
        confirmationMessage += `\n\nThis will also delete ${contentCount} content item(s) in this category.`;
    }
    
    confirmationMessage += '\n\nThis action cannot be undone.';
    
    const confirmation = confirm(confirmationMessage);
    if (!confirmation) return;
    
    // Remove category from storage
    const categories = getStoredCategories();
    delete categories[categoryName];
    saveCategories(categories);
    
    // Remove all content from this category
    if (contentCount > 0) {
        const portfolioContent = getStoredContent();
        
        ['articles', 'images', 'videos'].forEach(type => {
            portfolioContent[type] = portfolioContent[type].filter(item => 
                item.category !== categoryName
            );
        });
        
        saveContent(portfolioContent);
    }
    
    // Refresh displays
    loadCategoryManagement();
    showStatusMessage(`Category "${categoryName}" and ${contentCount} items have been deleted.`, 'success');
}

// Show status messages
function showStatusMessage(message, type = 'info') {
    // Remove existing messages
    const existing = document.querySelector('.status-message');
    if (existing) existing.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
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