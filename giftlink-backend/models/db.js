// db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

if (!url) {
    throw new Error("MONGO_URL is not defined in the environment variables.");
}

let dbInstance = null;
const dbName = "giftdb";

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance; // Return the existing database instance if already connected
    }

    try {
        // Create a new MongoDB client
        const client = new MongoClient(url);

        // Task 1: Connect to MongoDB
        await client.connect();

        // Task 2: Connect to the database and store it in dbInstance
        dbInstance = client.db(dbName);

        // Log the connection
        console.log(`Connected to database: ${dbName}`);

        // Task 3: Return the database instance
        return dbInstance;
    } catch (error) {
        console.error(`Failed to connect to MongoDB: ${error.message}`);
        throw error; // Propagate the error for debugging
    }
}

console.log('Connecting to MongoDB:', process.env.MONGO_URL);


module.exports = connectToDatabase;
