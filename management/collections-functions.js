// Collections Management - Data Functions
// Phase 8: Collections Admin Panel

// Global state
let allCollections = [];
let allCategories = [];
let allContent = [];
let currentEditingCollectionId = null;
let currentAssigningCollectionId = null;

// ========== COLLECTION CRUD OPERATIONS ==========

async function loadAllCollections() {
    try {
        allCollections = await getCollections();
        console.log('Loaded collections:', allCollections);
        return allCollections;
    } catch (error) {
        console.error('Error loading collections:', error);
        return [];
    }
}

async function createNewCollection(collectionData) {
    try {
        const newCollection = await createCollection({
            name: collectionData.name,
            description: collectionData.description || null,
            slug: collectionData.slug,
            order: parseInt(collectionData.order) || 0
        });
        console.log('Created collection:', newCollection);
        return newCollection;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

async function updateExistingCollection(collectionId, collectionData) {
    try {
        const updated = await updateCollection(collectionId, {
            name: collectionData.name,
            description: collectionData.description || null,
            slug: collectionData.slug,
            order: parseInt(collectionData.order) || 0
        });
        console.log('Updated collection:', updated);
        return updated;
    } catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
}

async function deleteExistingCollection(collectionId) {
    try {
        await deleteCollection(collectionId);
        console.log('Deleted collection:', collectionId);
        return true;
    } catch (error) {
        console.error('Error deleting collection:', error);
        throw error;
    }
}

// ========== CONTENT ASSIGNMENT OPERATIONS ==========

async function loadCollectionContent(collectionId) {
    try {
        const content = await getCollectionContent(collectionId);
        console.log('Loaded collection content:', content);
        return content;
    } catch (error) {
        console.error('Error loading collection content:', error);
        return [];
    }
}

async function assignContentToCollection(contentId, collectionId) {
    try {
        await addContentToCollection(contentId, collectionId, 0);
        console.log('Assigned content to collection:', contentId, collectionId);
        return true;
    } catch (error) {
        console.error('Error assigning content:', error);
        throw error;
    }
}

async function unassignContentFromCollection(contentId, collectionId) {
    try {
        await removeContentFromCollection(contentId, collectionId);
        console.log('Removed content from collection:', contentId, collectionId);
        return true;
    } catch (error) {
        console.error('Error removing content:', error);
        throw error;
    }
}

async function getContentCollectionStatus(contentId) {
    try {
        const collections = await getContentCollections(contentId);
        return collections.map(c => c.id);
    } catch (error) {
        console.error('Error getting content collections:', error);
        return [];
    }
}

// ========== SUPPORTING DATA OPERATIONS ==========

async function loadAllCategories() {
    try {
        allCategories = await getCategories();
        console.log('Loaded categories:', allCategories);
        return allCategories;
    } catch (error) {
        console.error('Error loading categories:', error);
        return [];
    }
}

async function loadAllContent() {
    try {
        allContent = await getAllContent();
        console.log('Loaded all content:', allContent);
        return allContent;
    } catch (error) {
        console.error('Error loading content:', error);
        return [];
    }
}

async function loadFilteredContent(categoryId = null, subcategoryId = null) {
    try {
        let filtered = [...allContent];
        
        if (subcategoryId) {
            filtered = filtered.filter(item => item.subcategory_id === subcategoryId);
        } else if (categoryId) {
            // Find all subcategories for this category
            const category = allCategories.find(c => c.id === categoryId);
            if (category && category.subcategories) {
                const subcategoryIds = category.subcategories.map(s => s.id);
                filtered = filtered.filter(item => subcategoryIds.includes(item.subcategory_id));
            }
        }
        
        console.log('Filtered content:', filtered.length, 'items');
        return filtered;
    } catch (error) {
        console.error('Error filtering content:', error);
        return [];
    }
}

// ========== UTILITY FUNCTIONS ==========

function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-');      // Replace multiple hyphens with single
}

function getCollectionUrl(slug) {
    // This will be the future collection page URL
    return `../collection.html?slug=${slug}`;
}

function getCategoryNameForContent(contentItem) {
    for (let cat of allCategories) {
        if (cat.subcategories) {
            const sub = cat.subcategories.find(s => s.id === contentItem.subcategory_id);
            if (sub) {
                return `${cat.name} → ${sub.name}`;
            }
        }
    }
    return 'Unknown Category';
}

// ========== INITIALIZATION ==========

async function initializeCollectionsData() {
    try {
        await loadAllCategories();
        await loadAllContent();
        await loadAllCollections();
        console.log('Collections data initialized');
        return true;
    } catch (error) {
        console.error('Error initializing collections data:', error);
        return false;
    }
}