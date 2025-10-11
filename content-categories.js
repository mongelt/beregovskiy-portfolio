// Content Management - Categories & Subcategories
// Split from content.js for better organization

// ========== CATEGORY FUNCTIONS ==========

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
        return data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function getCategoryById(categoryId) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select(`
                *,
                subcategories (*)
            `)
            .eq('id', categoryId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

async function createCategory(categoryData) {
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

// ========== SUBCATEGORY FUNCTIONS ==========

async function getSubcategoriesByCategory(categoryId) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', categoryId)
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return [];
    }
}

async function getSubcategoryById(subcategoryId) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('id', subcategoryId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        return null;
    }
}

async function createSubcategory(subcategoryData) {
    try {
        const { data, error } = await supabase
            .from('subcategories')
            .insert([{
                name: subcategoryData.name,
                category_id: subcategoryData.categoryId,
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
                category_id: subcategoryData.categoryId,
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