// Shared Navigation Component for Admin Panel
// Phase 8 - Session 4 Bug Fixes

function renderAdminNav(activePage) {
    const navItems = [
        { href: 'index.html', label: 'Content', page: 'content' },
        { href: 'categories.html', label: 'Categories', page: 'categories' },
        { href: 'profile.html', label: 'Profile', page: 'profile' },
        { href: 'collections.html', label: 'Collections', page: 'collections' },
        { href: 'resume.html', label: 'Resume', page: 'resume' },
        { href: 'downloads.html', label: 'Downloads', page: 'downloads' }
    ];
    
    let navHTML = '';
    
    navItems.forEach(item => {
        const activeClass = item.page === activePage ? ' class="active"' : '';
        navHTML += `<a href="${item.href}"${activeClass}>${item.label}</a>\n                `;
    });
    
    navHTML += '<a href="../index.html" class="btn-secondary">← Back to Portfolio</a>';
    
    return navHTML;
}

// Auto-render navigation if container exists
document.addEventListener('DOMContentLoaded', function() {
    const navContainer = document.getElementById('adminNavContainer');
    if (navContainer && typeof ADMIN_ACTIVE_PAGE !== 'undefined') {
        navContainer.innerHTML = renderAdminNav(ADMIN_ACTIVE_PAGE);
    }
});