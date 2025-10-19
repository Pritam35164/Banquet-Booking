// Homepage specific JavaScript

// Set minimum date for event date picker
document.addEventListener('DOMContentLoaded', function() {
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.setAttribute('min', today);
    }
    
    // Check if user is logged in and update navigation
    updateNavigation();
    
    // Clear navigation flags
    sessionStorage.removeItem('navigatingHome');
    sessionStorage.removeItem('navigatingSearch');
});

// Update navigation based on login status
function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const navActions = document.querySelector('.nav-actions');
    
    if (user && navActions) {
        navActions.innerHTML = `
            <a href="#" onclick="goToDashboard('${user.role}'); return false;" class="btn btn-outline">
                <i class="fas fa-user"></i> ${user.name}
            </a>
            <button onclick="logout()" class="btn btn-primary">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    }
}

// Navigate to dashboard while staying logged in
function goToDashboard(role) {
    sessionStorage.setItem('navigatingDashboard', 'true');
    const dashboardUrl = role === 'owner' ? 'admin-dashboard.html' : 'client-dashboard.html';
    window.location.href = dashboardUrl;
}

// Go to search while staying logged in
function goToSearch() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        sessionStorage.setItem('navigatingSearch', 'true');
    }
    window.location.href = 'search-results.html';
}

// Handle Enter key in search inputs
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation on page load
    updateNavigation();
    
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchVenues();
            }
        });
    });
});
