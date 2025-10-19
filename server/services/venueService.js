const Venue = require('../models/Venue');
const mongoose = require('mongoose');

/**
 * Venue Database Service
 * All CRUD operations for Venue collection
 */

class VenueService {
    
    // ========== CREATE Operations ==========
    
    /**
     * Create a new venue
     */
    static async createVenue(venueData) {
        try {
            const venue = new Venue(venueData);
            await venue.save();
            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Create multiple venues
     */
    static async createMultipleVenues(venuesArray) {
        try {
            const venues = await Venue.insertMany(venuesArray);
            return { success: true, data: venues };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== READ Operations ==========

    /**
     * Get all venues with optional filters
     */
    static async getAllVenues(filters = {}, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                sort = '-createdAt',
                populate = 'owner'
            } = options;

            const query = Venue.find(filters)
                .populate(populate, 'name email phone')
                .sort(sort)
                .limit(limit)
                .skip((page - 1) * limit);

            const venues = await query.exec();
            const total = await Venue.countDocuments(filters);

            return {
                success: true,
                data: venues,
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
     * Get venue by ID
     */
    static async getVenueById(venueId) {
        try {
            const venue = await Venue.findById(venueId)
                .populate('owner', 'name email phone venueName');
            
            if (!venue) {
                return { success: false, error: 'Venue not found' };
            }

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Search venues by city
     */
    static async getVenuesByCity(city, options = {}) {
        try {
            return await this.getAllVenues(
                { city: { $regex: city, $options: 'i' }, isActive: true },
                options
            );
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Search venues by capacity range
     */
    static async getVenuesByCapacity(minGuests, maxGuests = null, options = {}) {
        try {
            const filters = {
                'capacity.min': { $lte: minGuests },
                'capacity.max': { $gte: minGuests },
                isActive: true
            };

            if (maxGuests) {
                filters['capacity.max'] = { $gte: maxGuests };
            }

            return await this.getAllVenues(filters, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Search venues by price range
     */
    static async getVenuesByPriceRange(minPrice, maxPrice, options = {}) {
        try {
            const filters = {
                'pricing.pricePerPlate': { 
                    $gte: minPrice, 
                    $lte: maxPrice 
                },
                isActive: true
            };

            return await this.getAllVenues(filters, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get featured venues
     */
    static async getFeaturedVenues(limit = 6) {
        try {
            const venues = await Venue.find({ featured: true, isActive: true })
                .sort({ rating: -1 })
                .limit(limit)
                .populate('owner', 'name');

            return { success: true, data: venues };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get venues by owner
     */
    static async getVenuesByOwner(ownerId, options = {}) {
        try {
            return await this.getAllVenues({ owner: ownerId }, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Search venues with multiple filters
     */
    static async searchVenues(searchParams) {
        try {
            const { 
                city, 
                guests, 
                minPrice, 
                maxPrice, 
                amenities,
                date,
                page = 1,
                limit = 10
            } = searchParams;

            const filters = { isActive: true };

            if (city) {
                filters.city = { $regex: city, $options: 'i' };
            }

            if (guests) {
                filters['capacity.min'] = { $lte: parseInt(guests) };
                filters['capacity.max'] = { $gte: parseInt(guests) };
            }

            if (minPrice || maxPrice) {
                filters['pricing.pricePerPlate'] = {};
                if (minPrice) filters['pricing.pricePerPlate'].$gte = parseFloat(minPrice);
                if (maxPrice) filters['pricing.pricePerPlate'].$lte = parseFloat(maxPrice);
            }

            if (amenities && amenities.length > 0) {
                filters.amenities = { $all: amenities };
            }

            return await this.getAllVenues(filters, { page, limit, sort: '-rating' });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== UPDATE Operations ==========

    /**
     * Update venue by ID
     */
    static async updateVenue(venueId, updateData) {
        try {
            const venue = await Venue.findByIdAndUpdate(
                venueId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!venue) {
                return { success: false, error: 'Venue not found' };
            }

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update venue rating
     */
    static async updateVenueRating(venueId, newRating, incrementReviews = true) {
        try {
            const updateObj = { rating: newRating };
            if (incrementReviews) {
                updateObj.$inc = { reviewCount: 1 };
            }

            const venue = await Venue.findByIdAndUpdate(
                venueId,
                updateObj,
                { new: true }
            );

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update venue availability
     */
    static async updateVenueAvailability(venueId, date, isAvailable) {
        try {
            const venue = await Venue.findById(venueId);
            if (!venue) {
                return { success: false, error: 'Venue not found' };
            }

            venue.availability.set(date, isAvailable);
            await venue.save();

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Add amenity to venue
     */
    static async addAmenity(venueId, amenity) {
        try {
            const venue = await Venue.findByIdAndUpdate(
                venueId,
                { $addToSet: { amenities: amenity } },
                { new: true }
            );

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove amenity from venue
     */
    static async removeAmenity(venueId, amenity) {
        try {
            const venue = await Venue.findByIdAndUpdate(
                venueId,
                { $pull: { amenities: amenity } },
                { new: true }
            );

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== DELETE Operations ==========

    /**
     * Soft delete venue (mark as inactive)
     */
    static async softDeleteVenue(venueId) {
        try {
            const venue = await Venue.findByIdAndUpdate(
                venueId,
                { isActive: false },
                { new: true }
            );

            if (!venue) {
                return { success: false, error: 'Venue not found' };
            }

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Hard delete venue
     */
    static async deleteVenue(venueId) {
        try {
            const venue = await Venue.findByIdAndDelete(venueId);

            if (!venue) {
                return { success: false, error: 'Venue not found' };
            }

            return { success: true, data: venue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete multiple venues
     */
    static async deleteMultipleVenues(venueIds) {
        try {
            const result = await Venue.deleteMany({ 
                _id: { $in: venueIds } 
            });

            return { 
                success: true, 
                data: { 
                    deletedCount: result.deletedCount 
                } 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== AGGREGATE Operations ==========

    /**
     * Get venue statistics
     */
    static async getVenueStats() {
        try {
            const stats = await Venue.aggregate([
                {
                    $group: {
                        _id: null,
                        totalVenues: { $sum: 1 },
                        avgRating: { $avg: '$rating' },
                        avgPricePerPlate: { $avg: '$pricing.pricePerPlate' },
                        avgHallRental: { $avg: '$pricing.hallRental' },
                        totalCapacity: { $sum: '$capacity.max' }
                    }
                }
            ]);

            return { success: true, data: stats[0] || {} };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get venues grouped by city
     */
    static async getVenuesByCity() {
        try {
            const cities = await Venue.aggregate([
                { $match: { isActive: true } },
                { 
                    $group: {
                        _id: '$city',
                        count: { $sum: 1 },
                        avgRating: { $avg: '$rating' },
                        avgPrice: { $avg: '$pricing.pricePerPlate' }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            return { success: true, data: cities };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get top rated venues
     */
    static async getTopRatedVenues(limit = 10) {
        try {
            const venues = await Venue.aggregate([
                { $match: { isActive: true } },
                { $sort: { rating: -1, reviewCount: -1 } },
                { $limit: limit },
                {
                    $project: {
                        name: 1,
                        city: 1,
                        rating: 1,
                        reviewCount: 1,
                        'pricing.pricePerPlate': 1
                    }
                }
            ]);

            return { success: true, data: venues };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get price range statistics by city
     */
    static async getPriceRangeByCity() {
        try {
            const priceRanges = await Venue.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: '$city',
                        minPrice: { $min: '$pricing.pricePerPlate' },
                        maxPrice: { $max: '$pricing.pricePerPlate' },
                        avgPrice: { $avg: '$pricing.pricePerPlate' },
                        venueCount: { $sum: 1 }
                    }
                },
                { $sort: { avgPrice: -1 } }
            ]);

            return { success: true, data: priceRanges };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = VenueService;
