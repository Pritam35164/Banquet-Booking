const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    city: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    capacity: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    pricing: {
        pricePerPlate: {
            type: Number,
            required: true
        },
        hallRental: {
            type: Number,
            required: true
        }
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    availability: {
        type: Map,
        of: Boolean,
        default: {}
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better search performance
venueSchema.index({ city: 1, 'capacity.min': 1, 'capacity.max': 1 });
venueSchema.index({ 'pricing.pricePerPlate': 1 });
venueSchema.index({ featured: -1, rating: -1 });

// Update timestamp on save
venueSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Venue', venueSchema);
