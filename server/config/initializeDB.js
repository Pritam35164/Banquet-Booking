const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./database');

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import Models
const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// Initialize Database with sample data
const initializeDatabase = async () => {
    try {
        await connectDB();
        
        console.log('\n🚀 Starting Database Initialization...\n');

        // Clear existing data (optional - comment out in production)
        console.log('🗑️  Clearing existing collections...');
        await User.deleteMany({});
        await Venue.deleteMany({});
        await Booking.deleteMany({});
        await Contact.deleteMany({});
        console.log('✅ Collections cleared\n');

        // Create indexes
        console.log('📑 Creating indexes...');
        await User.createIndexes();
        await Venue.createIndexes();
        await Booking.createIndexes();
        await Contact.createIndexes();
        console.log('✅ Indexes created\n');

        // ========== CREATE OPERATIONS ==========
        console.log('📝 Creating sample users...');
        
        // Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@banquetbook.com',
            password: '$2a$10$XqZv6gG3K5kF1N2M3O4P5e6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1', // hashed 'admin123'
            phone: '+91-9876543210',
            role: 'admin',
            isActive: true
        });
        console.log('✅ Admin user created:', admin.email);

        // Create Venue Owners
        const owner1 = await User.create({
            name: 'Raj Kumar',
            email: 'raj.kumar@venues.com',
            password: '$2a$10$XqZv6gG3K5kF1N2M3O4P5e6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1',
            phone: '+91-9876543211',
            role: 'owner',
            venueName: 'Grand Palace Banquet',
            venueAddress: 'Connaught Place, New Delhi',
            isActive: true
        });

        const owner2 = await User.create({
            name: 'Priya Sharma',
            email: 'priya.sharma@venues.com',
            password: '$2a$10$XqZv6gG3K5kF1N2M3O4P5e6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1',
            phone: '+91-9876543212',
            role: 'owner',
            venueName: 'Royal Gardens',
            venueAddress: 'Bandra West, Mumbai',
            isActive: true
        });

        const owner3 = await User.create({
            name: 'Amit Patel',
            email: 'amit.patel@venues.com',
            password: '$2a$10$XqZv6gG3K5kF1N2M3O4P5e6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1',
            phone: '+91-9876543213',
            role: 'owner',
            venueName: 'Celebration Hall',
            venueAddress: 'Koramangala, Bangalore',
            isActive: true
        });

        console.log('✅ Venue owners created');

        // Create Clients
        const client1 = await User.create({
            name: 'Rahul Verma',
            email: 'rahul.verma@email.com',
            password: '$2a$10$XqZv6gG3K5kF1N2M3O4P5e6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1',
            phone: '+91-9876543214',
            role: 'client',
            isActive: true
        });

        const client2 = await User.create({
            name: 'Sneha Singh',
            email: 'sneha.singh@email.com',
            password: '$2a$10$XqZv6gG3K5kF1N2M3O4P5e6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1',
            phone: '+91-9876543215',
            role: 'client',
            isActive: true
        });

        console.log('✅ Clients created\n');

        // Create Venues
        console.log('🏛️  Creating sample venues...');
        
        const venue1 = await Venue.create({
            name: 'Grand Palace Banquet',
            description: 'Luxurious banquet hall with royal ambiance, perfect for weddings and grand celebrations. Features include crystal chandeliers, marble flooring, and state-of-the-art sound systems.',
            owner: owner1._id,
            city: 'New Delhi',
            location: 'Connaught Place',
            address: 'Block A, Connaught Place, New Delhi - 110001',
            capacity: { min: 100, max: 500 },
            pricing: { pricePerPlate: 1500, hallRental: 50000 },
            amenities: ['AC', 'Parking', 'Catering', 'DJ', 'Decoration', 'Valet Parking', 'Projector', 'Stage'],
            images: ['venue1-1.jpg', 'venue1-2.jpg', 'venue1-3.jpg'],
            rating: 4.8,
            reviewCount: 156,
            featured: true,
            isActive: true
        });

        const venue2 = await Venue.create({
            name: 'Royal Gardens',
            description: 'Beautiful outdoor garden venue with natural greenery and elegant setup. Perfect for intimate gatherings and garden weddings.',
            owner: owner2._id,
            city: 'Mumbai',
            location: 'Bandra West',
            address: 'Linking Road, Bandra West, Mumbai - 400050',
            capacity: { min: 50, max: 300 },
            pricing: { pricePerPlate: 1800, hallRental: 75000 },
            amenities: ['Garden', 'Parking', 'Catering', 'Decoration', 'Photography', 'Outdoor Seating'],
            images: ['venue2-1.jpg', 'venue2-2.jpg'],
            rating: 4.6,
            reviewCount: 89,
            featured: true,
            isActive: true
        });

        const venue3 = await Venue.create({
            name: 'Celebration Hall',
            description: 'Modern and spacious banquet hall with contemporary design. Ideal for corporate events and receptions.',
            owner: owner3._id,
            city: 'Bangalore',
            location: 'Koramangala',
            address: '5th Block, Koramangala, Bangalore - 560095',
            capacity: { min: 80, max: 400 },
            pricing: { pricePerPlate: 1200, hallRental: 40000 },
            amenities: ['AC', 'Parking', 'Catering', 'WiFi', 'Projector', 'Stage', 'Green Room'],
            images: ['venue3-1.jpg', 'venue3-2.jpg'],
            rating: 4.5,
            reviewCount: 67,
            featured: false,
            isActive: true
        });

        const venue4 = await Venue.create({
            name: 'Elegant Events Plaza',
            description: 'Premium venue with world-class facilities and exceptional service.',
            owner: owner1._id,
            city: 'New Delhi',
            location: 'Dwarka',
            address: 'Sector 12, Dwarka, New Delhi - 110075',
            capacity: { min: 150, max: 600 },
            pricing: { pricePerPlate: 2000, hallRental: 80000 },
            amenities: ['AC', 'Parking', 'Catering', 'DJ', 'Decoration', 'Valet Parking', 'Bridal Room', 'Stage'],
            images: ['venue4-1.jpg'],
            rating: 4.9,
            reviewCount: 203,
            featured: true,
            isActive: true
        });

        console.log('✅ Venues created\n');

        // Create Bookings
        console.log('📅 Creating sample bookings...');

        const booking1 = await Booking.create({
            venue: venue1._id,
            client: client1._id,
            eventDate: new Date('2025-11-15'),
            guests: 250,
            clientName: 'Rahul Verma',
            clientEmail: 'rahul.verma@email.com',
            clientPhone: '+91-9876543214',
            notes: 'Wedding reception, need decoration in red and gold theme',
            pricePerPlate: 1500,
            hallRental: 50000,
            totalAmount: 425000,
            status: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: 'Online',
            paymentDate: new Date('2025-10-15'),
            confirmedAt: new Date('2025-10-15')
        });

        const booking2 = await Booking.create({
            venue: venue2._id,
            client: client2._id,
            eventDate: new Date('2025-12-05'),
            guests: 150,
            clientName: 'Sneha Singh',
            clientEmail: 'sneha.singh@email.com',
            clientPhone: '+91-9876543215',
            notes: 'Engagement ceremony, outdoor setup preferred',
            pricePerPlate: 1800,
            hallRental: 75000,
            totalAmount: 345000,
            status: 'Confirmed - Awaiting Payment',
            paymentStatus: 'Unpaid'
        });

        const booking3 = await Booking.create({
            venue: venue3._id,
            client: client1._id,
            eventDate: new Date('2025-10-25'),
            guests: 100,
            clientName: 'Rahul Verma',
            clientEmail: 'rahul.verma@email.com',
            clientPhone: '+91-9876543214',
            notes: 'Birthday party',
            pricePerPlate: 1200,
            hallRental: 40000,
            totalAmount: 160000,
            status: 'Pending',
            paymentStatus: 'Unpaid'
        });

        console.log('✅ Bookings created\n');

        // Create Contact Messages
        console.log('💬 Creating sample contact messages...');

        await Contact.create({
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+91-9876543220',
            subject: 'Inquiry about venue availability',
            message: 'Hi, I would like to know if you have any venues available for December 2025 for a wedding reception of around 300 guests.',
            status: 'New',
            priority: 'High'
        });

        await Contact.create({
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+91-9876543221',
            subject: 'Payment issue',
            message: 'I am facing issues with online payment. Please help.',
            status: 'In Progress',
            priority: 'Urgent',
            response: 'We are looking into this issue. Our team will contact you shortly.',
            respondedBy: admin._id,
            respondedAt: new Date()
        });

        console.log('✅ Contact messages created\n');

        // ========== READ OPERATIONS (QUERIES) ==========
        console.log('📖 Performing READ operations...\n');

        // Find all venues in a specific city
        const delhiVenues = await Venue.find({ city: 'New Delhi' }).populate('owner', 'name email');
        console.log(`✅ Found ${delhiVenues.length} venues in New Delhi`);

        // Find venues by capacity
        const largeVenues = await Venue.find({ 'capacity.max': { $gte: 400 } });
        console.log(`✅ Found ${largeVenues.length} venues with capacity >= 400`);

        // Find featured venues sorted by rating
        const featuredVenues = await Venue.find({ featured: true }).sort({ rating: -1 });
        console.log(`✅ Found ${featuredVenues.length} featured venues`);

        // Find all bookings for a specific client
        const clientBookings = await Booking.find({ client: client1._id })
            .populate('venue', 'name city')
            .sort({ eventDate: 1 });
        console.log(`✅ Found ${clientBookings.length} bookings for client`);

        // Find confirmed bookings
        const confirmedBookings = await Booking.find({ status: 'Confirmed' })
            .populate('venue client');
        console.log(`✅ Found ${confirmedBookings.length} confirmed bookings`);

        // Find all venue owners
        const owners = await User.find({ role: 'owner' });
        console.log(`✅ Found ${owners.length} venue owners`);

        // Find unresolved contact messages
        const unresolvedContacts = await Contact.find({ 
            status: { $in: ['New', 'In Progress'] } 
        }).sort({ createdAt: -1 });
        console.log(`✅ Found ${unresolvedContacts.length} unresolved contact messages\n`);

        // ========== UPDATE OPERATIONS ==========
        console.log('✏️  Performing UPDATE operations...\n');

        // Update venue rating
        await Venue.findByIdAndUpdate(venue1._id, {
            rating: 4.9,
            reviewCount: 157
        });
        console.log('✅ Updated venue rating');

        // Update booking status
        await Booking.findByIdAndUpdate(booking3._id, {
            status: 'Confirmed',
            confirmedAt: new Date()
        });
        console.log('✅ Updated booking status');

        // Update user profile
        await User.findByIdAndUpdate(client1._id, {
            phone: '+91-9876543299'
        });
        console.log('✅ Updated user profile');

        // Update contact message status
        await Contact.findOneAndUpdate(
            { status: 'New' },
            { 
                status: 'In Progress',
                priority: 'High'
            }
        );
        console.log('✅ Updated contact message status\n');

        // ========== DELETE OPERATIONS ==========
        console.log('🗑️  Performing DELETE operations...\n');

        // Soft delete a venue (mark as inactive)
        await Venue.findByIdAndUpdate(venue4._id, { isActive: false });
        console.log('✅ Soft deleted venue (marked inactive)');

        // Delete old resolved contacts (example)
        const oldDate = new Date();
        oldDate.setMonth(oldDate.getMonth() - 6);
        const deletedContacts = await Contact.deleteMany({
            status: 'Closed',
            createdAt: { $lt: oldDate }
        });
        console.log(`✅ Deleted ${deletedContacts.deletedCount} old contact messages\n`);

        // ========== AGGREGATE OPERATIONS ==========
        console.log('📊 Performing AGGREGATE operations...\n');

        // Get venue statistics by city
        const venuesByCity = await Venue.aggregate([
            { $match: { isActive: true } },
            { $group: { 
                _id: '$city', 
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' },
                avgPrice: { $avg: '$pricing.pricePerPlate' }
            }},
            { $sort: { count: -1 } }
        ]);
        console.log('✅ Venue statistics by city:', JSON.stringify(venuesByCity, null, 2));

        // Get booking revenue by month
        const revenueByMonth = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: {
                _id: { 
                    year: { $year: '$eventDate' },
                    month: { $month: '$eventDate' }
                },
                totalRevenue: { $sum: '$totalAmount' },
                bookingCount: { $sum: 1 }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        console.log('✅ Revenue by month:', JSON.stringify(revenueByMonth, null, 2));

        // Get top rated venues
        const topVenues = await Venue.aggregate([
            { $match: { isActive: true } },
            { $sort: { rating: -1, reviewCount: -1 } },
            { $limit: 5 },
            { $project: { name: 1, city: 1, rating: 1, reviewCount: 1 } }
        ]);
        console.log('✅ Top rated venues:', JSON.stringify(topVenues, null, 2));

        console.log('\n✨ Database initialization completed successfully!\n');
        console.log('📋 Summary:');
        console.log(`   - Users: ${await User.countDocuments()}`);
        console.log(`   - Venues: ${await Venue.countDocuments()}`);
        console.log(`   - Bookings: ${await Booking.countDocuments()}`);
        console.log(`   - Contact Messages: ${await Contact.countDocuments()}`);
        console.log('\n🎉 All operations completed!\n');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔴 Database connection closed');
        process.exit(0);
    }
};

// Run initialization
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;
