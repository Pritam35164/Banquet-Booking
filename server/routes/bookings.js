const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// @route   GET /api/bookings
// @desc    Get all bookings (with filters)
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { clientEmail, venueId, status } = req.query;

        let query = {};

        if (clientEmail) {
            query.clientEmail = clientEmail;
        }

        if (venueId) {
            query.venue = venueId;
        }

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('venue', 'name location city')
            .populate('client', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('venue', 'name location city images')
            .populate('client', 'name email phone');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Public
router.post('/', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();

        // Populate venue and client info
        await booking.populate('venue', 'name location city');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('venue', 'name location city');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
