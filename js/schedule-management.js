// Schedule Management JavaScript

let currentDate = new Date();
let currentView = 'month';
let allBookings = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (!user) return;
    
    loadBookings();
    renderCalendar();
    
    // Clear navigation flags
    sessionStorage.removeItem('navigatingHome');
    sessionStorage.removeItem('navigatingSearch');
    sessionStorage.removeItem('navigatingSchedule');
});

// Check authentication
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!user) {
        // Only redirect if not navigating intentionally
        const isNavigating = sessionStorage.getItem('navigatingSchedule');
        if (!isNavigating) {
            window.location.href = 'auth.html';
            return null;
        }
    }
    
    if (user && user.role !== 'owner') {
        window.location.href = 'client-dashboard.html';
        return null;
    }
    
    return user;
}

// Go to home while staying logged in
function goToHome() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        // Store a flag to indicate user is navigating intentionally
        sessionStorage.setItem('navigatingHome', 'true');
    }
    window.location.href = 'index.html';
}

// Go to dashboard while staying logged in
function goToDashboard(section = 'dashboard') {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        sessionStorage.setItem('navigatingDashboard', 'true');
        sessionStorage.setItem('dashboardSection', section);
    }
    window.location.href = 'admin-dashboard.html';
}

// Load bookings from API or localStorage
async function loadBookings() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const token = localStorage.getItem('token');

        if (token) {
            // Try to fetch from API
            const response = await fetch(`/api/bookings?owner=${user._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                allBookings = data.bookings || data;
            } else {
                throw new Error('Failed to fetch bookings');
            }
        } else {
            throw new Error('No token');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        // Fallback to localStorage
        allBookings = JSON.parse(localStorage.getItem('bookings') || '[]').filter(
            booking => booking.venueName === JSON.parse(localStorage.getItem('currentUser')).venueName
        );
    }

    renderCalendar();
    if (currentView === 'list') {
        renderListView();
    }
}

// Calendar Navigation
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
}

// Switch between month and list view
function switchView(view) {
    currentView = view;
    
    document.getElementById('monthViewBtn').classList.toggle('active', view === 'month');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    
    document.getElementById('calendarView').style.display = view === 'month' ? 'block' : 'none';
    document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
    
    if (view === 'list') {
        renderListView();
    }
}

// Render Calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, month - 1, year, true);
        calendarGrid.appendChild(dayElement);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === todayDate && month === todayMonth && year === todayYear;
        const dayElement = createDayElement(day, month, year, false, isToday);
        calendarGrid.appendChild(dayElement);
    }
    
    // Next month days
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, month + 1, year, true);
        calendarGrid.appendChild(dayElement);
    }
}

// Create day element
function createDayElement(day, month, year, isOtherMonth = false, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Get bookings for this day
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBookings = allBookings.filter(booking => {
        const bookingDate = booking.date || booking.eventDate;
        if (!bookingDate) return false;
        const dateOnly = new Date(bookingDate).toISOString().split('T')[0];
        return dateOnly === dateStr;
    });
    
    // Display bookings
    if (dayBookings.length > 0) {
        const bookingsContainer = document.createElement('div');
        bookingsContainer.className = 'day-bookings';
        
        const maxDisplay = 2;
        dayBookings.slice(0, maxDisplay).forEach(booking => {
            const indicator = document.createElement('div');
            indicator.className = `booking-indicator ${booking.status.toLowerCase()}`;
            indicator.textContent = booking.clientName || 'Event';
            indicator.onclick = (e) => {
                e.stopPropagation();
                showBookingDetails(booking);
            };
            bookingsContainer.appendChild(indicator);
        });
        
        if (dayBookings.length > maxDisplay) {
            const moreText = document.createElement('div');
            moreText.className = 'more-bookings';
            moreText.textContent = `+${dayBookings.length - maxDisplay} more`;
            bookingsContainer.appendChild(moreText);
        }
        
        dayElement.appendChild(bookingsContainer);
    }
    
    // Click to add booking
    dayElement.onclick = () => {
        if (!isOtherMonth) {
            showDayBookings(dateStr, dayBookings);
        }
    };
    
    return dayElement;
}

// Note: showDayBookings function is defined later in the file with full day modal implementation

// Show booking details
function showBookingDetails(booking) {
    const modal = document.getElementById('bookingModal');
    const modalContent = document.getElementById('modalBookingDetails');
    
    const bookingDate = booking.date || booking.eventDate;
    const eventDate = new Date(bookingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modalContent.innerHTML = `
        <div class="modal-booking-header">
            <h2 class="modal-booking-title">${booking.clientName || 'Event Booking'}</h2>
            <p class="modal-booking-id">Booking ID: ${booking.bookingId || booking.id || 'N/A'}</p>
        </div>
        
        <div class="modal-booking-grid">
            <div class="modal-detail-item">
                <div class="modal-detail-label">Event Date</div>
                <div class="modal-detail-value">${eventDate}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Status</div>
                <div class="modal-detail-value">
                    <span class="badge badge-${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Client Email</div>
                <div class="modal-detail-value">${booking.clientEmail}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Client Phone</div>
                <div class="modal-detail-value">${booking.clientPhone}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Number of Guests</div>
                <div class="modal-detail-value">${booking.guests}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Total Amount</div>
                <div class="modal-detail-value">${formatCurrency(booking.totalAmount)}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">Payment Status</div>
                <div class="modal-detail-value">
                    <span class="badge badge-${booking.paymentStatus ? booking.paymentStatus.toLowerCase() : 'unpaid'}">
                        ${booking.paymentStatus || 'Unpaid'}
                    </span>
                </div>
            </div>
        </div>
        
        ${booking.notes ? `
            <div style="margin-top: 1.5rem;">
                <div class="modal-detail-label">Notes</div>
                <p style="margin-top: 0.5rem; color: var(--text-dark);">${booking.notes}</p>
            </div>
        ` : ''}
        
        <div class="modal-actions">
            ${booking.status === 'Pending' ? `
                <button class="btn btn-success" onclick="updateBookingStatus('${booking.id}', 'Confirmed')">
                    <i class="fas fa-check"></i> Confirm
                </button>
                <button class="btn btn-danger" onclick="updateBookingStatus('${booking.id}', 'Cancelled')">
                    <i class="fas fa-times"></i> Decline
                </button>
            ` : ''}
            <button class="btn btn-outline" onclick="closeBookingModal()">Close</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) {
        closeBookingModal();
    }
};

