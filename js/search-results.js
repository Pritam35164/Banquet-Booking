// Search Results Page JavaScript

let allVenues = [];
let filteredVenues = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadVenuesFromData();
    loadFiltersFromURL();
    applyFilters();
    setupEventListeners();
    
    // Check if user is logged in and update navigation
    updateNavigation();
    
    // Setup independent scrolling for filters sidebar
    setupSidebarScroll();
    
    // Clear navigation flags
    sessionStorage.removeItem('navigatingHome');
    sessionStorage.removeItem('navigatingSearch');
});

// Setup independent scrolling for filters sidebar
function setupSidebarScroll() {
    const sidebar = document.querySelector('.filters-sidebar');
    if (!sidebar) return;
    
    let isScrollingInSidebar = false;
    
    // Track when mouse enters sidebar
    sidebar.addEventListener('mouseenter', function() {
        isScrollingInSidebar = true;
    });
    
    // Track when mouse leaves sidebar
    sidebar.addEventListener('mouseleave', function() {
        isScrollingInSidebar = false;
    });
    
    // Prevent page scroll when scrolling inside sidebar
    sidebar.addEventListener('wheel', function(e) {
        const scrollTop = sidebar.scrollTop;
        const scrollHeight = sidebar.scrollHeight;
        const height = sidebar.clientHeight;
        const wheelDelta = e.deltaY;
        const isScrollingDown = wheelDelta > 0;
        const isScrollingUp = wheelDelta < 0;
        
        // Check if sidebar can scroll in the direction of the wheel
        const canScrollDown = scrollTop < scrollHeight - height;
        const canScrollUp = scrollTop > 0;
        
        // Only prevent default if sidebar can actually scroll in that direction
        if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
            e.stopPropagation();
        }
    }, { passive: false });
}

