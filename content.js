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

// ========== CATEGORY FUNCTIONS ==========

// Add new category
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

// Update category
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

// Delete category
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

// ========== PROFILE FUNCTIONS (SUPABASE) ==========

// Get profile data from Supabase
async function getProfileData() {
    try {
        const { data, error } = await supabase
            .from('profile')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            // Return default structure if no profile exists
            return {
                personalInfo: {
                    fullName: 'Your Name',
                    jobTitle1: 'Your Title',
                    jobTitle2: '',
                    jobTitle3: '',
                    jobTitle4: '',
                    location: 'Your Location',
                    profileImage: '',
                    email: '',
                    phone: '',
                    linkedin: ''
                },
                bioInfo: {
                    shortBio: 'Professional summary coming soon...',
                    fullBio: '<p>Detailed bio coming soon...</p>',
                    skills: [],
                    languages: [],
                    education: ''
                },
                displaySettings: {
                    showEmail: true,
                    showPhone: true,
                    showSocialMedia: true
                }
            };
        }

        // Transform database format to match expected format
        return {
            personalInfo: {
                fullName: data.full_name || 'Your Name',
                jobTitle1: data.job_title_1 || 'Your Title',
                jobTitle2: data.job_title_2 || '',
                jobTitle3: data.job_title_3 || '',
                jobTitle4: data.job_title_4 || '',
                location: data.location || 'Your Location',
                profileImage: data.profile_image || '',
                email: data.email || '',
                phone: data.phone || '',
                linkedin: data.linkedin || ''
            },
            bioInfo: {
                shortBio: data.short_bio || 'Professional summary coming soon...',
                fullBio: data.full_bio || '<p>Detailed bio coming soon...</p>',
                skills: data.skills || [],
                languages: data.languages || [],
                education: data.education || ''
            },
            displaySettings: {
                showEmail: data.show_email !== false,
                showPhone: data.show_phone !== false,
                showSocialMedia: data.show_social_media !== false
            }
        };
    } catch (error) {
        console.error('Error in getProfileData:', error);
        // Return default structure on error
        return {
            personalInfo: {
                fullName: 'Your Name',
                jobTitle1: 'Your Title',
                jobTitle2: '',
                jobTitle3: '',
                jobTitle4: '',
                location: 'Your Location',
                profileImage: '',
                email: '',
                phone: '',
                linkedin: ''
            },
            bioInfo: {
                shortBio: 'Professional summary coming soon...',
                fullBio: '<p>Detailed bio coming soon...</p>',
                skills: [],
                languages: [],
                education: ''
            },
            displaySettings: {
                showEmail: true,
                showPhone: true,
                showSocialMedia: true
            }
        };
    }
}

// Update profile data in Supabase
async function updateProfile(profileData) {
    try {
        // First, check if a profile exists
        const { data: existing, error: fetchError } = await supabase
            .from('profile')
            .select('id')
            .limit(1)
            .single();

        // Prepare the update data
        const updateData = {
            full_name: profileData.personalInfo?.fullName,
            location: profileData.personalInfo?.location,
            job_title_1: profileData.personalInfo?.jobTitle1,
            job_title_2: profileData.personalInfo?.jobTitle2 || null,
            job_title_3: profileData.personalInfo?.jobTitle3 || null,
            job_title_4: profileData.personalInfo?.jobTitle4 || null,
            profile_image: profileData.personalInfo?.profileImage || null,
            email: profileData.personalInfo?.email || null,
            phone: profileData.personalInfo?.phone || null,
            linkedin: profileData.personalInfo?.linkedin || null,
            short_bio: profileData.bioInfo?.shortBio,
            full_bio: profileData.bioInfo?.fullBio,
            skills: profileData.bioInfo?.skills || [],
            languages: profileData.bioInfo?.languages || [],
            education: profileData.bioInfo?.education || null,
            show_email: profileData.displaySettings?.showEmail !== false,
            show_phone: profileData.displaySettings?.showPhone !== false,
            show_social_media: profileData.displaySettings?.showSocialMedia !== false
        };

        if (existing && existing.id) {
            // Update existing profile
            const { data, error } = await supabase
                .from('profile')
                .update(updateData)
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('profile')
                .insert([updateData])
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}