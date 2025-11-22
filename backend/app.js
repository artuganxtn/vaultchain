const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// --- Middleware ---
// CORS configuration - allow requests from production domain
// Backend is accessible at: vaultchaintr.store/api (via Nginx proxy)
// Frontend makes requests to /api (relative URL) which Nginx proxies to backend
const allowedOrigins = [
    'https://vaultchaintr.store',
    'https://www.vaultchaintr.store'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Security: Body parsing
app.use(express.json({ limit: '50mb' })); // Increased for KYC document uploads (base64 encoded images)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers middleware
app.use((req, res, next) => {
    // Remove server identification
    res.removeHeader('X-Powered-By');
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Only set HSTS in production with HTTPS
    if (process.env.NODE_ENV === 'production' && req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
});

// --- API Routes ---
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const adminRoutes = require('./routes/admin');
const adminsRoutes = require('./routes/admins');
const usersRoutes = require('./routes/users');
const transactionsRoutes = require('./routes/transactions');
const tradeRoutes = require('./routes/trade');
const copyTradersRoutes = require('./routes/copyTraders');
const subscriptionsRoutes = require('./routes/subscriptions');
const vouchersRoutes = require('./routes/vouchers');
const auditLogsRoutes = require('./routes/auditLogs');
const aiRoutes = require('./routes/ai');
const kpisRoutes = require('./routes/kpis');
const testEmailRoutes = require('./routes/testEmail');

app.use('/api/auth', authRoutes);
app.use('/api/test', testEmailRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/copy-traders', copyTradersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/kpis', kpisRoutes);

// --- Frontend Serving (Development Only) ---
// In production, Nginx/Apache serves the frontend static files
// Only serve frontend in development mode
if (process.env.NODE_ENV !== 'production') {
    // Serve static files from the project root.
    app.use(express.static(path.join(__dirname, '..')));

    // Handle SPA routing: for any request that doesn't match an API route or a static file,
    // send back the main index.html file.
    app.get('*', (req, res) => {
        // Don't serve frontend for API routes
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'API route not found' });
        }
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
}


// --- Error Handling ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
});

module.exports = app;