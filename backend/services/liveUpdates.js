/**
 * WebSocket-based real-time updates
 * This module now uses WebSocket manager instead of SSE
 */
const wsManager = require('./websocket');

// Legacy SSE endpoint for backwards compatibility (can be removed later)
const registerClient = (req, res) => {
    res.status(501).json({ message: 'SSE endpoint deprecated. Please use WebSocket at /api/ws' });
};

// Export WebSocket notifyDataChange function
const notifyDataChange = (event = 'data_change', payload = {}) => {
    return wsManager.notifyDataChange(event, payload);
};

module.exports = {
    registerClient,
    notifyDataChange
};

