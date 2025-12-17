"use strict";
/**
 * Copyright (c) 2024 Amuse Labs Pvt Ltd
 * Grabble - Scrabble with Gravity
 * Word detection utilities for finding words on the board
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWordsInDirection = findWordsInDirection;
exports.findAllWords = findAllWords;
exports.extractWordFromPositions = extractWordFromPositions;
exports.isValidWordLine = isValidWordLine;
exports.getReverseWord = getReverseWord;
exports.containsNewTile = containsNewTile;
exports.getWordDirection = getWordDirection;
exports.areWordsSameDirection = areWordsSameDirection;
exports.isSubstringWord = isSubstringWord;
/**
 * Direction vectors for word detection
 */
const DIRECTIONS = [
    { dx: 1, dy: 0 }, // Horizontal right
    { dx: 0, dy: 1 }, // Vertical down
    { dx: 1, dy: 1 }, // Diagonal down-right
    { dx: 1, dy: -1 } // Diagonal up-right
];
/**
 * Find all possible words starting from a position in a given direction
 * Returns array of word positions (each word is an array of positions)
 */
function findWordsInDirection(board, startX, startY, dx, dy) {
    const words = [];
    const rows = board.length;
    const cols = board[0]?.length || 0;
    // Start from the given position and extend in the direction
    let currentWord = [];
    // Move backwards first to find the start of any word containing this position
    let x = startX;
    let y = startY;
    // Go backwards until we hit an empty cell or board edge
    while (x >= 0 && x < cols && y >= 0 && y < rows && board[y][x] !== null) {
        x -= dx;
        y -= dy;
    }
    // Move forward one step (we went one too far back)
    x += dx;
    y += dy;
    // Now collect positions going forward
    while (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (board[y][x] === null) {
            // Hit empty cell - if we have a word, save it
            if (currentWord.length >= 3) {
                words.push([...currentWord]);
            }
            currentWord = [];
        }
        else {
            currentWord.push({ x, y });
        }
        x += dx;
        y += dy;
    }
    // Don't forget the word at the end if we hit the board edge
    if (currentWord.length >= 3) {
        words.push([...currentWord]);
    }
    return words;
}
/**
 * Find all words on the board (horizontal, vertical, diagonal)
 * Returns array of word positions
 */
function findAllWords(board) {
    const words = [];
    const rows = board.length;
    const cols = board[0]?.length || 0;
    const seen = new Set();
    // Check each cell as a potential starting point
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x] === null)
                continue;
            // Check each direction
            for (const { dx, dy } of DIRECTIONS) {
                const foundWords = findWordsInDirection(board, x, y, dx, dy);
                for (const wordPositions of foundWords) {
                    // Create a unique key for this word (normalize by sorting positions)
                    const sorted = [...wordPositions].sort((a, b) => {
                        if (a.y !== b.y)
                            return a.y - b.y;
                        return a.x - b.x;
                    });
                    const key = sorted.map(p => `${p.x},${p.y}`).join('|');
                    if (!seen.has(key)) {
                        seen.add(key);
                        words.push(wordPositions);
                    }
                }
            }
        }
    }
    return words;
}
/**
 * Extract word string from board positions
 * @param preserveOrder - If true, use positions as-is. If false, sort them.
 */
function extractWordFromPositions(board, positions, preserveOrder = false) {
    let orderedPositions;
    if (preserveOrder) {
        // Use positions as provided (respects drag direction)
        orderedPositions = positions;
    }
    else {
        // Determine word direction and sort accordingly
        if (positions.length === 0) {
            return '';
        }
        // Check the actual direction from the original positions (first to last)
        // This tells us which direction the user selected
        const firstPos = positions[0];
        const lastPos = positions[positions.length - 1];
        const dx = lastPos.x - firstPos.x;
        const dy = lastPos.y - firstPos.y;
        // Determine reading direction based on word orientation
        // For all straight-line words, preserve the selection direction (how user dragged)
        // This allows selecting words in any direction
        if (dx === 0 && dy !== 0) {
            // Vertical word - preserve selection direction
            // User can select top-to-bottom or bottom-to-top, both are valid
            orderedPositions = [...positions]; // Use selection order as-is
        }
        else if (dy === 0 && dx !== 0) {
            // Horizontal word - preserve selection direction  
            // User can select left-to-right or right-to-left, both are valid
            orderedPositions = [...positions]; // Use selection order as-is
        }
        else if (dx !== 0 && dy !== 0 && Math.abs(dx) === Math.abs(dy)) {
            // Diagonal word - preserve selection direction
            // User can select in any diagonal direction (top-left to bottom-right, 
            // bottom-right to top-left, top-right to bottom-left, bottom-left to top-right)
            orderedPositions = [...positions]; // Use selection order as-is
        }
        else {
            // Not a straight line - sort by y then x (top-left to bottom-right)
            orderedPositions = [...positions].sort((a, b) => {
                if (a.y !== b.y)
                    return a.y - b.y;
                return a.x - b.x;
            });
        }
    }
    const letters = [];
    for (const pos of orderedPositions) {
        const tile = board[pos.y]?.[pos.x];
        if (tile) {
            // For blank tiles, use blankLetter if available, otherwise use space
            if (tile.letter === ' ' && tile.blankLetter) {
                letters.push(tile.blankLetter);
            }
            else {
                letters.push(tile.letter);
            }
        }
    }
    const result = letters.join('').trim();
    // Debug: log extraction details for troubleshooting
    if (result.length > 0 && result.length <= 10) {
        console.log('extractWordFromPositions:', {
            preserveOrder,
            positions: positions.map(p => `(${p.x},${p.y})`),
            orderedPositions: orderedPositions.map(p => `(${p.x},${p.y})`),
            letters,
            result
        });
    }
    return result;
}
/**
 * Check if positions form a valid straight line (horizontal, vertical, or diagonal)
 */
