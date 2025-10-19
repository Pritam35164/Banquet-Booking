// Client Dashboard JavaScript

let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    currentUser = checkAuth();
    
    // Debug logging
    console.log('Current user:', currentUser);
    console.log('User role:', currentUser?.role);
    
    if (!currentUser) {
        console.log('No user found, redirecting to auth');
        window.location.href = 'auth.html';
        return;
    }
    
    if (currentUser.role !== 'client') {
        console.log('User is not a client (role:', currentUser.role, '), redirecting to correct dashboard');
        window.location.href = 'admin-dashboard.html';
        return;
    }
    
    loadUserData();
    loadBookings();
    loadPayments();
    
    // Clear navigation flags
    sessionStorage.removeItem('navigatingHome');
    sessionStorage.removeItem('navigatingSearch');
    sessionStorage.removeItem('navigatingSchedule');
});

// Go to search while staying logged in
function goToSearch() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        // Store a flag to indicate user is navigating intentionally
        sessionStorage.setItem('navigatingSearch', 'true');
    }
    window.location.href = 'search-results.html';
}

// Load user data
function loadUserData() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone;
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const sectionMap = {
        'bookings': 'bookingsSection',
        'payments': 'paymentsSection',
        'profile': 'profileSection'
    };
    
    document.getElementById(sectionMap[section]).style.display = 'block';
    
    // Add active to clicked nav item
    event.target.closest('.nav-item').classList.add('active');
    
    // Reload data when switching sections
    if (section === 'bookings') {
        loadBookings();
    } else if (section === 'payments') {
        loadPayments();
    }
}

// Load bookings
function loadBookings() {
    const bookingsGrid = document.getElementById('bookingsGrid');
    
    // Get bookings from localStorage
    const allBookings = getBookings();
    const bookings = allBookings.filter(b => b.clientEmail === currentUser.email)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    console.log('Loading bookings for:', currentUser.email);
    console.log('All bookings in storage:', allBookings);
    console.log('Filtered bookings for user:', bookings);
    
    displayBookings(bookings);
}

