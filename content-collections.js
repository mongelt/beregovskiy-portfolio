// Content Management - Collections Functions (Phase 7)
// Split from content.js for better organization

// ========== COLLECTION CRUD ==========

async function getCollections() {
    try {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching collections:', error);
        return [];
    }
}

async function getCollectionById(collectionId) {
    try {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('id', collectionId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching collection:', error);
        return null;
    }
}

async function getCollectionBySlug(slug) {
    try {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('slug', slug)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching collection by slug:', error);
        return null;
    }
}

async function createCollection(collectionData) {
    try {
        const { data, error } = await supabase
            .from('collections')
            .insert([{
                name: collectionData.name,
                description: collectionData.description || null,
                slug: collectionData.slug,
                order_index: collectionData.order || 0
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

async function updateCollection(collectionId, collectionData) {
    try {
        const { data, error } = await supabase
            .from('collections')
            .update({
                name: collectionData.name,
                description: collectionData.description || null,
                slug: collectionData.slug,
                order_index: collectionData.order || 0
            })
            .eq('id', collectionId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
}

async function deleteCollection(collectionId) {
    try {
        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting collection:', error);
        throw error;
    }
}

// ========== CONTENT-COLLECTION ASSIGNMENTS ==========

async function getCollectionContent(collectionId) {
    try {
        const { data, error } = await supabase
            .from('content_collections')
            .select(`
                content_id,
                order_index,
                content (*)
            `)
            .eq('collection_id', collectionId)
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data ? data.map(item => item.content) : [];
    } catch (error) {
        console.error('Error fetching collection content:', error);
        return [];
    }
}

async function getContentCollections(contentId) {
    try {
        const { data, error } = await supabase
            .from('content_collections')
            .select(`
                collection_id,
                collections (*)
            `)
            .eq('content_id', contentId);
        
        if (error) throw error;
        return data ? data.map(item => item.collections) : [];
    } catch (error) {
        console.error('Error fetching content collections:', error);
        return [];
    }
}

async function addContentToCollection(contentId, collectionId, orderIndex = 0) {
    try {
        const { data, error } = await supabase
            .from('content_collections')
            .insert([{
                content_id: contentId,
                collection_id: collectionId,
                order_index: orderIndex
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding content to collection:', error);
        throw error;
    }
}

async function removeContentFromCollection(contentId, collectionId) {
    try {
        const { error } = await supabase
            .from('content_collections')
            .delete()
            .eq('content_id', contentId)
            .eq('collection_id', collectionId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing content from collection:', error);
        throw error;
    }
}