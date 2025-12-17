/**
 * Grabble Multiplayer Server
 * Socket.IO server for real-time game synchronization
 */
import { Server } from 'socket.io';
import { RoomManager } from './room-manager';
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
declare const roomManager: RoomManager;
export { io, roomManager };
//# sourceMappingURL=index.d.ts.map