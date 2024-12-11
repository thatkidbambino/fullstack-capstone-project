"use strict";

const express = require("express");
const router = express.Router();
const connectToDatabase = require("../models/db");
const { ObjectId } = require("mongodb");

// Fetch all gifts
router.get("/", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        const gifts = await collection.find({}).toArray();
        res.status(200).json(gifts);
    } catch (e) {
        console.error("Error fetching gifts:", e);
        res.status(500).json({ error: "Failed to fetch gifts" });
    }
});

// Fetch a gift by ID
router.get("/:id", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        const id = req.params.id;

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
        if (!req.body.name || !req.body.description) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        const result = await collection.insertOne(req.body);

        res.status(201).json({ insertedId: result.insertedId });
    } catch (e) {
        console.error("Error adding gift:", e);
        res.status(500).json({ error: "Failed to add gift" });
    }
});

module.exports = router;
