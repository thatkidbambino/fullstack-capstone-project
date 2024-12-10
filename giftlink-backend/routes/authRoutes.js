const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const { body, validationResult } = require('express-validator'); // For input validation
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino'); // Logger
dotenv.config();

const logger = pino(); // Create a Pino logger instance
const JWT_SECRET = process.env.JWT_SECRET; // JWT Secret

/**
 * Register Endpoint
 */
router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email already exists');
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Save user details
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({ authtoken, email: req.body.email });
    } catch (e) {
        logger.error(e);
        res.status(500).send('Internal server error');
    }
});

/**
 * Login Endpoint
 */
router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const theUser = await collection.findOne({ email: req.body.email });

        if (!theUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const isMatch = await bcryptjs.compare(req.body.password, theUser.password);
        if (!isMatch) {
            logger.error('Incorrect password');
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const payload = { user: { id: theUser._id.toString() } };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User logged in successfully');
        res.json({ authtoken, userName: theUser.firstName, userEmail: theUser.email });
    } catch (e) {
        logger.error(e);
        res.status(500).json({ error: 'Internal server error', details: e.message });
    }
});

/**
 * Update Profile Endpoint
 */
router.put(
    '/update',
    [
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const email = req.headers.email;
            if (!email) {
                logger.error('Email not found in request headers');
                return res.status(400).json({ error: 'Email is required in headers' });
            }

            const db = await connectToDatabase();
            const collection = db.collection("users");

            const existingUser = await collection.findOne({ email });
            if (!existingUser) {
                logger.error('User not found');
                return res.status(404).json({ error: 'User not found' });
            }

            const { firstName, lastName, password } = req.body;
            if (firstName) existingUser.firstName = firstName;
            if (lastName) existingUser.lastName = lastName;
            if (password) existingUser.password = await bcryptjs.hash(password, 10);
            existingUser.updatedAt = new Date();

            const updatedUser = await collection.findOneAndUpdate(
                { email },
                { $set: existingUser },
                { returnDocument: 'after' }
            );

            const payload = { user: { id: updatedUser.value._id.toString() } };
            const authtoken = jwt.sign(payload, JWT_SECRET);

            logger.info('User profile updated successfully');
            res.json({ authtoken, firstName: updatedUser.value.firstName, email: updatedUser.value.email });
        } catch (e) {
            logger.error(e);
            res.status(500).send('Internal server error');
        }
    }
);

module.exports = router;
