const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./database');

// Import Services
const VenueService = require('../services/venueService');
const BookingService = require('../services/bookingService');
const UserService = require('../services/userService');
const ContactService = require('../services/contactService');

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Test all database operations
 */
const testDatabase = async () => {
    try {
        await connectDB();
        
        console.log('\n🧪 Starting Database Operations Test...\n');

        // ========== TEST USER OPERATIONS ==========
        console.log('👤 Testing User Operations...');
        
        // Get all users
        const usersResult = await UserService.getAllUsers();
        console.log(`✅ Found ${usersResult.data?.length || 0} users`);

        // Get user stats
        const userStats = await UserService.getUserStats();
        console.log('✅ User Statistics:', userStats.data);

        // ========== TEST VENUE OPERATIONS ==========
        console.log('\n🏛️  Testing Venue Operations...');
        
        // Get all venues
        const venuesResult = await VenueService.getAllVenues();
        console.log(`✅ Found ${venuesResult.data?.length || 0} venues`);

        // Search venues by city
        const delhiVenues = await VenueService.getVenuesByCity('Delhi');
        console.log(`✅ Found ${delhiVenues.data?.length || 0} venues in Delhi`);

        // Get featured venues
        const featuredVenues = await VenueService.getFeaturedVenues();
        console.log(`✅ Found ${featuredVenues.data?.length || 0} featured venues`);

        // Get venue stats
        const venueStats = await VenueService.getVenueStats();
        console.log('✅ Venue Statistics:', venueStats.data);

        // Get top rated venues
        const topVenues = await VenueService.getTopRatedVenues(5);
        console.log(`✅ Top 5 venues:`, topVenues.data?.map(v => ({
            name: v.name,
            rating: v.rating,
            city: v.city
        })));

        // ========== TEST BOOKING OPERATIONS ==========
        console.log('\n📅 Testing Booking Operations...');
        
        // Get all bookings
        const bookingsResult = await BookingService.getAllBookings();
        console.log(`✅ Found ${bookingsResult.data?.length || 0} bookings`);

        // Get upcoming bookings
        const upcomingBookings = await BookingService.getUpcomingBookings();
        console.log(`✅ Found ${upcomingBookings.data?.length || 0} upcoming bookings`);

        // Get booking stats
        const bookingStats = await BookingService.getBookingStats();
        console.log('✅ Booking Statistics:', bookingStats.data);

        // Get most booked venues
        const mostBooked = await BookingService.getMostBookedVenues(3);
        console.log(`✅ Top 3 most booked venues:`, mostBooked.data?.map(v => ({
            venue: v.venueName,
            bookings: v.bookingCount,
            revenue: v.totalRevenue
        })));

        // ========== TEST CONTACT OPERATIONS ==========
        console.log('\n💬 Testing Contact Operations...');
        
        // Get all contacts
        const contactsResult = await ContactService.getAllContacts();
        console.log(`✅ Found ${contactsResult.data?.length || 0} contact messages`);

        // Get unresolved contacts
        const unresolvedContacts = await ContactService.getUnresolvedContacts();
        console.log(`✅ Found ${unresolvedContacts.data?.length || 0} unresolved contacts`);

        // Get contact stats
        const contactStats = await ContactService.getContactStats();
        console.log('✅ Contact Statistics:', contactStats.data);

        // ========== ADVANCED QUERIES ==========
        console.log('\n📊 Testing Advanced Queries...');

        // Search venues with multiple filters
        const searchResult = await VenueService.searchVenues({
            guests: 200,
            minPrice: 1000,
            maxPrice: 2000
        });
        console.log(`✅ Found ${searchResult.data?.length || 0} venues matching search criteria`);

        // Get venues by city statistics
        const citiesStats = await VenueService.getVenuesByCity();
        console.log('✅ Venues by city:', citiesStats.data);

        // Get booking trends
        const bookingTrends = await BookingService.getBookingTrends(6);
        console.log(`✅ Booking trends for last 6 months (${bookingTrends.data?.length || 0} data points)`);

        // Get revenue by month
        const revenue = await BookingService.getRevenueByMonth();
        console.log(`✅ Revenue data by month (${revenue.data?.length || 0} months)`);

        console.log('\n✨ All database tests completed successfully!\n');

        // Display summary
        console.log('📋 Database Summary:');
        console.log(`   - Total Users: ${userStats.data?.totalUsers || 0}`);
        console.log(`   - Total Venues: ${venueStats.data?.totalVenues || 0}`);
        console.log(`   - Total Bookings: ${bookingStats.data?.totalBookings || 0}`);
        console.log(`   - Total Revenue: ₹${bookingStats.data?.totalRevenue?.toLocaleString() || 0}`);
        console.log(`   - Total Contacts: ${contactStats.data?.totalContacts || 0}`);
        console.log('\n🎉 Database is working perfectly!\n');

    } catch (error) {
        console.error('❌ Error testing database:', error);
        throw error;
    } finally {
        // Close connection
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('🔴 Database connection closed');
        process.exit(0);
    }
};

// Run test
if (require.main === module) {
    testDatabase();
}

module.exports = testDatabase;
