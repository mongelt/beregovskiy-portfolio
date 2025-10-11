// Downloads Management - UI Functions
// Phase 8 Session 4

// ========== SETUP BUTTONS ==========

function setupDownloadButtons() {
    // Full Resume
    document.getElementById('saveFullResumeBtn').addEventListener('click', () => {
        saveResumeFile('resume_full', 'fullResumeUrl', 'fullResumeFilename', 'fullResumeStatus');
    });
    document.getElementById('deleteFullResumeBtn').addEventListener('click', () => {
        deleteResumeFile('resume_full', 'fullResumeStatus');
    });
    
    // Condensed Resume
    document.getElementById('saveCondensedResumeBtn').addEventListener('click', () => {
        saveResumeFile('resume_condensed', 'condensedResumeUrl', 'condensedResumeFilename', 'condensedResumeStatus');
    });
    document.getElementById('deleteCondensedResumeBtn').addEventListener('click', () => {
        deleteResumeFile('resume_condensed', 'condensedResumeStatus');
    });
    
    // Portfolio
    document.getElementById('savePortfolioBtn').addEventListener('click', () => {
        saveResumeFile('portfolio', 'portfolioUrl', 'portfolioFilename', 'portfolioStatus');
    });
    document.getElementById('deletePortfolioBtn').addEventListener('click', () => {
        deleteResumeFile('portfolio', 'portfolioStatus');
    });
}

// ========== SAVE RESUME FILE ==========

async function saveResumeFile(fileType, urlFieldId, filenameFieldId, statusId) {
    const url = document.getElementById(urlFieldId).value.trim();
    const filename = document.getElementById(filenameFieldId).value.trim();
    
    if (!url) {
        showStatus(statusId, 'Please enter a URL', 'error');
        return;
    }
    
    if (!validateUrl(url)) {
        showStatus(statusId, 'Please enter a valid URL', 'error');
        return;
    }
    
    try {
        await saveDownloadFile(fileType, url, filename);
        showStatus(statusId, 'Saved successfully!', 'success');
        await loadAllDownloads();
        renderDownloadPreviews();
    } catch (error) {
        showStatus(statusId, 'Error: ' + error.message, 'error');
    }
}

// ========== DELETE RESUME FILE ==========

async function deleteResumeFile(fileType, statusId) {
    if (!confirm('Remove this file? This cannot be undone.')) return;
    
    try {
        await deleteDownloadFile(fileType);
        showStatus(statusId, 'Removed successfully', 'success');
        await loadAllDownloads();
        renderDownloadPreviews();
    } catch (error) {
        showStatus(statusId, 'Error: ' + error.message, 'error');
    }
}

// ========== RENDER PREVIEWS ==========

function renderDownloadPreviews() {
    // Full Resume
    const fullResume = getDownloadByType('resume_full');
    if (fullResume) {
        document.getElementById('fullResumePreview').style.display = 'block';
        document.getElementById('fullResumeLink').href = fullResume.file_url;
        document.getElementById('fullResumeLink').textContent = fullResume.file_name;
        document.getElementById('fullResumeUrl').value = fullResume.file_url;
        document.getElementById('fullResumeFilename').value = fullResume.file_name;
    } else {
        document.getElementById('fullResumePreview').style.display = 'none';
    }
    
    // Condensed Resume
    const condensedResume = getDownloadByType('resume_condensed');
    if (condensedResume) {
        document.getElementById('condensedResumePreview').style.display = 'block';
        document.getElementById('condensedResumeLink').href = condensedResume.file_url;
        document.getElementById('condensedResumeLink').textContent = condensedResume.file_name;
        document.getElementById('condensedResumeUrl').value = condensedResume.file_url;
        document.getElementById('condensedResumeFilename').value = condensedResume.file_name;
    } else {
        document.getElementById('condensedResumePreview').style.display = 'none';
    }
    
    // Portfolio
    const portfolio = getDownloadByType('portfolio');
    if (portfolio) {
        document.getElementById('portfolioPreview').style.display = 'block';
        document.getElementById('portfolioLink').href = portfolio.file_url;
        document.getElementById('portfolioLink').textContent = portfolio.file_name;
        document.getElementById('portfolioUrl').value = portfolio.file_url;
        document.getElementById('portfolioFilename').value = portfolio.file_name;
    } else {
        document.getElementById('portfolioPreview').style.display = 'none';
    }
}

// ========== RENDER STATS ==========

function renderDownloadableStats() {
    document.getElementById('totalDownloadableCount').textContent = downloadableContentStats.total;
    document.getElementById('articlesDownloadableCount').textContent = downloadableContentStats.articles;
    document.getElementById('imagesDownloadableCount').textContent = downloadableContentStats.images;
    document.getElementById('videosDownloadableCount').textContent = downloadableContentStats.videos;
}

// ========== STATUS ==========

function showStatus(statusId, message, type) {
    const statusDiv = document.getElementById(statusId);
    statusDiv.textContent = message;
    statusDiv.className = `message ${type}`;
    statusDiv.style.display = 'block';
    setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', async function() {
    const initialized = await initializeDownloadsData();
    
    if (initialized) {
        setupDownloadButtons();
        renderDownloadPreviews();
        renderDownloadableStats();
    }
});