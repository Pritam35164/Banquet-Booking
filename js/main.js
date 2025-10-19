// Main JavaScript functions

// Store venues data
const venuesData = [
    {
        id: 1,
        name: "Royal Palace Banquet",
        city: "Delhi",
        location: "South Delhi, Delhi",
        capacity: { min: 500, max: 1000 },
        pricePerPlate: 2500,
        hallRental: 50000,
        amenities: ["Parking", "AC", "Catering", "DJ", "Decorations", "Valet Parking"],
        images: [
            "https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800"
        ],
        description: "A luxurious banquet hall perfect for grand celebrations. Features elegant interiors, state-of-the-art facilities, and impeccable service. Our spacious halls with crystal chandeliers and modern lighting create the perfect ambiance for weddings and corporate events.",
        availability: {}
    },
    {
        id: 2,
        name: "Grand Crystal Hall",
        city: "Mumbai",
        location: "Bandra West, Mumbai",
        capacity: { min: 300, max: 800 },
        pricePerPlate: 3000,
        hallRental: 75000,
        amenities: ["Parking", "AC", "DJ", "Catering", "WiFi", "AV System", "Valet Parking"],
        images: [
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
            "https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800"
        ],
        description: "Experience elegance at its finest with crystal chandeliers, premium interiors, and modern amenities. Located in the heart of Bandra, perfect for sophisticated celebrations.",
        availability: {}
    },
    {
        id: 3,
        name: "Emerald Gardens",
        city: "Bangalore",
        location: "Whitefield, Bangalore",
        capacity: { min: 200, max: 500 },
        pricePerPlate: 2000,
        hallRental: 40000,
        amenities: ["Garden", "Parking", "Catering", "Outdoor Seating", "Fountain", "Stage"],
        images: [
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800"
        ],
        description: "Beautiful garden venue perfect for outdoor celebrations and intimate gatherings. Lush greenery, water fountains, and open-air ambiance create magical moments.",
        availability: {}
    },
    {
        id: 4,
        name: "Sapphire Celebration Hall",
        city: "Hyderabad",
        location: "Banjara Hills, Hyderabad",
        capacity: { min: 400, max: 700 },
        pricePerPlate: 2200,
        hallRental: 45000,
        amenities: ["Parking", "AC", "WiFi", "Catering", "Valet Parking", "AV System"],
        images: [
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
            "https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800"
        ],
        description: "Modern banquet hall with excellent amenities and professional service. Contemporary design meets traditional hospitality in this premium venue.",
        availability: {}
    },
    {
        id: 5,
        name: "Golden Arch Banquet",
        city: "Kolkata",
        location: "Park Street, Kolkata",
        capacity: { min: 250, max: 600 },
        pricePerPlate: 1800,
        hallRental: 35000,
        amenities: ["Parking", "AC", "Catering", "Stage", "Green Room"],
        images: [
            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800"
        ],
        description: "Classic venue with traditional charm and modern facilities. Perfect blend of old-world elegance and contemporary comfort in the heart of Kolkata.",
        availability: {}
    },
    {
        id: 6,
        name: "Majestic Convention Center",
        city: "Chennai",
        location: "Anna Nagar, Chennai",
        capacity: { min: 600, max: 1200 },
        pricePerPlate: 2800,
        hallRental: 80000,
        amenities: ["Parking", "AC", "AV System", "WiFi", "Catering", "Green Room", "Conference Rooms"],
        images: [
            "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800"
        ],
        description: "Large convention center suitable for grand events and conferences. Multiple halls, advanced audio-visual systems, and professional event management.",
        availability: {}
    },
    {
        id: 7,
        name: "Ramdev Grand Celebration",
        city: "Pune",
        location: "Koregaon Park, Pune",
        capacity: { min: 350, max: 750 },
        pricePerPlate: 2300,
        hallRental: 55000,
        amenities: ["Parking", "AC", "Catering", "DJ", "Decorations", "WiFi", "Valet Parking", "Stage", "AV System"],
        images: [
            "https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800"
        ],
        description: "Ramdev Grand Celebration is Pune's premier banquet destination offering world-class hospitality. Featuring spacious halls with elegant interiors, premium lighting, luxurious seating arrangements, and exceptional service. Our venue specializes in weddings, receptions, corporate events, and grand celebrations. With state-of-the-art sound systems, customizable decor options, and award-winning catering services, we ensure your event is truly unforgettable. Our experienced event management team handles every detail with precision and care.",
        availability: {}
    },
    {
        id: 8,
        name: "Pearl Banquet & Lawns",
        city: "Jaipur",
        location: "C-Scheme, Jaipur",
        capacity: { min: 400, max: 900 },
        pricePerPlate: 2100,
        hallRental: 48000,
        amenities: ["Garden", "Parking", "AC", "Catering", "DJ", "Outdoor Seating", "Fountain", "Valet Parking"],
        images: [
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"
        ],
        description: "Rajasthani elegance meets modern luxury at Pearl Banquet. Beautiful lawns with traditional architecture, perfect for royal weddings and grand celebrations. Indoor and outdoor venues available.",
        availability: {}
    },
    {
        id: 9,
        name: "Ivory Palace Convention",
        city: "Ahmedabad",
        location: "Satellite, Ahmedabad",
        capacity: { min: 500, max: 1100 },
        pricePerPlate: 2600,
        hallRental: 65000,
        amenities: ["Parking", "AC", "WiFi", "Catering", "AV System", "Green Room", "Valet Parking", "Conference Rooms"],
        images: [
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
            "https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800",
            "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800"
        ],
        description: "Premium convention center with multiple halls and advanced facilities. Ideal for large-scale weddings, corporate events, and conferences. Professional event management services included.",
        availability: {}
    },
    {
        id: 10,
        name: "Lotus Garden Resort",
        city: "Lucknow",
        location: "Gomti Nagar, Lucknow",
        capacity: { min: 300, max: 650 },
        pricePerPlate: 1900,
        hallRental: 42000,
        amenities: ["Garden", "Parking", "AC", "Catering", "Outdoor Seating", "Stage", "DJ", "Fountain"],
        images: [
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800"
        ],
        description: "Serene garden resort with beautiful landscapes and water features. Perfect for intimate weddings and outdoor celebrations. Traditional Awadhi hospitality with modern amenities.",
        availability: {}
    },
    {
        id: 11,
        name: "Diamond Jubilee Hall",
        city: "Surat",
        location: "Adajan, Surat",
        capacity: { min: 450, max: 850 },
        pricePerPlate: 2400,
        hallRental: 52000,
        amenities: ["Parking", "AC", "WiFi", "Catering", "DJ", "AV System", "Valet Parking", "Decorations"],
        images: [
            "https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800",
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"
        ],
        description: "Opulent banquet hall with diamond-inspired decor and crystal lighting. Luxury redefined with spacious interiors and premium services. Perfect for grand weddings and celebrations.",
        availability: {}
    },
    {
        id: 12,
        name: "Silver Oak Banquet",
        city: "Indore",
        location: "Vijay Nagar, Indore",
        capacity: { min: 280, max: 580 },
        pricePerPlate: 1850,
        hallRental: 38000,
        amenities: ["Parking", "AC", "Catering", "Stage", "DJ", "WiFi"],
        images: [
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800"
        ],
        description: "Elegant banquet hall with modern facilities and warm ambiance. Well-suited for weddings, receptions, and corporate events. Exceptional catering and decor services.",
        availability: {}
    },
    {
        id: 13,
        name: "The Heritage Mansion",
        city: "Chandigarh",
        location: "Sector 17, Chandigarh",
        capacity: { min: 350, max: 700 },
        pricePerPlate: 2700,
        hallRental: 60000,
        amenities: ["Parking", "AC", "Garden", "Catering", "DJ", "Valet Parking", "Stage", "AV System", "WiFi"],
        images: [
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
            "https://images.unsplash.com/photo-1519167758481-83f29da8c14f?w=800"
        ],
        description: "Heritage-style mansion with colonial architecture and modern amenities. Spacious lawns and elegant halls make it perfect for destination-style weddings. Premium hospitality services.",
        availability: {}
    }
];

