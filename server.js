// server.js

require('dotenv').config();  // Load environment variables first
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import route modules
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');
const authRoutes = require('./routes/authRoutes');

// Import database configuration
const { checkDatabaseConnection } = require('./config/db');

const app = express();

// Environment variables check
console.log('Environment Check:', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  dbHost: process.env.DB_HOST ? 'set' : 'not set',
  dbUser: process.env.DB_USER ? 'set' : 'not set',
  dbName: process.env.DB_NAME ? 'set' : 'not set',
  hasDbPassword: process.env.DB_PASSWORD ? 'yes' : 'no'
});

// Middleware
app.use(cors());  // Enable CORS for all requests
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Define routes
app.use('/api/policies', policyRoutes);  // Routes for policy-related actions
app.use('/api/claims', claimRoutes);     // Routes for claim-related actions
app.use('/api/auth', authRoutes);        // Routes for authentication-related actions

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Check database connection before starting server
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.warn('Warning: Could not establish database connection');
    } else {
      console.log('Database connection successful');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});