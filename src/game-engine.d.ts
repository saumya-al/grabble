/**
 * Copyright (c) 2024 Amuse Labs Pvt Ltd
 * Grabble - Scrabble with Gravity
 * Core game engine with game logic
 */
import type { Tile, Position, TilePlacement, WordClaim, GameState } from './types';
/**
 * Core game engine for Grabble
 */
export declare class GrabbleEngine {
    private state;
    constructor(state: GameState);
    /**
     * Get current game state
     */
    getState(): GameState;
    /**
     * Initialize a new tile bag from standard Scrabble distribution
     */
    static createTileBag(): Tile[];
    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    static shuffle<T>(array: T[]): T[];
    /**
     * Initialize empty 7x7 board
     */
    static createEmptyBoard(): (Tile | null)[][];
    /**
     * Place tiles from column tops (row 0)
     * Tiles are placed first, then gravity resolves
     */
    placeTiles(placements: TilePlacement[], playerId: number): void;
    /**
     * Place a tile directly at a specific position (without gravity)
     * Used for dropping tiles anywhere on the board
     */
    placeTileAtPosition(x: number, y: number, tile: Tile, playerId: number): void;
    /**
     * Remove a tile from the board at the given position
     * Returns the removed tile or null if position was empty
     */
    removeTile(x: number, y: number): Tile | null;
    /**
     * Resolve gravity - tiles fall straight down until they hit bottom or another tile
     */
    private resolveGravity;
    /**
     * Extract word from board given positions
     * Returns the word string and validates it's a straight line
     */
    extractWord(positions: Position[]): {
        word: string;
        isValid: boolean;
    };
    /**
     * Check if word is a palindrome (same forward and backward)
     */
    isPalindrome(word: string): boolean;
    /**
     * Check if word is an emordnilap (reverses to a different valid word)
     * Uses the reverse word from board positions to handle multi-character tiles correctly
     * Both the original word and the reverse word must be valid dictionary words
     */
    isEmordnilap(word: string, positions: Position[], dictionary: Set<string>): Promise<boolean>;
    /**
     * Calculate word score with bonuses
     */
    calculateWordScore(word: string, positions: Position[], dictionary: Set<string>): Promise<{
        score: number;
        bonuses: string[];
    }>;
    /**
     * Validate word claim
     * Returns validation result with error message if invalid
     */
    validateWordClaim(claim: WordClaim, newlyPlacedTiles: Position[], dictionary: Set<string>): Promise<{
        valid: boolean;
        error?: string;
        word?: string;
        score?: number;
        bonuses?: string[];
    }>;
    /**
     * Process word claims for a turn
     * Returns validation results for each claim
     */
    processWordClaims(claims: WordClaim[], newlyPlacedTiles: Position[], dictionary: Set<string>): Promise<{
        valid: boolean;
        results: Array<{
            valid: boolean;
            error?: string;
            word?: string;
            score?: number;
            bonuses?: string[];
        }>;
        totalScore: number;
    }>;
    /**
     * Draw tiles from bag to fill player rack (up to 7 tiles)
     */
    refillPlayerRack(playerId: number): void;
    /**
     * Swap tiles (player discards selected tiles, draws new ones)
     */
    swapTiles(playerId: number, tileIndices: number[]): void;
    /**
     * Advance to next player's turn
     */
    advanceTurn(): void;
    /**
     * Check win condition
     * Returns winner ID if game is won, null otherwise
     */
    checkWinCondition(): number | null;
    /**
     * Check if game can continue (tiles available and legal moves possible)
     */
    canContinueGame(): boolean;
}
//# sourceMappingURL=game-engine.d.ts.map