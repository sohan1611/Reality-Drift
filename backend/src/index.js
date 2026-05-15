require('dotenv').config();

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // temporarily disabled

const app = express();

// Middleware
app.use(cors({
  origin: "*",
}));

app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('Backend is running successfully 🚀');
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'Reality Drift API is online',
    timestamp: new Date()
  });
});

// API routes (disabled for now to debug startup issue)
app.use('/api', apiRoutes);

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;