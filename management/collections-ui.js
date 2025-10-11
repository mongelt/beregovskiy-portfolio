// Collections Management - UI Functions
// Phase 8: Collections Admin Panel

// ========== FORM HANDLING ==========

function setupCollectionForm() {
    const form = document.getElementById('collectionForm');
    const nameInput = document.getElementById('collectionName');
    const slugInput = document.getElementById('collectionSlug');
    
    // Auto-generate slug from name
    nameInput.addEventListener('input', function() {
        if (!currentEditingCollectionId) {
            slugInput.value = generateSlug(this.value);
        }
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleCollectionFormSubmit();
    });
    
    // Cancel button
    document.getElementById('collectionCancelBtn').addEventListener('click', resetCollectionForm);
}

async function handleCollectionFormSubmit() {
    const submitBtn = document.getElementById('collectionSubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentEditingCollectionId ? 'Updating...' : 'Creating...';
    
    const collectionData = {
        name: document.getElementById('collectionName').value.trim(),
        slug: document.getElementById('collectionSlug').value.trim(),
        description: document.getElementById('collectionDescription').value.trim(),
        order: document.getElementById('collectionOrder').value
    };
    
    try {
        if (currentEditingCollectionId) {
            await updateExistingCollection(currentEditingCollectionId, collectionData);
            showStatus('Collection updated successfully!', 'success');
        } else {
            await createNewCollection(collectionData);
            showStatus('Collection created successfully!', 'success');
        }
        
        resetCollectionForm();
        await loadAllCollections();
        renderCollectionsList();
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function resetCollectionForm() {
    document.getElementById('collectionForm').reset();
    document.getElementById('editCollectionId').value = '';
    currentEditingCollectionId = null;
    document.getElementById('collection-form-title').textContent = 'Create New Collection';
    document.getElementById('collectionSubmitBtn').textContent = 'Create Collection';
    document.getElementById('collectionCancelBtn').style.display = 'none';
}

// ========== COLLECTIONS LIST RENDERING ==========

function renderCollectionsList() {
    const container = document.getElementById('collectionsList');
    
    if (allCollections.length === 0) {
        container.innerHTML = '<p class="no-data">No collections yet. Create your first collection above!</p>';
        return;
    }
    
    container.innerHTML = allCollections.map(collection => {
        const url = getCollectionUrl(collection.slug);
        
        return `
            <div class="collection-card" data-collection-id="${collection.id}">
                <div class="collection-header">
                    <div class="collection-info">
                        <h3>${collection.name}</h3>
                        ${collection.description ? `<p class="collection-description">${collection.description}</p>` : ''}
                        <div class="collection-meta">
                            <span class="collection-slug">Slug: ${collection.slug}</span>
                            <span class="collection-order">Order: ${collection.order_index || 0}</span>
                            <a href="${url}" target="_blank" class="collection-url">View Collection Page →</a>
                        </div>
                    </div>
                    <div class="collection-actions">
                        <button class="btn-edit" data-collection-id="${collection.id}">Edit</button>
                        <button class="btn-primary btn-assign" data-collection-id="${collection.id}">Assign Content</button>
                        <button class="btn-delete" data-collection-id="${collection.id}">Delete</button>
                    </div>
                </div>
                <div class="collection-content" id="collection-content-${collection.id}">
                    <p class="loading">Loading content...</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editCollection(this.getAttribute('data-collection-id'));
        });
    });
    
    container.querySelectorAll('.btn-assign').forEach(btn => {
        btn.addEventListener('click', function() {
            openAssignContent(this.getAttribute('data-collection-id'));
        });
    });
    
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteCollectionWithConfirm(this.getAttribute('data-collection-id'));
        });
    });
    
    // Load content for each collection
    allCollections.forEach(collection => {
        loadAndRenderCollectionContent(collection.id);
    });
}

async function loadAndRenderCollectionContent(collectionId) {
    const container = document.getElementById(`collection-content-${collectionId}`);
    if (!container) return;
    
    const content = await loadCollectionContent(collectionId);
    
    if (content.length === 0) {
        container.innerHTML = '<p class="no-content-in-collection">No content assigned yet</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="collection-content-list">
            ${content.map(item => `
                <div class="collection-content-item">
                    <span class="content-type-badge">${item.type}</span>
                    <span class="content-title">${item.title}</span>
                    <span class="content-category">${getCategoryNameForContent(item)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== EDIT COLLECTION ==========

function editCollection(collectionId) {
    const collection = allCollections.find(c => c.id === collectionId);
    if (!collection) return;
    
    currentEditingCollectionId = collectionId;
    document.getElementById('editCollectionId').value = collectionId;
    document.getElementById('collectionName').value = collection.name;
    document.getElementById('collectionSlug').value = collection.slug;
    document.getElementById('collectionDescription').value = collection.description || '';
    document.getElementById('collectionOrder').value = collection.order_index || 0;
    
    document.getElementById('collection-form-title').textContent = 'Edit Collection';
    document.getElementById('collectionSubmitBtn').textContent = 'Update Collection';
    document.getElementById('collectionCancelBtn').style.display = 'inline-block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== DELETE COLLECTION ==========

async function deleteCollectionWithConfirm(collectionId) {
    const collection = allCollections.find(c => c.id === collectionId);
    if (!collection) return;
    
    if (!confirm(`Delete collection "${collection.name}"?\n\nThis will NOT delete the content items, only remove them from this collection.\n\nContinue?`)) {
        return;
    }
    
    try {
        await deleteExistingCollection(collectionId);
        showStatus('Collection deleted successfully', 'success');
        await loadAllCollections();
        renderCollectionsList();
    } catch (error) {
        showStatus('Error deleting collection: ' + error.message, 'error');
    }
}

// ========== ASSIGN CONTENT UI ==========

function setupAssignContentUI() {
    const categoryFilter = document.getElementById('filterCategory');
    const subcategoryFilter = document.getElementById('filterSubcategory');
    const closeBtn = document.getElementById('closeAssignBtn');
    
    // Category filter change
    categoryFilter.addEventListener('change', function() {
        const categoryId = this.value;
        
        if (!categoryId) {
            subcategoryFilter.innerHTML = '<option value="">Select category first...</option>';
            subcategoryFilter.disabled = true;
            renderContentSelectionList();
            return;
        }
        
        const category = allCategories.find(c => c.id === categoryId);
        if (category && category.subcategories && category.subcategories.length > 0) {
            subcategoryFilter.innerHTML = '<option value="">All Subcategories</option>' +
                category.subcategories.map(sub => 
                    `<option value="${sub.id}">${sub.name}</option>`
                ).join('');
            subcategoryFilter.disabled = false;
        } else {
            subcategoryFilter.innerHTML = '<option value="">No subcategories</option>';
            subcategoryFilter.disabled = true;
        }
        
        renderContentSelectionList(categoryId, null);
    });
    
    // Subcategory filter change
    subcategoryFilter.addEventListener('change', function() {
        const categoryId = categoryFilter.value;
        const subcategoryId = this.value;
        renderContentSelectionList(categoryId, subcategoryId || null);
    });
    
    // Close button
    closeBtn.addEventListener('click', closeAssignContent);
}

async function openAssignContent(collectionId) {
    currentAssigningCollectionId = collectionId;
    const collection = allCollections.find(c => c.id === collectionId);
    
    document.getElementById('assignCollectionName').textContent = collection.name;
    document.getElementById('assignContentSection').style.display = 'block';
    
    // Populate category filter
    const categoryFilter = document.getElementById('filterCategory');
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        allCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    
    // Reset filters
    document.getElementById('filterSubcategory').innerHTML = '<option value="">Select category first...</option>';
    document.getElementById('filterSubcategory').disabled = true;
    
    // Render content list
    await renderContentSelectionList();
    
    // Scroll to section
    document.getElementById('assignContentSection').scrollIntoView({ behavior: 'smooth' });
}

function closeAssignContent() {
    document.getElementById('assignContentSection').style.display = 'none';
    currentAssigningCollectionId = null;
    
    // Refresh collection content displays
    renderCollectionsList();
}

async function renderContentSelectionList(categoryId = null, subcategoryId = null) {
    const container = document.getElementById('contentSelectionList');
    container.innerHTML = '<p class="loading">Loading content...</p>';
    
    const filtered = await loadFilteredContent(categoryId, subcategoryId);
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No content found with selected filters</p>';
        return;
    }
    
    // Get collection status for each content item
    const contentWithStatus = await Promise.all(filtered.map(async item => {
        const collections = await getContentCollectionStatus(item.id);
        return {
            ...item,
            isInCollection: collections.includes(currentAssigningCollectionId)
        };
    }));
    
    container.innerHTML = contentWithStatus.map(item => `
        <div class="content-selection-item">
            <label class="content-checkbox-label">
                <input type="checkbox" 
                    class="content-checkbox" 
                    data-content-id="${item.id}" 
                    ${item.isInCollection ? 'checked' : ''}>
                <div class="content-selection-info">
                    <span class="content-type-badge">${item.type}</span>
                    <strong>${item.title}</strong>
                    <span class="content-category">${getCategoryNameForContent(item)}</span>
                </div>
            </label>
        </div>
    `).join('');
    
    // Add event listeners to checkboxes
    container.querySelectorAll('.content-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
            await handleContentAssignment(this);
        });
    });
}

async function handleContentAssignment(checkbox) {
    const contentId = checkbox.getAttribute('data-content-id');
    const isChecked = checkbox.checked;
    
    try {
        if (isChecked) {
            await assignContentToCollection(contentId, currentAssigningCollectionId);
        } else {
            await unassignContentFromCollection(contentId, currentAssigningCollectionId);
        }
    } catch (error) {
        console.error('Error toggling content assignment:', error);
        checkbox.checked = !isChecked; // Revert checkbox
        alert('Error: ' + error.message);
    }
}

// ========== STATUS MESSAGES ==========

function showStatus(message, type) {
    const statusDiv = document.getElementById('collectionStatus');
    statusDiv.textContent = message;
    statusDiv.className = `message ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Collections management page loaded');
    
    const initialized = await initializeCollectionsData();
    
    if (initialized) {
        setupCollectionForm();
        setupAssignContentUI();
        renderCollectionsList();
        console.log('Collections management initialized successfully');
    } else {
        showStatus('Error loading data. Please refresh the page.', 'error');
    }
});