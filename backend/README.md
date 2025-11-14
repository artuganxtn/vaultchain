<<<<<<< HEAD
# VaultChain Backend Setup

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Gemini AI API Key (Required for AI Assistant)
# Get your API key from: https://makersuite.google.com/app/apikey
API_KEY=your_gemini_api_key_here
# OR use GEMINI_API_KEY
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP Configuration (for email sending)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchaintr.com
SMTP_PASSWORD=your_smtp_password_here

# Server Port (optional, defaults to 3001)
PORT=3001
```

## Getting a Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to your `.env` file as `API_KEY` or `GEMINI_API_KEY`

## Running the Server

```bash
cd backend
npm install
node server.js
```

The server will start on port 3001 by default.

=======
# VaultChain Backend Setup

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Gemini AI API Key (Required for AI Assistant)
# Get your API key from: https://makersuite.google.com/app/apikey
API_KEY=your_gemini_api_key_here
# OR use GEMINI_API_KEY
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP Configuration (for email sending)
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchaintr.com
SMTP_PASSWORD=your_smtp_password_here

# Server Port (optional, defaults to 3001)
PORT=3001
```

## Getting a Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to your `.env` file as `API_KEY` or `GEMINI_API_KEY`

## Running the Server

```bash
cd backend
npm install
node server.js
```

The server will start on port 3001 by default.

>>>>>>> 8cf7b9904c0e59190db7233e79357b9d9ab0b44b
