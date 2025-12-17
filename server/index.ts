/**
 * Grabble Multiplayer Server
 * Socket.IO server for real-time game synchronization
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './room-manager';
import { setupSocketEvents } from './socket-events';

const PORT = process.env.PORT || 3001;

// Express app
const app = express();
app.use(cors());
app.use(express.json());

// HTTP server
const httpServer = createServer(app);

// Socket.IO server with CORS for React dev server
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Room manager for game lobbies
const roomManager = new RoomManager();

// Set up socket event handlers
setupSocketEvents(io, roomManager);

// Root endpoint - server info
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>Grabble Server</title></head>
        <body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
            <h1>🎮 Grabble Multiplayer Server</h1>
            <p>Socket.IO server is running and ready for connections.</p>
            <h3>Status</h3>
            <ul>
                <li>Active Rooms: ${roomManager.getActiveRoomCount()}</li>
                <li>Uptime: ${Math.floor(process.uptime())}s</li>
            </ul>
            <h3>Connect from React</h3>
            <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px;">
import { useSocket } from './hooks/useSocket';
const { connected, createRoom, joinRoom } = useSocket();
            </pre>
            <p>Open the game at <a href="http://localhost:3000">http://localhost:3000</a></p>
        </body>
        </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        activeRooms: roomManager.getActiveRoomCount(),
        timestamp: new Date().toISOString()
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`🎮 Grabble server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
});

export { io, roomManager };
