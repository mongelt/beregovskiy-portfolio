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

// ========== CATEGORY FUNCTIONS (FIXED - REMOVED TYPE FIELD) ==========

// Add new category (NO TYPE FIELD - that was causing the bug!)
async function addCategory(categoryData) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{
                name: categoryData.name,
                order_index: categoryData.order || 0
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

// Update category (NO TYPE FIELD)
async function updateCategory(categoryId, categoryData) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .update({
                name: categoryData.name,
                order_index: categoryData.order || 0
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

// Add new subcategory
async function addSubcategory(categoryId, subcategoryData) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .insert([{
                name: subcategoryData.name,
                category_id: categoryId,
                order_index: subcategoryData.order || 0
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
async function updateSubcategory(subcategoryId, subcategoryData) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .update({
                name: subcategoryData.name,
                order_index: subcategoryData.order || 0
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

// ========== PROFILE FUNCTIONS (FOR BUSINESS CARD) ==========

// Get profile data (still using localStorage for now)
function getProfileData() {
    const profileData = localStorage.getItem('portfolioProfile');
    
    if (profileData) {
        return JSON.parse(profileData);
    }
    
    // Return default structure
    return {
        personalInfo: {
            fullName: 'Your Name',
            jobTitle: 'Your Title',
            currentEmployer: 'Your Company',
            location: 'Your Location',
            profileImage: '',
            email: '',
            phone: '',
            website: '',
            linkedin: '',
            twitter: ''
        },
        bioInfo: {
            shortBio: 'Professional summary coming soon...',
            fullBio: '<p>Detailed bio coming soon...</p>',
            skills: [],
            languages: [],
            education: ''
        },
        displaySettings: {
            headerHeight: 40,
            expandedHeight: 80,
            showEmail: true,
            showPhone: true,
            showSocialMedia: true
        }
    };
}

// Update profile data
function updateProfile(section, data) {
    const profile = getProfileData();
    profile[section] = data;
    localStorage.setItem('portfolioProfile', JSON.stringify(profile));
}