const express = require('express');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing to allow requests from the frontend
// Production domain: https://vaultchaintr.com
const allowedOrigins = new Set([
    'https://vaultchaintr.com',
    'https://www.vaultchaintr.com',
    // Development origins (for local testing)
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Allow custom CORS_ORIGIN from environment if set
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
  ]);
  
  app.use(cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      console.warn(`[CORS] Blocked origin: ${origin}`);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));
// Parse incoming request bodies in JSON format
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads (KYC)

// Debug middleware - log all API requests (MUST be before routes)
app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
    next();
});

// --- API Routes ---
// Here we are importing all the route handlers
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const tradeRoutes = require('./routes/trade');
const copyTradersRoutes = require('./routes/copyTraders');
const subscriptionsRoutes = require('./routes/subscriptions');
const vouchersRoutes = require('./routes/vouchers');
const auditLogsRoutes = require('./routes/auditLogs');
const aiRoutes = require('./routes/ai');

// Registering the routes with a base path
// FIX: Moved '/api/admins' before '/api/admin' to resolve routing conflict
app.use('/api/admins', require('./routes/admins')); // Direct require
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin', adminRoutes);
// IMPORTANT: Register users routes BEFORE transactions to ensure /users/:id/transactions matches
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/copy-traders', copyTradersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for unmatched API routes (must be after all routes)
app.use('/api', (req, res) => {
    console.log(`[API 404] Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Route not found', path: req.originalUrl, method: req.method });
});

// --- Error Handling ---
// A simple generic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
});

module.exports = app;