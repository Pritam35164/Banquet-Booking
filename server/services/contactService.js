const Contact = require('../models/Contact');

/**
 * Contact Database Service
 * All CRUD operations for Contact collection
 */

class ContactService {
    
    // ========== CREATE Operations ==========
    
    /**
     * Create a new contact message
     */
    static async createContact(contactData) {
        try {
            const contact = new Contact(contactData);
            await contact.save();
            
            return { success: true, data: contact };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Submit a contact form
     */
    static async submitContactForm(name, email, phone, subject, message) {
        try {
            return await this.createContact({
                name,
                email,
                phone,
                subject,
                message,
                status: 'New',
                priority: 'Medium'
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== READ Operations ==========

    /**
     * Get all contact messages with filters
     */
    static async getAllContacts(filters = {}, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                sort = '-createdAt'
            } = options;

            const query = Contact.find(filters)
                .populate('respondedBy', 'name email')
                .sort(sort)
                .limit(limit)
                .skip((page - 1) * limit);

            const contacts = await query.exec();
            const total = await Contact.countDocuments(filters);

            return {
                success: true,
                data: contacts,
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
     * Get contact by ID
     */
    static async getContactById(contactId) {
        try {
            const contact = await Contact.findById(contactId)
                .populate('respondedBy', 'name email role');
            
            if (!contact) {
                return { success: false, error: 'Contact message not found' };
            }

            return { success: true, data: contact };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get contacts by status
     */
    static async getContactsByStatus(status, options = {}) {
        try {
            return await this.getAllContacts({ status }, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get new (unread) contacts
     */
    static async getNewContacts(options = {}) {
        try {
            return await this.getContactsByStatus('New', options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get contacts in progress
     */
    static async getInProgressContacts(options = {}) {
        try {
            return await this.getContactsByStatus('In Progress', options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get resolved contacts
     */
    static async getResolvedContacts(options = {}) {
        try {
            return await this.getContactsByStatus('Resolved', options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get contacts by priority
     */
    static async getContactsByPriority(priority, options = {}) {
        try {
            return await this.getAllContacts({ priority }, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get urgent contacts
     */
    static async getUrgentContacts(options = {}) {
        try {
            return await this.getContactsByPriority('Urgent', options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get contacts by email
     */
    static async getContactsByEmail(email, options = {}) {
        try {
            return await this.getAllContacts(
                { email: email.toLowerCase() }, 
                options
            );
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get unresolved contacts
     */
    static async getUnresolvedContacts(options = {}) {
        try {
            const filters = {
                status: { $in: ['New', 'In Progress'] }
            };
            return await this.getAllContacts(filters, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Search contacts
     */
    static async searchContacts(searchTerm, options = {}) {
        try {
            const filters = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { subject: { $regex: searchTerm, $options: 'i' } },
                    { message: { $regex: searchTerm, $options: 'i' } }
                ]
            };

            return await this.getAllContacts(filters, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== UPDATE Operations ==========

    /**
     * Update contact
     */
    static async updateContact(contactId, updateData) {
        try {
            const contact = await Contact.findByIdAndUpdate(
                contactId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('respondedBy', 'name email');

            if (!contact) {
                return { success: false, error: 'Contact message not found' };
            }

            return { success: true, data: contact };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update contact status
     */
    static async updateContactStatus(contactId, status) {
        try {
            return await this.updateContact(contactId, { status });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update contact priority
     */
    static async updateContactPriority(contactId, priority) {
        try {
            return await this.updateContact(contactId, { priority });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Respond to contact message
     */
    static async respondToContact(contactId, response, respondedBy) {
        try {
            const updateData = {
                response,
                respondedBy,
                respondedAt: new Date(),
                status: 'Resolved'
            };

            return await this.updateContact(contactId, updateData);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark contact as in progress
     */
    static async markAsInProgress(contactId) {
        try {
            return await this.updateContactStatus(contactId, 'In Progress');
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark contact as resolved
     */
    static async markAsResolved(contactId) {
        try {
            return await this.updateContactStatus(contactId, 'Resolved');
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Close contact
     */
    static async closeContact(contactId) {
        try {
            return await this.updateContactStatus(contactId, 'Closed');
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== DELETE Operations ==========

    /**
     * Delete contact
     */
    static async deleteContact(contactId) {
        try {
            const contact = await Contact.findByIdAndDelete(contactId);

            if (!contact) {
                return { success: false, error: 'Contact message not found' };
            }

            return { success: true, data: contact };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete multiple contacts
     */
    static async deleteMultipleContacts(contactIds) {
        try {
            const result = await Contact.deleteMany({ 
                _id: { $in: contactIds } 
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
     * Delete old closed contacts
     */
    static async deleteOldClosedContacts(monthsOld = 6) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

            const result = await Contact.deleteMany({
                status: 'Closed',
                createdAt: { $lt: cutoffDate }
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
     * Delete spam contacts (based on criteria)
     */
    static async deleteSpamContacts() {
        try {
            // Example: Delete contacts with certain spam keywords
            const spamKeywords = ['spam', 'test test test', 'xxxxxx'];
            
            const result = await Contact.deleteMany({
                $or: [
                    { message: { $regex: spamKeywords.join('|'), $options: 'i' } },
                    { subject: { $regex: spamKeywords.join('|'), $options: 'i' } }
                ]
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
     * Get contact statistics
     */
    static async getContactStats() {
        try {
            const stats = await Contact.aggregate([
                {
                    $group: {
                        _id: null,
                        totalContacts: { $sum: 1 },
                        newContacts: {
                            $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] }
                        },
                        inProgress: {
                            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
                        },
                        resolved: {
                            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
                        },
                        closed: {
                            $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] }
                        },
                        urgent: {
                            $sum: { $cond: [{ $eq: ['$priority', 'Urgent'] }, 1, 0] }
                        },
                        high: {
                            $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] }
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
     * Get contact trends by month
     */
    static async getContactTrends(months = 12) {
        try {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const trends = await Contact.aggregate([
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
                        totalContacts: { $sum: 1 },
                        resolved: {
                            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
                        },
                        pending: {
                            $sum: { 
                                $cond: [
                                    { $in: ['$status', ['New', 'In Progress']] }, 
                                    1, 
                                    0
                                ] 
                            }
                        }
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
     * Get response time statistics
     */
    static async getResponseTimeStats() {
        try {
            const stats = await Contact.aggregate([
                {
                    $match: {
                        respondedAt: { $exists: true }
                    }
                },
                {
                    $project: {
                        responseTime: {
                            $subtract: ['$respondedAt', '$createdAt']
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgResponseTime: { $avg: '$responseTime' },
                        minResponseTime: { $min: '$responseTime' },
                        maxResponseTime: { $max: '$responseTime' },
                        totalResponded: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        avgResponseTimeHours: { 
                            $divide: ['$avgResponseTime', 1000 * 60 * 60] 
                        },
                        minResponseTimeHours: { 
                            $divide: ['$minResponseTime', 1000 * 60 * 60] 
                        },
                        maxResponseTimeHours: { 
                            $divide: ['$maxResponseTime', 1000 * 60 * 60] 
                        },
                        totalResponded: 1
                    }
                }
            ]);

            return { success: true, data: stats[0] || {} };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get contacts grouped by status
     */
    static async getContactsByStatusCount() {
        try {
            const statusStats = await Contact.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            return { success: true, data: statusStats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get most active contact users
     */
    static async getMostActiveContactUsers(limit = 10) {
        try {
            const users = await Contact.aggregate([
                {
                    $group: {
                        _id: '$email',
                        name: { $first: '$name' },
                        phone: { $first: '$phone' },
                        contactCount: { $sum: 1 },
                        lastContact: { $max: '$createdAt' }
                    }
                },
                { $sort: { contactCount: -1 } },
                { $limit: limit }
            ]);

            return { success: true, data: users };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = ContactService;
