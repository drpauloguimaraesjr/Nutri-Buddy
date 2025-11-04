const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const apiRoutes = require('./routes/api');
const whatsappRoutes = require('./routes/whatsapp');
const mealsRoutes = require('./routes/meals');
const waterRoutes = require('./routes/water');
const exercisesRoutes = require('./routes/exercises');
const goalsRoutes = require('./routes/goals');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');
const fastingRoutes = require('./routes/fasting');
const measurementsRoutes = require('./routes/measurements');
const recipesRoutes = require('./routes/recipes');
const glucoseRoutes = require('./routes/glucose');
const stravaRoutes = require('./routes/strava');
// Role-based routes
const prescriberRoutes = require('./routes/prescriber');
const patientRoutes = require('./routes/patient');

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
      water: '/api/water',
      exercises: '/api/exercises',
      goals: '/api/goals',
      ai: '/api/ai/*',
      chat: '/api/chat/*',
      fasting: '/api/fasting/*',
      measurements: '/api/measurements/*',
      recipes: '/api/recipes/*',
      glucose: '/api/glucose/*',
      strava: '/api/strava/*',
      user: '/api/user',
      webhook: '/api/webhook',
      whatsapp: '/api/whatsapp/*'
    }
  });
});

app.use('/api', apiRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/fasting', fastingRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/glucose', glucoseRoutes);
app.use('/api/strava', stravaRoutes);
// Role-based routes
app.use('/api/prescriber', prescriberRoutes);
app.use('/api/patient', patientRoutes);

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
  
  // Inicializar WhatsApp Handler
  initializeWhatsAppHandler();
});

// Inicializar WhatsApp Message Handler
async function initializeWhatsAppHandler() {
  try {
    const whatsappService = require('./services/whatsapp');
    const WhatsAppMessageHandler = require('./services/whatsappHandler');
    
    const handler = new WhatsAppMessageHandler(whatsappService);
    handler.register();
    
    console.log('✅ WhatsApp Message Handler registrado!');
    console.log('📱 Use o endpoint /api/whatsapp/connect para conectar');
  } catch (error) {
    console.warn('⚠️ WhatsApp Handler não pôde ser inicializado:', error.message);
  }
}

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

