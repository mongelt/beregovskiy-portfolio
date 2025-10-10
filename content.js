// Content management functions with Supabase integration
// Updated Phase 7: Complete Backend Infrastructure

// ========== EXISTING FUNCTIONS ==========

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
        return categories.map(cat => ({
            ...cat,
            subcategories: subcategories.filter(sub => sub.category_id === cat.id)
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

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
                audio_url: contentData.audioUrl || null,
                subcategory_id: contentData.subcategoryId,
                author_name: contentData.authorName || null,
                publication_name: contentData.publicationName || null,
                publication_date: contentData.publicationDate || null,
                source_link: contentData.sourceLink || null,
                copyright_notice: contentData.copyrightNotice || null,
                download_enabled: contentData.downloadEnabled || false,
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
                audio_url: contentData.audioUrl || null,
                subcategory_id: contentData.subcategoryId,
                author_name: contentData.authorName || null,
                publication_name: contentData.publicationName || null,
                publication_date: contentData.publicationDate || null,
                source_link: contentData.sourceLink || null,
                copyright_notice: contentData.copyrightNotice || null,
                download_enabled: contentData.downloadEnabled || false
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

async function getProfileData() {
    try {
        const { data, error } = await supabase
            .from('profile')
            .select('*')
            .limit(1)
            .single();
        if (error) {
            return {
                personalInfo: { fullName: 'Your Name', jobTitle1: 'Your Title', jobTitle2: '', jobTitle3: '', jobTitle4: '', location: 'Your Location', profileImage: '', email: '', phone: '', linkedin: '' },
                bioInfo: { shortBio: 'Professional summary coming soon...', fullBio: '<p>Detailed bio coming soon...</p>', skills: [], languages: [], education: '' },
                displaySettings: { showEmail: true, showPhone: true, showSocialMedia: true }
            };
        }
        return {
            personalInfo: { fullName: data.full_name || 'Your Name', jobTitle1: data.job_title_1 || 'Your Title', jobTitle2: data.job_title_2 || '', jobTitle3: data.job_title_3 || '', jobTitle4: data.job_title_4 || '', location: data.location || 'Your Location', profileImage: data.profile_image || '', email: data.email || '', phone: data.phone || '', linkedin: data.linkedin || '' },
            bioInfo: { shortBio: data.short_bio || 'Professional summary coming soon...', fullBio: data.full_bio || '<p>Detailed bio coming soon...</p>', skills: data.skills || [], languages: data.languages || [], education: data.education || '' },
            displaySettings: { showEmail: data.show_email !== false, showPhone: data.show_phone !== false, showSocialMedia: data.show_social_media !== false }
        };
    } catch (error) {
        console.error('Error in getProfileData:', error);
        return {
            personalInfo: { fullName: 'Your Name', jobTitle1: 'Your Title', jobTitle2: '', jobTitle3: '', jobTitle4: '', location: 'Your Location', profileImage: '', email: '', phone: '', linkedin: '' },
            bioInfo: { shortBio: 'Professional summary coming soon...', fullBio: '<p>Detailed bio coming soon...</p>', skills: [], languages: [], education: '' },
            displaySettings: { showEmail: true, showPhone: true, showSocialMedia: true }
        };
    }
}

async function updateProfile(profileData) {
    try {
        const { data: existing } = await supabase.from('profile').select('id').limit(1).single();
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
        if (existing?.id) {
            const { data, error } = await supabase.from('profile').update(updateData).eq('id', existing.id).select().single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase.from('profile').insert([updateData]).select().single();
            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// ========== PHASE 7: COLLECTIONS ==========

async function getCollections() {
    try {
        const { data, error } = await supabase.from('collections').select('*').order('order_index');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching collections:', error);
        return [];
    }
}

async function getCollectionById(collectionId) {
    try {
        const { data, error } = await supabase.from('collections').select('*').eq('id', collectionId).single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching collection:', error);
        return null;
    }
}

async function getCollectionBySlug(slug) {
    try {
        const { data, error } = await supabase.from('collections').select('*').eq('slug', slug).single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching collection by slug:', error);
        return null;
    }
}

async function createCollection(collectionData) {
    try {
        const { data, error } = await supabase.from('collections').insert([{ name: collectionData.name, description: collectionData.description || null, slug: collectionData.slug, order_index: collectionData.order || 0 }]).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

async function updateCollection(collectionId, collectionData) {
    try {
        const { data, error } = await supabase.from('collections').update({ name: collectionData.name, description: collectionData.description || null, slug: collectionData.slug, order_index: collectionData.order || 0 }).eq('id', collectionId).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
}

async function deleteCollection(collectionId) {
    try {
        const { error } = await supabase.from('collections').delete().eq('id', collectionId);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting collection:', error);
        throw error;
    }
}

async function getCollectionContent(collectionId) {
    try {
        const { data: links, error: linkError } = await supabase.from('content_collections').select('content_id, order_index').eq('collection_id', collectionId).order('order_index');
        if (linkError) throw linkError;
        if (!links || links.length === 0) return [];
        const contentIds = links.map(link => link.content_id);
        const { data: content, error: contentError } = await supabase.from('content').select('*').in('id', contentIds);
        if (contentError) throw contentError;
        return links.map(link => content.find(c => c.id === link.content_id)).filter(Boolean);
    } catch (error) {
        console.error('Error fetching collection content:', error);
        return [];
    }
}

async function getContentCollections(contentId) {
    try {
        const { data: links, error: linkError } = await supabase.from('content_collections').select('collection_id').eq('content_id', contentId);
        if (linkError) throw linkError;
        if (!links || links.length === 0) return [];
        const collectionIds = links.map(link => link.collection_id);
        const { data: collections, error: collectionError } = await supabase.from('collections').select('*').in('id', collectionIds);
        if (collectionError) throw collectionError;
        return collections || [];
    } catch (error) {
        console.error('Error fetching content collections:', error);
        return [];
    }
}

async function addContentToCollection(contentId, collectionId, orderIndex = 0) {
    try {
        const { data, error } = await supabase.from('content_collections').insert([{ content_id: contentId, collection_id: collectionId, order_index: orderIndex }]).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding content to collection:', error);
        throw error;
    }
}

async function removeContentFromCollection(contentId, collectionId) {
    try {
        const { error } = await supabase.from('content_collections').delete().eq('content_id', contentId).eq('collection_id', collectionId);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing content from collection:', error);
        throw error;
    }
}

// ========== PHASE 7: RESUME ENTRY TYPES ==========

async function getResumeEntryTypes() {
    try {
        const { data, error } = await supabase.from('resume_entry_types').select('*').order('order_index');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching resume entry types:', error);
        return [];
    }
}

async function createResumeEntryType(typeData) {
    try {
        const { data, error } = await supabase.from('resume_entry_types').insert([{ name: typeData.name, icon: typeData.icon || null, order_index: typeData.order || 0 }]).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating resume entry type:', error);
        throw error;
    }
}

async function updateResumeEntryType(typeId, typeData) {
    try {
        const { data, error } = await supabase.from('resume_entry_types').update({ name: typeData.name, icon: typeData.icon || null, order_index: typeData.order || 0 }).eq('id', typeId).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating resume entry type:', error);
        throw error;
    }
}

async function deleteResumeEntryType(typeId) {
    try {
        const { error } = await supabase.from('resume_entry_types').delete().eq('id', typeId);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting resume entry type:', error);
        throw error;
    }
}

// ========== PHASE 7: RESUME ENTRIES ==========

async function getResumeEntries() {
    try {
        const { data, error } = await supabase.from('resume_entries').select('*').order('date_start', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching resume entries:', error);
        return [];
    }
}

async function getResumeEntriesByType(typeId) {
    try {
        const { data, error } = await supabase.from('resume_entries').select('*').eq('entry_type_id', typeId).order('date_start', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching resume entries by type:', error);
        return [];
    }
}

async function getFeaturedResumeEntries() {
    try {
        const { data, error } = await supabase.from('resume_entries').select('*').eq('is_featured', true).order('date_start', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching featured resume entries:', error);
        return [];
    }
}

async function createResumeEntry(entryData) {
    try {
        const { data, error } = await supabase.from('resume_entries').insert([{ entry_type_id: entryData.entryTypeId, title: entryData.title, subtitle: entryData.subtitle || null, date_start: entryData.dateStart, date_end: entryData.dateEnd || null, description: entryData.description || null, media_urls: entryData.mediaUrls || [], order_index: entryData.order || 0, is_featured: entryData.isFeatured || false }]).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating resume entry:', error);
        throw error;
    }
}

async function updateResumeEntry(entryId, entryData) {
    try {
        const { data, error } = await supabase.from('resume_entries').update({ entry_type_id: entryData.entryTypeId, title: entryData.title, subtitle: entryData.subtitle || null, date_start: entryData.dateStart, date_end: entryData.dateEnd || null, description: entryData.description || null, media_urls: entryData.mediaUrls || [], order_index: entryData.order || 0, is_featured: entryData.isFeatured || false }).eq('id', entryId).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating resume entry:', error);
        throw error;
    }
}

async function deleteResumeEntry(entryId) {
    try {
        const { error } = await supabase.from('resume_entries').delete().eq('id', entryId);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting resume entry:', error);
        throw error;
    }
}

// ========== PHASE 7: DOWNLOADABLE FILES ==========

async function getDownloadableFiles() {
    try {
        const { data, error } = await supabase.from('downloadable_files').select('*').order('updated_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching downloadable files:', error);
        return [];
    }
}

async function getDownloadableFilesByType(fileType) {
    try {
        const { data, error } = await supabase.from('downloadable_files').select('*').eq('file_type', fileType).order('updated_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching downloadable files by type:', error);
        return [];
    }
}

async function createDownloadableFile(fileData) {
    try {
        const { data, error } = await supabase.from('downloadable_files').insert([{ file_type: fileData.fileType, related_id: fileData.relatedId || null, file_url: fileData.fileUrl, file_name: fileData.fileName, updated_at: new Date().toISOString() }]).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating downloadable file:', error);
        throw error;
    }
}

async function updateDownloadableFile(fileId, fileData) {
    try {
        const { data, error } = await supabase.from('downloadable_files').update({ file_type: fileData.fileType, related_id: fileData.relatedId || null, file_url: fileData.fileUrl, file_name: fileData.fileName, updated_at: new Date().toISOString() }).eq('id', fileId).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating downloadable file:', error);
        throw error;
    }
}

async function deleteDownloadableFile(fileId) {
    try {
        const { error } = await supabase.from('downloadable_files').delete().eq('id', fileId);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting downloadable file:', error);
        throw error;
    }
}