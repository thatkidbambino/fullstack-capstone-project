// db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = "giftdb";

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance; // Return the existing database instance if already connected
    }

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
}

module.exports = connectToDatabase;
