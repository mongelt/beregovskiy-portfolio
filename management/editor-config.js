// editor-config.js
// Enhanced Editor.js configuration with debugging

/**
 * Create Editor.js configuration
 * @param {object} existingData - Existing editor data (optional)
 * @returns {object} Editor.js configuration
 */
function createEditorConfig(existingData = null) {
    console.log('Creating editor configuration...');
    console.log('Existing data:', existingData);
    
    // Check if tools are available
    if (!window.editorTools) {
        console.error('Editor tools not loaded!');
        window.editorTools = {}; // Fallback empty tools
    }
    
    console.log('Available tools:', Object.keys(window.editorTools));
    
    const config = {
        holder: 'editorjs',
        
        placeholder: 'Start writing your article... Click to add content blocks.',
        
        tools: window.editorTools,
        
        data: existingData || {
            time: new Date().getTime(),
            blocks: [],
            version: "2.28.0"
        },
        
        minHeight: 200,
        
        autofocus: true,
        
        onChange: async (api, event) => {
            console.log('Editor content changed');
        },
        
        onReady: () => {
            console.log('Editor.js is ready to work!');
            
            // Initialize undo/redo if available
            if (window.Undo && window.editorInstance) {
                try {
                    new window.Undo({ editor: window.editorInstance });
                    console.log('Undo plugin initialized');
                } catch (error) {
                    console.warn('Undo plugin failed to initialize:', error);
                }
            }
            
            // Initialize drag-drop if available
            if (window.DragDrop && window.editorInstance) {
                try {
                    new window.DragDrop(window.editorInstance);
                    console.log('DragDrop plugin initialized');
                } catch (error) {
                    console.warn('DragDrop plugin failed to initialize:', error);
                }
            }
        }
    };
    
    console.log('Editor configuration created:', config);
    return config;
}

// Expose globally
window.createEditorConfig = createEditorConfig;

console.log('editor-config.js loaded');