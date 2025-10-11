// Resume Management - Data Functions
// Phase 8: Resume Admin Panel (Entry Types & Timeline Entries)

// Global state
let allEntryTypes = [];
let allTimelineEntries = [];
let currentEditingEntryTypeId = null;
let currentEditingEntryId = null;

// ========== ENTRY TYPE CRUD OPERATIONS ==========

async function loadAllEntryTypes() {
    try {
        allEntryTypes = await getResumeEntryTypes();
        console.log('Loaded entry types:', allEntryTypes);
        return allEntryTypes;
    } catch (error) {
        console.error('Error loading entry types:', error);
        return [];
    }
}

async function createNewEntryType(entryTypeData) {
    try {
        const newEntryType = await createResumeEntryType({
            name: entryTypeData.name,
            icon: entryTypeData.icon || null,
            order: parseInt(entryTypeData.order) || 0
        });
        console.log('Created entry type:', newEntryType);
        return newEntryType;
    } catch (error) {
        console.error('Error creating entry type:', error);
        throw error;
    }
}

async function updateExistingEntryType(entryTypeId, entryTypeData) {
    try {
        const updated = await updateResumeEntryType(entryTypeId, {
            name: entryTypeData.name,
            icon: entryTypeData.icon || null,
            order: parseInt(entryTypeData.order) || 0
        });
        console.log('Updated entry type:', updated);
        return updated;
    } catch (error) {
        console.error('Error updating entry type:', error);
        throw error;
    }
}

async function deleteExistingEntryType(entryTypeId) {
    try {
        await deleteResumeEntryType(entryTypeId);
        console.log('Deleted entry type:', entryTypeId);
        return true;
    } catch (error) {
        console.error('Error deleting entry type:', error);
        throw error;
    }
}

// ========== TIMELINE ENTRIES CRUD OPERATIONS ==========

async function loadAllTimelineEntries() {
    try {
        allTimelineEntries = await getResumeEntries();
        console.log('Loaded timeline entries:', allTimelineEntries);
        return allTimelineEntries;
    } catch (error) {
        console.error('Error loading timeline entries:', error);
        return [];
    }
}

async function createNewTimelineEntry(entryData) {
    try {
        const newEntry = await createResumeEntry({
            entryTypeId: entryData.entryTypeId,
            title: entryData.title,
            subtitle: entryData.subtitle || null,
            dateStart: entryData.dateStart,
            dateEnd: entryData.dateEnd || null,
            description: entryData.description || null,
            mediaUrls: entryData.mediaUrls || [],
            order: parseInt(entryData.order) || 0,
            isFeatured: entryData.isFeatured || false
        });
        console.log('Created timeline entry:', newEntry);
        return newEntry;
    } catch (error) {
        console.error('Error creating timeline entry:', error);
        throw error;
    }
}

async function updateExistingTimelineEntry(entryId, entryData) {
    try {
        const updated = await updateResumeEntry(entryId, {
            entryTypeId: entryData.entryTypeId,
            title: entryData.title,
            subtitle: entryData.subtitle || null,
            dateStart: entryData.dateStart,
            dateEnd: entryData.dateEnd || null,
            description: entryData.description || null,
            mediaUrls: entryData.mediaUrls || [],
            order: parseInt(entryData.order) || 0,
            isFeatured: entryData.isFeatured || false
        });
        console.log('Updated timeline entry:', updated);
        return updated;
    } catch (error) {
        console.error('Error updating timeline entry:', error);
        throw error;
    }
}

async function deleteExistingTimelineEntry(entryId) {
    try {
        await deleteResumeEntry(entryId);
        console.log('Deleted timeline entry:', entryId);
        return true;
    } catch (error) {
        console.error('Error deleting timeline entry:', error);
        throw error;
    }
}

// ========== COUNT ENTRIES BY TYPE ==========

async function countEntriesByType(entryTypeId) {
    try {
        const entries = await getResumeEntriesByType(entryTypeId);
        return entries.length;
    } catch (error) {
        console.error('Error counting entries:', error);
        return 0;
    }
}

// ========== VALIDATION FUNCTIONS - ENTRY TYPES ==========

function validateEntryTypeData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Entry type name is required');
    }
    
    if (data.name && data.name.trim().length > 50) {
        errors.push('Entry type name must be 50 characters or less');
    }
    
    if (data.icon && data.icon.length > 5) {
        errors.push('Icon must be 5 characters or less (single emoji recommended)');
    }
    
    const order = parseInt(data.order);
    if (isNaN(order) || order < 0) {
        errors.push('Display order must be a positive number');
    }
    
    return errors;
}

