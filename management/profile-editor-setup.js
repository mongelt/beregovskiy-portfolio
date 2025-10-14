// resume-editor-setup.js
// Editor.js integration for resume entry descriptions

window.resumeDescriptionEditor = null;

// Simple editor config
function createResumeEditorConfig(existingData = null) {
    return {
        holder: 'entryDescriptionEditor',
        placeholder: 'Describe responsibilities, achievements, details...',
        tools: {
            paragraph: { class: Paragraph, inlineToolbar: true },
            header: { class: Header, config: { levels: [3, 4], defaultLevel: 3 } },
            list: { class: NestedList, inlineToolbar: true }
        },
        data: existingData || { blocks: [] },
        minHeight: 150
    };
}

// Initialize editor (called when creating/editing entry)
window.initializeResumeEditor = async function(existingDescription = null) {
    if (window.resumeDescriptionEditor) {
        await window.resumeDescriptionEditor.destroy();
    }
    
    let data = null;
    if (existingDescription) {
        try {
            data = JSON.parse(existingDescription);
        } catch (e) {
            data = { blocks: [{ type: 'paragraph', data: { text: existingDescription } }] };
        }
    }
    
    window.resumeDescriptionEditor = new EditorJS(createResumeEditorConfig(data));
    await window.resumeDescriptionEditor.isReady;
};

// Get editor data as JSON string
window.getResumeEditorData = async function() {
    if (!window.resumeDescriptionEditor) return '';
    
    try {
        const data = await window.resumeDescriptionEditor.save();
        return JSON.stringify(data);
    } catch (error) {
        console.error('Error saving editor data:', error);
        return '';
    }
};

// Initialize editor on page load
document.addEventListener('DOMContentLoaded', function() {
    window.initializeResumeEditor();
});