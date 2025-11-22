/*
=================================================
 VaultChain Backend - Server Entry Point
=================================================
This file starts the Node.js server.

--- SETUP INSTRUCTIONS ---

1. Navigate to the project root in your terminal.
2. Create a 'backend' directory if it doesn't exist and place all backend files inside it.
3. Inside the `backend` directory, run `npm init -y` to create a package.json file.
4. Install the required dependencies by running:
   npm install express sqlite3 cors @google/genai

--- RUNNING THE SERVER ---

- To run in development:
  node backend/server.js
  The server will start on port 3001. In a local development environment, your frontend should make API requests to http://localhost:3001.

- For production deployment on a server (like AWS EC2), this Node.js application will run behind a web server like NGINX. NGINX will handle requests from your domain (https://vaultchaintr.store) and forward them internally to this application.

*/

// Load environment variables from .env file if it exists
require('dotenv').config();

const app = require('./app');
const { initDb } = require('./database');
const wsManager = require('./services/websocket');

// Use environment variable for port
// In production, this runs behind a reverse proxy (nginx/apache)
// and listens on a local port (e.g., 3001), while the proxy handles HTTPS on port 443
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Initialize the database
initDb().then(() => {
    console.log('Database initialized successfully.');
    // Start the server after DB is ready
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`=================================================`);
        console.log(`VaultChain Backend Server`);
        console.log(`=================================================`);
        console.log(`Environment: ${NODE_ENV}`);
        console.log(`Server is listening on port ${PORT}`);
        console.log(`API Base URL: https://vaultchaintr.store/api`);
        console.log(`WebSocket URL: ws://localhost:${PORT}/api/ws`);
        console.log(`=================================================`);
    });

    // Initialize WebSocket server
    wsManager.initialize(server);
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