function checkDuplicateEntryTypeName(name, excludeId = null) {
    const normalizedName = name.toLowerCase().trim();
    return allEntryTypes.some(type => 
        type.name.toLowerCase().trim() === normalizedName && 
        type.id !== excludeId
    );
}

// ========== VALIDATION FUNCTIONS - TIMELINE ENTRIES ==========

function validateTimelineEntryData(data) {
    const errors = [];
    
    if (!data.entryTypeId || data.entryTypeId.trim().length === 0) {
        errors.push('Entry type is required');
    }
    
    if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required');
    }
    
    if (data.title && data.title.trim().length > 200) {
        errors.push('Title must be 200 characters or less');
    }
    
    if (data.subtitle && data.subtitle.trim().length > 200) {
        errors.push('Subtitle must be 200 characters or less');
    }
    
    if (!data.dateStart) {
        errors.push('Start date is required');
    }
    
    // Validate date format (YYYY-MM-DD)
    if (data.dateStart && !isValidDateFormat(data.dateStart)) {
        errors.push('Start date must be in YYYY-MM-DD format');
    }
    
    if (data.dateEnd && !isValidDateFormat(data.dateEnd)) {
        errors.push('End date must be in YYYY-MM-DD format');
    }
    
    // Validate end date is after start date
    if (data.dateStart && data.dateEnd) {
        if (new Date(data.dateEnd) < new Date(data.dateStart)) {
            errors.push('End date must be after start date');
        }
    }
    
    const order = parseInt(data.order);
    if (isNaN(order) || order < 0) {
        errors.push('Display order must be a positive number');
    }
    
    return errors;
}

function isValidDateFormat(dateString) {
    // Check YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if valid date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// ========== UTILITY FUNCTIONS - ENTRY TYPES ==========

function getEntryTypeIcon(icon) {
    if (icon && icon.trim().length > 0) {
        return icon.trim();
    }
    return '📋'; // Default icon
}

function formatEntryTypeForDisplay(entryType) {
    return {
        id: entryType.id,
        name: entryType.name,
        icon: getEntryTypeIcon(entryType.icon),
        order: entryType.order_index || 0,
        created_at: entryType.created_at
    };
}

function getEntryTypeById(entryTypeId) {
    return allEntryTypes.find(type => type.id === entryTypeId);
}

// ========== UTILITY FUNCTIONS - TIMELINE ENTRIES ==========

function parseMediaUrls(mediaUrlsString) {
    if (!mediaUrlsString || mediaUrlsString.trim().length === 0) {
        return [];
    }
    
    // Split by comma and trim each URL
    return mediaUrlsString
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);
}

function formatMediaUrlsForDisplay(mediaUrls) {
    if (!mediaUrls || mediaUrls.length === 0) {
        return '';
    }
    
    return mediaUrls.join(', ');
}

function formatDateForDisplay(dateString) {
    if (!dateString) return 'Present';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
}

function formatDateRangeForDisplay(dateStart, dateEnd) {
    const start = formatDateForDisplay(dateStart);
    const end = dateEnd ? formatDateForDisplay(dateEnd) : 'Present';
    return `${start} – ${end}`;
}

function getTimelineEntryById(entryId) {
    return allTimelineEntries.find(entry => entry.id === entryId);
}

// ========== FILTERING FUNCTIONS ==========

function filterEntriesByType(entryTypeId) {
    if (!entryTypeId || entryTypeId === '') {
        return allTimelineEntries;
    }
    
    return allTimelineEntries.filter(entry => entry.entry_type_id === entryTypeId);
}

// ========== INITIALIZATION ==========

async function initializeResumeData() {
    try {
        await loadAllEntryTypes();
        await loadAllTimelineEntries();
        console.log('Resume data initialized');
        return true;
    } catch (error) {
        console.error('Error initializing resume data:', error);
        return false;
    }
}

// ========== PRE-POPULATE DEFAULT ENTRY TYPES ==========

async function createDefaultEntryTypes() {
    const defaultTypes = [
        { name: 'Jobs', icon: '💼', order: 1 },
        { name: 'Education', icon: '🎓', order: 2 },
        { name: 'Projects', icon: '🚀', order: 3 },
        { name: 'Awards', icon: '🏆', order: 4 },
        { name: 'Publications', icon: '📚', order: 5 }
    ];
    
    try {
        for (const type of defaultTypes) {
            // Check if already exists
            if (!checkDuplicateEntryTypeName(type.name)) {
                await createNewEntryType(type);
            }
        }
        console.log('Default entry types created');
        return true;
    } catch (error) {
        console.error('Error creating default entry types:', error);
        return false;
    }
}