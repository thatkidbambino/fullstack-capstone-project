const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const { body, validationResult } = require('express-validator'); // Added for validation
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino'); // Import Pino logger
dotenv.config();

const logger = pino(); // Create a Pino logger instance

// Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Register Endpoint
router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Check for existing email in DB
        const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

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

        // Create JWT
        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({ authtoken, email });
    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const theUser = await collection.findOne({ email: req.body.email });

        if (theUser) {
            let result = await bcryptjs.compare(req.body.password, theUser.password);
            if (!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong password' });
            }

            const payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };

            const userName = theUser.firstName;
            const userEmail = theUser.email;

            const authtoken = jwt.sign(payload, JWT_SECRET);
            logger.info('User logged in successfully');
            return res.status(200).json({ authtoken, userName, userEmail });
        } else {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: 'Internal server error', details: e.message });
    }
});

// Update Profile Endpoint
router.put(
    '/update',
    [
        body('firstName').not().isEmpty().withMessage('First name is required'),
        body('lastName').not().isEmpty().withMessage('Last name is required'),
        body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error('Validation errors in update request', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const email = req.headers.email;
            if (!email) {
                logger.error('Email not found in the request headers');
                return res.status(400).json({ error: 'Email not found in the request headers' });
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

            const payload = {
                user: {
                    id: updatedUser.value._id.toString(),
                },
            };
            const authtoken = jwt.sign(payload, JWT_SECRET);

            logger.info('User profile updated successfully');
            res.json({ authtoken, firstName: updatedUser.value.firstName, email: updatedUser.value.email });
        } catch (e) {
            logger.error('Internal server error:', e.message);
            return res.status(500).send('Internal server error');
        }
    }
);

module.exports = router;
