const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Core routes still used by the current product flow
const apiRoutes = require('./routes/api');
const prescriberRoutes = require('./routes/prescriber');
const patientRoutes = require('./routes/patient');
const n8nRoutes = require('./routes/n8n');
const adminRoutes = require('./routes/admin');
const messagesRoutes = require('./routes/messages');
const whatsappRoutes = require('./routes/whatsapp');

// Import Firebase config to initialize
const { db } = require('./config/firebase');

// Import cron jobs for automatic maintenance
const { startCronJobs } = require('./services/cron-jobs');

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
      webhook: '/api/webhook',
      n8n: '/api/n8n/*'
    }
  });
});

app.use('/api', apiRoutes);
app.use('/api/prescriber', prescriberRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/n8n', n8nRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/whatsapp', whatsappRoutes);
// Webhooks Twilio WhatsApp (sem /api prefix)
app.use('/webhooks', whatsappRoutes);

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
  console.log(`📱 Twilio WhatsApp Business API: ${process.env.TWILIO_ACCOUNT_SID ? 'Configured ✅' : 'Not configured ⚠️'}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api/health`);
  console.log('=================================');
  
  // Iniciar cron jobs para manutenção automática
  startCronJobs();
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