// Update navigation based on login status
function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const navActions = document.querySelector('.nav-actions');
    
    if (user && navActions) {
        const dashboardUrl = user.role === 'owner' ? 'admin-dashboard.html' : 'client-dashboard.html';
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

// Load venues data
function loadVenuesFromData() {
    // Load from localStorage and merge with default venuesData
    const storedVenues = JSON.parse(localStorage.getItem('venues') || '[]');
    
    // Merge stored venues with default venues, avoiding duplicates
    const mergedVenues = [...venuesData];
    storedVenues.forEach(storedVenue => {
        const existingIndex = mergedVenues.findIndex(v => v.id === storedVenue.id);
        if (existingIndex >= 0) {
            // Update existing venue
            mergedVenues[existingIndex] = storedVenue;
        } else {
            // Add new venue
            mergedVenues.push(storedVenue);
        }
    });
    
    allVenues = mergedVenues;
    filteredVenues = [...allVenues];
}

// Load filters from URL parameters
function loadFiltersFromURL() {
    const city = getUrlParameter('city');
    const date = getUrlParameter('date');
    const guests = getUrlParameter('guests');
    
    if (city) {
        document.getElementById('cityFilter').value = city;
    }
    if (date) {
        document.getElementById('dateFilter').value = date;
    }
    if (guests) {
        document.getElementById('guestsFilter').value = guests;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Price range slider
    const priceRange = document.getElementById('priceRange');
    const maxPrice = document.getElementById('maxPrice');
    
    priceRange.addEventListener('input', function() {
        maxPrice.textContent = formatCurrency(parseInt(this.value));
    });
    
    // Filter checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // Set minimum date
    const dateFilter = document.getElementById('dateFilter');
    const today = new Date().toISOString().split('T')[0];
    dateFilter.setAttribute('min', today);
}

// Apply all filters
function applyFilters() {
    const city = document.getElementById('cityFilter').value;
    const date = document.getElementById('dateFilter').value;
    const guests = parseInt(document.getElementById('guestsFilter').value) || 0;
    const maxPrice = parseInt(document.getElementById('priceRange').value);
    const sortBy = document.getElementById('sortBy').value;
    
    // Get selected capacity ranges
    const capacityFilters = Array.from(document.querySelectorAll('input[name="capacity"]:checked'))
        .map(cb => cb.value);
    
    // Get selected amenities
    const amenitiesFilters = Array.from(document.querySelectorAll('input[name="amenities"]:checked'))
        .map(cb => cb.value);
    
    // Filter venues
    filteredVenues = allVenues.filter(venue => {
        // City filter
        if (city && venue.city !== city) return false;
        
        // Guest capacity filter
        if (guests > 0 && (guests < venue.capacity.min || guests > venue.capacity.max)) {
            return false;
        }
        
        // Capacity range filter
        if (capacityFilters.length > 0) {
            const matchesCapacity = capacityFilters.some(range => {
                if (range === '0-300') return venue.capacity.max <= 300;
                if (range === '300-500') return venue.capacity.min <= 500 && venue.capacity.max >= 300;
                if (range === '500-800') return venue.capacity.min <= 800 && venue.capacity.max >= 500;
                if (range === '800+') return venue.capacity.max > 800;
                return false;
            });
            if (!matchesCapacity) return false;
        }
        
        // Price filter
        if (venue.pricePerPlate > maxPrice) return false;
        
        // Amenities filter
        if (amenitiesFilters.length > 0) {
            const hasAllAmenities = amenitiesFilters.every(amenity => 
                venue.amenities.includes(amenity)
            );
            if (!hasAllAmenities) return false;
        }
        
        return true;
    });
    
    // Sort venues
    sortVenues(sortBy);
    
    // Display results
    displayVenues();
}

// Sort venues
function sortVenues(sortBy) {
    switch(sortBy) {
        case 'price-low':
            filteredVenues.sort((a, b) => a.pricePerPlate - b.pricePerPlate);
            break;
        case 'price-high':
            filteredVenues.sort((a, b) => b.pricePerPlate - a.pricePerPlate);
            break;
        case 'capacity':
            filteredVenues.sort((a, b) => b.capacity.max - a.capacity.max);
            break;
        default:
            // Recommended (default order)
            break;
    }
}

// Display venues
function displayVenues() {
    const venuesList = document.getElementById('venuesList');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = `${filteredVenues.length} Venue${filteredVenues.length !== 1 ? 's' : ''} Found`;
    
    if (filteredVenues.length === 0) {
        venuesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No venues found</h3>
                <p>Try adjusting your filters to see more results</p>
                <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    venuesList.innerHTML = filteredVenues.map(venue => `
        <div class="venue-card-horizontal" onclick="goToVenueDetails(${venue.id})">
            <div class="venue-image">
                <img src="${venue.images && venue.images[0] ? venue.images[0] : 'https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800'}" alt="${venue.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800';">
                ${venue.id <= 2 ? '<div class="venue-badge">Featured</div>' : ''}
            </div>
            <div class="venue-info">
                <div class="venue-main-info">
                    <h3>${venue.name}</h3>
                    <div class="venue-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${venue.location}</span>
                    </div>
                    <p class="venue-description">${venue.description}</p>
                    
                    <div class="venue-highlights">
                        <div class="highlight-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <div class="highlight-label">Capacity</div>
                                <div class="highlight-value">${venue.capacity.min}-${venue.capacity.max} Guests</div>
                            </div>
                        </div>
                        <div class="highlight-item">
                            <i class="fas fa-tags"></i>
                            <div>
                                <div class="highlight-label">Per Plate</div>
                                <div class="highlight-value">${formatCurrency(venue.pricePerPlate)}</div>
                            </div>
                        </div>
                        <div class="highlight-item">
                            <i class="fas fa-building"></i>
                            <div>
                                <div class="highlight-label">Hall Rental</div>
                                <div class="highlight-value">${formatCurrency(venue.hallRental)}</div>
                            </div>
                        </div>
                        <div class="highlight-item">
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <div class="highlight-label">Amenities</div>
                                <div class="highlight-value">${venue.amenities.length}+ Features</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="venue-footer">
                    <div class="venue-pricing">
                        <div class="price-item">
                            <span class="label">Starting from</span>
                            <span class="amount">${formatCurrency(venue.pricePerPlate)}/plate</span>
                        </div>
                    </div>
                    <div class="venue-actions">
                        <a href="venue-details.html?id=${venue.id}" class="btn-view-details" onclick="event.stopPropagation()">
                            View Details <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Go to venue details page
function goToVenueDetails(venueId) {
    window.location.href = `venue-details.html?id=${venueId}`;
}

// Clear all filters
function clearFilters() {
    // Clear search inputs
    document.getElementById('cityFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('guestsFilter').value = '';
    
    // Reset price range
    const priceRange = document.getElementById('priceRange');
    priceRange.value = 5000;
    document.getElementById('maxPrice').textContent = formatCurrency(5000);
    
    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    
    // Reset sort
    document.getElementById('sortBy').value = 'recommended';
    
    // Apply filters (will show all venues)
    applyFilters();
    
    // Update URL
    window.history.pushState({}, '', 'search-results.html');
}
