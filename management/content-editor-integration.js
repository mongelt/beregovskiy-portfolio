// content-editor-integration.js
// Handles Editor.js initialization and integration for article content

// Global editor instance
window.editorInstance = null;

/**
 * Initialize Editor.js with optional existing data
 * @param {object} existingData - Editor.js data format (blocks array)
 */
async function initializeEditor(existingData = null) {
    // Destroy existing instance if present
    if (window.editorInstance) {
        await destroyEditor();
    }

    try {
        // Wait for EditorJS to be available
        if (typeof EditorJS === 'undefined') {
            console.error('EditorJS library not loaded');
            return;
        }

        // Import configuration from editor-config.js
        const { createEditorConfig } = window;
        
        if (!createEditorConfig || typeof createEditorConfig !== 'function') {
            console.error('Editor configuration not loaded. Make sure editor-config.js is loaded.');
            
            // Fallback: create basic config directly
            window.editorInstance = new EditorJS({
                holder: 'editorjs',
                placeholder: 'Start writing your article...',
                data: existingData ? { blocks: existingData } : { blocks: [] },
                tools: window.editorTools || {},
                minHeight: 200
            });
            
            console.log('Editor.js initialized with fallback configuration');
            return;
        }

        // Create editor instance with proper configuration
        const config = createEditorConfig(existingData);
        console.log('Editor config:', config);
        
        window.editorInstance = new EditorJS(config);
        
        // Wait for editor to be ready
        await window.editorInstance.isReady;
        
        console.log('Editor.js initialized successfully');
    } catch (error) {
        console.error('Error initializing Editor.js:', error);
        alert('Error initializing editor: ' + error.message + '\nPlease refresh the page.');
    }
}

/**
 * Get editor data as JSON (blocks array only)
 * @returns {array|null} Blocks array or null if empty/error
 */
async function getEditorData() {
    if (!window.editorInstance) {
        console.warn('Editor not initialized');
        return null;
    }

    try {
        const data = await window.editorInstance.save();
        
        // Check if editor has any content
        if (!data.blocks || data.blocks.length === 0) {
            return null;
        }

        // Check if all blocks are empty
        const hasContent = data.blocks.some(block => {
            if (block.type === 'paragraph') {
                return block.data.text && block.data.text.trim().length > 0;
            }
            return true; // Non-paragraph blocks are considered content
        });

        if (!hasContent) {
            return null;
        }

        // Return ONLY blocks array (not the full Editor.js object)
        return data.blocks;
    } catch (error) {
        console.error('Error getting editor data:', error);
        return null;
    }
}

/**
 * Destroy editor instance
 */
async function destroyEditor() {
    if (window.editorInstance) {
        try {
            if (typeof window.editorInstance.destroy === 'function') {
                await window.editorInstance.destroy();
            }
            window.editorInstance = null;
            
            // Clear the editor container
            const container = document.getElementById('editorjs');
            if (container) {
                container.innerHTML = '';
            }
        } catch (error) {
            console.error('Error destroying editor:', error);
        }
    }
}

/**
 * Check if editor has unsaved content
 * @returns {boolean} True if editor has content
 */
async function editorHasContent() {
    const data = await getEditorData();
    return data !== null;
}

// Expose functions globally
window.initializeEditor = initializeEditor;
window.getEditorData = getEditorData;
window.destroyEditor = destroyEditor;
window.editorHasContent = editorHasContent;