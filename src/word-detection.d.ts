/**
 * Copyright (c) 2024 Amuse Labs Pvt Ltd
 * Grabble - Scrabble with Gravity
 * Word detection utilities for finding words on the board
 */
import type { Position, Tile } from './types';
/**
 * Find all possible words starting from a position in a given direction
 * Returns array of word positions (each word is an array of positions)
 */
export declare function findWordsInDirection(board: (Tile | null)[][], startX: number, startY: number, dx: number, dy: number): Position[][];
/**
 * Find all words on the board (horizontal, vertical, diagonal)
 * Returns array of word positions
 */
export declare function findAllWords(board: (Tile | null)[][]): Position[][];
/**
 * Extract word string from board positions
 * @param preserveOrder - If true, use positions as-is. If false, sort them.
 */
export declare function extractWordFromPositions(board: (Tile | null)[][], positions: Position[], preserveOrder?: boolean): string;
/**
 * Check if positions form a valid straight line (horizontal, vertical, or diagonal)
 */
export declare function isValidWordLine(positions: Position[]): boolean;
/**
 * Check if word can be read in reverse direction (for palindrome/emordnilap detection)
 * Returns the reverse word if valid, null otherwise
 */
export declare function getReverseWord(board: (Tile | null)[][], positions: Position[]): string | null;
/**
 * Check if positions contain at least one of the newly placed tiles
 */
export declare function containsNewTile(positions: Position[], newlyPlacedTiles: Position[]): boolean;
/**
 * Get the direction vector of a word (normalized to -1, 0, or 1)
 * Returns { dx, dy } or null if not a valid word line
 */
export declare function getWordDirection(positions: Position[]): {
    dx: number;
    dy: number;
} | null;
/**
 * Check if two words are in the same direction
 */
export declare function areWordsSameDirection(word1Positions: Position[], word2Positions: Position[]): boolean;
/**
 * Check if claimed word positions are a consecutive substring of longer word positions
 * (i.e., all positions of claimed word appear consecutively within longer word)
 */
export declare function isSubstringWord(claimedPositions: Position[], longerWordPositions: Position[]): boolean;
//# sourceMappingURL=word-detection.d.ts.map