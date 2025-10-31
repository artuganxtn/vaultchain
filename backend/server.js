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
   npm install express sqlite3 cors @google/genai nodemailer dotenv

--- RUNNING THE SERVER ---

- To run in development:
  node backend/server.js
  The server will start on port 3001. In a local development environment, your frontend should make API requests to http://localhost:3001/api.

- For production deployment on a server (like AWS EC2), this Node.js application will run behind a web server like NGINX. NGINX will handle requests from your domain (https://vaultchaintr.com) and forward /api requests internally to this application running on port 3001.
  
- Production API endpoint: https://vaultchaintr.com/api

*/

// Load environment variables from .env file
require('dotenv').config();

const app = require('./app');
const { initDb } = require('./database');
const { verifyEmailConfig } = require('./services/emailService');

const PORT = process.env.PORT || 3001;

// Initialize the database
initDb().then(async () => {
    console.log('Database initialized successfully.');
    
    // Verify email configuration
    const emailStatus = await verifyEmailConfig();
    if (emailStatus.configured) {
        console.log(`✅ ${emailStatus.message}`);
    } else {
        console.log(`⚠️  ${emailStatus.message}`);
        console.log(`   Password reset codes will be displayed in the console during development.`);
        console.log(`   To enable email sending, set SMTP environment variables (see emailService.js).`);
    }
    
    // Start the server after DB is ready
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
