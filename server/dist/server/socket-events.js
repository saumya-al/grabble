"use strict";
/**
 * Socket.IO Event Handlers
 * Handles all real-time game communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketEvents = setupSocketEvents;
const game_state_manager_1 = require("../src/game-state-manager");
const dictionary_1 = require("./dictionary");
// Dictionary for word validation
let dictionary = new Set();
// Store game managers per room
const gameManagers = new Map();
// Track tiles placed by players in the current turn (socket.id -> positions)
const playerTurnTiles = new Map();
function setupSocketEvents(io, roomManager) {
    // Load dictionary on startup
    (0, dictionary_1.loadDictionary)().then(dict => {
        dictionary = dict;
        console.log(`📚 Dictionary loaded with ${dictionary.size} words`);
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Initialize socket data
        socket.data.playerId = socket.id;
        socket.data.roomCode = null;
        // Clear turn tiles on disconnect
        socket.on('disconnect', () => {
            playerTurnTiles.delete(socket.id);
        });
        /**
         * Create a new room
         */
        socket.on('create_room', ({ playerName, targetScore = 100 }) => {
            try {
                // Leave any existing room
                if (socket.data.roomCode) {
                    handleLeaveRoom(socket, io, roomManager);
                }
                const room = roomManager.createRoom(socket.id, playerName, targetScore);
                socket.data.playerName = playerName;
                socket.data.roomCode = room.code;
                // Join socket.io room for broadcasting
                socket.join(room.code);
                socket.emit('room_created', { roomCode: room.code, room });
                console.log(`✅ Room ${room.code} created for ${playerName}`);
            }
            catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * Join existing room
         */
        socket.on('join_room', ({ roomCode, playerName }) => {
            try {
                const targetRoomCode = roomCode.toUpperCase();
                // Check if already in this room
                if (socket.data.roomCode === targetRoomCode) {
                    // Update name if changed
                    const room = roomManager.getRoom(targetRoomCode);
                    if (room) {
                        const player = room.players.find(p => p.id === socket.id);
                        if (player) {
                            player.name = playerName;
                            socket.data.playerName = playerName;
                            socket.emit('room_joined', { room, playerId: socket.id });
                            return;
                        }
                    }
                }
                // Leave any existing room (if different)
                if (socket.data.roomCode && socket.data.roomCode !== targetRoomCode) {
                    handleLeaveRoom(socket, io, roomManager);
                }
                const result = roomManager.joinRoom(targetRoomCode, socket.id, playerName);
                if (!result.success) {
                    socket.emit('error', { message: result.error || 'Failed to join room' });
                    return;
                }
                socket.data.playerName = playerName;
                socket.data.roomCode = roomCode.toUpperCase();
                // Join socket.io room
                socket.join(roomCode.toUpperCase());
                // Notify the joiner
                socket.emit('room_joined', {
                    room: result.room,
                    playerId: socket.id
                });
                // Notify others in the room
                const player = result.room.players.find(p => p.id === socket.id);
                if (player) {
                    socket.to(roomCode.toUpperCase()).emit('player_joined', player);
                }
                console.log(`✅ ${playerName} joined room ${roomCode}`);
            }
            catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * Leave room
         */
        socket.on('leave_room', () => {
            handleLeaveRoom(socket, io, roomManager);
        });
        /**
         * Set ready status
         */
        socket.on('set_ready', (ready) => {
            const room = roomManager.setPlayerReady(socket.id, ready);
            if (room) {
                io.to(room.code).emit('player_ready', { playerId: socket.id, ready });
            }
        });
        /**
         * Start the game (host only)
         */
        socket.on('start_game', () => {
            const room = roomManager.getRoomByPlayer(socket.id);
            if (!room) {
                socket.emit('error', { message: 'Not in a room' });
                return;
            }
            if (room.hostId !== socket.id) {
                socket.emit('error', { message: 'Only the host can start the game' });
                return;
            }
            if (!roomManager.areAllPlayersReady(room.code)) {
                socket.emit('error', { message: 'Not all players are ready' });
                return;
            }
            if (room.players.length < 2) {
                socket.emit('error', { message: 'Need at least 2 players to start' });
                return;
            }
            try {
                // Create game with player names from room
                const playerNames = room.players.map(p => p.name);
                const manager = game_state_manager_1.GameStateManager.createNewGame(room.players.length, playerNames, room.targetScore);
                gameManagers.set(room.code, manager);
                roomManager.setRoomStatus(room.code, 'playing');
                roomManager.updateGameState(room.code, manager.getState());
                // Clear any stored turn tiles from previous games
                room.players.forEach(p => playerTurnTiles.delete(p.id));
                const gameState = manager.getState();
                io.to(room.code).emit('game_started', gameState);
                console.log(`🎮 Game started in room ${room.code}`);
            }
            catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * Place tiles on board
         */
        socket.on('place_tiles', async ({ placements }) => {
            const room = roomManager.getRoomByPlayer(socket.id);
            if (!room || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not in progress' });
                return;
            }
            const manager = gameManagers.get(room.code);
            if (!manager) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            const playerId = roomManager.getGamePlayerId(socket.id);
            if (playerId === undefined) {
                socket.emit('error', { message: 'Player not found' });
                return;
            }
            const state = manager.getState();
            if (state.currentPlayerId !== playerId) {
                socket.emit('error', { message: 'Not your turn' });
                return;
            }
            try {
                const engine = manager.getEngine();
                const state = manager.getState();
                const player = state.players.find(p => p.id === playerId);
                if (!player) {
                    socket.emit('error', { message: 'Player not found' });
                    return;
                }
                // Get state before placement to track where tiles land
                const prevState = manager.getState();
                console.log(`📥 Place tiles request from ${player.name} (${playerId}):`, placements);
                console.log('Rack before placement:', player.rack.map(t => t.letter).join(','));
                // Convert placements to TilePlacement format
                const tilePlacements = placements.map(p => ({
                    column: p.column,
                    tile: player.rack[p.tileIndex]
                }));
                // Place tiles
                engine.placeTiles(tilePlacements, playerId);
                // Remove placed tiles from rack using engine method
                const indices = placements.map(p => p.tileIndex);
                console.log('🔧 About to remove tiles from rack at indices:', indices);
                console.log('🔧 Rack before removal:', JSON.stringify(engine.state.players.find((p) => p.id === playerId)?.rack.map((t) => t.letter)));
                engine.removeTilesFromRack(playerId, indices);
                console.log('🔧 Rack after removal (engine state):', JSON.stringify(engine.state.players.find((p) => p.id === playerId)?.rack.map((t) => t.letter)));
                console.log('Removed tiles from rack at indices:', indices);
                const newState = manager.getState();
                const newStatePlayer = newState.players.find(p => p.id === playerId);
                console.log('🔧 Rack in newState (after getState):', newStatePlayer?.rack.map(t => t.letter).join(',') || 'Player not found');
                console.log('🔧 Rack length in newState:', newStatePlayer?.rack.length);
                console.log('All player racks in newState:', newState.players.map(p => ({ id: p.id, name: p.name, rack: p.rack.map(t => t.letter).join(','), length: p.rack.length })));
                // Calculate where tiles actually landed (after gravity)
                const placedPositions = [];
                for (const placement of tilePlacements) {
                    const column = placement.column;
                    // Find where the new tile landed in this column
                    for (let row = 6; row >= 0; row--) {
                        const boardTile = newState.board[row][column];
                        const prevTile = prevState.board[row][column];
                        // Tile exists now but didn't before, or changed ownership
                        if (boardTile && (!prevTile || prevTile.playerId !== playerId) && boardTile.playerId === playerId) {
                            placedPositions.push({ x: column, y: row });
                            break;
                        }
                    }
                }
                // Update server-side turn tracking
                const currentTurnTiles = playerTurnTiles.get(socket.id) || [];
                playerTurnTiles.set(socket.id, [...currentTurnTiles, ...placedPositions]);
                console.log('📤 Sending tiles_placed with placedPositions:', placedPositions);
                roomManager.updateGameState(room.code, newState);
                io.to(room.code).emit('tiles_placed', {
                    playerId: socket.id,
                    gameState: newState,
                    placedPositions // NEW: Include where tiles landed
                });
            }
            catch (error) {
                console.error('Error placing tiles:', error);
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * Claim words and end turn
         */
        socket.on('claim_words', async ({ claims }) => {
            const room = roomManager.getRoomByPlayer(socket.id);
            if (!room || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not in progress' });
                return;
            }
            const manager = gameManagers.get(room.code);
            if (!manager) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            const playerId = roomManager.getGamePlayerId(socket.id);
            if (playerId === undefined) {
                socket.emit('error', { message: 'Player not found' });
                return;
            }
            console.log(`📥 Claim words request from ${playerId}:`, JSON.stringify(claims));
            const state = manager.getState();
            if (state.currentPlayerId !== playerId) {
                socket.emit('error', { message: 'Not your turn' });
                return;
            }
            try {
                const engine = manager.getEngine();
                const player = state.players.find(p => p.id === playerId);
                if (!player) {
                    socket.emit('error', { message: 'Player not found' });
                    return;
                }
                // Retrieve tiles placed this turn by this player
                const newlyPlacedTiles = playerTurnTiles.get(socket.id) || [];
                // Validate with dictionary (use global directory variable)
                console.log('Validating with dictionary size:', dictionary.size);
                // Convert socket claims { positions: {x,y}[] } to WordClaim[] { positions: [], playerId }
                const wordClaims = claims.map(c => ({
                    positions: c.positions,
                    playerId
                }));
                const result = await engine.processWordClaims(wordClaims, newlyPlacedTiles, dictionary);
                console.log('Validation result:', JSON.stringify(result));
                if (!result.valid) {
                    socket.emit('error', { message: 'Invalid word claims: ' + result.results.map(r => r.error).join(', ') });
                    return;
                }
                // Validation passed
                player.score += result.totalScore;
                engine.refillPlayerRack(playerId);
                engine.advanceTurn();
                // Clear turn tiles for this player
                playerTurnTiles.delete(socket.id);
                // Check win condition
                const winnerId = engine.checkWinCondition();
                const newState = manager.getState();
                roomManager.updateGameState(room.code, newState);
                if (winnerId !== null) {
                    roomManager.setRoomStatus(room.code, 'finished');
                    io.to(room.code).emit('game_ended', {
                        winnerId,
                        finalState: newState
                    });
                }
                else {
                    io.to(room.code).emit('words_claimed', {
                        playerId,
                        results: result,
                        gameState: newState
                    });
                    io.to(room.code).emit('turn_changed', {
                        currentPlayerId: newState.currentPlayerId,
                        gameState: newState
                    });
                }
            }
            catch (error) {
                console.error('Error claiming words:', error);
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * Swap tiles
         */
        socket.on('swap_tiles', ({ tileIndices }) => {
            const room = roomManager.getRoomByPlayer(socket.id);
            if (!room || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not in progress' });
                return;
            }
            const manager = gameManagers.get(room.code);
            if (!manager) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            const playerId = roomManager.getGamePlayerId(socket.id);
            if (playerId === undefined) {
                socket.emit('error', { message: 'Player not found' });
                return;
            }
            const state = manager.getState();
            if (state.currentPlayerId !== playerId) {
                socket.emit('error', { message: 'Not your turn' });
                return;
            }
            try {
                const engine = manager.getEngine();
                engine.swapTiles(playerId, tileIndices);
                engine.advanceTurn();
                const newState = manager.getState();
                roomManager.updateGameState(room.code, newState);
                io.to(room.code).emit('tiles_swapped', {
                    playerId: socket.id,
                    gameState: newState
                });
                io.to(room.code).emit('turn_changed', {
                    currentPlayerId: newState.currentPlayerId,
                    gameState: newState
                });
                // Clear turn tiles
                playerTurnTiles.delete(socket.id);
            }
            catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * End turn without claiming words
         */
        socket.on('end_turn', () => {
            const room = roomManager.getRoomByPlayer(socket.id);
            if (!room || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not in progress' });
                return;
            }
            const manager = gameManagers.get(room.code);
            if (!manager) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            const playerId = roomManager.getGamePlayerId(socket.id);
            if (playerId === undefined) {
                socket.emit('error', { message: 'Player not found' });
                return;
            }
            const state = manager.getState();
            if (state.currentPlayerId !== playerId) {
                socket.emit('error', { message: 'Not your turn' });
                return;
            }
            try {
                const engine = manager.getEngine();
                engine.refillPlayerRack(playerId);
                engine.advanceTurn();
                const newState = manager.getState();
                roomManager.updateGameState(room.code, newState);
                io.to(room.code).emit('turn_changed', {
                    currentPlayerId: newState.currentPlayerId,
                    gameState: newState
                });
                // Clear turn tiles
                playerTurnTiles.delete(socket.id);
            }
            catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * Remove a tile
         */
        socket.on('remove_tile', async ({ column, row }) => {
            const room = roomManager.getRoomByPlayer(socket.id);
            if (!room || room.status !== 'playing') {
                socket.emit('error', { message: 'Game not in progress' });
                return;
            }
            const manager = gameManagers.get(room.code);
            if (!manager) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            const playerId = roomManager.getGamePlayerId(socket.id);
            if (playerId === undefined) {
                socket.emit('error', { message: 'Player not found' });
                return;
            }
            const state = manager.getState();
            if (state.currentPlayerId !== playerId) {
                socket.emit('error', { message: 'Not your turn' });
                return;
            }
            try {
                const gameEngine = manager.getEngine();
                const tile = state.board[row][column];
                if (!tile) {
                    // Tile might already be gone
                    return;
                }
                // Verify ownership
                if (tile.playerId !== playerId) {
                    socket.emit('error', { message: 'You can only remove your own tiles' });
                    return;
                }
                // Remove the tile
                const removedTile = gameEngine.removeTile(column, row);
                if (removedTile) {
                    const player = state.players.find(p => p.id === playerId);
                    if (player) {
                        // Return to rack (without playerId)
                        player.rack.push({
                            letter: removedTile.letter,
                            points: removedTile.points
                        });
                    }
                    const newState = manager.getState();
                    roomManager.updateGameState(room.code, newState);
                    io.to(room.code).emit('tile_removed', {
                        playerId: socket.id,
                        gameState: newState,
                        removedPosition: { x: column, y: row }
                    });
                    // Remove from turn tracking
                    const current = playerTurnTiles.get(socket.id);
                    if (current) {
                        playerTurnTiles.set(socket.id, current.filter(p => !(p.x === column && p.y === row)));
                    }
                }
            }
            catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        /**
         * Handle disconnection
         */
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
            handleLeaveRoom(socket, io, roomManager);
        });
    });
}
/**
 * Helper to handle leaving a room
 */
function handleLeaveRoom(socket, io, roomManager) {
    const { roomCode, room, wasHost } = roomManager.leaveRoom(socket.id);
    if (roomCode) {
        socket.leave(roomCode);
        socket.data.roomCode = null;
        if (room) {
            // Notify remaining players
            io.to(roomCode).emit('player_left', socket.id);
            io.to(roomCode).emit('room_state', room);
        }
    }
}
//# sourceMappingURL=socket-events.js.map