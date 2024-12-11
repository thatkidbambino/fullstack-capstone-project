"use strict";

const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db'); // Import the database connection

// Fetch all gifts
router.get('/', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        const db = await connectToDatabase();

        // Task 2: Use the collection() method to retrieve the gift collection
        const collection = db.collection('gifts');

        // Task 3: Fetch all gifts using the collection.find method. Chain with toArray method to convert to JSON array
        const gifts = await collection.find({}).toArray();

        // Task 4: Return the gifts using the res.json method
        res.json(gifts);
    } catch (e) {
        console.error('Error fetching gifts:', e);
        res.status(500).send('Error fetching gifts');
    }
});

// Fetch a gift by ID
router.get('/:id', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        const db = await connectToDatabase();

        // Task 2: Use the collection() method to retrieve the gift collection
        const collection = db.collection('gifts');

        // Extract the ID from the request parameters
        const id = req.params.id;

        // Task 3: Find a specific gift by ID using the collection.findOne method and store in constant called gift
        const gift = await collection.findOne({ _id: new require('mongodb').ObjectId(id) });

        if (!gift) {
            return res.status(404).send('Gift not found');
        }

        res.json(gift);
    } catch (e) {
        console.error('Error fetching gift:', e);
        res.status(500).send('Error fetching gift');
    }
});

// Add a new gift
router.post('/', async (req, res, next) => {
    try {
        // Connect to the database
        const db = await connectToDatabase();
        const collection = db.collection("gifts");

        // Insert the new gift
        const gift = await collection.insertOne(req.body);

        // Return the created gift
        res.status(201).json(gift.ops[0]);
    } catch (e) {
        console.error('Error adding gift:', e);
        next(e);
    }
});

module.exports = router;
