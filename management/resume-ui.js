// Resume Management - UI Functions
// Phase 8: Resume Admin Panel (Entry Types & Timeline Entries)

// ========== ENTRY TYPE FORM HANDLING ==========

function setupEntryTypeForm() {
    const form = document.getElementById('entryTypeForm');
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleEntryTypeFormSubmit();
    });
    
    // Cancel button
    document.getElementById('entryTypeCancelBtn').addEventListener('click', resetEntryTypeForm);
}

async function handleEntryTypeFormSubmit() {
    const submitBtn = document.getElementById('entryTypeSubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentEditingEntryTypeId ? 'Updating...' : 'Creating...';
    
    const entryTypeData = {
        name: document.getElementById('entryTypeName').value.trim(),
        icon: document.getElementById('entryTypeIcon').value.trim(),
        order: document.getElementById('entryTypeOrder').value
    };
    
    // Validate data
    const errors = validateEntryTypeData(entryTypeData);
    if (errors.length > 0) {
        showEntryTypeStatus('Error: ' + errors.join(', '), 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    // Check for duplicate name
    if (checkDuplicateEntryTypeName(entryTypeData.name, currentEditingEntryTypeId)) {
        showEntryTypeStatus('Error: An entry type with this name already exists', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        if (currentEditingEntryTypeId) {
            await updateExistingEntryType(currentEditingEntryTypeId, entryTypeData);
            showEntryTypeStatus('Entry type updated successfully!', 'success');
        } else {
            await createNewEntryType(entryTypeData);
            showEntryTypeStatus('Entry type created successfully!', 'success');
        }
        
        resetEntryTypeForm();
        await loadAllEntryTypes();
        renderEntryTypesList();
        populateEntryTypeDropdowns(); // Update dropdowns
    } catch (error) {
        showEntryTypeStatus('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function resetEntryTypeForm() {
    document.getElementById('entryTypeForm').reset();
    document.getElementById('editEntryTypeId').value = '';
    currentEditingEntryTypeId = null;
    document.getElementById('entry-type-form-title').textContent = 'Manage Resume Entry Types';
    document.getElementById('entryTypeSubmitBtn').textContent = 'Create Entry Type';
    document.getElementById('entryTypeCancelBtn').style.display = 'none';
}

// ========== ENTRY TYPES LIST RENDERING ==========

async function renderEntryTypesList() {
    const container = document.getElementById('entryTypesList');
    
    if (allEntryTypes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="no-data">No entry types yet. Create your first entry type above!</p>
                <button class="btn-primary" id="createDefaultsBtn">Create Default Entry Types</button>
            </div>
        `;
        
        // Add event listener for default creation button
        document.getElementById('createDefaultsBtn').addEventListener('click', async function() {
            this.disabled = true;
            this.textContent = 'Creating...';
            await createDefaultEntryTypes();
            await loadAllEntryTypes();
            renderEntryTypesList();
            populateEntryTypeDropdowns(); // Update dropdowns after creating defaults
        });
        
        return;
    }
    
    // Get entry counts for each type
    const typesWithCounts = await Promise.all(
        allEntryTypes.map(async type => {
            const count = await countEntriesByType(type.id);
            return { ...type, entryCount: count };
        })
    );
    
    container.innerHTML = typesWithCounts.map(type => {
        const formatted = formatEntryTypeForDisplay(type);
        
        return `
            <div class="entry-type-card" data-type-id="${type.id}">
                <div class="entry-type-header">
                    <div class="entry-type-icon">${formatted.icon}</div>
                    <div class="entry-type-info">
                        <h3>${formatted.name}</h3>
                        <div class="entry-type-meta">
                            <span class="entry-type-order">Order: ${formatted.order}</span>
                            <span class="entry-type-count">${type.entryCount} ${type.entryCount === 1 ? 'entry' : 'entries'}</span>
                        </div>
                    </div>
                    <div class="entry-type-actions">
                        <button class="btn-edit" data-type-id="${type.id}">Edit</button>
                        <button class="btn-delete" data-type-id="${type.id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editEntryType(this.getAttribute('data-type-id'));
        });
    });
    
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteEntryTypeWithConfirm(this.getAttribute('data-type-id'));
        });
    });
}

