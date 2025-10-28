# BanquetBook – A Complete Solution for Banquet Hall Discovery & Booking

BanquetBook is a beautifully designed, user-focused web platform that revolutionizes how people plan events. Whether it's a wedding, engagement, reception, or corporate celebration, BanquetBook helps users discover the perfect banquet hall effortlessly, check availability, explore amenities, and simulate bookings with secure payment experiences. Venue owners can register their banquet halls, manage inquiries, approve bookings, and track payments through their own interactive admin dashboard.

This project showcases a complete end-to-end web application built using HTML, CSS, and JavaScript with localStorage as a simulated backend—making it ideal for learning full-stack concepts using only frontend technologies.

---

## What This Platform Offers

### For Event Planners (Clients)
- **Venue Exploration:** Browse elegant banquet halls with photos, pricing, and detailed specifications.
- **Advanced Search:** Search by location, date, and guest capacity for personalized results.
- **Real-Time Availability:** View available dates before submitting a booking.
- **Booking Experience:** Submit banquet booking requests with your personal details.
- **Simulated Payments:** Complete your booking using card, UPI, or net banking (localStorage-based simulation).
- **Personal Dashboard:** View all your confirmed, pending, or paid bookings in one place.

### For Banquet Owners
- **Hall Registration:** Add hall details including pricing, capacity, address, and images.
- **Booking Approval System:** Receive incoming booking requests and choose to accept or reject them.
- **Schedule Management:** View calendar-based availability and manage event timelines.
- **Payment Tracking:** Monitor the payment status of each confirmed booking.
- **Growth-Ready Architecture:** Designed to scale with features such as revenue analytics and customer reviews.

---

## Design Philosophy
- **User-first Experience:** The interface is crafted to be clean, warm, and easy to navigate.
- **Modern UI Elements:** Rounded cards, soft shadows, elegant fonts, and premium color palette.
- **Fully Responsive:** Optimized for desktop, tablet, and mobile devices using CSS Flexbox and Grid.
- **Visual Storytelling:** High-quality visuals bring each banquet listing to life.

---

## Built With
- **HTML5** – Semantic structure for clean and accessible content
- **CSS3** – Elegant visuals, animations, and responsiveness
- **JavaScript (Vanilla)** – Logic, interactivity, dynamic page updates, and data handling
- **LocalStorage API** – Used as a simulated database for users, venues, and bookings
- **Google Fonts & Font Awesome** – Modern typography and iconography

---

## Project Structure

```
project/
├── index.html                  # Homepage
├── search-results.html         # Venue search and filtering
├── venue-details.html          # Detailed venue information
├── auth.html                   # Login and signup
├── client-dashboard.html       # Client dashboard
├── admin-dashboard.html        # Venue owner dashboard
├── payment.html                # Payment processing
├── css/
│   ├── styles.css             # Global styles
│   ├── homepage.css           # Homepage styles
│   ├── search-results.css     # Search page styles
│   ├── venue-details.css      # Venue details styles
│   ├── auth.css               # Authentication styles
│   ├── dashboard.css          # Dashboard styles
│   └── payment.css            # Payment page styles
└── js/
    ├── main.js                # Core utilities and data
    ├── homepage.js            # Homepage functionality
    ├── search-results.js      # Search and filtering
    ├── venue-details.js       # Venue details and booking
    ├── auth.js                # Authentication
    ├── client-dashboard.js    # Client dashboard
    ├── admin-dashboard.js     # Admin dashboard
    └── payment.js             # Payment processing
```

