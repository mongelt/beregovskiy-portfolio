// Enhanced Content Storage System with Categories and Profile Management
// This stores content, category structure, and profile data

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

// Profile/Business Card Management
function initializeProfile() {
    if (!localStorage.getItem('portfolioProfile')) {
        const initialProfile = {
            personalInfo: {
                fullName: "Your Name",
                jobTitle: "Reporter & Content Creator",
                currentEmployer: "Your Media Company",
                location: "Your City, State",
                profileImage: "",
                email: "your.email@example.com",
                phone: "+1 (555) 123-4567",
                website: "https://beregovskiy.com",
                linkedin: "https://linkedin.com/in/yourname",
                twitter: "https://twitter.com/yourhandle"
            },
            bioInfo: {
                shortBio: "Award-winning reporter with 10+ years of experience covering breaking news, investigations, and feature stories. Passionate about accurate, compelling storytelling.",
                fullBio: `<p>Professional journalist with extensive experience in digital media, print journalism, and broadcast reporting. Specializes in investigative reporting, breaking news coverage, and feature storytelling.</p>
                
                <h3>Experience Highlights</h3>
                <ul>
                <li>10+ years in professional journalism</li>
                <li>Award-winning investigative pieces</li>
                <li>Expert in multimedia storytelling</li>
                <li>Fluent in multiple languages</li>
                </ul>
                
                <h3>Notable Achievements</h3>
                <ul>
                <li>Excellence in Journalism Award 2023</li>
                <li>Best Investigative Series 2022</li>
                <li>Featured speaker at journalism conferences</li>
                </ul>`,
                skills: ["Investigative Reporting", "Breaking News", "Feature Writing", "Video Production", "Social Media", "Data Analysis"],
                languages: ["English (Native)", "Spanish (Fluent)", "French (Conversational)"],
                education: "Bachelor's in Journalism, Master's in Communications"
            },
            displaySettings: {
                showEmail: true,
                showPhone: true,
                showSocialMedia: true,
                headerHeight: 40,
                expandedHeight: 80,
                primaryColor: "#2c3e50",
                secondaryColor: "#3498db"
            }
        };
        localStorage.setItem('portfolioProfile', JSON.stringify(initialProfile));
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

// Get profile data
function getProfileData() {
    const stored = localStorage.getItem('portfolioProfile');
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

// Save profile data
function saveProfileData(profileData) {
    localStorage.setItem('portfolioProfile', JSON.stringify(profileData));
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

// Update profile section
function updateProfile(section, data) {
    const profile = getProfileData();
    profile[section] = { ...profile[section], ...data };
    saveProfileData(profile);
}

// Initialize everything when script loads
initializeContent();
initializeProfile();