// ========== EDIT/DELETE ENTRY TYPE ==========

function editEntryType(entryTypeId) {
    const entryType = allEntryTypes.find(t => t.id === entryTypeId);
    if (!entryType) return;
    
    currentEditingEntryTypeId = entryTypeId;
    document.getElementById('editEntryTypeId').value = entryTypeId;
    document.getElementById('entryTypeName').value = entryType.name;
    document.getElementById('entryTypeIcon').value = entryType.icon || '';
    document.getElementById('entryTypeOrder').value = entryType.order_index || 0;
    
    document.getElementById('entry-type-form-title').textContent = 'Edit Entry Type';
    document.getElementById('entryTypeSubmitBtn').textContent = 'Update Entry Type';
    document.getElementById('entryTypeCancelBtn').style.display = 'inline-block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteEntryTypeWithConfirm(entryTypeId) {
    const entryType = allEntryTypes.find(t => t.id === entryTypeId);
    if (!entryType) return;
    
    // Check if entry type has entries
    const entryCount = await countEntriesByType(entryTypeId);
    
    let confirmMessage = `Delete entry type "${entryType.name}"?`;
    
    if (entryCount > 0) {
        confirmMessage += `\n\nWARNING: This entry type has ${entryCount} timeline ${entryCount === 1 ? 'entry' : 'entries'}. Deleting this entry type will also DELETE all associated timeline entries!\n\nThis cannot be undone.`;
    } else {
        confirmMessage += '\n\nThis cannot be undone.';
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        await deleteExistingEntryType(entryTypeId);
        showEntryTypeStatus('Entry type deleted successfully', 'success');
        await loadAllEntryTypes();
        await loadAllTimelineEntries(); // Reload entries since some may have been deleted
        renderEntryTypesList();
        renderTimelineEntriesList();
        populateEntryTypeDropdowns(); // Update dropdowns
    } catch (error) {
        showEntryTypeStatus('Error deleting entry type: ' + error.message, 'error');
    }
}

// ========== TIMELINE ENTRY FORM HANDLING ==========

function setupTimelineEntryForm() {
    const form = document.getElementById('timelineEntryForm');
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleTimelineEntryFormSubmit();
    });
    
    // Cancel button
    document.getElementById('entryCancelBtn').addEventListener('click', resetTimelineEntryForm);
    
    // "Is Present" checkbox
    document.getElementById('entryIsPresent').addEventListener('change', function() {
        const endDateInput = document.getElementById('entryDateEnd');
        if (this.checked) {
            endDateInput.disabled = true;
            endDateInput.value = '';
        } else {
            endDateInput.disabled = false;
        }
    });
}

