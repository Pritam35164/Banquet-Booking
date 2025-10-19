const mongoose = require('mongoose');

// MongoDB Atlas Connection Configuration
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/banquetbook';
        
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        };

        console.log('🔄 Connecting to MongoDB...');
        console.log('📍 Using connection:', mongoURI.includes('@') ? mongoURI.split('@')[1].split('/')[0] : 'localhost');
        
        await mongoose.connect(mongoURI, options);
        
        console.log('✅ MongoDB Atlas Connected Successfully');
        console.log(`📊 Database: banquetbook`);
        console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        
        // Setup database event listeners
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Close database connection gracefully
const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('🔴 MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

module.exports = { connectDB, closeDB };