// Display bookings in grid
function displayBookings(bookings) {
    const bookingsGrid = document.getElementById('bookingsGrid');
    
    if (bookings.length === 0) {
        bookingsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Bookings Yet</h3>
                <p>Start exploring amazing venues and make your first booking!</p>
                <a href="search-results.html" class="btn btn-primary">
                    <i class="fas fa-search"></i> Find Venues
                </a>
            </div>
        `;
        return;
    }
    
    bookingsGrid.innerHTML = bookings.map(booking => {
        const statusClass = booking.status.toLowerCase().replace(/\s/g, '-');
        
        return `
            <div class="booking-card">
                <div class="booking-info">
                    <h3>${booking.venueName}</h3>
                    <div class="booking-details">
                        <div class="detail-item">
                            <span class="detail-label">Booking ID</span>
                            <span class="detail-value">${booking.id}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Event Date</span>
                            <span class="detail-value">${formatDate(booking.date)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Guests</span>
                            <span class="detail-value">${booking.guests} guests</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Location</span>
                            <span class="detail-value">${booking.venueLocation}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Amount</span>
                            <span class="detail-value">${formatCurrency(booking.total)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Payment Status</span>
                            <span class="detail-value">
                                <span class="badge badge-${booking.paymentStatus === 'Paid' ? 'paid' : booking.paymentStatus === 'Unpaid' ? 'pending' : 'cancelled'}">
                                    ${booking.paymentStatus}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="booking-actions">
                    <span class="badge badge-${statusClass}">${booking.status}</span>
                    ${(booking.status === 'Confirmed' || booking.status === 'Confirmed - Awaiting Payment') && booking.paymentStatus === 'Unpaid' ? 
                        `<a href="payment.html?booking=${booking.id}" class="btn btn-success">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </a>` : ''}
                    ${booking.paymentStatus === 'Paid' ? 
                        `<button class="btn btn-outline" disabled>
                            <i class="fas fa-check-circle"></i> Paid
                        </button>` : ''}
                    ${booking.status !== 'Cancelled' && booking.paymentStatus !== 'Paid' ? 
                        `<button onclick="cancelBooking('${booking.id}')" class="btn btn-danger">
                            <i class="fas fa-times-circle"></i> Cancel
                        </button>` : ''}
                    <a href="venue-details.html?id=${booking.venueId}" class="btn btn-outline">
                        <i class="fas fa-eye"></i> View Venue
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// Load payments
function loadPayments() {
    const allBookings = getBookings();
    const bookings = allBookings.filter(b => 
        b.clientEmail === currentUser.email && 
        (b.status === 'Confirmed' || b.status === 'Confirmed - Awaiting Payment' || b.paymentStatus === 'Paid')
    ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); // Sort by newest first
    
    const paymentsList = document.getElementById('paymentsList');
    
    console.log('Loading payments for:', currentUser.email);
    console.log('Found payment records:', bookings.length);
    
    if (bookings.length === 0) {
        paymentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No Invoices Yet</h3>
                <p>Your invoices will appear here once bookings are confirmed</p>
            </div>
        `;
        return;
    }
    
    paymentsList.innerHTML = bookings.map(booking => {
        const invoiceDate = new Date(booking.createdAt);
        const dueDate = new Date(booking.date);
        dueDate.setDate(dueDate.getDate() - 7); // Payment due 7 days before event
        
        return `
            <div class="payment-card">
                <div class="payment-header">
                    <div>
                        <h3>Invoice #${booking.id}</h3>
                        <p style="color: var(--text-light); margin-top: 0.25rem;">
                            ${booking.venueName}
                        </p>
                    </div>
                    <span class="badge badge-${booking.paymentStatus === 'Paid' ? 'paid' : 'pending'}">
                        ${booking.paymentStatus}
                    </span>
                </div>
                
                <div class="payment-details">
                    <div class="detail-item">
                        <span class="detail-label">Invoice Date</span>
                        <span class="detail-value">${formatDate(invoiceDate.toISOString().split('T')[0])}</span>
                    </div>
                    ${booking.paymentStatus === 'Paid' && booking.paidAt ? `
                        <div class="detail-item">
                            <span class="detail-label">Payment Date</span>
                            <span class="detail-value">${formatDate(new Date(booking.paidAt).toISOString().split('T')[0])}</span>
                        </div>
                    ` : `
                        <div class="detail-item">
                            <span class="detail-label">Due Date</span>
                            <span class="detail-value">${formatDate(dueDate.toISOString().split('T')[0])}</span>
                        </div>
                    `}
                    <div class="detail-item">
                        <span class="detail-label">Event Date</span>
                        <span class="detail-value">${formatDate(booking.date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Guests</span>
                        <span class="detail-value">${booking.guests} guests</span>
                    </div>
                </div>
                
                <div class="payment-breakdown">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Per Plate (${booking.guests} × ${formatCurrency(booking.pricePerPlate)})</span>
                        <span>${formatCurrency(booking.guests * booking.pricePerPlate)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Hall Rental</span>
                        <span>${formatCurrency(booking.hallRental)}</span>
                    </div>
                </div>
                
                <div class="payment-footer">
                    <div>
                        <span style="color: var(--text-light);">Total Amount</span>
                        <div class="total-amount">${formatCurrency(booking.total)}</div>
                    </div>
                    ${booking.paymentStatus === 'Unpaid' ? 
                        `<a href="payment.html?booking=${booking.id}" class="btn btn-success">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </a>` :
                        `<button class="btn btn-outline" disabled>
                            <i class="fas fa-check-circle"></i> Paid
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    
    // Update current user
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    
    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    showNotification('Profile updated successfully!', 'success');
    document.getElementById('userName').textContent = name;
}

// Cancel booking
function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    const booking = updateBooking(bookingId, {
        status: 'Cancelled',
        paymentStatus: 'Cancelled'
    });
    
    if (booking) {
        showNotification('Booking cancelled successfully', 'success');
        loadBookings();
        loadPayments();
    } else {
        showNotification('Failed to cancel booking', 'error');
    }
}
