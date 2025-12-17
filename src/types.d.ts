/**
 * Copyright (c) 2024 Amuse Labs Pvt Ltd
 * Grabble - Scrabble with Gravity
 * Type definitions for Grabble game
 */
/**
 * Standard Scrabble tile with letter and point value
 */
export interface Tile {
    letter: string;
    points: number;
    playerId?: number;
    blankLetter?: string;
    isBlankLocked?: boolean;
}
/**
 * Position on the 7x7 board
 */
export interface Position {
    x: number;
    y: number;
}
/**
 * Tile placement - tile dropped into a column
 */
export interface TilePlacement {
    column: number;
    tile: Tile;
}
/**
 * Word claim - player's explicit word declaration
 */
export interface WordClaim {
    positions: Position[];
    playerId: number;
}
/**
 * Claimed word record (already scored)
 */
export interface ClaimedWord {
    word: string;
    positions: Position[];
    playerId: number;
    score: number;
    bonuses: string[];
}
/**
 * Player in the game
 */
export interface Player {
    id: number;
    name: string;
    color: string;
    score: number;
    rack: Tile[];
    turnOrder: number;
}
/**
 * Game state
 */
export interface GameState {
    board: (Tile | null)[][];
    players: Player[];
    currentPlayerId: number;
    tileBag: Tile[];
    claimedWords: ClaimedWord[];
    targetScore: number;
    gameStatus: 'waiting' | 'playing' | 'finished';
    winnerId?: number;
}
/**
 * Standard Scrabble letter distribution and point values
 *
 * Distribution:
 * A x 9, B x 2, C x 2, D x 4, E x 12, F x 2, G x 3, H x 2, I x 9, J x 1,
 * K x 1, L x 4, M x 2, N x 6, O x 8, P x 2, Q x 1, R x 6, S x 4, T x 6,
 * U x 4, V x 2, W x 2, X x 1, Y x 2, Z x 1, Blank x 2
 *
 * Point values:
 * 1 point: A, E, I, O, U, L, N, S, T, R
 * 2 points: D, G
 * 3 points: B, C, M, P
 * 4 points: F, H, V, W, Y
 * 5 points: K
 * 8 points: J, X
 * 10 points: Q, Z
 * 0 points: Blank
 */
export declare const STANDARD_SCRABBLE_DISTRIBUTION: Record<string, {
    count: number;
    points: number;
}>;
//# sourceMappingURL=types.d.ts.map