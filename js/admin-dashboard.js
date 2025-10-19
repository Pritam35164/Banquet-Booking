// Admin Dashboard JavaScript

let currentOwner = null;
let allBookings = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    currentOwner = checkAuth();
    
    // Debug logging
    console.log('Current owner:', currentOwner);
    console.log('Owner role:', currentOwner?.role);
    
    if (!currentOwner) {
        console.log('No user found, redirecting to auth');
        window.location.href = 'auth.html';
        return;
    }
    
    if (currentOwner.role !== 'owner') {
        console.log('User is not an owner (role:', currentOwner.role, '), redirecting to client dashboard');
        window.location.href = 'client-dashboard.html';
        return;
    }
    
    loadOwnerData();
    loadAllBookings();
    loadStats();
    loadPendingBookings();
    loadConfirmedBookings();
    renderMiniCalendar();
    
    // Check if coming from schedule and show specific section
    const dashboardSection = sessionStorage.getItem('dashboardSection');
    if (dashboardSection && dashboardSection !== 'dashboard') {
        setTimeout(() => {
            const sectionMap = {
                'bookings': 'bookingsSection',
                'venue': 'venueSection',
                'analytics': 'analyticsSection'
            };
            
            if (sectionMap[dashboardSection]) {
                document.querySelectorAll('.dashboard-section').forEach(sec => sec.style.display = 'none');
                document.getElementById(sectionMap[dashboardSection]).style.display = 'block';
                
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                const activeLink = document.querySelector(`[onclick*="showSection('${dashboardSection}')"]`);
                if (activeLink) activeLink.classList.add('active');
                
                // Load venue data if venue section
                if (dashboardSection === 'venue') {
                    loadVenueData();
                }
                
                // Load bookings table if bookings section
                if (dashboardSection === 'bookings') {
                    loadAllBookingsTable();
                }
                
                // Load analytics if analytics section
                if (dashboardSection === 'analytics') {
                    loadAnalytics();
                }
            }
        }, 100);
    }
    
    // Clear navigation flags
    sessionStorage.removeItem('navigatingHome');
    sessionStorage.removeItem('navigatingSearch');
    sessionStorage.removeItem('navigatingSchedule');
    sessionStorage.removeItem('navigatingDashboard');
    sessionStorage.removeItem('dashboardSection');
    
    // Setup venue form submission
    const venueForm = document.getElementById('venueForm');
    if (venueForm) {
        venueForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveVenueData();
        });
    }
    
    // Setup drag and drop functionality
    setupDragAndDrop();
});

// Global array to store uploaded images
let uploadedImages = [];

// Setup Drag and Drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!dropZone || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when dragging over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Handle click to browse
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    // Validate and process files
    const validFiles = [...files].filter(file => {
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            showNotification(`${file.name} is not an image file`, 'error');
            return false;
        }
        
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            showNotification(`${file.name} is too large. Max size is 5MB`, 'error');
            return false;
        }
        
        return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Convert files to base64 and display
    validFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = {
                name: file.name,
                size: formatFileSize(file.size),
                dataUrl: e.target.result,
                timestamp: Date.now()
            };
            
            uploadedImages.push(imageData);
            displayUploadedImage(imageData);
            
            showNotification(`${file.name} uploaded successfully!`, 'success');
        };
        
        reader.onerror = () => {
            showNotification(`Failed to read ${file.name}`, 'error');
        };
        
        reader.readAsDataURL(file);
    });
}

function displayUploadedImage(imageData) {
    const container = document.getElementById('uploadedImagesContainer');
    const grid = document.getElementById('uploadedImagesGrid');
    
    grid.style.display = 'block';
    
    const imageCard = document.createElement('div');
    imageCard.className = 'uploaded-image-card';
    imageCard.dataset.timestamp = imageData.timestamp;
    
    imageCard.innerHTML = `
        <img src="${imageData.dataUrl}" alt="${imageData.name}">
        <button class="remove-btn" onclick="removeUploadedImage(${imageData.timestamp})" title="Remove">
            <i class="fas fa-times"></i>
        </button>
        <div class="image-info">
            <div style="font-weight: 600; margin-bottom: 2px;">${imageData.name.length > 20 ? imageData.name.substring(0, 17) + '...' : imageData.name}</div>
            <div style="color: #999;">${imageData.size}</div>
        </div>
    `;
    
    container.appendChild(imageCard);
}

