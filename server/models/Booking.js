const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Event Details
    eventDate: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    // Client Contact (for safety)
    clientName: {
        type: String,
        required: true
    },
    clientEmail: {
        type: String,
        required: true
    },
    clientPhone: {
        type: String,
        required: true
    },
    // Booking Details
    notes: String,
    // Pricing
    pricePerPlate: {
        type: Number,
        required: true
    },
    hallRental: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    // Status
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Confirmed - Awaiting Payment', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Refunded', 'Cancelled'],
        default: 'Unpaid'
    },
    paymentMethod: String,
    paymentDate: Date,
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date,
    cancelledAt: Date
});

// Indexes
bookingSchema.index({ venue: 1, eventDate: 1 });
bookingSchema.index({ client: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });

// Update timestamp on save
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate booking ID
bookingSchema.virtual('bookingId').get(function() {
    return 'BK' + this._id.toString().slice(-8).toUpperCase();
});

module.exports = mongoose.model('Booking', bookingSchema);
