/**
 * Room Manager - handles game room/lobby lifecycle
 */
import type { Room, RoomPlayer } from './types';
export declare class RoomManager {
    private rooms;
    private playerToRoom;
    /**
     * Create a new room
     */
    createRoom(hostSocketId: string, hostName: string, targetScore?: number): Room;
    /**
     * Join an existing room
     */
    joinRoom(roomCode: string, socketId: string, playerName: string): {
        success: boolean;
        room?: Room;
        error?: string;
    };
    /**
     * Leave a room
     */
    leaveRoom(socketId: string): {
        roomCode: string | null;
        room: Room | null;
        wasHost: boolean;
    };
    /**
     * Set player ready state
     */
    setPlayerReady(socketId: string, ready: boolean): Room | null;
    /**
     * Check if all players are ready
     */
    areAllPlayersReady(roomCode: string): boolean;
    /**
     * Get room by code
     */
    getRoom(roomCode: string): Room | undefined;
    /**
     * Get room by player socket ID
     */
    getRoomByPlayer(socketId: string): Room | undefined;
    /**
     * Get room code for a player
     */
    getRoomCodeForPlayer(socketId: string): string | undefined;
    /**
     * Update room game state
     */
    updateGameState(roomCode: string, gameState: any): void;
    /**
     * Set room status
     */
    setRoomStatus(roomCode: string, status: 'waiting' | 'playing' | 'finished'): void;
    /**
     * Get number of active rooms
     */
    getActiveRoomCount(): number;
    /**
     * Get player in room by socket ID
     */
    getPlayer(socketId: string): RoomPlayer | undefined;
    /**
     * Map socket ID to game player ID
     */
    getGamePlayerId(socketId: string): number | undefined;
}
//# sourceMappingURL=room-manager.d.ts.map