// Render list view
function renderListView() {
    const bookingsList = document.getElementById('bookingsList');
    
    if (allBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No bookings found</h3>
                <p>You don't have any bookings yet</p>
            </div>
        `;
        return;
    }
    
    // Sort bookings by date
    const sortedBookings = [...allBookings].sort((a, b) => {
        const dateA = a.date || a.eventDate;
        const dateB = b.date || b.eventDate;
        return new Date(dateA) - new Date(dateB);
    });
    
    bookingsList.innerHTML = sortedBookings.map(booking => {
        const bookingDate = booking.date || booking.eventDate;
        const eventDate = new Date(bookingDate).toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="list-booking-card" onclick='showBookingDetails(${JSON.stringify(booking).replace(/'/g, "&#39;")})'>
                <div class="list-booking-header">
                    <div class="list-booking-title">${booking.clientName || 'Event'}</div>
                    <span class="list-booking-status ${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
                <div class="list-booking-details">
                    <div class="list-detail-item">
                        <i class="fas fa-calendar"></i>
                        <span><span class="list-detail-label">Date:</span> ${eventDate}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-users"></i>
                        <span><span class="list-detail-label">Guests:</span> ${booking.guests}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-rupee-sign"></i>
                        <span><span class="list-detail-label">Amount:</span> ${formatCurrency(booking.totalAmount)}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-phone"></i>
                        <span><span class="list-detail-label">Phone:</span> ${booking.clientPhone}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-envelope"></i>
                        <span><span class="list-detail-label">Email:</span> ${booking.clientEmail}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-credit-card"></i>
                        <span><span class="list-detail-label">Payment:</span> ${booking.paymentStatus || 'Unpaid'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter bookings list
function filterBookingsList() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchBooking').value.toLowerCase();
    
    let filteredBookings = allBookings;
    
    if (statusFilter !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
    }
    
    if (searchTerm) {
        filteredBookings = filteredBookings.filter(b => 
            (b.clientName || '').toLowerCase().includes(searchTerm) ||
            (b.clientEmail || '').toLowerCase().includes(searchTerm) ||
            (b.clientPhone || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Update display
    const bookingsList = document.getElementById('bookingsList');
    
    if (filteredBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No bookings found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    const sortedBookings = [...filteredBookings].sort((a, b) => 
        new Date(a.eventDate) - new Date(b.eventDate)
    );
    
    bookingsList.innerHTML = sortedBookings.map(booking => {
        const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="list-booking-card" onclick='showBookingDetails(${JSON.stringify(booking).replace(/'/g, "&#39;")})'>
                <div class="list-booking-header">
                    <div class="list-booking-title">${booking.clientName || 'Event'}</div>
                    <span class="list-booking-status ${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
                <div class="list-booking-details">
                    <div class="list-detail-item">
                        <i class="fas fa-calendar"></i>
                        <span><span class="list-detail-label">Date:</span> ${eventDate}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-users"></i>
                        <span><span class="list-detail-label">Guests:</span> ${booking.guests}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-rupee-sign"></i>
                        <span><span class="list-detail-label">Amount:</span> ${formatCurrency(booking.totalAmount)}</span>
                    </div>
                    <div class="list-detail-item">
                        <i class="fas fa-phone"></i>
                        <span><span class="list-detail-label">Phone:</span> ${booking.clientPhone}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update booking status
async function updateBookingStatus(bookingId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        
        if (token) {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                showNotification(`Booking ${newStatus.toLowerCase()} successfully`, 'success');
                closeBookingModal();
                loadBookings();
                return;
            }
        }
        
        throw new Error('Failed to update booking');
    } catch (error) {
        console.error('Error updating booking:', error);
        
        // Fallback to localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = newStatus;
            localStorage.setItem('bookings', JSON.stringify(bookings));
            showNotification(`Booking ${newStatus.toLowerCase()} successfully`, 'success');
            closeBookingModal();
            closeDayModal();
            loadBookings();
        }
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Show notification
function showNotification(message, type = 'info') {
    // Use existing notification system from main.js if available
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback notification
    alert(message);
}

// Show day bookings modal
function showDayBookings(dateStr, dayBookings) {
    const modal = document.getElementById('dayModal');
    const modalContent = document.getElementById('modalDayDetails');
    
    // Format date for display
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-IN', options);
    
    let html = `
        <div class="day-modal-header">
            <h2>
                <i class="fas fa-calendar-day"></i>
                ${formattedDate}
            </h2>
            <span class="day-status-badge ${dayBookings.length > 0 ? 'booked' : 'available'}">
                ${dayBookings.length > 0 ? `${dayBookings.length} Booking(s)` : 'Available'}
            </span>
        </div>
    `;
    
    if (dayBookings.length === 0) {
        html += `
            <div class="no-bookings-message">
                <i class="fas fa-calendar-check"></i>
                <h3>No Reservations</h3>
                <p>This date is available for booking</p>
            </div>
        `;
    } else {
        html += '<div class="day-bookings-list">';
        
        dayBookings.forEach(booking => {
            const statusClass = booking.status.toLowerCase().replace(/\s/g, '-');
            const statusIcon = booking.status === 'Confirmed' ? 'check-circle' : 
                              booking.status === 'Pending' ? 'clock' : 'times-circle';
            
            html += `
                <div class="day-booking-card">
                    <div class="booking-card-header">
                        <h3>
                            <i class="fas fa-user"></i>
                            ${booking.clientName}
                        </h3>
                        <span class="badge badge-${statusClass}">
                            <i class="fas fa-${statusIcon}"></i>
                            ${booking.status}
                        </span>
                    </div>
                    
                    <div class="booking-card-details">
                        <div class="booking-detail-item">
                            <span class="booking-detail-label">
                                <i class="fas fa-id-card"></i> Booking ID
                            </span>
                            <span class="booking-detail-value">${booking.id}</span>
                        </div>
                        
                        <div class="booking-detail-item">
                            <span class="booking-detail-label">
                                <i class="fas fa-envelope"></i> Email
                            </span>
                            <span class="booking-detail-value">${booking.clientEmail}</span>
                        </div>
                        
                        <div class="booking-detail-item">
                            <span class="booking-detail-label">
                                <i class="fas fa-phone"></i> Phone
                            </span>
                            <span class="booking-detail-value">${booking.clientPhone}</span>
                        </div>
                        
                        <div class="booking-detail-item">
                            <span class="booking-detail-label">
                                <i class="fas fa-users"></i> Guests
                            </span>
                            <span class="booking-detail-value">${booking.guests}</span>
                        </div>
                        
                        <div class="booking-detail-item">
                            <span class="booking-detail-label">
                                <i class="fas fa-rupee-sign"></i> Total Amount
                            </span>
                            <span class="booking-detail-value">${formatCurrency(booking.total)}</span>
                        </div>
                        
                        <div class="booking-detail-item">
                            <span class="booking-detail-label">
                                <i class="fas fa-credit-card"></i> Payment
                            </span>
                            <span class="booking-detail-value">
                                <span class="badge badge-${booking.paymentStatus === 'Paid' ? 'paid' : 'pending'}">
                                    ${booking.paymentStatus}
                                </span>
                            </span>
                        </div>
                    </div>
                    
                    ${booking.status === 'Pending' ? `
                        <div class="booking-actions" style="margin-top: 1rem;">
                            <button class="btn btn-success" onclick="updateBookingStatus('${booking.id}', 'Confirmed')">
                                <i class="fas fa-check"></i> Accept
                            </button>
                            <button class="btn btn-danger" onclick="updateBookingStatus('${booking.id}', 'Cancelled')">
                                <i class="fas fa-times"></i> Decline
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    modalContent.innerHTML = html;
    modal.style.display = 'block';
}

// Close day modal
function closeDayModal() {
    const modal = document.getElementById('dayModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const bookingModal = document.getElementById('bookingModal');
    const dayModal = document.getElementById('dayModal');
    
    if (event.target === bookingModal) {
        closeBookingModal();
    }
    if (event.target === dayModal) {
        closeDayModal();
    }
};

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = 'auth.html';
}
