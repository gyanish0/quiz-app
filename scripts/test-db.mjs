import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('Using URI:', MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)@/, '$1****@'));

        const connection = await mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            retryWrites: true,
            w: 'majority',
            authSource: 'admin',
            dbName: 'quiz-app'
        });

        console.log('Successfully connected to MongoDB!');

        // Test creating a collection
        const db = connection.connection.db;
        await db.createCollection('test_connection');
        console.log('Successfully created test collection');

        // Clean up
        await db.dropCollection('test_connection');
        console.log('Cleaned up test collection');

        await connection.disconnect();
        console.log('Disconnected from MongoDB');

        process.exit(0);
    } catch (error) {
        console.error('MongoDB Connection Error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            codeName: error.codeName
        });
        process.exit(1);
    }
}

testConnection();