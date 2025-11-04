const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const apiRoutes = require('./routes/api');

// Import Firebase config to initialize
const { db } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'NutriBuddy API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      nutrition: '/api/nutrition',
      meals: '/api/meals',
      user: '/api/user',
      webhook: '/api/webhook'
    }
  });
});

app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: 'error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 NutriBuddy API Server Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Firebase: Connected`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api/health`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;