// Search venues function
function searchVenues() {
    const city = document.getElementById('citySearch')?.value;
    const eventDate = document.getElementById('eventDate')?.value;
    const guestCount = document.getElementById('guestCount')?.value;
    
    // Build query string
    let query = '?';
    if (city) query += `city=${encodeURIComponent(city)}&`;
    if (eventDate) query += `date=${eventDate}&`;
    if (guestCount) query += `guests=${guestCount}&`;
    
    // Redirect to search results page
    window.location.href = `search-results.html${query}`;
}

// Navigate to venue details
function goToVenueDetails(venueId) {
    window.location.href = `venue-details.html?id=${venueId}`;
}

// Get venue by ID
function getVenueById(id) {
    // First check in venuesData
    let venue = venuesData.find(venue => venue.id === parseInt(id));
    
    // If not found, check in localStorage venues
    if (!venue) {
        const storedVenues = JSON.parse(localStorage.getItem('venues') || '[]');
        venue = storedVenues.find(venue => venue.id === parseInt(id));
    }
    
    return venue;
}

// Format currency in INR
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize bookings in localStorage if not exists
function initializeBookings() {
    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify([]));
    }
}

// Initialize venues in localStorage if not exists
function initializeVenues() {
    if (!localStorage.getItem('venues')) {
        // Initialize with default venues
        localStorage.setItem('venues', JSON.stringify(venuesData));
    }
}

// Call initialization on page load
if (typeof window !== 'undefined') {
    initializeBookings();
    initializeVenues();
}

// Get all bookings
function getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Add booking
function addBooking(booking) {
    const bookings = getBookings();
    booking.id = 'BK' + Date.now();
    booking.status = 'Pending';
    booking.paymentStatus = 'Unpaid';
    booking.createdAt = new Date().toISOString();
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    console.log('Booking added:', booking);
    console.log('Total bookings:', bookings.length);
    
    return booking;
}

// Update booking
function updateBooking(bookingId, updates) {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
        bookings[index] = { ...bookings[index], ...updates };
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return bookings[index];
    }
    return null;
}

// Get booking by ID
function getBookingById(bookingId) {
    const bookings = getBookings();
    return bookings.find(b => b.id === bookingId);
}

// Initialize users in localStorage if not exists
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize reviews in localStorage
function initializeReviews() {
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    }
}

// Get all reviews
function getReviews(venueId) {
    const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    if (venueId) {
        return allReviews.filter(r => r.venueId === venueId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return allReviews;
}

// Add review
function addReview(review) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    review.id = 'RV' + Date.now();
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    return review;
}

// Get average rating for a venue
function getAverageRating(venueId) {
    const reviews = getReviews(venueId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeBookings();
    initializeUsers();
    initializeReviews();
});
