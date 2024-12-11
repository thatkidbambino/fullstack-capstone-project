"use strict";

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const connectToDatabase = require('./models/db');

const app = express();
app.use("*", cors());
const port = 3060;

// Connect to MongoDB
connectToDatabase()
  .then(() => {
    pinoLogger.info('Connected to DB');
  })
  .catch((e) => {
    console.error('Failed to connect to DB:', e.message);
    process.exit(1); // Exit process on connection failure
  });

app.use(express.json());

// Route files
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');
const pinoHttp = require('pino-http');
const logger = require('./logger');
const authRoutes = require('./routes/authRoutes');

app.use(pinoHttp({ logger }));

// Use Routes
app.use('/api/gifts', giftRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send('Internal Server Error');
  next(); // Explicitly call next for linting compliance
});

// Health Check Endpoint
app.get("/", (req, res) => {
  res.send("Inside the server");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
