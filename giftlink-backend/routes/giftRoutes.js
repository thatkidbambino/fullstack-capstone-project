"use strict";

const express = require("express");
const router = express.Router();
const connectToDatabase = require("../models/db"); // Import the database connection
const { ObjectId } = require("mongodb"); // Import ObjectId for querying by ID

// Fetch all gifts
router.get("/", async (req, res) => {
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Retrieve the "gifts" collection
        const collection = db.collection("gifts");

        // Fetch all gifts
        const gifts = await collection.find({}).toArray();

        // Return the fetched gifts
        res.status(200).json(gifts);
    } catch (e) {
        console.error("Error fetching gifts:", e);
        res.status(500).json({ error: "Failed to fetch gifts" });
    }
});

// Fetch a gift by ID
router.get("/:id", async (req, res) => {
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Retrieve the "gifts" collection
        const collection = db.collection("gifts");

        // Extract the ID from the request parameters
        const id = req.params.id;

        // Find a specific gift by ID
        const gift = await collection.findOne({ _id: new ObjectId(id) });

        if (!gift) {
            return res.status(404).json({ error: "Gift not found" });
        }

        res.status(200).json(gift);
    } catch (e) {
        console.error("Error fetching gift:", e);
        res.status(500).json({ error: "Failed to fetch gift" });
    }
});

// Add a new gift
router.post("/", async (req, res) => {
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Retrieve the "gifts" collection
        const collection = db.collection("gifts");

        // Insert the new gift
        const result = await collection.insertOne(req.body);

        // Return the created gift
        res.status(201).json({ insertedId: result.insertedId });
    } catch (e) {
        console.error("Error adding gift:", e);
        res.status(500).json({ error: "Failed to add gift" });
    }
});

module.exports = router;
