const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * User Database Service
 * All CRUD operations for User collection
 */

class UserService {
    
    // ========== CREATE Operations ==========
    
    /**
     * Create a new user
     */
    static async createUser(userData) {
        try {
            // Hash password before saving
            if (userData.password) {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
            }

            const user = new User(userData);
            await user.save();
            
            // Remove password from response
            const userObj = user.toObject();
            delete userObj.password;
            
            return { success: true, data: userObj };
        } catch (error) {
            if (error.code === 11000) {
                return { success: false, error: 'Email already exists' };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Register a new user (with password hashing)
     */
    static async registerUser(name, email, password, phone, role = 'client', additionalData = {}) {
        try {
            return await this.createUser({
                name,
                email,
                password,
                phone,
                role,
                ...additionalData
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== READ Operations ==========

    /**
     * Get all users with filters
     */
    static async getAllUsers(filters = {}, options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                sort = '-createdAt'
            } = options;

            const query = User.find(filters)
                .select('-password')
                .sort(sort)
                .limit(limit)
                .skip((page - 1) * limit);

            const users = await query.exec();
            const total = await User.countDocuments(filters);

            return {
                success: true,
                data: users,
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
     * Get user by ID
     */
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user by email
     */
    static async getUserByEmail(email) {
        try {
            const user = await User.findOne({ email: email.toLowerCase() })
                .select('-password');
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user by email (with password for authentication)
     */
    static async getUserByEmailWithPassword(email) {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get users by role
     */
    static async getUsersByRole(role, options = {}) {
        try {
            return await this.getAllUsers({ role }, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all clients
     */
    static async getAllClients(options = {}) {
        try {
            return await this.getUsersByRole('client', options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all venue owners
     */
    static async getAllOwners(options = {}) {
        try {
            return await this.getUsersByRole('owner', options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all admins
     */
    static async getAllAdmins(options = {}) {
        try {
            return await this.getUsersByRole('admin', options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get active users
     */
    static async getActiveUsers(options = {}) {
        try {
            return await this.getAllUsers({ isActive: true }, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Search users by name or email
     */
    static async searchUsers(searchTerm, options = {}) {
        try {
            const filters = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            };

            return await this.getAllUsers(filters, options);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify user credentials (for login)
     */
    static async verifyCredentials(email, password) {
        try {
            const result = await this.getUserByEmailWithPassword(email);
            
            if (!result.success) {
                return { success: false, error: 'Invalid credentials' };
            }

            const user = result.data;

            // Check if user is active
            if (!user.isActive) {
                return { success: false, error: 'Account is inactive' };
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return { success: false, error: 'Invalid credentials' };
            }

            // Remove password from response
            const userObj = user.toObject();
            delete userObj.password;

            return { success: true, data: userObj };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== UPDATE Operations ==========

    /**
     * Update user
     */
    static async updateUser(userId, updateData) {
        try {
            // If password is being updated, hash it
            if (updateData.password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(updateData.password, salt);
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            return { success: true, data: user };
        } catch (error) {
            if (error.code === 11000) {
                return { success: false, error: 'Email already exists' };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId, profileData) {
        try {
            // Don't allow role or password update through profile update
            delete profileData.role;
            delete profileData.password;

            return await this.updateUser(userId, profileData);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Change password
     */
    static async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Verify old password
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            
            if (!isMatch) {
                return { success: false, error: 'Current password is incorrect' };
            }

            // Hash and update new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user role
     */
    static async updateUserRole(userId, newRole) {
        try {
            return await this.updateUser(userId, { role: newRole });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Activate user account
     */
    static async activateUser(userId) {
        try {
            return await this.updateUser(userId, { isActive: true });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Deactivate user account
     */
    static async deactivateUser(userId) {
        try {
            return await this.updateUser(userId, { isActive: false });
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========== DELETE Operations ==========

    /**
     * Soft delete user (deactivate)
     */
    static async softDeleteUser(userId) {
        try {
            return await this.deactivateUser(userId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Hard delete user
     */
    static async deleteUser(userId) {
        try {
            const user = await User.findByIdAndDelete(userId);

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete multiple users
     */
    static async deleteMultipleUsers(userIds) {
        try {
            const result = await User.deleteMany({ 
                _id: { $in: userIds } 
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
     * Delete inactive users (older than specified months)
     */
    static async deleteInactiveUsers(monthsOld = 12) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

            const result = await User.deleteMany({
                isActive: false,
                updatedAt: { $lt: cutoffDate }
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
     * Get user statistics
     */
    static async getUserStats() {
        try {
            const stats = await User.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: { $cond: ['$isActive', 1, 0] }
                        },
                        inactiveUsers: {
                            $sum: { $cond: ['$isActive', 0, 1] }
                        },
                        clients: {
                            $sum: { $cond: [{ $eq: ['$role', 'client'] }, 1, 0] }
                        },
                        owners: {
                            $sum: { $cond: [{ $eq: ['$role', 'owner'] }, 1, 0] }
                        },
                        admins: {
                            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
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
     * Get users grouped by role
     */
    static async getUsersByRoleCount() {
        try {
            const roleStats = await User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                        activeCount: {
                            $sum: { $cond: ['$isActive', 1, 0] }
                        }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            return { success: true, data: roleStats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user registration trends
     */
    static async getUserRegistrationTrends(months = 12) {
        try {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const trends = await User.aggregate([
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
                        totalRegistrations: { $sum: 1 },
                        clients: {
                            $sum: { $cond: [{ $eq: ['$role', 'client'] }, 1, 0] }
                        },
                        owners: {
                            $sum: { $cond: [{ $eq: ['$role', 'owner'] }, 1, 0] }
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
     * Get venue owners with their venue count
     */
    static async getOwnersWithVenueCount() {
        try {
            const owners = await User.aggregate([
                { $match: { role: 'owner', isActive: true } },
                {
                    $lookup: {
                        from: 'venues',
                        localField: '_id',
                        foreignField: 'owner',
                        as: 'venues'
                    }
                },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        phone: 1,
                        venueName: 1,
                        venueCount: { $size: '$venues' },
                        totalVenueRating: { $sum: '$venues.rating' }
                    }
                },
                { $sort: { venueCount: -1 } }
            ]);

            return { success: true, data: owners };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = UserService;