function isValidWordLine(positions) {
    if (positions.length < 3) {
        return false;
    }
    // Sort positions
    const sorted = [...positions].sort((a, b) => {
        if (a.y !== b.y)
            return a.y - b.y;
        return a.x - b.x;
    });
    // Determine direction from first two positions
    const dx = sorted[1].x - sorted[0].x;
    const dy = sorted[1].y - sorted[0].y;
    // Check if direction is valid (must be horizontal, vertical, or diagonal)
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
        return false;
    }
    // Normalize direction
    const dirX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const dirY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    // Verify all positions follow the same direction
    for (let i = 1; i < sorted.length; i++) {
        const expectedX = sorted[i - 1].x + dirX;
        const expectedY = sorted[i - 1].y + dirY;
        if (sorted[i].x !== expectedX || sorted[i].y !== expectedY) {
            return false;
        }
    }
    return true;
}
/**
 * Check if word can be read in reverse direction (for palindrome/emordnilap detection)
 * Returns the reverse word if valid, null otherwise
 */
function getReverseWord(board, positions) {
    if (!isValidWordLine(positions)) {
        return null;
    }
    // Reverse the positions array to get the reverse word
    // This respects the selection order - if user selected left-to-right,
    // reverse gives right-to-left, and vice versa
    const reversedPositions = [...positions].reverse();
    // Extract reverse word (read reversed positions in order)
    const letters = [];
    for (const pos of reversedPositions) {
        const tile = board[pos.y]?.[pos.x];
        if (tile) {
            // For blank tiles, use blankLetter if available, otherwise use space
            if (tile.letter === ' ' && tile.blankLetter) {
                letters.push(tile.blankLetter);
            }
            else {
                letters.push(tile.letter);
            }
        }
    }
    return letters.join('').trim();
}
/**
 * Check if positions contain at least one of the newly placed tiles
 */
function containsNewTile(positions, newlyPlacedTiles) {
    return positions.some(pos => newlyPlacedTiles.some(newPos => newPos.x === pos.x && newPos.y === pos.y));
}
/**
 * Get the direction vector of a word (normalized to -1, 0, or 1)
 * Returns { dx, dy } or null if not a valid word line
 */
function getWordDirection(positions) {
    if (positions.length < 2) {
        return null;
    }
    // Sort positions to get consistent direction
    const sorted = [...positions].sort((a, b) => {
        if (a.y !== b.y)
            return a.y - b.y;
        return a.x - b.x;
    });
    const dx = sorted[1].x - sorted[0].x;
    const dy = sorted[1].y - sorted[0].y;
    // Normalize direction to -1, 0, or 1
    const dirX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const dirY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    return { dx: dirX, dy: dirY };
}
/**
 * Check if two words are in the same direction
 */
function areWordsSameDirection(word1Positions, word2Positions) {
    const dir1 = getWordDirection(word1Positions);
    const dir2 = getWordDirection(word2Positions);
    if (!dir1 || !dir2) {
        return false;
    }
    return dir1.dx === dir2.dx && dir1.dy === dir2.dy;
}
/**
 * Check if claimed word positions are a consecutive substring of longer word positions
 * (i.e., all positions of claimed word appear consecutively within longer word)
 */
function isSubstringWord(claimedPositions, longerWordPositions) {
    if (claimedPositions.length >= longerWordPositions.length) {
        return false; // Claimed word is not shorter
    }
    // Sort both to check for consecutive substring
    const claimedSorted = [...claimedPositions].sort((a, b) => {
        if (a.y !== b.y)
            return a.y - b.y;
        return a.x - b.x;
    });
    const longerSorted = [...longerWordPositions].sort((a, b) => {
        if (a.y !== b.y)
            return a.y - b.y;
        return a.x - b.x;
    });
    // Check if claimed positions appear consecutively in longer word
    // Try to find the starting index where claimed word matches
    for (let i = 0; i <= longerSorted.length - claimedSorted.length; i++) {
        let matches = true;
        for (let j = 0; j < claimedSorted.length; j++) {
            const longerPos = longerSorted[i + j];
            const claimedPos = claimedSorted[j];
            if (longerPos.x !== claimedPos.x || longerPos.y !== claimedPos.y) {
                matches = false;
                break;
            }
        }
        if (matches) {
            return true; // Found consecutive match
        }
    }
    return false;
}
//# sourceMappingURL=word-detection.js.map