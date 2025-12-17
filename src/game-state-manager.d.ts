/**
 * Copyright (c) 2024 Amuse Labs Pvt Ltd
 * Grabble - Scrabble with Gravity
 * Game state manager for turn order, player management, and game lifecycle
 */
import type { GameState, Player } from './types';
import { GrabbleEngine } from './game-engine';
/**
 * Game state manager - handles game initialization, player management, and lifecycle
 */
export declare class GameStateManager {
    private engine;
    private state;
    /**
     * Create a new game with specified number of players
     */
    static createNewGame(numPlayers: number, playerNames: string[], targetScore?: number): GameStateManager;
    /**
     * Load game from saved state
     */
    static loadGame(state: GameState): GameStateManager;
    private constructor();
    /**
     * Get current game state
     */
    getState(): GameState;
    /**
     * Get game engine (for game logic operations)
     */
    getEngine(): GrabbleEngine;
    /**
     * Get current player
     */
    getCurrentPlayer(): Player;
    /**
     * Get player by ID
     */
    getPlayer(playerId: number): Player | undefined;
    /**
     * Get all players sorted by turn order
     */
    getPlayersByTurnOrder(): Player[];
    /**
     * Check if it's a specific player's turn
     */
    isPlayerTurn(playerId: number): boolean;
    /**
     * Get game status
     */
    getGameStatus(): 'waiting' | 'playing' | 'finished';
    /**
     * Check if game is finished
     */
    isGameFinished(): boolean;
    /**
     * Get winner if game is finished
     */
    getWinner(): Player | null;
    /**
     * End game and determine winner (highest score)
     * Called when no legal moves remain
     */
    endGame(): Player;
    /**
     * Serialize game state for storage
     */
    serialize(): string;
    /**
     * Deserialize game state from storage
     */
    static deserialize(serialized: string): GameStateManager;
    /**
     * Get claimed words for a specific player
     */
    getClaimedWordsForPlayer(playerId: number): import("./types").ClaimedWord[];
    /**
     * Get all claimed words
     */
    getAllClaimedWords(): import("./types").ClaimedWord[];
    /**
     * Get player scores as array
     */
    getPlayerScores(): Array<{
        playerId: number;
        name: string;
        score: number;
    }>;
    /**
     * Get leaderboard (players sorted by score, descending)
     */
    getLeaderboard(): Player[];
}
//# sourceMappingURL=game-state-manager.d.ts.map