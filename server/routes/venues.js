const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

// @route   GET /api/venues
// @desc    Get all venues with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { city, minGuests, maxGuests, maxPrice, amenities, sortBy } = req.query;

        // Build query
        let query = { isActive: true };

        if (city) {
            query.city = city;
        }

        if (minGuests || maxGuests) {
            query['capacity.min'] = { $lte: parseInt(maxGuests) || 10000 };
            query['capacity.max'] = { $gte: parseInt(minGuests) || 0 };
        }

        if (maxPrice) {
            query['pricing.pricePerPlate'] = { $lte: parseInt(maxPrice) };
        }

        if (amenities) {
            const amenitiesArray = amenities.split(',');
            query.amenities = { $all: amenitiesArray };
        }

        // Sort
        let sort = {};
        switch (sortBy) {
            case 'price-low':
                sort = { 'pricing.pricePerPlate': 1 };
                break;
            case 'price-high':
                sort = { 'pricing.pricePerPlate': -1 };
                break;
            case 'capacity':
                sort = { 'capacity.max': -1 };
                break;
            default:
                sort = { featured: -1, rating: -1 };
        }

        const venues = await Venue.find(query).sort(sort).populate('owner', 'name email phone');

        res.json({
            success: true,
            count: venues.length,
            data: venues
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/venues/:id
// @desc    Get single venue
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id).populate('owner', 'name email phone');

        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        res.json({
            success: true,
            data: venue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/venues
// @desc    Create venue
// @access  Private (Owner)
router.post('/', async (req, res) => {
    try {
        const venue = new Venue(req.body);
        await venue.save();

        res.status(201).json({
            success: true,
            message: 'Venue created successfully',
            data: venue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