function removeUploadedImage(timestamp) {
    // Remove from array
    uploadedImages = uploadedImages.filter(img => img.timestamp !== timestamp);
    
    // Remove from DOM
    const card = document.querySelector(`[data-timestamp="${timestamp}"]`);
    if (card) {
        card.remove();
    }
    
    // Hide grid if no images
    if (uploadedImages.length === 0) {
        document.getElementById('uploadedImagesGrid').style.display = 'none';
    }
    
    showNotification('Image removed', 'success');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

// Go to schedule while staying logged in
function goToSchedule() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        sessionStorage.setItem('navigatingSchedule', 'true');
    }
    window.location.href = 'schedule-management.html';
}

// Load owner data
function loadOwnerData() {
    document.getElementById('ownerName').textContent = currentOwner.name;
    
    // Get the actual venue name from venues storage
    const venues = JSON.parse(localStorage.getItem('venues') || '[]');
    const ownerVenue = venues.find(v => v.ownerEmail === currentOwner.email);
    
    if (ownerVenue && ownerVenue.name) {
        // Use the venue name from the venue data
        document.getElementById('venueName').textContent = ownerVenue.name;
    } else if (currentOwner.venueName) {
        // Fallback to user's stored venue name
        document.getElementById('venueName').textContent = currentOwner.venueName;
    } else {
        // Default message
        document.getElementById('venueName').textContent = 'Manage your banquet hall bookings';
    }
}

// Load all bookings (filter by venue if needed - for demo, showing all)
function loadAllBookings() {
    allBookings = getBookings();
}

// Load stats
function loadStats() {
    const pending = allBookings.filter(b => b.status === 'Pending').length;
    const confirmed = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Confirmed - Awaiting Payment').length;
    const revenue = allBookings
        .filter(b => b.paymentStatus === 'Paid')
        .reduce((sum, b) => sum + b.total, 0);
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('confirmedCount').textContent = confirmed;
    document.getElementById('totalRevenue').textContent = formatCurrency(revenue);
}

