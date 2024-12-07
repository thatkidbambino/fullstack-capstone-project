/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./models/db');

const app = express();
const port = 3060;

// Middleware
app.use(express.json());
app.use("*", cors());

// Connect to MongoDB
connectToDatabase()
    .then(() => {
        console.log('Connected to DB');
    })
    .catch((e) => {
        console.error('Failed to connect to DB', e);
    });

// Route files
// Gift API Task 1: import the giftRoutes and store in a constant called giftRoutes
const giftRoutes = require('./routes/giftRoutes');

// Use Routes
// Gift API Task 2: add the giftRoutes to the server by using the app.use() method
app.use('/api/gifts', giftRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

// Default Route
app.get("/", (req, res) => {
    res.send("Inside the server");
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
