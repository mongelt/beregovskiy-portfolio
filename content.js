// Content Storage System using localStorage
// This stores content in the browser so it persists

// Initialize content if it doesn't exist
function initializeContent() {
    if (!localStorage.getItem('portfolioContent')) {
        const initialContent = {
            articles: [
                {
                    id: 1,
                    title: "Welcome to My Portfolio",
                    content: "<p>This is my first piece of content! 🎉</p><p>I can add <strong>bold text</strong>, <em>italic text</em>, and create professional articles.</p><p>This content management system allows me to easily update my portfolio without touching any code!</p>",
                    type: "article",
                    mediaUrl: "",
                    dateCreated: "2024-09-22",
                    published: true
                }
            ],
            images: [],
            videos: []
        };
        localStorage.setItem('portfolioContent', JSON.stringify(initialContent));
    }
}

// Get all content from storage
function getStoredContent() {
    const stored = localStorage.getItem('portfolioContent');
    return stored ? JSON.parse(stored) : { articles: [], images: [], videos: [] };
}

// Save content to storage
function saveContent(content) {
    localStorage.setItem('portfolioContent', JSON.stringify(content));
}

// Function to add new content
function addContent(newContent) {
    const portfolioContent = getStoredContent();
    const contentArray = portfolioContent[newContent.type + 's'];
    
    newContent.id = Date.now(); // Simple ID generation
    newContent.dateCreated = new Date().toISOString().split('T')[0];
    newContent.published = true;
    
    contentArray.unshift(newContent); // Add to beginning of array
    saveContent(portfolioContent);
    
    // Update the website display if function exists
    if (typeof updatePortfolioDisplay === 'function') {
        updatePortfolioDisplay();
    }
}

// Function to get all published content
function getAllContent() {
    const portfolioContent = getStoredContent();
    const allContent = [
        ...portfolioContent.articles,
        ...portfolioContent.images, 
        ...portfolioContent.videos
    ];
    
    return allContent.filter(item => item.published)
                    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
}

// Initialize content when script loads
initializeContent();