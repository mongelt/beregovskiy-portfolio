// content-form-handlers.js
// Handles all form interaction logic for content management

// Global variables (shared across files)
window.contentManagement = window.contentManagement || {
    categories: [],
    allContent: [],
    allCollections: []
};

/**
 * Initialize form event handlers
 */
function initializeFormHandlers() {
    // Content type change handler
    document.getElementById('contentType').addEventListener('change', handleContentTypeChange);
    
    // Category selection handler
    document.getElementById('categorySelect').addEventListener('change', loadSubcategories);
    
    // Download enabled checkbox
    document.getElementById('downloadEnabled').addEventListener('change', handleDownloadEnabledChange);
    
    // Cancel edit button
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    
    // Form submission
    document.getElementById('contentForm').addEventListener('submit', handleFormSubmit);
}

/**
 * Handle content type change - show/hide appropriate fields
 */
function handleContentTypeChange() {
    const type = document.getElementById('contentType').value;
    
    // Hide all content-specific groups
    document.getElementById('articleBodyGroup').style.display = 'none';
    document.getElementById('imageUploadGroup').style.display = 'none';
    document.getElementById('videoUploadGroup').style.display = 'none';
    document.getElementById('audioUploadGroup').style.display = 'none';
    
    // Remove all required attributes
    const editorContainer = document.getElementById('editorjs');
    if (editorContainer) editorContainer.removeAttribute('data-required');
    document.getElementById('imageUrl').removeAttribute('required');
    document.getElementById('videoUrl').removeAttribute('required');
    document.getElementById('audioUrl').removeAttribute('required');
    
    // Show appropriate group and set required
    if (type === 'article') {
        document.getElementById('articleBodyGroup').style.display = 'block';
        if (editorContainer) editorContainer.setAttribute('data-required', 'true');
        
        // Initialize Editor.js if not already initialized
        if (!window.editorInstance) {
            window.initializeEditor();
        }
    } else if (type === 'image') {
        document.getElementById('imageUploadGroup').style.display = 'block';
        document.getElementById('imageUrl').setAttribute('required', 'required');
    } else if (type === 'video') {
        document.getElementById('videoUploadGroup').style.display = 'block';
        document.getElementById('videoUrl').setAttribute('required', 'required');
    } else if (type === 'audio') {
        document.getElementById('audioUploadGroup').style.display = 'block';
        document.getElementById('audioUrl').setAttribute('required', 'required');
    }
}

/**
 * Handle download enabled checkbox change
 */
function handleDownloadEnabledChange() {
    const isEnabled = document.getElementById('downloadEnabled').checked;
    document.getElementById('externalDownloadGroup').style.display = isEnabled ? 'block' : 'none';
}

/**
 * Load categories into dropdown
 */
async function loadCategories() {
    window.contentManagement.categories = await getCategories();
    const select = document.getElementById('categorySelect');
    select.innerHTML = '<option value="">Select category...</option>';
    
    window.contentManagement.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

/**
 * Load subcategories based on selected category
 */
function loadSubcategories() {
    const categoryId = document.getElementById('categorySelect').value;
    const subSelect = document.getElementById('subcategorySelect');
    
    if (!categoryId) {
        subSelect.innerHTML = '<option value="">Select category first...</option>';
        subSelect.disabled = true;
        return;
    }

    const category = window.contentManagement.categories.find(c => c.id === categoryId);
    
    if (category && category.subcategories && category.subcategories.length > 0) {
        subSelect.innerHTML = '<option value="">Select subcategory...</option>';
        category.subcategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            subSelect.appendChild(option);
        });
        subSelect.disabled = false;
    } else {
        subSelect.innerHTML = '<option value="">No subcategories available</option>';
        subSelect.disabled = true;
    }
}

/**
 * Load collections and create checkboxes
 */
