// ===================================
// SUPABASE DATA FUNCTIONS
// ===================================

// Get all categories
async function getCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select(`
                *,
                subcategories (*)
            `)
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        
        // Transform to match old format
        return data.map(cat => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            order: cat.order_index,
            subcategories: cat.subcategories.map(sub => ({
                id: sub.id,
                name: sub.name,
                order: sub.order_index
            }))
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Get all content
async function getAllContent() {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform to match old format
        return data.map(item => ({
            id: item.id,
            categoryId: item.category_id,
            subcategoryId: item.subcategory_id,
            type: item.type,
            title: item.title,
            subtitle: item.subtitle,
            content: item.content,
            imageUrl: item.image_url,
            videoUrl: item.video_url,
            createdAt: item.created_at
        }));
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
}

// Get content by category
async function getContentByCategory(categoryId) {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('category_id', categoryId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(item => ({
            id: item.id,
            categoryId: item.category_id,
            subcategoryId: item.subcategory_id,
            type: item.type,
            title: item.title,
            subtitle: item.subtitle,
            content: item.content,
            imageUrl: item.image_url,
            videoUrl: item.video_url,
            createdAt: item.created_at
        }));
    } catch (error) {
        console.error('Error fetching content by category:', error);
        return [];
    }
}

// Get content by subcategory
async function getContentBySubcategory(subcategoryId) {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('subcategory_id', subcategoryId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(item => ({
            id: item.id,
            categoryId: item.category_id,
            subcategoryId: item.subcategory_id,
            type: item.type,
            title: item.title,
            subtitle: item.subtitle,
            content: item.content,
            imageUrl: item.image_url,
            videoUrl: item.video_url,
            createdAt: item.created_at
        }));
    } catch (error) {
        console.error('Error fetching content by subcategory:', error);
        return [];
    }
}

// Add new content
async function addContent(contentItem) {
    try {
        const { data, error } = await supabase
            .from('content')
            .insert({
                category_id: contentItem.categoryId,
                subcategory_id: contentItem.subcategoryId || null,
                type: contentItem.type,
                title: contentItem.title,
                subtitle: contentItem.subtitle || null,
                content: contentItem.content || null,
                image_url: contentItem.imageUrl || null,
                video_url: contentItem.videoUrl || null
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding content:', error);
        throw error;
    }
}

// Update content
async function updateContent(contentId, updates) {
    try {
        const updateData = {
            title: updates.title,
            subtitle: updates.subtitle || null,
            content: updates.content || null,
            image_url: updates.imageUrl || null,
            video_url: updates.videoUrl || null
        };
        
        const { data, error } = await supabase
            .from('content')
            .update(updateData)
            .eq('id', contentId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating content:', error);
        throw error;
    }
}

// Delete content
async function deleteContent(contentId) {
    try {
        const { error } = await supabase
            .from('content')
            .delete()
            .eq('id', contentId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting content:', error);
        throw error;
    }
}

// Add category
async function addCategory(category) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert({
                name: category.name,
                type: category.type,
                order_index: category.order || 0
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding category:', error);
        throw error;
    }
}

// Update category
async function updateCategory(categoryId, updates) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .update({
                name: updates.name,
                order_index: updates.order || 0
            })
            .eq('id', categoryId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}

// Delete category
async function deleteCategory(categoryId) {
    try {
        // Supabase will cascade delete subcategories and content
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

// Add subcategory
async function addSubcategory(categoryId, subcategory) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .insert({
                category_id: categoryId,
                name: subcategory.name,
                order_index: subcategory.order || 0
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding subcategory:', error);
        throw error;
    }
}

// Update subcategory
async function updateSubcategory(subcategoryId, updates) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .update({
                name: updates.name,
                order_index: updates.order || 0
            })
            .eq('id', subcategoryId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating subcategory:', error);
        throw error;
    }
}

// Delete subcategory
async function deleteSubcategory(subcategoryId) {
    try {
        const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', subcategoryId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        throw error;
    }
}

// Get profile data
function getProfileData() {
    // For now, return from localStorage
    // We'll update this to use Supabase in next step
    const profile = localStorage.getItem('portfolioProfile');
    return profile ? JSON.parse(profile) : {
        personalInfo: {},
        bioInfo: {},
        displaySettings: {}
    };
}

// Save profile data
function saveProfileData(profile) {
    // For now, keep using localStorage
    // We'll update this to use Supabase in next step
    localStorage.setItem('portfolioProfile', JSON.stringify(profile));
}