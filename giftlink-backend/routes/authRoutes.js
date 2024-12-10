const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const dotenv = require('dotenv');
const pino = require('pino');
dotenv.config();

const logger = pino(); // Create a Pino logger instance
const JWT_SECRET = process.env.JWT_SECRET; // Load JWT secret from environment

router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();

        // Task 2: Access MongoDB `users` collection
        const collection = db.collection("users");

        // Task 3: Check for user credentials in the database
        const theUser = await collection.findOne({ email: req.body.email });
        if (!theUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // Task 4: Check if the password matches the encrypted password and send an appropriate message on mismatch
        const passwordMatches = await bcryptjs.compare(req.body.password, theUser.password);
        if (!passwordMatches) {
            logger.error('Passwords do not match');
            return res.status(404).json({ error: 'Wrong password' });
        }

        // Task 5: Fetch user details from the database
        const userName = theUser.firstName;
        const userEmail = theUser.email;

        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {
                id: theUser._id.toString(),
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token valid for 1 hour

        // Send successful response with the token and user details
        res.json({ authtoken, userName, userEmail });
    } catch (e) {
        logger.error('Internal server error', e);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
