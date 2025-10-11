// Content Management - Content Items CRUD
// Split from content.js for better organization

// ========== CONTENT CRUD FUNCTIONS ==========

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
        console.error('Error fetching content by subcategory:', error);
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
        console.error('Error fetching content by ID:', error);
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
                external_download_url: contentData.externalDownloadUrl || null
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
                download_enabled: contentData.downloadEnabled || false,
                external_download_url: contentData.externalDownloadUrl || null
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

// ========== CONTENT TYPE HELPERS ==========

function getContentTypeIcon(type) {
    const icons = {
        'article': '📄',
        'image': '🖼️',
        'video': '🎥',
        'audio': '🎵'
    };
    return icons[type] || '📄';
}

function validateContentData(contentData) {
    const errors = [];
    
    if (!contentData.title || contentData.title.trim().length === 0) {
        errors.push('Title is required');
    }
    
    if (!contentData.type || !['article', 'image', 'video', 'audio'].includes(contentData.type)) {
        errors.push('Valid content type is required (article, image, video, or audio)');
    }
    
    if (!contentData.content || contentData.content.trim().length === 0) {
        errors.push('Content is required');
    }
    
    if (!contentData.subcategoryId) {
        errors.push('Subcategory is required');
    }
    
    return errors;
}