// Load pending bookings
function loadPendingBookings() {
    const pending = allBookings.filter(b => b.status === 'Pending');
    const grid = document.getElementById('pendingBookingsGrid');
    
    if (pending.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Pending Requests</h3>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = pending.map(booking => `
        <div class="booking-card">
            <div class="booking-info">
                <h3>${booking.venueName}</h3>
                <div class="booking-details">
                    <div class="detail-item">
                        <span class="detail-label">Client</span>
                        <span class="detail-value">${booking.clientName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email</span>
                        <span class="detail-value">${booking.clientEmail}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">${booking.clientPhone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${formatDate(booking.date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Guests</span>
                        <span class="detail-value">${booking.guests}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Amount</span>
                        <span class="detail-value">${formatCurrency(booking.total)}</span>
                    </div>
                </div>
                ${booking.notes ? `<p style="margin-top: 1rem; color: var(--text-light);"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
            </div>
            <div class="booking-actions">
                <button onclick="acceptBooking('${booking.id}')" class="btn btn-success">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button onclick="rejectBooking('${booking.id}')" class="btn btn-danger">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

// Load confirmed bookings
function loadConfirmedBookings() {
    const confirmed = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Confirmed - Awaiting Payment');
    const grid = document.getElementById('confirmedBookingsGrid');
    
    if (confirmed.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3>No Confirmed Bookings</h3>
                <p>Confirmed bookings will appear here</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = confirmed.map(booking => `
        <div class="booking-card">
            <div class="booking-info">
                <h3>${booking.venueName}</h3>
                <div class="booking-details">
                    <div class="detail-item">
                        <span class="detail-label">Client</span>
                        <span class="detail-value">${booking.clientName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${formatDate(booking.date)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Guests</span>
                        <span class="detail-value">${booking.guests}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Amount</span>
                        <span class="detail-value">${formatCurrency(booking.total)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment</span>
                        <span class="detail-value">
                            <span class="badge badge-${booking.paymentStatus === 'Paid' ? 'paid' : 'pending'}">
                                ${booking.paymentStatus}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <div class="booking-actions">
                <span class="badge badge-confirmed">${booking.status}</span>
            </div>
        </div>
    `).join('');
}

// Accept booking
function acceptBooking(bookingId) {
    if (confirm('Accept this booking request?')) {
        updateBooking(bookingId, {
            status: 'Confirmed - Awaiting Payment'
        });
        showNotification('Booking accepted! Client will be notified to make payment.', 'success');
        loadAllBookings();
        loadStats();
        loadPendingBookings();
        loadConfirmedBookings();
        loadAllBookingsTable();
        renderMiniCalendar();
    }
}

// Reject booking
function rejectBooking(bookingId) {
    if (confirm('Reject this booking request? This action cannot be undone.')) {
        updateBooking(bookingId, {
            status: 'Cancelled',
            paymentStatus: 'Cancelled'
        });
        showNotification('Booking rejected', 'info');
        loadAllBookings();
        loadStats();
        loadPendingBookings();
        loadConfirmedBookings();
        loadAllBookingsTable();
    }
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
        'dashboard': 'dashboardSection',
        'bookings': 'bookingsSection',
        'venue': 'venueSection',
        'analytics': 'analyticsSection'
    };
    
    document.getElementById(sectionMap[section]).style.display = 'block';
    event.target.closest('.nav-item').classList.add('active');
    
    // Reload data for each section
    if (section === 'dashboard') {
        loadAllBookings();
        loadStats();
        loadPendingBookings();
        loadRecentBookings();
    }
    
    // Load bookings table if bookings section
    if (section === 'bookings') {
        loadAllBookingsTable();
    }
    
    // Load venue data if venue section
    if (section === 'venue') {
        loadVenueData();
    }
    
    // Load analytics if analytics section
    if (section === 'analytics') {
        loadAnalytics();
    }
}

// Load all bookings table
function loadAllBookingsTable() {
    // Reload bookings from storage
    allBookings = getBookings();
    
    console.log('Loading all bookings:', allBookings.length);
    
    const tbody = document.getElementById('allBookingsBody');
    
    tbody.innerHTML = allBookings.map(booking => `
        <tr>
            <td>${booking.id}</td>
            <td>${booking.clientName}</td>
            <td>${booking.clientEmail}</td>
            <td>${booking.clientPhone}</td>
            <td>${formatDate(booking.date)}</td>
            <td>${booking.guests}</td>
            <td>${formatCurrency(booking.total)}</td>
            <td><span class="badge badge-${booking.status.toLowerCase().replace(/\s/g, '-')}">${booking.status}</span></td>
            <td><span class="badge badge-${booking.paymentStatus === 'Paid' ? 'paid' : 'pending'}">${booking.paymentStatus}</span></td>
            <td>
                ${booking.status === 'Pending' ? `
                    <button onclick="acceptBooking('${booking.id}')" class="btn btn-success" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        <i class="fas fa-check"></i>
                    </button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

// Filter bookings
function filterBookings() {
    const search = document.getElementById('bookingSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#allBookingsBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// Render mini calendar
function renderMiniCalendar() {
    const calendar = document.getElementById('miniCalendar');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get booked dates
    const bookedDates = allBookings
        .filter(b => b.status !== 'Cancelled' && b.status !== 'Pending')
        .map(b => b.date);
    
    let html = `
        <div class="calendar-widget">
            <h3>${monthNames[month]} ${year}</h3>
            <div class="calendar-grid-mini">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
    `;
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day-mini empty"></div>';
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        const isBooked = bookedDates.includes(dateString);
        const isToday = day === today.getDate() && month === today.getMonth();
        
        html += `<div class="calendar-day-mini ${isBooked ? 'booked' : ''} ${isToday ? 'today' : ''}">${day}</div>`;
    }
    
    html += `
            </div>
            <a href="schedule-management.html" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-calendar-alt"></i> Manage Schedule
            </a>
        </div>
    `;
    
    calendar.innerHTML = html;
}

// Load venue data into form
function loadVenueData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const venues = JSON.parse(localStorage.getItem('venues') || '[]');
    
    // Find venue associated with this owner
    let venue = venues.find(v => v.ownerEmail === user.email);
    
    // If no venue exists, create a new one with current user data
    if (!venue && user.venueName) {
        venue = {
            id: Date.now(),
            name: user.venueName,
            city: user.city || '',
            location: user.location || '',
            capacity: { min: 100, max: 500 },
            pricePerPlate: 1500,
            hallRental: 30000,
            amenities: [],
            images: [],
            description: '',
            ownerEmail: user.email,
            availability: {}
        };
        venues.push(venue);
        localStorage.setItem('venues', JSON.stringify(venues));
    }
    
    if (venue) {
        document.getElementById('venueNameInput').value = venue.name || '';
        document.getElementById('venueCity').value = venue.city || '';
        document.getElementById('venueLocation').value = venue.location || '';
        document.getElementById('venueMinCapacity').value = venue.capacity?.min || 100;
        document.getElementById('venueMaxCapacity').value = venue.capacity?.max || 500;
        document.getElementById('venuePricePerPlate').value = venue.pricePerPlate || 1500;
        document.getElementById('venueHallRental').value = venue.hallRental || 30000;
        document.getElementById('venueDescription').value = venue.description || '';
        
        // Update the header with the venue name
        if (venue.name) {
            document.getElementById('venueName').textContent = venue.name;
        }
        
        // Set amenities checkboxes
        document.querySelectorAll('input[name="amenity"]').forEach(checkbox => {
            checkbox.checked = venue.amenities?.includes(checkbox.value) || false;
        });
        
        // Load images
        const imageContainer = document.getElementById('imageInputs');
        imageContainer.innerHTML = '';
        if (venue.images && venue.images.length > 0) {
            venue.images.forEach(img => {
                const input = document.createElement('input');
                input.type = 'url';
                input.className = 'image-url-input';
                input.value = img;
                input.placeholder = 'https://example.com/image.jpg';
                imageContainer.appendChild(input);
            });
        } else {
            // Add 3 empty inputs
            for (let i = 0; i < 3; i++) {
                const input = document.createElement('input');
                input.type = 'url';
                input.className = 'image-url-input';
                input.placeholder = 'https://example.com/image.jpg';
                imageContainer.appendChild(input);
            }
        }
    }
}

// Add more image input fields
function addImageInput() {
    const container = document.getElementById('imageInputs');
    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'image-url-input';
    input.placeholder = 'https://example.com/image.jpg';
    input.setAttribute('onchange', 'previewImage(this)');
    container.appendChild(input);
}

// Preview a single image
function previewImage(inputElement) {
    const url = inputElement.value.trim();
    if (!url) return;
    
    // Show preview section
    document.getElementById('imagePreviewSection').style.display = 'block';
    
    // Test if image loads
    const testImg = new Image();
    testImg.onload = function() {
        showNotification('Image loaded successfully! ✓', 'success');
    };
    testImg.onerror = function() {
        showNotification('Warning: Image URL may not be valid or accessible', 'error');
    };
    testImg.src = url;
}

// Preview all images
function previewAllImages() {
    const previewGrid = document.getElementById('imagePreviewGrid');
    const previewSection = document.getElementById('imagePreviewSection');
    const imageInputs = document.querySelectorAll('.image-url-input');
    
    previewGrid.innerHTML = '';
    let validImageCount = 0;
    
    // Add uploaded images (from drag & drop)
    uploadedImages.forEach((imageData, index) => {
        validImageCount++;
        const previewCard = document.createElement('div');
        previewCard.style.cssText = `
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        previewCard.innerHTML = `
            <div style="position: relative; padding-top: 75%; background: #f3f4f6;">
                <img src="${imageData.dataUrl}" 
                     alt="${imageData.name}" 
                     style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 5px; left: 5px; background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">
                    <i class="fas fa-check"></i> Uploaded
                </div>
            </div>
            <div style="padding: 0.5rem; font-size: 0.8rem; color: #666; word-break: break-all;">
                <strong>${imageData.name.length > 20 ? imageData.name.substring(0, 20) + '...' : imageData.name}</strong><br>
                <span style="color: #999;">${imageData.size}</span>
            </div>
        `;
        
        previewGrid.appendChild(previewCard);
    });
    
    // Add URL images
    imageInputs.forEach((input, index) => {
        const url = input.value.trim();
        if (url) {
            validImageCount++;
            const previewCard = document.createElement('div');
            previewCard.style.cssText = `
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            
            previewCard.innerHTML = `
                <div style="position: relative; padding-top: 75%; background: #f3f4f6;">
                    <img src="${url}" 
                         alt="URL Image ${index + 1}" 
                         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #ef4444;\\'>❌<br>Failed to load</div>';">
                    <div style="position: absolute; top: 5px; left: 5px; background: #6366f1; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">
                        <i class="fas fa-link"></i> URL
                    </div>
                </div>
                <div style="padding: 0.5rem; font-size: 0.8rem; color: #666; word-break: break-all;">
                    <strong>URL Image ${index + 1}</strong><br>
                    ${url.length > 50 ? url.substring(0, 50) + '...' : url}
                </div>
            `;
            
            previewGrid.appendChild(previewCard);
        }
    });
    
    if (validImageCount === 0) {
        previewSection.style.display = 'none';
        showNotification('Please upload images or add URLs to preview', 'error');
    } else {
        previewSection.style.display = 'block';
        showNotification(`Previewing ${validImageCount} image(s) total (${uploadedImages.length} uploaded, ${validImageCount - uploadedImages.length} from URLs)`, 'success');
    }
}

// Save venue data
function saveVenueData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const venues = JSON.parse(localStorage.getItem('venues') || '[]');
    
    // Get form data
    const venueName = document.getElementById('venueNameInput').value.trim();
    const city = document.getElementById('venueCity').value;
    const location = document.getElementById('venueLocation').value.trim();
    const minCapacity = parseInt(document.getElementById('venueMinCapacity').value);
    const maxCapacity = parseInt(document.getElementById('venueMaxCapacity').value);
    const pricePerPlate = parseInt(document.getElementById('venuePricePerPlate').value);
    const hallRental = parseInt(document.getElementById('venueHallRental').value);
    const description = document.getElementById('venueDescription').value.trim();
    
    // Get amenities
    const amenities = [];
    document.querySelectorAll('input[name="amenity"]:checked').forEach(checkbox => {
        amenities.push(checkbox.value);
    });
    
    // Get images - combine uploaded images and URL images
    const images = [];
    
    // First, add all uploaded images (drag & drop / file browse)
    uploadedImages.forEach(imageData => {
        images.push(imageData.dataUrl);
    });
    
    // Then, add URL images
    document.querySelectorAll('.image-url-input').forEach(input => {
        const url = input.value.trim();
        if (url) {
            // Basic URL validation
            try {
                // Accept various image hosting services and formats
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
                    // Clean up the URL - ensure it's properly formatted
                    let cleanUrl = url;
                    if (url.startsWith('//')) {
                        cleanUrl = 'https:' + url;
                    }
                    images.push(cleanUrl);
                } else if (url.startsWith('data:image')) {
                    // Support base64 data URLs
                    images.push(url);
                } else {
                    // If no protocol, add https://
                    images.push('https://' + url);
                }
            } catch (e) {
                console.warn('Invalid image URL:', url);
            }
        }
    });
    
    // Find or create venue
    let venueIndex = venues.findIndex(v => v.ownerEmail === user.email);
    
    const venueData = {
        id: venueIndex >= 0 ? venues[venueIndex].id : Date.now(),
        name: venueName,
        city: city,
        location: location,
        capacity: { min: minCapacity, max: maxCapacity },
        pricePerPlate: pricePerPlate,
        hallRental: hallRental,
        amenities: amenities,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800'],
        description: description || 'A beautiful venue perfect for your special occasions.',
        ownerEmail: user.email,
        availability: venueIndex >= 0 ? venues[venueIndex].availability : {}
    };
    
    if (venueIndex >= 0) {
        venues[venueIndex] = venueData;
    } else {
        venues.push(venueData);
    }
    
    // Save to localStorage
    localStorage.setItem('venues', JSON.stringify(venues));
    
    // Update user's venue name
    user.venueName = venueName;
    user.city = city;
    user.location = location;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update display
    document.getElementById('venueName').textContent = venueName;
    
    // Show success message
    showNotification('Venue information updated successfully!', 'success');
    
    // Update venuesData in main.js for search results
    if (typeof venuesData !== 'undefined') {
        const dataIndex = venuesData.findIndex(v => v.id === venueData.id);
        if (dataIndex >= 0) {
            venuesData[dataIndex] = venueData;
        } else {
            venuesData.push(venueData);
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load Analytics
function loadAnalytics() {
    const bookings = allBookings;
    
    // Calculate stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed' || b.paymentStatus === 'Paid').length;
    const totalRevenue = bookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + (b.total || 0), 0);
    const totalGuests = bookings.reduce((sum, b) => sum + (b.guests || 0), 0);
    const confirmRate = totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0;
    
    // Update stats cards
    document.getElementById('totalBookingsAnalytics').textContent = totalBookings;
    document.getElementById('confirmedBookingsAnalytics').textContent = confirmedBookings;
    document.getElementById('totalRevenueAnalytics').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalGuestsAnalytics').textContent = totalGuests.toLocaleString();
    document.getElementById('confirmRate').textContent = confirmRate + '%';
    
    // Status Distribution
    const statusCounts = {
        'Pending': bookings.filter(b => b.status === 'Pending').length,
        'Confirmed': bookings.filter(b => b.status === 'Confirmed' || b.status === 'Confirmed - Awaiting Payment').length,
        'Paid': bookings.filter(b => b.paymentStatus === 'Paid').length,
        'Cancelled': bookings.filter(b => b.status === 'Cancelled').length
    };
    
    renderStatusChart(statusCounts);
    
    // Monthly Revenue (only from paid bookings)
    const monthlyRevenue = {};
    bookings.filter(b => b.paymentStatus === 'Paid').forEach(booking => {
        if (booking.date) {
            const month = new Date(booking.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (booking.total || 0);
        }
    });
    
    renderRevenueChart(monthlyRevenue);
    
    // Recent Activity
    const recentBookings = bookings.slice().sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ).slice(0, 10);
    
    renderActivityTimeline(recentBookings);
    
    // Popular Months
    const monthCounts = {};
    bookings.forEach(booking => {
        if (booking.date) {
            const month = new Date(booking.date).toLocaleString('default', { month: 'long' });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
    });
    
    renderPopularMonths(monthCounts);
}

// Render Status Chart (Simple Pie Chart)
function renderStatusChart(statusCounts) {
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const colors = {
        'Pending': '#f59e0b',
        'Confirmed': '#3b82f6',
        'Paid': '#10b981',
        'Cancelled': '#ef4444'
    };
    
    const canvas = document.getElementById('statusChart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let currentAngle = -Math.PI / 2;
    
    Object.entries(statusCounts).forEach(([status, count]) => {
        const sliceAngle = (count / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[status];
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
    
    // Legend
    const legend = document.getElementById('statusLegend');
    legend.innerHTML = Object.entries(statusCounts).map(([status, count]) => `
        <div class="legend-item">
            <div class="legend-color" style="background: ${colors[status]}"></div>
            <span>${status}: ${count}</span>
        </div>
    `).join('');
}

// Render Revenue Chart (Simple Bar Chart)
function renderRevenueChart(monthlyRevenue) {
    const canvas = document.getElementById('revenueChart');
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const months = Object.keys(monthlyRevenue).slice(-6); // Last 6 months
    const values = months.map(m => monthlyRevenue[m]);
    const maxValue = Math.max(...values, 1);
    
    if (months.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No revenue data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const barWidth = chartWidth / months.length - 10;
    
    months.forEach((month, index) => {
        const value = values[index];
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (chartWidth / months.length) + 5;
        const y = padding + chartHeight - barHeight;
        
        // Draw bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#6d28d9');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('₹' + (value / 1000).toFixed(0) + 'k', x + barWidth / 2, y - 5);
        
        // Draw month label
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.save();
        ctx.translate(x + barWidth / 2, padding + chartHeight + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(month, 0, 0);
        ctx.restore();
    });
}

// Render Activity Timeline
function renderActivityTimeline(bookings) {
    const timeline = document.getElementById('activityTimeline');
    
    if (bookings.length === 0) {
        timeline.innerHTML = '<p style="text-align: center; color: #666;">No recent activity</p>';
        return;
    }
    
    timeline.innerHTML = bookings.map(booking => `
        <div class="activity-item">
            <div class="activity-icon ${getStatusClass(booking.status)}">
                <i class="fas ${getStatusIcon(booking.status)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${booking.clientName} - ${booking.venueName || 'Venue'}</div>
                <div class="activity-meta">
                    ${booking.guests} guests • ${formatCurrency(booking.total)} • ${booking.status}
                </div>
                <div class="activity-time">${getTimeAgo(booking.createdAt)}</div>
            </div>
        </div>
    `).join('');
}

// Render Popular Months
function renderPopularMonths(monthCounts) {
    const grid = document.getElementById('popularMonthsGrid');
    const sorted = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    
    if (sorted.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No booking data available</p>';
        return;
    }
    
    const maxCount = sorted[0][1];
    
    grid.innerHTML = sorted.map(([month, count]) => `
        <div class="popular-month-card">
            <div class="month-name">${month}</div>
            <div class="month-bar">
                <div class="month-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
            <div class="month-count">${count} booking${count !== 1 ? 's' : ''}</div>
        </div>
    `).join('');
}

// Helper Functions
function getStatusClass(status) {
    if (status === 'Confirmed' || status === 'Confirmed - Awaiting Payment') return 'status-confirmed';
    if (status === 'Pending') return 'status-pending';
    if (status === 'Cancelled') return 'status-cancelled';
    return '';
}

function getStatusIcon(status) {
    if (status === 'Confirmed' || status === 'Confirmed - Awaiting Payment') return 'fa-check-circle';
    if (status === 'Pending') return 'fa-clock';
    if (status === 'Cancelled') return 'fa-times-circle';
    return 'fa-info-circle';
}

function getTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return date.toLocaleDateString();
}
