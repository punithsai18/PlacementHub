<<<<<<< HEAD
require('dotenv').config(); // Load environment variables from .env file

// Import core dependencies
const express = require('express'); // Express framework for creating the server
const cors = require('cors'); // Cross-Origin Resource Sharing middleware
const helmet = require('helmet'); // Security middleware to set HTTP headers
const morgan = require('morgan'); // HTTP request logger middleware
const rateLimit = require('express-rate-limit'); // Middleware to rate-limit requests
=======
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394

const studentRoutes = require('./src/routes/students');
const companyRoutes = require('./src/routes/companies');
const chatRoutes = require('./src/routes/chat');
const placementRoutes = require('./src/routes/placements');

const app = express();
const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
// Trust proxy for Azure App Service load balancer (needed for correct client IP detection)
app.set('trust proxy', 1);

// Configure Security & Utility middlewares
app.use(helmet()); // Secure Express apps by setting various HTTP headers
app.use(cors({ // Enable CORS, allowing requests from the frontend URL
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined')); // Log all incoming requests in Apache combined format
app.use(express.json({ limit: '10mb' })); // Parse incoming JSON payloads (up to 10MB)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
=======
// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
<<<<<<< HEAD
  keyGenerator: (req) => req.ip ? req.ip.replace(/:\d+$/, '') : req.socket.remoteAddress,
=======
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
  message: { error: 'Too many requests, please try again later.' }
});

// Stricter limiter for auth endpoints: 10 per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
<<<<<<< HEAD
  keyGenerator: (req) => req.ip ? req.ip.replace(/:\d+$/, '') : req.socket.remoteAddress,
=======
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
  message: { error: 'Too many authentication attempts, please try again later.' }
});

app.use('/api/', globalLimiter);
app.use('/api/students/login', authLimiter);
app.use('/api/students/register', authLimiter);
app.use('/api/companies/login', authLimiter);
app.use('/api/companies/register', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'PlacementHub API' });
});

<<<<<<< HEAD
// Mount application routes
app.use('/api/students', studentRoutes); // Handle student-related requests
app.use('/api/companies', companyRoutes); // Handle company-related requests
app.use('/api/chat', chatRoutes); // Handle chat functionality requests
app.use('/api/placements', placementRoutes); // Handle placement tracking activities
=======
// Routes
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/placements', placementRoutes);
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`PlacementHub API running on port ${PORT}`);
});

module.exports = app;
