// Venue Details JavaScript

let currentVenue = null;
let currentDate = new Date();
let selectedDate = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if returning from login
    const returnVenueId = sessionStorage.getItem('returnToVenue');
    const savedDate = sessionStorage.getItem('selectedDate');
    
    const venueId = returnVenueId ? parseInt(returnVenueId) : parseInt(getUrlParameter('id'));
    
    if (venueId) {
        loadVenueDetails(venueId);
        renderCalendar();
        loadReviews();
        
        // Restore selected date if returning from login
        if (savedDate && returnVenueId) {
            setTimeout(() => {
                selectDate(savedDate);
                sessionStorage.removeItem('returnToVenue');
                sessionStorage.removeItem('selectedDate');
                showNotification('Please complete your booking', 'info');
            }, 500);
        }
    } else {
        window.location.href = 'search-results.html';
    }
    
    // Check if user is logged in
    updateNavigation();
    
    // Check authentication and setup booking form
    const user = checkAuth();
    setupBookingForm(user);
    
    // Clear navigation flags
    sessionStorage.removeItem('navigatingHome');
    sessionStorage.removeItem('navigatingSearch');
});

// Update navigation based on auth status
function updateNavigation() {
    const user = checkAuth();
    const navActions = document.getElementById('navActions');
    
    if (user) {
        navActions.innerHTML = `
            <a href="#" onclick="goToDashboard('${user.role}'); return false;" class="btn btn-outline">
                <i class="fas fa-user"></i> Dashboard
            </a>
            <button onclick="logout()" class="btn btn-primary">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    }
}

// Navigate to appropriate dashboard with flag
function goToDashboard(role) {
    sessionStorage.setItem('navigatingDashboard', 'true');
    window.location.href = role === 'owner' ? 'admin-dashboard.html' : 'client-dashboard.html';
}

// Setup booking form based on authentication
function setupBookingForm(user) {
    const bookingForm = document.getElementById('bookingForm');
    const bookingNote = document.querySelector('.booking-note');
    
    if (!user) {
        // Show login requirement banner
        const loginBanner = document.createElement('div');
        loginBanner.className = 'login-required-banner';
        loginBanner.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            text-align: center;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        `;
        loginBanner.innerHTML = `
            <i class="fas fa-lock" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
            <h3 style="margin: 0.5rem 0; font-size: 1.25rem;">Login Required to Book</h3>
            <p style="margin: 0.5rem 0 1rem 0; opacity: 0.9;">Please login or create an account to make a booking</p>
            <a href="auth.html" class="btn btn-primary" style="background: white; color: #667eea; font-weight: 600;">
                <i class="fas fa-sign-in-alt"></i> Login / Sign Up
            </a>
        `;
        bookingForm.parentElement.insertBefore(loginBanner, bookingForm);
        
        // Disable all form fields
        const formInputs = bookingForm.querySelectorAll('input, textarea, button');
        formInputs.forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.6';
            input.style.cursor = 'not-allowed';
        });
        
        // Update booking note
        bookingNote.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <small>Please <a href="auth.html" style="color: var(--primary-color); font-weight: 600;">login or sign up</a> to submit a booking request.</small>
        `;
    } else if (user.role === 'client') {
        // Pre-fill and lock user data for logged-in clients
        document.getElementById('bookingName').value = user.name || '';
        document.getElementById('bookingEmail').value = user.email || '';
        document.getElementById('bookingPhone').value = user.phone || '';
        
        document.getElementById('bookingName').readOnly = true;
        document.getElementById('bookingEmail').readOnly = true;
        document.getElementById('bookingPhone').readOnly = true;
        
        // Style readonly fields
        document.getElementById('bookingName').style.background = '#f3f4f6';
        document.getElementById('bookingEmail').style.background = '#f3f4f6';
        document.getElementById('bookingPhone').style.background = '#f3f4f6';
    } else if (user.role === 'owner') {
        // Show message for venue owners
        const ownerMessage = document.createElement('div');
        ownerMessage.className = 'owner-message';
        ownerMessage.style.cssText = `
            background: #fef3c7;
            color: #92400e;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            text-align: center;
            border: 2px solid #fbbf24;
        `;
        ownerMessage.innerHTML = `
            <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
            <h3 style="margin: 0.5rem 0; font-size: 1.25rem;">Venue Owner Account</h3>
            <p style="margin: 0.5rem 0;">Venue owners cannot make bookings. Please use a client account to book venues.</p>
        `;
        bookingForm.parentElement.insertBefore(ownerMessage, bookingForm);
        
        // Disable form
        const formInputs = bookingForm.querySelectorAll('input, textarea, button');
        formInputs.forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.6';
        });
    }
}

// Load venue details
function loadVenueDetails(venueId) {
    currentVenue = getVenueById(venueId);
    
    if (!currentVenue) {
        window.location.href = 'search-results.html';
        return;
    }
    
    renderGallery();
    renderHeader();
    renderDescription();
    renderAmenities();
    renderPricing();
}

// Render gallery
function renderGallery() {
    const galleryContainer = document.getElementById('venueGallery');
    
    // Ensure images array exists and has valid URLs
    const validImages = currentVenue.images && currentVenue.images.length > 0 
        ? currentVenue.images 
        : ['https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800'];
    
    galleryContainer.innerHTML = `
        <div class="gallery-main">
            <img src="${validImages[0]}" alt="${currentVenue.name}" id="mainImage" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800';">
        </div>
        ${validImages.length > 1 ? `
            <div class="gallery-thumbnails">
                ${validImages.map((img, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', ${index})">
                        <img src="${img}" alt="${currentVenue.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800';">
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
}

// Change main image
function changeMainImage(imageSrc, index) {
    document.getElementById('mainImage').src = imageSrc;
    
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    document.querySelectorAll('.thumbnail')[index].classList.add('active');
}

// Render header
function renderHeader() {
    const headerContainer = document.getElementById('venueHeader');
    
    headerContainer.innerHTML = `
        <h1>${currentVenue.name}</h1>
        <div class="venue-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${currentVenue.location}</span>
        </div>
        <div class="venue-meta">
            <div class="meta-item">
                <i class="fas fa-users"></i>
                <span>${currentVenue.capacity.min}-${currentVenue.capacity.max} Guests</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-rupee-sign"></i>
                <span>From ${formatCurrency(currentVenue.pricePerPlate)}/plate</span>
            </div>
        </div>
    `;
}

// Render description
function renderDescription() {
    const descContainer = document.getElementById('venueDescription');
    
    descContainer.innerHTML = `
        <h2><i class="fas fa-info-circle"></i> About This Venue</h2>
        <p>${currentVenue.description}</p>
    `;
}

// Render amenities
function renderAmenities() {
    const amenitiesContainer = document.getElementById('venueAmenities');
    
    const amenityIcons = {
        'Parking': 'fa-parking',
        'AC': 'fa-wind',
        'Catering': 'fa-utensils',
        'DJ': 'fa-music',
        'WiFi': 'fa-wifi',
        'Garden': 'fa-tree',
        'AV System': 'fa-video',
        'Decorations': 'fa-gifts',
        'Valet Parking': 'fa-car',
        'Stage': 'fa-theater-masks',
        'Outdoor Seating': 'fa-chair',
        'Green Room': 'fa-door-closed'
    };
    
    amenitiesContainer.innerHTML = `
        <h2><i class="fas fa-check-circle"></i> Amenities & Features</h2>
        <div class="amenities-grid">
            ${currentVenue.amenities.map(amenity => `
                <div class="amenity-item">
                    <i class="fas ${amenityIcons[amenity] || 'fa-check'}"></i>
                    <span>${amenity}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Render pricing
function renderPricing() {
    const pricingContainer = document.getElementById('venuePricing');
    
    pricingContainer.innerHTML = `
        <h2><i class="fas fa-tag"></i> Pricing</h2>
        <div class="pricing-grid">
            <div class="pricing-card">
                <h3>Per Plate</h3>
                <div class="price">${formatCurrency(currentVenue.pricePerPlate)}</div>
                <div class="price-unit">Per guest</div>
            </div>
            <div class="pricing-card">
                <h3>Hall Rental</h3>
                <div class="price">${formatCurrency(currentVenue.hallRental)}</div>
                <div class="price-unit">Base fee</div>
            </div>
        </div>
    `;
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Create calendar grid
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const cellDate = new Date(year, month, day);
        const dateString = cellDate.toISOString().split('T')[0];
        
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        // Check if past date
        if (cellDate < today && cellDate.toDateString() !== today.toDateString()) {
            dayCell.classList.add('past');
        } else {
            // Randomly mark some dates as booked for demo
            if (Math.random() > 0.7) {
                dayCell.classList.add('booked');
            } else {
                dayCell.classList.add('available');
                dayCell.onclick = () => selectDate(dateString, dayCell);
            }
        }
        
        // Check if selected
        if (selectedDate === dateString) {
            dayCell.classList.add('selected');
        }
        
        calendarGrid.appendChild(dayCell);
    }
}

// Select date
function selectDate(dateString, element) {
    selectedDate = dateString;
    
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selection to clicked day
    element.classList.add('selected');
    
    // Update selected date display
    const displayDate = formatDate(dateString);
    document.getElementById('selectedDateDisplay').innerHTML = `
        <i class="fas fa-calendar-check"></i>
        <span>${displayDate}</span>
    `;
    
    // Enable booking form
    document.getElementById('submitBookingBtn').disabled = false;
}

// Navigate calendar
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Submit booking
function submitBooking(event) {
    event.preventDefault();
    
    // Check if user is logged in first
    const user = checkAuth();
    if (!user) {
        showNotification('Please login to make a booking', 'error');
        setTimeout(() => {
            // Store venue ID and selected date to return after login
            sessionStorage.setItem('returnToVenue', currentVenue.id);
            if (selectedDate) {
                sessionStorage.setItem('selectedDate', selectedDate);
            }
            window.location.href = 'auth.html';
        }, 1500);
        return;
    }
    
    // Only clients can make bookings
    if (user.role !== 'client') {
        showNotification('Only clients can make bookings. Venue owners cannot book their own venues.', 'error');
        return;
    }
    
    if (!selectedDate) {
        showNotification('Please select a date first', 'error');
        return;
    }
    
    const bookingData = {
        venueId: currentVenue.id,
        venueName: currentVenue.name,
        venueLocation: currentVenue.location,
        date: selectedDate,
        clientName: user.name,
        clientEmail: user.email,
        clientPhone: user.phone,
        guests: parseInt(document.getElementById('bookingGuests').value),
        notes: document.getElementById('bookingNotes').value,
        pricePerPlate: currentVenue.pricePerPlate,
        hallRental: currentVenue.hallRental
    };
    
    // Check guest capacity
    if (bookingData.guests < currentVenue.capacity.min || bookingData.guests > currentVenue.capacity.max) {
        showNotification(`Guest count must be between ${currentVenue.capacity.min} and ${currentVenue.capacity.max}`, 'error');
        return;
    }
    
    // Calculate total
    bookingData.total = (bookingData.guests * bookingData.pricePerPlate) + bookingData.hallRental;
    
    // Save booking
    const booking = addBooking(bookingData);
    
    console.log('Booking submitted:', booking);
    showNotification('Booking request submitted successfully!', 'success');
    
    // Reset form
    document.getElementById('bookingForm').reset();
    selectedDate = null;
    document.getElementById('selectedDateDisplay').innerHTML = `
        <i class="fas fa-calendar-check"></i>
        <span>Select a date from calendar</span>
    `;
    
    // Redirect to client dashboard
    setTimeout(() => {
        window.location.href = 'client-dashboard.html';
    }, 2000);
}

// Star Rating Input Handler
document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.star-rating-input i');
    const ratingInput = document.getElementById('reviewRating');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            ratingInput.value = rating;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = this.getAttribute('data-rating');
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '';
                }
            });
        });
    });
    
    document.querySelector('.star-rating-input').addEventListener('mouseleave', function() {
        const currentRating = ratingInput.value;
        stars.forEach((s, index) => {
            s.style.color = '';
        });
    });
});

// Load reviews for current venue
function loadReviews() {
    if (!currentVenue) return;
    
    const reviews = getReviews(currentVenue.id);
    const reviewsList = document.getElementById('reviewsList');
    const reviewStats = document.getElementById('reviewStats');
    
    // Check if user is logged in and is a client
    const user = checkAuth();
    const writeReviewSection = document.getElementById('writeReviewSection');
    
    if (user && user.role === 'client') {
        // Check if user has already reviewed
        const userReview = reviews.find(r => r.userEmail === user.email);
        if (userReview) {
            writeReviewSection.innerHTML = '<p class="info-message"><i class="fas fa-check-circle"></i> You have already reviewed this venue.</p>';
        }
    } else if (!user) {
        writeReviewSection.innerHTML = '<p class="info-message"><i class="fas fa-info-circle"></i> Please <a href="auth.html">login</a> to write a review.</p>';
    } else {
        writeReviewSection.style.display = 'none';
    }
    
    // Calculate stats
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No reviews yet. Be the first to review this venue!</p>
            </div>
        `;
        return;
    }
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(r => ratingCounts[r.rating - 1]++);
    
    // Update stats
    document.querySelector('.rating-number').textContent = avgRating.toFixed(1);
    document.querySelector('.review-count').textContent = `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
    document.getElementById('averageStars').innerHTML = getStarsHTML(avgRating);
    
    // Rating breakdown
    const breakdownHTML = ratingCounts.reverse().map((count, index) => {
        const rating = 5 - index;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return `
            <div class="rating-bar">
                <span class="rating-label">${rating} <i class="fas fa-star"></i></span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="rating-count">${count}</span>
            </div>
        `;
    }).join('');
    document.getElementById('ratingBreakdown').innerHTML = breakdownHTML;
    
    // Display reviews
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="reviewer-name">${review.userName}</div>
                        <div class="review-date">${formatDate(review.createdAt)}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${getStarsHTML(review.rating)}
                </div>
            </div>
            <div class="review-text">
                ${review.text}
            </div>
        </div>
    `).join('');
}

// Get stars HTML
function getStarsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            html += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

// Submit review
function submitReview(event) {
    event.preventDefault();
    
    const user = checkAuth();
    if (!user || user.role !== 'client') {
        showNotification('Please login as a client to submit a review', 'error');
        return;
    }
    
    const rating = parseInt(document.getElementById('reviewRating').value);
    const text = document.getElementById('reviewText').value;
    
    if (!rating) {
        showNotification('Please select a rating', 'error');
        return;
    }
    
    const review = {
        venueId: currentVenue.id,
        venueName: currentVenue.name,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        rating: rating,
        text: text,
        createdAt: new Date().toISOString()
    };
    
    addReview(review);
    showNotification('Review submitted successfully!', 'success');
    
    // Reset form
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewRating').value = '';
    document.querySelectorAll('.star-rating-input i').forEach(s => {
        s.classList.remove('fas');
        s.classList.add('far');
    });
    
    // Reload reviews
    loadReviews();
}
