// Resume Timeline - Main JavaScript
// Phase 10 Session 1: Page Structure & Timeline Component

// ========== GLOBAL STATE ==========

let resumeEntries = [];
let entryTypes = [];
let timelineYearRange = { earliest: null, latest: null };

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Resume timeline page loaded');
    await initializeResumePage();
});

async function initializeResumePage() {
    try {
        // Load data from Supabase
        await loadResumeData();
        
        // Calculate timeline year range
        calculateTimelineRange();
        
        // Render timeline
        renderTimeline();
        
        console.log('Resume timeline initialized successfully');
    } catch (error) {
        console.error('Error initializing resume page:', error);
        showErrorState();
    }
}

// ========== DATA LOADING ==========

async function loadResumeData() {
    try {
        // Load entry types (Jobs, Education, etc.)
        entryTypes = await getResumeEntryTypes();
        console.log('Loaded entry types:', entryTypes);
        
        // Load all resume entries
        resumeEntries = await getResumeEntries();
        console.log('Loaded resume entries:', resumeEntries);
        
        if (resumeEntries.length === 0) {
            showEmptyState();
            return;
        }
        
        return true;
    } catch (error) {
        console.error('Error loading resume data:', error);
        throw error;
    }
}

// ========== TIMELINE CALCULATION ==========

function calculateTimelineRange() {
    if (resumeEntries.length === 0) {
        timelineYearRange = {
            earliest: new Date().getFullYear(),
            latest: new Date().getFullYear()
        };
        return;
    }
    
    let earliestDate = null;
    let latestDate = null;
    
    resumeEntries.forEach(entry => {
        const startDate = new Date(entry.date_start);
        const endDate = entry.date_end ? new Date(entry.date_end) : new Date();
        
        if (!earliestDate || startDate < earliestDate) {
            earliestDate = startDate;
        }
        
        if (!latestDate || endDate > latestDate) {
            latestDate = endDate;
        }
    });
    
    timelineYearRange = {
        earliest: earliestDate.getFullYear(),
        latest: latestDate.getFullYear()
    };
    
    console.log('Timeline range:', timelineYearRange);
}

// ========== TIMELINE RENDERING ==========

function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    
    if (resumeEntries.length === 0) {
        showEmptyState();
        return;
    }
    
    // Sort entries by start date (newest first)
    const sortedEntries = [...resumeEntries].sort((a, b) => {
        return new Date(b.date_start) - new Date(a.date_start);
    });
    
    // Build timeline HTML
    let timelineHTML = '<div class="timeline-track">';
    
    // Add year markers on the left
    timelineHTML += '<div class="timeline-years">';
    for (let year = timelineYearRange.latest; year >= timelineYearRange.earliest; year--) {
        timelineHTML += `<div class="year-marker" data-year="${year}">${year}</div>`;
    }
    timelineHTML += '</div>';
    
    // Add vertical line
    timelineHTML += '<div class="timeline-line"></div>';
    
    // Add entries
    timelineHTML += '<div class="timeline-entries">';
    
    sortedEntries.forEach((entry, index) => {
        timelineHTML += renderTimelineEntry(entry, index);
    });
    
    timelineHTML += '</div>'; // Close timeline-entries
    timelineHTML += '</div>'; // Close timeline-track
    
    container.innerHTML = timelineHTML;
    
    // Add event listeners after rendering
    attachEventListeners();
}

function renderTimelineEntry(entry, index) {
    const entryType = entryTypes.find(t => t.id === entry.entry_type_id);
    const typeIcon = entryType ? (entryType.icon || '📋') : '📋';
    const typeName = entryType ? entryType.name : 'Unknown Type';
    
    const startDate = new Date(entry.date_start);
    const endDate = entry.date_end ? new Date(entry.date_end) : null;
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endMonth = endDate ? endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
    
    const duration = calculateDuration(startDate, endDate);
    const hasMedia = entry.media_urls && entry.media_urls.length > 0;
    
    return `
        <div class="timeline-entry" data-entry-id="${entry.id}" data-index="${index}">
            <div class="timeline-dot">
                <span class="dot-icon">${typeIcon}</span>
            </div>
            
            <div class="entry-card">
                <div class="entry-header">
                    <div class="entry-type-badge">
                        <span class="type-icon">${typeIcon}</span>
                        <span class="type-name">${typeName}</span>
                    </div>
                    <div class="entry-dates">
                        <span class="date-range">${startMonth} — ${endMonth}</span>
                        <span class="duration">${duration}</span>
                    </div>
                </div>
                
                <div class="entry-content">
                    <h3 class="entry-title">${entry.title}</h3>
                    ${entry.subtitle ? `<p class="entry-subtitle">${entry.subtitle}</p>` : ''}
                    
                    ${entry.description ? `
                        <div class="entry-description">
                            <p>${entry.description}</p>
                        </div>
                    ` : ''}
                    
                    ${hasMedia ? `
                        <div class="entry-media">
                            <p class="media-count">
                                <i class="fas fa-paperclip"></i>
                                ${entry.media_urls.length} ${entry.media_urls.length === 1 ? 'attachment' : 'attachments'}
                            </p>
                        </div>
                    ` : ''}
                </div>
                
                ${entry.is_featured ? `
                    <div class="featured-badge">
                        <i class="fas fa-star"></i>
                        Featured in Portfolio
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ========== UTILITY FUNCTIONS ==========

function calculateDuration(startDate, endDate) {
    const end = endDate || new Date();
    const start = startDate;
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (months < 12) {
        return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        if (remainingMonths === 0) {
            return `${years} ${years === 1 ? 'year' : 'years'}`;
        } else {
            return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
        }
    }
}

// ========== EVENT LISTENERS ==========

function attachEventListeners() {
    // Entry card click handlers will be added in Session 2 (expand/collapse)
    console.log('Event listeners attached');
}

// ========== EMPTY STATE ==========

function showEmptyState() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <h2>No Resume Entries Yet</h2>
            <p>Your resume timeline is empty. Add entries in the admin panel to get started!</p>
            <a href="management/resume.html" class="btn-primary">
                <i class="fas fa-plus"></i>
                Add Resume Entries
            </a>
        </div>
    `;
}

// ========== ERROR STATE ==========

function showErrorState() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Error Loading Resume</h2>
            <p>There was a problem loading your resume timeline. Please try again.</p>
            <button class="btn-primary" onclick="location.reload()">
                <i class="fas fa-redo"></i>
                Reload Page
            </button>
        </div>
    `;
}

// ========== SCROLL BEHAVIOR ==========

// Smooth scroll when page loads
window.addEventListener('load', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});