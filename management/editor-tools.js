// editor-tools.js
// Configure all Editor.js tools with proper settings

console.log('Loading editor-tools.js...');

// Check if all required classes are available
console.log('Checking Editor.js plugins...');
console.log('Paragraph:', typeof Paragraph !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('Header:', typeof Header !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('NestedList:', typeof NestedList !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('Quote:', typeof Quote !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('Delimiter:', typeof Delimiter !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('Embed:', typeof Embed !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('Code:', typeof CodeTool !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('SimpleImage:', typeof SimpleImage !== 'undefined' ? 'Loaded' : 'NOT LOADED');

// Configure Editor.js tools (only add if class exists)
window.editorTools = {};

// Paragraph tool (default) - REQUIRED
if (typeof Paragraph !== 'undefined') {
    window.editorTools.paragraph = {
        class: Paragraph,
        inlineToolbar: true,
        config: {
            placeholder: 'Start writing...'
        }
    };
}

// Header tool
if (typeof Header !== 'undefined') {
    window.editorTools.header = {
        class: Header,
        inlineToolbar: true,
        config: {
            placeholder: 'Enter a heading',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
        },
        shortcut: 'CMD+SHIFT+H'
    };
}

// List tool (NestedList for @editorjs/list@latest)
if (typeof NestedList !== 'undefined') {
    window.editorTools.list = {
        class: NestedList,
        inlineToolbar: true,
        config: {
            defaultStyle: 'unordered'
        },
        shortcut: 'CMD+SHIFT+L'
    };
}

// Quote tool
if (typeof Quote !== 'undefined') {
    window.editorTools.quote = {
        class: Quote,
        inlineToolbar: true,
        config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote author'
        },
        shortcut: 'CMD+SHIFT+Q'
    };
}

// Delimiter (separator line)
if (typeof Delimiter !== 'undefined') {
    window.editorTools.delimiter = {
        class: Delimiter,
        shortcut: 'CMD+SHIFT+D'
    };
}

// Code block
if (typeof CodeTool !== 'undefined') {
    window.editorTools.code = {
        class: CodeTool,
        shortcut: 'CMD+SHIFT+C'
    };
}

// Embed (YouTube, Vimeo, etc.)
if (typeof Embed !== 'undefined') {
    window.editorTools.embed = {
        class: Embed,
        config: {
            services: {
                youtube: true,
                vimeo: true,
                twitter: true,
                instagram: true,
                codepen: true,
                github: true
            }
        }
    };
}

// Image tool with Cloudinary integration (using SimpleImage)
if (typeof SimpleImage !== 'undefined' && typeof window.uploadImageToCloudinary === 'function') {
    window.editorTools.image = {
        class: SimpleImage,
        config: {
            uploader: window.uploadImageToCloudinary
        }
    };
}

console.log('Editor tools configured:', Object.keys(window.editorTools));
console.log('editor-tools.js loaded successfully');