async function loadCollections() {
    try {
        window.contentManagement.allCollections = await getCollections();
        const container = document.getElementById('collectionsCheckboxes');
        
        if (window.contentManagement.allCollections.length === 0) {
            container.innerHTML = '<p style="font-size: 0.9rem; color: rgba(255,255,255,0.5);">No collections yet. Create collections in the Collections page.</p>';
            return;
        }
        
        container.innerHTML = '';
        window.contentManagement.allCollections.forEach(collection => {
            const checkboxWrapper = document.createElement('label');
            checkboxWrapper.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem; font-weight: normal;';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = collection.id;
            checkbox.className = 'collection-checkbox';
            checkbox.style.cssText = 'width: auto; margin: 0;';
            
            const label = document.createElement('span');
            label.textContent = collection.name;
            
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            container.appendChild(checkboxWrapper);
        });
    } catch (error) {
        console.error('Error loading collections:', error);
        document.getElementById('collectionsCheckboxes').innerHTML = '<p style="font-size: 0.9rem; color: #ef4444;">Error loading collections</p>';
    }
}

/**
 * Get selected collection IDs from checkboxes
 */
function getSelectedCollections() {
    const checkboxes = document.querySelectorAll('.collection-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Set selected collections based on content ID
 */
async function setSelectedCollections(contentId) {
    try {
        const contentCollections = await getContentCollections(contentId);
        const collectionIds = contentCollections.map(cc => cc.collection_id);
        
        document.querySelectorAll('.collection-checkbox').forEach(checkbox => {
            checkbox.checked = collectionIds.includes(checkbox.value);
        });
    } catch (error) {
        console.error('Error loading content collections:', error);
    }
}

/**
 * Handle form submission (create or update content)
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('editContentId').value;
    const contentType = document.getElementById('contentType').value;
    
    let contentValue = '';
    let audioUrlValue = '';
    
    // Get content based on type
    if (contentType === 'article') {
        // Get Editor.js data
        const editorData = await window.getEditorData();
        if (!editorData) {
            alert('Please add content to the article editor');
            return;
        }
        contentValue = JSON.stringify(editorData); // Store as JSON string
    } else if (contentType === 'image') {
        contentValue = document.getElementById('imageUrl').value;
    } else if (contentType === 'video') {
        contentValue = document.getElementById('videoUrl').value;
    } else if (contentType === 'audio') {
        audioUrlValue = document.getElementById('audioUrl').value;
        contentValue = 'Audio file';
    }
    
    const contentData = {
        type: contentType,
        subcategoryId: document.getElementById('subcategorySelect').value,
        title: document.getElementById('contentTitle').value,
        subtitle: document.getElementById('contentSubtitle').value,
        sidebarTitle: document.getElementById('sidebarTitle').value,
        sidebarSubtitle: document.getElementById('sidebarSubtitle').value,
        authorName: document.getElementById('authorName').value,
        publicationName: document.getElementById('publicationName').value,
        publicationDate: document.getElementById('publicationDate').value,
        sourceLink: document.getElementById('sourceLink').value,
        copyrightNotice: document.getElementById('copyrightNotice').value,
        content: contentValue,
        audioUrl: audioUrlValue,
        downloadEnabled: document.getElementById('downloadEnabled').checked,
        externalDownloadUrl: document.getElementById('externalDownloadUrl').value
    };

    const selectedCollections = getSelectedCollections();

    try {
        let contentId;
        
        if (editId) {
            // Update existing content
            await updateContent(editId, contentData);
            contentId = editId;
            
            // Remove existing collection assignments
            const existingCollections = await getContentCollections(contentId);
            for (const cc of existingCollections) {
                await removeContentFromCollection(contentId, cc.collection_id);
            }
            
            alert('Content updated successfully!');
        } else {
            // Create new content
            const newContent = await createContent(contentData);
            contentId = newContent.id;
            alert('Content created successfully!');
        }
        
        // Add new collection assignments
        for (const collectionId of selectedCollections) {
            await addContentToCollection(contentId, collectionId);
        }
        
        resetForm();
        await window.loadContent(); // Reload content list
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Reset form to initial state
 */
function resetForm() {
    document.getElementById('contentForm').reset();
    document.getElementById('editContentId').value = '';
    document.getElementById('form-title').textContent = 'Add New Content';
    document.getElementById('submitBtn').textContent = 'Create Content';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('subcategorySelect').disabled = true;
    document.getElementById('subcategorySelect').innerHTML = '<option value="">Select category first...</option>';
    
    // Hide all content type groups
    document.getElementById('articleBodyGroup').style.display = 'none';
    document.getElementById('imageUploadGroup').style.display = 'none';
    document.getElementById('videoUploadGroup').style.display = 'none';
    document.getElementById('audioUploadGroup').style.display = 'none';
    document.getElementById('externalDownloadGroup').style.display = 'none';
    
    // Clear upload status messages
    document.getElementById('imageUploadStatus').textContent = '';
    document.getElementById('videoUploadStatus').textContent = '';
    document.getElementById('audioUploadStatus').textContent = '';
    
    // Uncheck all collection checkboxes
    document.querySelectorAll('.collection-checkbox').forEach(cb => cb.checked = false);
    
    // Destroy and reinitialize editor if it exists
    if (window.editorInstance) {
        window.destroyEditor();
    }
}

/**
 * Populate form with existing content for editing
 */
async function editContent(contentId) {
    const content = window.contentManagement.allContent.find(c => c.id === contentId);
    if (!content) return;

    // Find category ID
    let categoryId = null;
    for (let cat of window.contentManagement.categories) {
        if (cat.subcategories) {
            const sub = cat.subcategories.find(s => s.id === content.subcategory_id);
            if (sub) {
                categoryId = cat.id;
                break;
            }
        }
    }

    // Set basic fields
    document.getElementById('editContentId').value = content.id;
    document.getElementById('contentType').value = content.type;
    document.getElementById('contentType').dispatchEvent(new Event('change'));
    document.getElementById('categorySelect').value = categoryId || '';
    
    loadSubcategories();
    
    // Wait for subcategories to load, then set remaining fields
    setTimeout(async () => {
        document.getElementById('subcategorySelect').value = content.subcategory_id;
        document.getElementById('contentTitle').value = content.title;
        document.getElementById('contentSubtitle').value = content.subtitle || '';
        document.getElementById('sidebarTitle').value = content.sidebar_title || '';
        document.getElementById('sidebarSubtitle').value = content.sidebar_subtitle || '';
        document.getElementById('authorName').value = content.author_name || '';
        document.getElementById('publicationName').value = content.publication_name || '';
        document.getElementById('publicationDate').value = content.publication_date || '';
        document.getElementById('sourceLink').value = content.source_link || '';
        document.getElementById('copyrightNotice').value = content.copyright_notice || '';
        
        // Set content based on type
        if (content.type === 'article') {
            // Initialize editor with existing content
            try {
                const editorData = JSON.parse(content.content);
                await window.initializeEditor(editorData);
            } catch (error) {
                console.error('Error parsing editor content:', error);
                // Fallback: treat as plain text
                await window.initializeEditor({
                    blocks: [
                        {
                            type: 'paragraph',
                            data: { text: content.content }
                        }
                    ]
                });
            }
        } else if (content.type === 'image') {
            document.getElementById('imageUrl').value = content.content;
        } else if (content.type === 'video') {
            document.getElementById('videoUrl').value = content.content;
        } else if (content.type === 'audio') {
            document.getElementById('audioUrl').value = content.audio_url || '';
        }
        
        document.getElementById('downloadEnabled').checked = content.download_enabled || false;
        document.getElementById('externalDownloadUrl').value = content.external_download_url || '';
        
        await setSelectedCollections(content.id);
        
        document.getElementById('externalDownloadGroup').style.display = content.download_enabled ? 'block' : 'none';
        document.getElementById('form-title').textContent = 'Edit Content';
        document.getElementById('submitBtn').textContent = 'Update Content';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

// Expose functions globally for use by other modules
window.initializeFormHandlers = initializeFormHandlers;
window.loadCategories = loadCategories;
window.loadCollections = loadCollections;
window.editContent = editContent;