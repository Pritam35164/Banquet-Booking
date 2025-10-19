const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Contact model (optional - for storing messages in database)
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['general', 'booking', 'venue', 'payment', 'technical', 'feedback', 'other']
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved', 'closed'],
        default: 'new'
    },
    response: {
        type: String
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, subject, message } = req.body;

        // Create new contact message
        const contact = new Contact({
            name,
            email,
            phone,
            subject,
            message
        });

        await contact.save();

        // TODO: Send email notification to admin
        // TODO: Send confirmation email to user

        res.status(201).json({
            message: 'Thank you for contacting us! We will get back to you soon.',
            contactId: contact._id
        });

    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('respondedBy', 'name email');

        const total = await Contact.countDocuments(query);

        res.json({
            contacts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private/Admin
router.get('/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id)
            .populate('respondedBy', 'name email');

        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }

        res.json(contact);

    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/contact/:id
// @desc    Update contact message status/response
// @access  Private/Admin
router.put('/:id', [
    body('status').optional().isIn(['new', 'in-progress', 'resolved', 'closed']),
    body('response').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, response } = req.body;

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }

        if (status) {
            contact.status = status;
        }

        if (response) {
            contact.response = response;
            contact.respondedAt = new Date();
            // TODO: Set respondedBy from authenticated user
        }

        await contact.save();

        // TODO: Send email notification to user if response is provided

        res.json({
            message: 'Contact message updated successfully',
            contact
        });

    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ message: 'Contact message not found' });
        }

        await contact.deleteOne();

        res.json({ message: 'Contact message deleted successfully' });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
