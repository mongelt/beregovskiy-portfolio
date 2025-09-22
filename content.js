// Content Storage System
// This file stores all your portfolio content

let portfolioContent = {
    articles: [
        {
            id: 1,
            title: "Welcome to My New Portfolio",
            content: "<p>This is my first piece of content created through the admin panel! 🎉</p><p>I can add <strong>bold text</strong>, <em>italic text</em>, and even links.</p>",
            type: "article",
            mediaUrl: "",
            dateCreated: "2024-09-22",
            published: true
        }
    ],
    images: [],
    videos: []
};

// Function to add new content
function addContent(newContent) {
    const contentArray = portfolioContent[newContent.type + 's'];
    newContent.id = Date.now(); // Simple ID generation
    newContent.dateCreated = new Date().toISOString().split('T')[0];
    newContent.published = true;
    
    contentArray.unshift(newContent); // Add to beginning of array
    updateWebsite();
}

// Function to get all published content
function getAllContent() {
    const allContent = [
        ...portfolioContent.articles,
        ...portfolioContent.images, 
        ...portfolioContent.videos
    ];
    
    return allContent.filter(item => item.published)
                    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
}

// Function to update the main website
function updateWebsite() {
    if (typeof updatePortfolioDisplay === 'function') {
        updatePortfolioDisplay();
    }
}