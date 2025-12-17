/**
 * Socket.IO Event Handlers
 * Handles all real-time game communication
 */
import { Server } from 'socket.io';
import { RoomManager } from './room-manager';
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';
export declare function setupSocketEvents(io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>, roomManager: RoomManager): void;
//# sourceMappingURL=socket-events.d.ts.map