// content-list-display.js
// Handles rendering and interaction with the content list

/**
 * Load all content from database
 */
async function loadContent() {
    try {
        window.contentManagement.allContent = await getAllContent();
        displayContent();
    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('contentList').innerHTML = '<p class="error">Error loading content. Please refresh the page.</p>';
    }
}

/**
 * Display content list with edit/delete buttons
 */
function displayContent() {
    const list = document.getElementById('contentList');
    
    if (window.contentManagement.allContent.length === 0) {
        list.innerHTML = '<p class="no-data">No content yet. Create your first content item above!</p>';
        return;
    }

    list.innerHTML = window.contentManagement.allContent.map(item => {
        // Find category and subcategory names
        let categoryName = 'Unknown';
        let subcategoryName = 'Unknown';
        
        for (let cat of window.contentManagement.categories) {
            if (cat.subcategories) {
                const sub = cat.subcategories.find(s => s.id === item.subcategory_id);
                if (sub) {
                    categoryName = cat.name;
                    subcategoryName = sub.name;
                    break;
                }
            }
        }

        // Build metadata sections
        const metadata = [];
        if (item.author_name) {
            metadata.push(`<div class="content-metadata"><strong>Author:</strong> ${item.author_name}</div>`);
        }
        if (item.publication_name) {
            metadata.push(`<div class="content-metadata"><strong>Published in:</strong> ${item.publication_name}</div>`);
        }
        if (item.publication_date) {
            metadata.push(`<div class="content-metadata"><strong>Date:</strong> ${item.publication_date}</div>`);
        }
        if (item.download_enabled) {
            metadata.push(`<div class="content-metadata"><strong>Download:</strong> ✅ Enabled</div>`);
        }

        return `
            <div class="content-item">
                <div class="content-item-header">
                    <div>
                        <h3>${escapeHtml(item.title)}</h3>
                        ${item.subtitle ? `<p class="content-subtitle">${escapeHtml(item.subtitle)}</p>` : ''}
                        <div class="content-meta">
                            <span class="content-type">${item.type}</span>
                            <span class="content-category">${categoryName} → ${subcategoryName}</span>
                        </div>
                        ${metadata.join('')}
                    </div>
                    <div class="content-actions">
                        <button class="btn-edit" data-content-id="${item.id}">Edit</button>
                        <button class="btn-delete" data-content-id="${item.id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Attach event listeners to buttons
    list.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            window.editContent(this.getAttribute('data-content-id'));
        });
    });
    
    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            handleDeleteContent(this.getAttribute('data-content-id'));
        });
    });
}

/**
 * Handle delete content button click
 */
function handleDeleteContent(contentId) {
    const content = window.contentManagement.allContent.find(c => c.id === contentId);
    if (!content) return;

    if (!confirm(`Are you sure you want to delete "${content.title}"?\n\nThis cannot be undone.`)) {
        return;
    }
    
    deleteContent(contentId)
        .then(() => {
            alert('Content deleted successfully!');
            loadContent();
        })
        .catch(error => {
            console.error('Delete error:', error);
            alert('Error deleting content: ' + error.message);
        });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose functions globally
window.loadContent = loadContent;
window.displayContent = displayContent;