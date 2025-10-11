// Content Management - Downloads Functions (Phase 7)
// Split from content.js for better organization

// ========== DOWNLOADABLE FILES ==========

async function getDownloadableFiles() {
    try {
        const { data, error } = await supabase
            .from('downloadable_files')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching downloadable files:', error);
        return [];
    }
}

async function getDownloadableFilesByType(fileType) {
    try {
        const { data, error } = await supabase
            .from('downloadable_files')
            .select('*')
            .eq('file_type', fileType)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching files by type:', error);
        return [];
    }
}

async function createDownloadableFile(fileData) {
    try {
        const { data, error } = await supabase
            .from('downloadable_files')
            .insert([{
                file_type: fileData.file_type,
                related_id: fileData.related_id || null,
                file_url: fileData.file_url,
                file_name: fileData.file_name
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating downloadable file:', error);
        throw error;
    }
}

async function updateDownloadableFile(fileId, fileData) {
    try {
        const updateData = {};
        
        if (fileData.file_type !== undefined) updateData.file_type = fileData.file_type;
        if (fileData.related_id !== undefined) updateData.related_id = fileData.related_id;
        if (fileData.file_url !== undefined) updateData.file_url = fileData.file_url;
        if (fileData.file_name !== undefined) updateData.file_name = fileData.file_name;
        if (fileData.updated_at !== undefined) updateData.updated_at = fileData.updated_at;
        
        const { data, error } = await supabase
            .from('downloadable_files')
            .update(updateData)
            .eq('id', fileId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating downloadable file:', error);
        throw error;
    }
}

async function deleteDownloadableFile(fileId) {
    try {
        const { error } = await supabase
            .from('downloadable_files')
            .delete()
            .eq('id', fileId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting downloadable file:', error);
        throw error;
    }
}