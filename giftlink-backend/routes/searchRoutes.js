"use strict";

const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for gifts
router.get('/', async (req, res, next) => {
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection("gifts");

        // Initialize the query object
        let query = {};

        // Check if the name exists and is not empty
        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name, $options: "i" }; // Using regex for partial match, case-insensitive
        }

        // Add other filters to the query
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.condition) {
            query.condition = req.query.condition;
        }
        if (req.query.age_years && !isNaN(req.query.age_years)) {
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch filtered and paginated gifts
        const gifts = await collection.find(query).skip(skip).limit(limit).sort({ name: 1 }).toArray();

        // Fetch total count for pagination metadata
        const total = await collection.countDocuments(query);

        res.json({ total, page, limit, gifts });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