async function handleTimelineEntryFormSubmit() {
    const submitBtn = document.getElementById('entrySubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentEditingEntryId ? 'Updating...' : 'Creating...';
    
    const isPresent = document.getElementById('entryIsPresent').checked;
    const mediaUrlsString = document.getElementById('entryMediaUrls').value.trim();
    
    const entryData = {
        entryTypeId: document.getElementById('entryType').value,
        title: document.getElementById('entryTitle').value.trim(),
        subtitle: document.getElementById('entrySubtitle').value.trim(),
        dateStart: document.getElementById('entryDateStart').value,
        dateEnd: isPresent ? null : document.getElementById('entryDateEnd').value || null,
        description: document.getElementById('entryDescription').value.trim(),
        mediaUrls: parseMediaUrls(mediaUrlsString),
        order: document.getElementById('entryOrder').value,
        isFeatured: document.getElementById('entryIsFeatured').checked
    };
    
    // Validate data
    const errors = validateTimelineEntryData(entryData);
    if (errors.length > 0) {
        showEntryStatus('Error: ' + errors.join(', '), 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        if (currentEditingEntryId) {
            await updateExistingTimelineEntry(currentEditingEntryId, entryData);
            showEntryStatus('Timeline entry updated successfully!', 'success');
        } else {
            await createNewTimelineEntry(entryData);
            showEntryStatus('Timeline entry created successfully!', 'success');
        }
        
        resetTimelineEntryForm();
        await loadAllTimelineEntries();
        renderTimelineEntriesList();
        renderEntryTypesList(); // Update counts
    } catch (error) {
        showEntryStatus('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function resetTimelineEntryForm() {
    document.getElementById('timelineEntryForm').reset();
    document.getElementById('editEntryId').value = '';
    currentEditingEntryId = null;
    document.getElementById('entry-form-title').textContent = 'Create Timeline Entry';
    document.getElementById('entrySubmitBtn').textContent = 'Create Entry';
    document.getElementById('entryCancelBtn').style.display = 'none';
    document.getElementById('entryDateEnd').disabled = false;
}

// ========== TIMELINE ENTRIES LIST RENDERING ==========

function renderTimelineEntriesList() {
    const container = document.getElementById('timelineEntriesList');
    const filterValue = document.getElementById('filterEntryType').value;
    
    const filteredEntries = filterEntriesByType(filterValue);
    
    if (filteredEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="no-data">No timeline entries yet. Create your first entry above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredEntries.map(entry => {
        const entryType = getEntryTypeById(entry.entry_type_id);
        const typeIcon = entryType ? getEntryTypeIcon(entryType.icon) : '📋';
        const typeName = entryType ? entryType.name : 'Unknown Type';
        const dateRange = formatDateRangeForDisplay(entry.date_start, entry.date_end);
        const mediaCount = entry.media_urls ? entry.media_urls.length : 0;
        
        return `
            <div class="timeline-entry-card" data-entry-id="${entry.id}">
                <div class="timeline-entry-header">
                    <div class="timeline-entry-type">
                        <span class="timeline-type-icon">${typeIcon}</span>
                        <span class="timeline-type-name">${typeName}</span>
                    </div>
                    <div class="timeline-entry-actions">
                        <button class="btn-edit" data-entry-id="${entry.id}">Edit</button>
                        <button class="btn-delete" data-entry-id="${entry.id}">Delete</button>
                    </div>
                </div>
                
                <div class="timeline-entry-content">
                    <h3 class="timeline-entry-title">${entry.title}</h3>
                    ${entry.subtitle ? `<p class="timeline-entry-subtitle">${entry.subtitle}</p>` : ''}
                    <p class="timeline-entry-dates">${dateRange}</p>
                    
                    ${entry.description ? `
                        <div class="timeline-entry-description">
                            ${entry.description.substring(0, 150)}${entry.description.length > 150 ? '...' : ''}
                        </div>
                    ` : ''}
                    
                    <div class="timeline-entry-meta">
                        ${entry.is_featured ? '<span class="badge badge-featured">⭐ Featured</span>' : ''}
                        ${mediaCount > 0 ? `<span class="badge badge-media">📎 ${mediaCount} media</span>` : ''}
                        <span class="badge badge-order">Order: ${entry.order_index || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editTimelineEntry(this.getAttribute('data-entry-id'));
        });
    });
    
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteTimelineEntryWithConfirm(this.getAttribute('data-entry-id'));
        });
    });
}

// ========== EDIT/DELETE TIMELINE ENTRY ==========

function editTimelineEntry(entryId) {
    const entry = getTimelineEntryById(entryId);
    if (!entry) return;
    
    currentEditingEntryId = entryId;
    document.getElementById('editEntryId').value = entryId;
    document.getElementById('entryType').value = entry.entry_type_id;
    document.getElementById('entryTitle').value = entry.title;
    document.getElementById('entrySubtitle').value = entry.subtitle || '';
    document.getElementById('entryDateStart').value = entry.date_start;
    
    if (entry.date_end) {
        document.getElementById('entryDateEnd').value = entry.date_end;
        document.getElementById('entryIsPresent').checked = false;
        document.getElementById('entryDateEnd').disabled = false;
    } else {
        document.getElementById('entryDateEnd').value = '';
        document.getElementById('entryIsPresent').checked = true;
        document.getElementById('entryDateEnd').disabled = true;
    }
    
    document.getElementById('entryDescription').value = entry.description || '';
    document.getElementById('entryMediaUrls').value = formatMediaUrlsForDisplay(entry.media_urls);
    document.getElementById('entryIsFeatured').checked = entry.is_featured || false;
    document.getElementById('entryOrder').value = entry.order_index || 0;
    
    document.getElementById('entry-form-title').textContent = 'Edit Timeline Entry';
    document.getElementById('entrySubmitBtn').textContent = 'Update Entry';
    document.getElementById('entryCancelBtn').style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('timelineEntriesSection').scrollIntoView({ behavior: 'smooth' });
}

async function deleteTimelineEntryWithConfirm(entryId) {
    const entry = getTimelineEntryById(entryId);
    if (!entry) return;
    
    const confirmMessage = `Delete timeline entry "${entry.title}"?\n\nThis cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        await deleteExistingTimelineEntry(entryId);
        showEntryStatus('Timeline entry deleted successfully', 'success');
        await loadAllTimelineEntries();
        renderTimelineEntriesList();
        renderEntryTypesList(); // Update counts
    } catch (error) {
        showEntryStatus('Error deleting entry: ' + error.message, 'error');
    }
}

// ========== POPULATE DROPDOWNS ==========

function populateEntryTypeDropdowns() {
    // Populate entry type selection dropdown (for creating entries)
    const entryTypeSelect = document.getElementById('entryType');
    entryTypeSelect.innerHTML = '<option value="">Select entry type...</option>';
    
    allEntryTypes.forEach(type => {
        const formatted = formatEntryTypeForDisplay(type);
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = `${formatted.icon} ${formatted.name}`;
        entryTypeSelect.appendChild(option);
    });
    
    // Populate filter dropdown
    const filterSelect = document.getElementById('filterEntryType');
    const currentFilter = filterSelect.value; // Preserve selection
    filterSelect.innerHTML = '<option value="">All Types</option>';
    
    allEntryTypes.forEach(type => {
        const formatted = formatEntryTypeForDisplay(type);
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = `${formatted.icon} ${formatted.name}`;
        filterSelect.appendChild(option);
    });
    
    filterSelect.value = currentFilter; // Restore selection
}

// ========== FILTER CHANGE HANDLER ==========

function setupFilterChangeHandler() {
    document.getElementById('filterEntryType').addEventListener('change', function() {
        renderTimelineEntriesList();
    });
}

// ========== STATUS MESSAGES ==========

function showEntryTypeStatus(message, type) {
    const statusDiv = document.getElementById('entryTypeStatus');
    statusDiv.textContent = message;
    statusDiv.className = `message ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function showEntryStatus(message, type) {
    const statusDiv = document.getElementById('entryStatus');
    statusDiv.textContent = message;
    statusDiv.className = `message ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Resume management page loaded');
    
    const initialized = await initializeResumeData();
    
    if (initialized) {
        setupEntryTypeForm();
        setupTimelineEntryForm();
        setupFilterChangeHandler();
        populateEntryTypeDropdowns();
        renderEntryTypesList();
        renderTimelineEntriesList();
        console.log('Resume management initialized successfully');
    } else {
        showEntryTypeStatus('Error loading data. Please refresh the page.', 'error');
    }
});