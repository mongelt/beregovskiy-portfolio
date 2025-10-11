// Content Management - Profile Functions
// Split from content.js for better organization

// ========== PROFILE FUNCTIONS ==========

async function getProfileData() {
    try {
        const { data, error } = await supabase
            .from('profile')
            .select('*')
            .limit(1)
            .single();
        
        if (error) {
            // If no profile exists yet, return default structure
            if (error.code === 'PGRST116') {
                return {
                    full_name: '',
                    location: '',
                    job_title_1: '',
                    job_title_2: '',
                    job_title_3: '',
                    job_title_4: '',
                    profile_image: '',
                    email: '',
                    phone: '',
                    linkedin: '',
                    short_bio: '',
                    full_bio: '',
                    skills: [],
                    languages: [],
                    education: '',
                    show_email: true,
                    show_phone: true,
                    show_social_media: true
                };
            }
            throw error;
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

async function updateProfile(profileData) {
    try {
        // Check if profile exists
        const { data: existing } = await supabase
            .from('profile')
            .select('id')
            .limit(1)
            .single();
        
        if (existing) {
            // Update existing profile
            const { data, error } = await supabase
                .from('profile')
                .update({
                    full_name: profileData.full_name,
                    location: profileData.location,
                    job_title_1: profileData.job_title_1,
                    job_title_2: profileData.job_title_2 || null,
                    job_title_3: profileData.job_title_3 || null,
                    job_title_4: profileData.job_title_4 || null,
                    profile_image: profileData.profile_image || null,
                    email: profileData.email || null,
                    phone: profileData.phone || null,
                    linkedin: profileData.linkedin || null,
                    short_bio: profileData.short_bio,
                    full_bio: profileData.full_bio,
                    skills: profileData.skills || [],
                    languages: profileData.languages || [],
                    education: profileData.education || null,
                    show_email: profileData.show_email !== false,
                    show_phone: profileData.show_phone !== false,
                    show_social_media: profileData.show_social_media !== false
                })
                .eq('id', existing.id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('profile')
                .insert([{
                    full_name: profileData.full_name,
                    location: profileData.location,
                    job_title_1: profileData.job_title_1,
                    job_title_2: profileData.job_title_2 || null,
                    job_title_3: profileData.job_title_3 || null,
                    job_title_4: profileData.job_title_4 || null,
                    profile_image: profileData.profile_image || null,
                    email: profileData.email || null,
                    phone: profileData.phone || null,
                    linkedin: profileData.linkedin || null,
                    short_bio: profileData.short_bio,
                    full_bio: profileData.full_bio,
                    skills: profileData.skills || [],
                    languages: profileData.languages || [],
                    education: profileData.education || null,
                    show_email: profileData.show_email !== false,
                    show_phone: profileData.show_phone !== false,
                    show_social_media: profileData.show_social_media !== false
                }])
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