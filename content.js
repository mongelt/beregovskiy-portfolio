// Content management functions with Supabase integration

// Get all categories with their subcategories
async function getCategories() {
    try {
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .order('order_index');

        if (catError) throw catError;

        const { data: subcategories, error: subError } = await supabase
            .from('subcategories')
            .select('*')
            .order('order_index');

        if (subError) throw subError;

        // Attach subcategories to their parent categories
        return categories.map(cat => ({
            ...cat,
            subcategories: subcategories.filter(sub => sub.category_id === cat.id)
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Get content items for a specific subcategory
async function getContentBySubcategory(subcategoryId) {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('subcategory_id', subcategoryId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
}

// Get all content items
async function getAllContent() {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching all content:', error);
        return [];
    }
}

// Get a single content item by ID
async function getContentById(contentId) {
    try {
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('id', contentId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching content:', error);
        return null;
    }
}

// Create new content item
async function createContent(contentData) {
    try {
        const { data, error } = await supabase
            .from('content')
            .insert([{
                title: contentData.title,
                subtitle: contentData.subtitle || null,
                sidebar_title: contentData.sidebarTitle || null,
                sidebar_subtitle: contentData.sidebarSubtitle || null,
                type: contentData.type,
                content: contentData.content,
                subcategory_id: contentData.subcategoryId,
                author_name: contentData.authorName || null,
                publication_name: contentData.publicationName || null,
                publication_date: contentData.publicationDate || null,
                source_link: contentData.sourceLink || null,
                copyright_notice: contentData.copyrightNotice || null,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating content:', error);
        throw error;
    }
}

// Update existing content item
async function updateContent(contentId, contentData) {
    try {
        const { data, error } = await supabase
            .from('content')
            .update({
                title: contentData.title,
                subtitle: contentData.subtitle || null,
                sidebar_title: contentData.sidebarTitle || null,
                sidebar_subtitle: contentData.sidebarSubtitle || null,
                type: contentData.type,
                content: contentData.content,
                subcategory_id: contentData.subcategoryId,
                author_name: contentData.authorName || null,
                publication_name: contentData.publicationName || null,
                publication_date: contentData.publicationDate || null,
                source_link: contentData.sourceLink || null,
                copyright_notice: contentData.copyrightNotice || null
            })
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

// Delete content item
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

// Create new category
async function createCategory(name, orderIndex) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{
                name: name,
                order_index: orderIndex || 0
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}

// Update category
async function updateCategory(categoryId, name, orderIndex) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .update({
                name: name,
                order_index: orderIndex
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

// Delete category (will cascade delete subcategories and content)
async function deleteCategory(categoryId) {
    try {
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

// Create new subcategory
async function createSubcategory(name, categoryId, orderIndex) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .insert([{
                name: name,
                category_id: categoryId,
                order_index: orderIndex || 0
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating subcategory:', error);
        throw error;
    }
}

// Update subcategory
async function updateSubcategory(subcategoryId, name, orderIndex) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .update({
                name: name,
                order_index: orderIndex
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

// Delete subcategory (will cascade delete content)
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

// Get profile data (still using localStorage for now)
function getProfile() {
    const profileData = localStorage.getItem('profileData');
    return profileData ? JSON.parse(profileData) : {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        socialLinks: {
            linkedin: '',
            twitter: '',
            github: '',
            website: ''
        }
    };
}

// Save profile data (still using localStorage for now)
function saveProfile(profileData) {
    localStorage.setItem('profileData', JSON.stringify(profileData));
}