// Enhanced Content Storage System with Categories
// This stores content and category structure

// Initialize content and categories if they don't exist
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
                    category: "Writing",
                    subcategory: "Blog Posts",
                    orderInCategory: 1,
                    dateCreated: "2024-09-22",
                    published: true
                }
            ],
            images: [],
            videos: []
        };
        localStorage.setItem('portfolioContent', JSON.stringify(initialContent));
    }
    
    if (!localStorage.getItem('portfolioCategories')) {
        const initialCategories = {
            "Writing": {
                order: 1,
                subcategories: {
                    "Blog Posts": { order: 1 },
                    "White Papers": { order: 2 },
                    "One-Pagers": { order: 3 }
                }
            },
            "Reporting": {
                order: 2,
                subcategories: {
                    "News Articles": { order: 1 },
                    "Investigations": { order: 2 }
                }
            },
            "Media Appearances": {
                order: 3,
                subcategories: {
                    "TV Interviews": { order: 1 },
                    "Podcast Appearances": { order: 2 }
                }
            },
            "Social Media": {
                order: 4,
                subcategories: {
                    "Twitter Posts": { order: 1 },
                    "LinkedIn Articles": { order: 2 }
                }
            },
            "Video": {
                order: 5,
                subcategories: {
                    "News Segments": { order: 1 },
                    "Documentary Work": { order: 2 }
                }
            },
            "Photography": {
                order: 6,
                subcategories: {
                    "Event Coverage": { order: 1 },
                    "Portrait Work": { order: 2 }
                }
            }
        };
        localStorage.setItem('portfolioCategories', JSON.stringify(initialCategories));
    }
}

// Get all content from storage
function getStoredContent() {
    const stored = localStorage.getItem('portfolioContent');
    return stored ? JSON.parse(stored) : { articles: [], images: [], videos: [] };
}

// Get categories from storage
function getStoredCategories() {
    const stored = localStorage.getItem('portfolioCategories');
    return stored ? JSON.parse(stored) : {};
}

// Save content to storage
function saveContent(content) {
    localStorage.setItem('portfolioContent', JSON.stringify(content));
}

// Save categories to storage
function saveCategories(categories) {
    localStorage.setItem('portfolioCategories', JSON.stringify(categories));
}

// Function to add new content
function addContent(newContent) {
    const portfolioContent = getStoredContent();
    const contentArray = portfolioContent[newContent.type + 's'];
    
    newContent.id = Date.now();
    newContent.dateCreated = new Date().toISOString().split('T')[0];
    newContent.published = true;
    
    // Set order within category (highest number + 1)
    if (!newContent.orderInCategory) {
        const sameCategory = contentArray.filter(item => 
            item.category === newContent.category && 
            item.subcategory === newContent.subcategory
        );
        newContent.orderInCategory = sameCategory.length + 1;
    }
    
    contentArray.unshift(newContent);
    saveContent(portfolioContent);
    
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

// Function to get content by category
function getContentByCategory(category, subcategory = null) {
    const allContent = getAllContent();
    let filtered = allContent.filter(item => item.category === category);
    
    if (subcategory) {
        filtered = filtered.filter(item => item.subcategory === subcategory);
    }
    
    return filtered.sort((a, b) => (a.orderInCategory || 999) - (b.orderInCategory || 999));
}

// Function to add new category
function addCategory(categoryName, subcategories = []) {
    const categories = getStoredCategories();
    const maxOrder = Math.max(0, ...Object.values(categories).map(cat => cat.order)) + 1;
    
    categories[categoryName] = {
        order: maxOrder,
        subcategories: {}
    };
    
    subcategories.forEach((subcat, index) => {
        categories[categoryName].subcategories[subcat] = { order: index + 1 };
    });
    
    saveCategories(categories);
}

// Function to add subcategory
function addSubcategory(categoryName, subcategoryName) {
    const categories = getStoredCategories();
    if (categories[categoryName]) {
        const maxOrder = Math.max(0, ...Object.values(categories[categoryName].subcategories).map(sub => sub.order)) + 1;
        categories[categoryName].subcategories[subcategoryName] = { order: maxOrder };
        saveCategories(categories);
    }
}

// Initialize everything when script loads
initializeContent();