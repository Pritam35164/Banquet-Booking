const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const mongoose = require('mongoose');

/**
 * Booking Database Service
 * All CRUD operations for Booking collection
 */

class BookingService {
    
    // ========== CREATE Operations ==========
    
    /**
     * Create a new booking
     */
    static async createBooking(bookingData) {
        try {
            const booking = new Booking(bookingData);
            await booking.save();
            
            // Populate venue and client details
            await booking.populate(['venue', 'client']);
            
            return { success: true, data: booking };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Create multiple bookings
     */
    static async createMultipleBookings(bookingsArray) {
        try {
            const bookings = await Booking.insertMany(bookingsArray);
            return { success: true, data: bookings };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== READ Operations ==========

    /**
     * Get all bookings with filters
     */
    static async getAllBookings(filters = {}, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                sort = '-createdAt',
                populate = ['venue', 'client']
            } = options;

            const query = Booking.find(filters)
                .populate('venue', 'name city location pricing')
                .populate('client', 'name email phone')
                .sort(sort)
                .limit(limit)
                .skip((page - 1) * limit);

            const bookings = await query.exec();
            const total = await Booking.countDocuments(filters);

            return {
                success: true,
                data: bookings,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get booking by ID
     */
    static async getBookingById(bookingId) {
        try {
            const booking = await Booking.findById(bookingId)
                .populate('venue')
                .populate('client', '-password');
            
            if (!booking) {
                return { success: false, error: 'Booking not found' };
            }

            return { success: true, data: booking };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get bookings by client
     */
    static async getBookingsByClient(clientId, options = {}) {
        try {
            return await this.getAllBookings(
                { client: clientId },
                { ...options, sort: '-eventDate' }
            );
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get bookings by venue
     */
    static async getBookingsByVenue(venueId, options = {}) {
        try {
            return await this.getAllBookings(
                { venue: venueId },
                { ...options, sort: 'eventDate' }
            );
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get bookings by status
     */
    static async getBookingsByStatus(status, options = {}) {
        try {
            return await this.getAllBookings({ status }, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get bookings by date range
     */
    static async getBookingsByDateRange(startDate, endDate, options = {}) {
        try {
            const filters = {
                eventDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };

            return await this.getAllBookings(filters, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get upcoming bookings
     */
    static async getUpcomingBookings(options = {}) {
        try {
            const filters = {
                eventDate: { $gte: new Date() },
                status: { $in: ['Confirmed', 'Confirmed - Awaiting Payment', 'Pending'] }
            };

            return await this.getAllBookings(
                filters, 
                { ...options, sort: 'eventDate' }
            );
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get past bookings
     */
    static async getPastBookings(options = {}) {
        try {
            const filters = {
                eventDate: { $lt: new Date() }
            };

            return await this.getAllBookings(
                filters, 
                { ...options, sort: '-eventDate' }
            );
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Check venue availability for a date
     */
    static async checkVenueAvailability(venueId, eventDate) {
        try {
            const booking = await Booking.findOne({
                venue: venueId,
                eventDate: new Date(eventDate),
                status: { $nin: ['Cancelled'] }
            });

            return { 
                success: true, 
                data: { 
                    available: !booking,
                    booking: booking || null
                } 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== UPDATE Operations ==========

    /**
     * Update booking
     */
    static async updateBooking(bookingId, updateData) {
        try {
            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate(['venue', 'client']);

            if (!booking) {
                return { success: false, error: 'Booking not found' };
            }

            return { success: true, data: booking };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update booking status
     */
    static async updateBookingStatus(bookingId, status) {
        try {
            const updateObj = { status };

            if (status === 'Confirmed') {
                updateObj.confirmedAt = new Date();
            } else if (status === 'Cancelled') {
                updateObj.cancelledAt = new Date();
            }

            return await this.updateBooking(bookingId, updateObj);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update payment status
     */
    static async updatePaymentStatus(bookingId, paymentStatus, paymentMethod = null) {
        try {
            const updateObj = { paymentStatus };

            if (paymentStatus === 'Paid') {
                updateObj.paymentDate = new Date();
                if (paymentMethod) {
                    updateObj.paymentMethod = paymentMethod;
                }
            }

            return await this.updateBooking(bookingId, updateObj);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Confirm booking and process payment
     */
    static async confirmBookingWithPayment(bookingId, paymentMethod) {
        try {
            const updateObj = {
                status: 'Confirmed',
                paymentStatus: 'Paid',
                paymentMethod,
                paymentDate: new Date(),
                confirmedAt: new Date()
            };

            return await this.updateBooking(bookingId, updateObj);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel booking
     */
    static async cancelBooking(bookingId, reason = null) {
        try {
            const updateObj = {
                status: 'Cancelled',
                cancelledAt: new Date()
            };

            if (reason) {
                updateObj.notes = updateObj.notes 
                    ? `${updateObj.notes}\nCancellation reason: ${reason}`
                    : `Cancellation reason: ${reason}`;
            }

            // Update payment status if it was paid
            const booking = await Booking.findById(bookingId);
            if (booking && booking.paymentStatus === 'Paid') {
                updateObj.paymentStatus = 'Refunded';
            } else {
                updateObj.paymentStatus = 'Cancelled';
            }

            return await this.updateBooking(bookingId, updateObj);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== DELETE Operations ==========

    /**
     * Delete booking
     */
    static async deleteBooking(bookingId) {
        try {
            const booking = await Booking.findByIdAndDelete(bookingId);

            if (!booking) {
                return { success: false, error: 'Booking not found' };
            }

            return { success: true, data: booking };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete multiple bookings
     */
    static async deleteMultipleBookings(bookingIds) {
        try {
            const result = await Booking.deleteMany({ 
                _id: { $in: bookingIds } 
            });

            return { 
                success: true, 
                data: { deletedCount: result.deletedCount } 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete old cancelled bookings
     */
    static async deleteOldCancelledBookings(monthsOld = 6) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

            const result = await Booking.deleteMany({
                status: 'Cancelled',
                cancelledAt: { $lt: cutoffDate }
            });

            return { 
                success: true, 
                data: { deletedCount: result.deletedCount } 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== AGGREGATE Operations ==========

    /**
     * Get booking statistics
     */
    static async getBookingStats() {
        try {
            const stats = await Booking.aggregate([
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' },
                        avgBookingAmount: { $avg: '$totalAmount' },
                        confirmedBookings: {
                            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
                        },
                        pendingBookings: {
                            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                        },
                        cancelledBookings: {
                            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                        }
                    }
                }
            ]);

            return { success: true, data: stats[0] || {} };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get revenue by month
     */
    static async getRevenueByMonth(year = new Date().getFullYear()) {
        try {
            const revenue = await Booking.aggregate([
                {
                    $match: {
                        paymentStatus: 'Paid',
                        paymentDate: {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$paymentDate' },
                        totalRevenue: { $sum: '$totalAmount' },
                        bookingCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return { success: true, data: revenue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get most booked venues
     */
    static async getMostBookedVenues(limit = 10) {
        try {
            const venues = await Booking.aggregate([
                {
                    $match: {
                        status: { $in: ['Confirmed', 'Completed'] }
                    }
                },
                {
                    $group: {
                        _id: '$venue',
                        bookingCount: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' },
                        avgGuests: { $avg: '$guests' }
                    }
                },
                { $sort: { bookingCount: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'venues',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'venueDetails'
                    }
                },
                { $unwind: '$venueDetails' },
                {
                    $project: {
                        venueName: '$venueDetails.name',
                        city: '$venueDetails.city',
                        bookingCount: 1,
                        totalRevenue: 1,
                        avgGuests: 1
                    }
                }
            ]);

            return { success: true, data: venues };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get booking trends
     */
    static async getBookingTrends(months = 12) {
        try {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const trends = await Booking.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalBookings: { $sum: 1 },
                        confirmed: {
                            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
                        },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                        },
                        cancelled: {
                            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                        },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            return { success: true, data: trends };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get client booking history with statistics
     */
    static async getClientBookingHistory(clientId) {
        try {
            const history = await Booking.aggregate([
                {
                    $match: { client: mongoose.Types.ObjectId(clientId) }
                },
                {
                    $facet: {
                        bookings: [
                            { $sort: { eventDate: -1 } },
                            { $limit: 10 },
                            {
                                $lookup: {
                                    from: 'venues',
                                    localField: 'venue',
                                    foreignField: '_id',
                                    as: 'venueDetails'
                                }
                            }
                        ],
                        stats: [
                            {
                                $group: {
                                    _id: null,
                                    totalBookings: { $sum: 1 },
                                    totalSpent: { $sum: '$totalAmount' },
                                    avgSpent: { $avg: '$totalAmount' }
                                }
                            }
                        ]
                    }
                }
            ]);

            return { success: true, data: history[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = BookingService;
