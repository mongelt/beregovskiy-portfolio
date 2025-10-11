// Content Management - Resume Functions (Phase 7)
// Split from content.js for better organization

// ========== RESUME ENTRY TYPES ==========

async function getResumeEntryTypes() {
    try {
        const { data, error } = await supabase
            .from('resume_entry_types')
            .select('*')
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching entry types:', error);
        return [];
    }
}

async function createResumeEntryType(entryTypeData) {
    try {
        const { data, error } = await supabase
            .from('resume_entry_types')
            .insert([{
                name: entryTypeData.name,
                icon: entryTypeData.icon || null,
                order_index: entryTypeData.order || 0
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating entry type:', error);
        throw error;
    }
}

async function updateResumeEntryType(entryTypeId, entryTypeData) {
    try {
        const { data, error } = await supabase
            .from('resume_entry_types')
            .update({
                name: entryTypeData.name,
                icon: entryTypeData.icon || null,
                order_index: entryTypeData.order || 0
            })
            .eq('id', entryTypeId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating entry type:', error);
        throw error;
    }
}

async function deleteResumeEntryType(entryTypeId) {
    try {
        const { error } = await supabase
            .from('resume_entry_types')
            .delete()
            .eq('id', entryTypeId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting entry type:', error);
        throw error;
    }
}

// ========== RESUME ENTRIES ==========

async function getResumeEntries() {
    try {
        const { data, error } = await supabase
            .from('resume_entries')
            .select('*')
            .order('date_start', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching resume entries:', error);
        return [];
    }
}

async function getResumeEntriesByType(entryTypeId) {
    try {
        const { data, error } = await supabase
            .from('resume_entries')
            .select('*')
            .eq('entry_type_id', entryTypeId)
            .order('date_start', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching entries by type:', error);
        return [];
    }
}

async function getFeaturedResumeEntries() {
    try {
        const { data, error } = await supabase
            .from('resume_entries')
            .select('*')
            .eq('is_featured', true)
            .order('date_start', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching featured entries:', error);
        return [];
    }
}

async function createResumeEntry(entryData) {
    try {
        const { data, error } = await supabase
            .from('resume_entries')
            .insert([{
                entry_type_id: entryData.entryTypeId,
                title: entryData.title,
                subtitle: entryData.subtitle || null,
                date_start: entryData.dateStart,
                date_end: entryData.dateEnd || null,
                description: entryData.description || null,
                media_urls: entryData.mediaUrls || [],
                order_index: entryData.order || 0,
                is_featured: entryData.isFeatured || false
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating resume entry:', error);
        throw error;
    }
}

async function updateResumeEntry(entryId, entryData) {
    try {
        const { data, error } = await supabase
            .from('resume_entries')
            .update({
                entry_type_id: entryData.entryTypeId,
                title: entryData.title,
                subtitle: entryData.subtitle || null,
                date_start: entryData.dateStart,
                date_end: entryData.dateEnd || null,
                description: entryData.description || null,
                media_urls: entryData.mediaUrls || [],
                order_index: entryData.order || 0,
                is_featured: entryData.isFeatured || false
            })
            .eq('id', entryId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating resume entry:', error);
        throw error;
    }
}

async function deleteResumeEntry(entryId) {
    try {
        const { error } = await supabase
            .from('resume_entries')
            .delete()
            .eq('id', entryId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting resume entry:', error);
        throw error;
    }
}