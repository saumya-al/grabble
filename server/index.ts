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
