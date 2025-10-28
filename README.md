# BanquetBook - Banquet Rental Platform

A comprehensive web application for booking banquet halls across India. This platform connects clients looking to book venues with banquet hall owners, featuring real-time availability, secure payments, and complete booking management.

## Features

### For Clients
- **Venue Discovery**: Browse and search banquet halls across major Indian cities
- **Advanced Filtering**: Filter by location, capacity, price, and amenities
- **Real-time Availability**: Interactive calendar showing available dates
- **Booking Management**: Track all bookings in a personal dashboard
- **Secure Payments**: Multiple payment options (Card, Net Banking, UPI)
- **Profile Management**: Update personal information

### For Venue Owners
- **Booking Requests**: Review and accept/reject booking requests
- **Schedule Management**: Full calendar view for managing availability
- **Client Information**: Complete client details including contact information
- **Payment Tracking**: Monitor payment status for all bookings
- **Revenue Analytics**: Track earnings (coming soon)

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

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser using localStorage

### Installation
1. Download or clone the project files
2. Open `index.html` in your web browser
3. Start exploring!

### Demo Accounts
You can create accounts directly through the signup page:
- **Client Account**: Select "I'm a Client" during registration
- **Venue Owner Account**: Select "I'm a Venue Owner" during registration

## Currency and Locations

- **Currency**: All prices are displayed in Indian Rupees (₹)
- **Locations**: Major Indian cities including:
  - Mumbai, Delhi, Bangalore, Hyderabad
  - Chennai, Kolkata, Pune, Ahmedabad
  - Jaipur, Lucknow, Chandigarh, Indore

## Design Features

### Professional and Vibrant
- Modern gradient backgrounds
- Smooth animations and transitions
- Responsive design for all devices
- Intuitive user interface
- Professional color scheme with purple/pink gradients

### Key Components
- Interactive calendars for availability
- Real-time search and filtering
- Status badges for bookings and payments
- Secure payment forms
- Dashboard widgets and statistics

## Pages Overview

### 1. Homepage (`index.html`)
- Welcome banner with mission statement
- Prominent search bar (City, Date, Guests)
- Popular venue showcase
- Feature highlights
- Call-to-action buttons

### 2. Search Results (`search-results.html`)
- Comprehensive filtering sidebar
  - Guest capacity ranges
  - Price range slider
  - Amenities checkboxes
- Venue cards with key information
- Sorting options
- Real-time filter application

### 3. Venue Details (`venue-details.html`)
- High-quality image gallery
- Complete venue information
- Amenities grid
- Pricing breakdown
- Interactive availability calendar
- Booking request form with:
  - Full name, email, mobile (required)
  - Number of guests
  - Special requirements
- Customer reviews section (coming soon)

### 4. Authentication (`auth.html`)
- Unified login and signup
- Role selection (Client/Owner)
- Client signup fields:
  - Full Name, Email, Phone, Password
- Owner signup fields:
  - Owner Name, Email, Phone
  - Banquet Hall Name, Address, Password

### 5. Client Dashboard (`client-dashboard.html`)
- My Bookings section:
  - Booking ID, Venue, Date, Status
  - "Pay Now" button for confirmed bookings
- Payments & Invoices:
  - Invoice details
  - Payment status tracking
  - Direct payment links
- Profile management

### 6. Payment Page (`payment.html`)
- Order summary with breakdown
- Payment method selection:
  - Credit/Debit Card
  - Net Banking (major Indian banks)
  - UPI (Google Pay, PhonePe, Paytm)
- Secure payment forms
- Real-time validation
- Success confirmation

### 7. Admin Dashboard (`admin-dashboard.html`)
- Key statistics:
  - Pending requests
  - Confirmed bookings
  - Total revenue
- Incoming booking requests with:
  - Client contact information
  - Event details
  - Accept/Reject actions
- Confirmed bookings list
- Mini schedule overview
- Full booking management table

## Security Features

- Client contact information (email & mobile) stored with every booking
- Secure payment form validation
- Password-protected accounts
- Data encryption simulation

## Data Storage

The application uses browser localStorage for data persistence:
- User accounts
- Venue information
- Booking records
- Payment status

## User Workflows

### Client Booking Flow
1. Search for venues by city, date, and capacity
2. Filter results by preferences
3. View detailed venue information
4. Check availability calendar
5. Submit booking request with contact details
6. Receive confirmation (status: Pending)
7. Wait for admin approval
8. Receive payment request (status: Confirmed - Awaiting Payment)
9. Complete payment via preferred method
10. Booking confirmed (status: Confirmed, Payment: Paid)

### Owner Management Flow
1. Receive booking request notification
2. Review client information and details
3. Accept or reject booking
4. Track payment status
5. Manage venue availability
6. View schedule and upcoming events

## Color Scheme

- **Primary**: Purple (#8b5cf6)
- **Secondary**: Pink (#ec4899)
- **Accent**: Amber (#f59e0b)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)

## Key Features Implementation

### Search & Filter
- Real-time filtering without page reload
- Multiple filter types (capacity, price, amenities)
- Sort options (recommended, price, capacity)

### Availability Calendar
- Interactive date selection
- Visual indicators (available, booked, selected)
- Past date disabling
- Month navigation

### Payment Gateway
- Multiple payment methods
- Form validation
- Success/failure handling
- Payment confirmation modal

### Dashboard Analytics
- Real-time statistics
- Booking status tracking
- Revenue calculations
- Client information management

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript**: Vanilla JS for all functionality
- **Font Awesome**: Icons
- **Google Fonts**: Poppins font family

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## Coming Soon

- Customer review system
- Advanced analytics dashboard
- Email notifications
- SMS confirmations
- Real payment gateway integration
- Admin booking creation
- Venue availability blocking
- Multi-venue support for owners

## Notes

- This is a demonstration project using simulated data
- All payment processing is simulated (no real transactions)
- Venue images are from Unsplash
- Contact information required for safer admin-client communication

## User Roles

### Client
- Search and book venues
- Manage bookings
- Make payments
- Update profile

### Venue Owner
- Review booking requests
- Accept/reject bookings
- Manage schedule
- Track payments
- View analytics

## Learning Outcomes

This project demonstrates:
- Modern web development practices
- Responsive design principles
- User authentication flows
- CRUD operations with localStorage
- Interactive calendar implementation
- Form validation and handling
- Multi-role application architecture
- Indian payment integration concepts

## Support

For questions or issues with the application, refer to the code comments or contact information in the footer.

---
