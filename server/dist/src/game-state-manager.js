"use strict";
/**
 * Copyright (c) 2024 Amuse Labs Pvt Ltd
 * Grabble - Scrabble with Gravity
 * Game state manager for turn order, player management, and game lifecycle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateManager = void 0;
const game_engine_1 = require("./game-engine");
/**
 * Game state manager - handles game initialization, player management, and lifecycle
 */
class GameStateManager {
    /**
     * Create a new game with specified number of players
     */
    static createNewGame(numPlayers, playerNames, targetScore = 100) {
        if (numPlayers < 2 || numPlayers > 4) {
            throw new Error('Game must have 2-4 players');
        }
        if (playerNames.length !== numPlayers) {
            throw new Error('Player names array must match number of players');
        }
        // Create tile bag
        const tileBag = game_engine_1.GrabbleEngine.createTileBag();
        // Create players with sequential turn order (player 1 always goes first)
        // Player 1 (id: 0) gets turnOrder 0, Player 2 (id: 1) gets turnOrder 1, etc.
        const playerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']; // Distinct colors for 4 players
        const players = playerNames.map((name, index) => ({
            id: index,
            name,
            color: playerColors[index],
            score: 0,
            rack: [],
            turnOrder: index // Sequential turn order: 0, 1, 2, 3
        }));
        // Deal initial tiles to each player
        for (const player of players) {
            for (let i = 0; i < 7; i++) {
                if (tileBag.length > 0) {
                    player.rack.push(tileBag.pop());
                }
            }
        }
        // Always start with player 1 (id: 0)
        const state = {
            board: game_engine_1.GrabbleEngine.createEmptyBoard(),
            players,
            currentPlayerId: 0, // Always start with player 1
            tileBag,
            claimedWords: [],
            targetScore,
            gameStatus: 'playing'
        };
        return new GameStateManager(state);
    }
    /**
     * Load game from saved state
     */
    static loadGame(state) {
        return new GameStateManager(state);
    }
    constructor(state) {
        this.state = state;
        this.engine = new game_engine_1.GrabbleEngine(state);
    }
    /**
     * Get current game state
     */
    getState() {
        return this.engine.getState();
    }
    /**
     * Get game engine (for game logic operations)
     */
    getEngine() {
        return this.engine;
    }
    /**
     * Get current player
     */
    getCurrentPlayer() {
        const player = this.state.players.find(p => p.id === this.state.currentPlayerId);
        if (!player) {
            throw new Error(`Current player ${this.state.currentPlayerId} not found`);
        }
        return player;
    }
    /**
     * Get player by ID
     */
    getPlayer(playerId) {
        return this.state.players.find(p => p.id === playerId);
    }
    /**
     * Get all players sorted by turn order
     */
    getPlayersByTurnOrder() {
        return [...this.state.players].sort((a, b) => a.turnOrder - b.turnOrder);
    }
    /**
     * Check if it's a specific player's turn
     */
    isPlayerTurn(playerId) {
        return this.state.currentPlayerId === playerId;
    }
    /**
     * Get game status
     */
    getGameStatus() {
        return this.state.gameStatus;
    }
    /**
     * Check if game is finished
     */
    isGameFinished() {
        return this.state.gameStatus === 'finished';
    }
    /**
     * Get winner if game is finished
     */
    getWinner() {
        if (!this.isGameFinished() || this.state.winnerId === undefined) {
            return null;
        }
        return this.getPlayer(this.state.winnerId) || null;
    }
    /**
     * End game and determine winner (highest score)
     * Called when no legal moves remain
     */
    endGame() {
        // Find player with highest score
        const winner = this.state.players.reduce((max, p) => p.score > max.score ? p : max);
        this.state.gameStatus = 'finished';
        this.state.winnerId = winner.id;
        return winner;
    }
    /**
     * Serialize game state for storage
     */
    serialize() {
        return JSON.stringify(this.state);
    }
    /**
     * Deserialize game state from storage
     */
    static deserialize(serialized) {
        const state = JSON.parse(serialized);
        return new GameStateManager(state);
    }
    /**
     * Get claimed words for a specific player
     */
    getClaimedWordsForPlayer(playerId) {
        return this.state.claimedWords.filter(cw => cw.playerId === playerId);
    }
    /**
     * Get all claimed words
     */
    getAllClaimedWords() {
        return [...this.state.claimedWords];
    }
    /**
     * Get player scores as array
     */
    getPlayerScores() {
        return this.state.players.map(p => ({
            playerId: p.id,
            name: p.name,
            score: p.score
        }));
    }
    /**
     * Get leaderboard (players sorted by score, descending)
     */
    getLeaderboard() {
        return [...this.state.players].sort((a, b) => b.score - a.score);
    }
}
exports.GameStateManager = GameStateManager;
//# sourceMappingURL=game-state-manager.js.map