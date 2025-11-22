const WebSocket = require('ws');
const EventEmitter = require('events');

/**
 * WebSocket server for real-time updates
 * Replaces SSE with full-duplex WebSocket connections
 */
class WebSocketManager extends EventEmitter {
    constructor() {
        super();
        this.wss = null;
        this.clients = new Set();
        this.dataVersion = Date.now();
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/api/ws',
            perMessageDeflate: false // Disable compression for lower latency
        });

        this.wss.on('connection', (ws, req) => {
            const clientId = `${req.socket.remoteAddress}-${Date.now()}`;
            this.clients.add(ws);
            console.log(`[WebSocket] Client connected: ${clientId} (Total: ${this.clients.size})`);

            // Send initial connection message
            ws.send(JSON.stringify({
                event: 'connected',
                version: this.dataVersion,
                timestamp: new Date().toISOString()
            }));

            // Handle client messages (for ping/pong or future features)
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    if (data.type === 'ping') {
                        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    }
                } catch (err) {
                    console.error('[WebSocket] Error parsing client message:', err);
                }
            });

            // Handle client disconnect
            ws.on('close', () => {
                this.clients.delete(ws);
                console.log(`[WebSocket] Client disconnected: ${clientId} (Total: ${this.clients.size})`);
            });

            // Handle errors
            ws.on('error', (error) => {
                console.error(`[WebSocket] Error for client ${clientId}:`, error);
                this.clients.delete(ws);
            });

            // Send heartbeat every 30 seconds
            const heartbeat = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
                } else {
                    clearInterval(heartbeat);
                }
            }, 30000);

            ws.on('close', () => {
                clearInterval(heartbeat);
            });
        });

        console.log('[WebSocket] Server initialized on /api/ws');
    }

    broadcast(event, payload = {}) {
        const message = {
            event,
            payload,
            version: ++this.dataVersion,
            timestamp: new Date().toISOString()
        };

        const messageStr = JSON.stringify(message);
        let sentCount = 0;

        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(messageStr);
                    sentCount++;
                } catch (error) {
                    console.error('[WebSocket] Error sending message to client:', error);
                    this.clients.delete(client);
                }
            }
        });

        if (sentCount > 0) {
            console.log(`[WebSocket] Broadcasted ${event} to ${sentCount} client(s)`);
        }

        return message;
    }

    notifyDataChange(event = 'data_change', payload = {}) {
        return this.broadcast(event, payload);
    }
}

const wsManager = new WebSocketManager();

module.exports = wsManager;

