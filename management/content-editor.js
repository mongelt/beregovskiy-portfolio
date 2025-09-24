// Rich Text Content Editor with Formatting Tools
// This provides WYSIWYG editing capabilities for content creation

class RichTextEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.toolbar = null;
        this.editor = null;
        this.init();
    }
    
    init() {
        this.createToolbar();
        this.createEditor();
        this.attachEventListeners();
    }
    
    createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'rich-editor-toolbar';
        this.toolbar.innerHTML = `
            <div class="toolbar-group">
                <button type="button" data-command="bold" title="Bold"><i class="fas fa-bold"></i></button>
                <button type="button" data-command="italic" title="Italic"><i class="fas fa-italic"></i></button>
                <button type="button" data-command="underline" title="Underline"><i class="fas fa-underline"></i></button>
                <button type="button" data-command="strikethrough" title="Strikethrough"><i class="fas fa-strikethrough"></i></button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <div class="toolbar-group">
                <select data-command="formatBlock" title="Heading">
                    <option value="">Normal</option>
                    <option value="<h1>">Heading 1</option>
                    <option value="<h2>">Heading 2</option>
                    <option value="<h3>">Heading 3</option>
                    <option value="<h4>">Heading 4</option>
                </select>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <div class="toolbar-group">
                <button type="button" data-command="justifyLeft" title="Align Left"><i class="fas fa-align-left"></i></button>
                <button type="button" data-command="justifyCenter" title="Center"><i class="fas fa-align-center"></i></button>
                <button type="button" data-command="justifyRight" title="Align Right"><i class="fas fa-align-right"></i></button>
                <button type="button" data-command="justifyFull" title="Justify"><i class="fas fa-align-justify"></i></button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <div class="toolbar-group">
                <button type="button" data-command="insertUnorderedList" title="Bullet List"><i class="fas fa-list-ul"></i></button>
                <button type="button" data-command="insertOrderedList" title="Numbered List"><i class="fas fa-list-ol"></i></button>
                <button type="button" data-command="outdent" title="Decrease Indent"><i class="fas fa-outdent"></i></button>
                <button type="button" data-command="indent" title="Increase Indent"><i class="fas fa-indent"></i></button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <div class="toolbar-group">
                <button type="button" data-command="createLink" title="Insert Link"><i class="fas fa-link"></i></button>
                <button type="button" data-command="unlink" title="Remove Link"><i class="fas fa-unlink"></i></button>
                <button type="button" data-command="insertImage" title="Insert Image"><i class="fas fa-image"></i></button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <div class="toolbar-group">
                <button type="button" data-command="insertTable" title="Insert Table"><i class="fas fa-table"></i></button>
                <button type="button" data-command="insertHR" title="Insert Line"><i class="fas fa-minus"></i></button>
                <button type="button" data-command="insertQuote" title="Insert Quote"><i class="fas fa-quote-left"></i></button>
            </div>
            
            <div class="toolbar-separator"></div>
            
            <div class="toolbar-group">
                <button type="button" data-command="undo" title="Undo"><i class="fas fa-undo"></i></button>
                <button type="button" data-command="redo" title="Redo"><i class="fas fa-redo"></i></button>
                <button type="button" data-command="removeFormat" title="Clear Formatting"><i class="fas fa-remove-format"></i></button>
            </div>
        `;
        this.container.appendChild(this.toolbar);
    }
    
    createEditor() {
        this.editor = document.createElement('div');
        this.editor.className = 'rich-editor-content';
        this.editor.contentEditable = true;
        this.editor.innerHTML = '<p>Start typing your content here...</p>';
        this.container.appendChild(this.editor);
    }
    
    attachEventListeners() {
        // Toolbar button clicks
        this.toolbar.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                e.preventDefault();
                const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
                const command = button.getAttribute('data-command');
                this.executeCommand(command);
            }
        });
        
        // Select dropdown changes
        this.toolbar.addEventListener('change', (e) => {
            if (e.target.tagName === 'SELECT') {
                const command = e.target.getAttribute('data-command');
                const value = e.target.value;
                this.executeCommand(command, value);
                e.target.selectedIndex = 0; // Reset dropdown
            }
        });
        
        // Editor focus/blur for placeholder
        this.editor.addEventListener('focus', () => {
            if (this.editor.innerHTML === '<p>Start typing your content here...</p>') {
                this.editor.innerHTML = '<p><br></p>';
            }
        });
        
        this.editor.addEventListener('blur', () => {
            if (this.editor.innerHTML === '<p><br></p>' || this.editor.innerHTML === '') {
                this.editor.innerHTML = '<p>Start typing your content here...</p>';
            }
        });
        
        // Paste handling
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    }
    
    executeCommand(command, value = null) {
        this.editor.focus();
        
        switch(command) {
            case 'createLink':
                const url = prompt('Enter the URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
                break;
                
            case 'insertImage':
                const imgUrl = prompt('Enter the image URL:');
                if (imgUrl) {
                    document.execCommand(command, false, imgUrl);
                }
                break;
                
            case 'insertTable':
                const tableHTML = `
                    <table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">Header 1</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">Header 2</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
                        </tr>
                    </table>
                `;
                document.execCommand('insertHTML', false, tableHTML);
                break;
                
            case 'insertHR':
                document.execCommand('insertHTML', false, '<hr>');
                break;
                
            case 'insertQuote':
                document.execCommand('insertHTML', false, '<blockquote style="border-left: 4px solid #3498db; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #555;">Quote text here...</blockquote>');
                break;
                
            default:
                document.execCommand(command, false, value);
        }
    }
    
    getContent() {
        let content = this.editor.innerHTML;
        if (content === '<p>Start typing your content here...</p>') {
            return '';
        }
        return content;
    }
    
    setContent(html) {
        this.editor.innerHTML = html || '<p>Start typing your content here...</p>';
    }
    
    clear() {
        this.editor.innerHTML = '<p>Start typing your content here...</p>';
    }
    
    focus() {
        this.editor.focus();
    }
}

// Initialize rich text editor when DOM is loaded
let contentEditor;

function initializeRichTextEditor(containerId = 'richTextEditor') {
    contentEditor = new RichTextEditor(containerId);
    return contentEditor;
}

// Helper function to get editor content
function getEditorContent() {
    return contentEditor ? contentEditor.getContent() : '';
}

// Helper function to set editor content
function setEditorContent(html) {
    if (contentEditor) {
        contentEditor.setContent(html);
    }
}

// Helper function to clear editor
function clearEditor() {
    if (contentEditor) {
        contentEditor.clear();
    }
}