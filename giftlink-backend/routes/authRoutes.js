"use strict";

const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');
const { body, validationResult } = require('express-validator');

dotenv.config();
const logger = pino();
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = { user: { id: newUser.insertedId } };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email: req.body.email });
    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        // Validate input
        if (!req.body.email || !req.body.password) {
            logger.error('Email and password are required');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Find user by email
        const theUser = await collection.findOne(
            { email: req.body.email },
            { projection: { password: 1, firstName: 1, email: 1 } }
        );

        if (!theUser) {
            logger.error('Authentication failed: User not found');
            return res.status(404).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const passwordMatch = await bcryptjs.compare(req.body.password, theUser.password);
        if (!passwordMatch) {
            logger.error('Authentication failed: Invalid password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT
        const payload = { user: { id: theUser._id.toString() } };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        // Success response
        logger.info('User logged in successfully');
        res.status(200).json({
            authtoken,
            userName: theUser.firstName,
            userEmail: theUser.email,
        });
    } catch (e) {
        logger.error(e.message);
        res.status(500).json({ error: 'Internal server error', details: e.message });
    }
});


// Update User
router.put('/update',
    body('name').notEmpty().withMessage('Name is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error('Validation errors in update request', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        try {
            const db = await connectToDatabase();
            const collection = db.collection("users");

            const existingUser = await collection.findOne({ email });
            if (!existingUser) {
                logger.error('User not found');
                return res.status(404).json({ error: "User not found" });
            }

            const updatedUser = {
                ...existingUser,
                firstName: req.body.name,
                updatedAt: new Date(),
            };

            const result = await collection.findOneAndUpdate(
                { email },
                { $set: updatedUser },
                { returnDocument: 'after' }
            );

            if (!result.value) {
                logger.error('Failed to update user');
                return res.status(500).json({ error: "Failed to update user" });
            }

            const payload = {
                user: {
                    id: result.value._id.toString(),
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET);
            logger.info('User updated successfully');
            res.json({ authtoken });
        } catch (error) {
            logger.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);

module.exports = router;
