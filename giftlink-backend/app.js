"use strict";

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const connectToDatabase = require('./models/db');
const pinoHttp = require('pino-http');

// Route files
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 3060;

// CORS Middleware
if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: 'https://your-production-domain.com' })); // Restrict origins in production
} else {
  app.use("*", cors());
}

// Logger Middleware
app.use(pinoHttp({ logger: pinoLogger }));

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    pinoLogger.info('Connected to DB');
  })
  .catch((e) => {
    console.error('Failed to connect to DB:', e.message);
    process.exit(1); // Exit process if DB connection fails
  });

// Middleware to parse JSON requests
app.use(express.json());

// Register Routes
app.use('/api/gifts', giftRoutes); // Gift-related APIs
app.use('/api/search', searchRoutes); // Search-related APIs
app.use('/api/auth', authRoutes); // Authentication APIs

// Global Error Handler
app.use((err, req, res, next) => {
  pinoLogger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`);
  res.status(500).send('Internal Server Error');
});

// Health Check Endpoint
app.get("/", (req, res) => {
  res.send("Inside the server");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
