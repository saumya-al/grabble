"use strict";
/**
 * Copyright (c) 2024 Amuse Labs Pvt Ltd
 * Grabble - Scrabble with Gravity
 * Type definitions for Grabble game
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STANDARD_SCRABBLE_DISTRIBUTION = void 0;
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
exports.STANDARD_SCRABBLE_DISTRIBUTION = {
    // 1 point letters
    'A': { count: 9, points: 1 },
    'E': { count: 12, points: 1 },
    'I': { count: 9, points: 1 },
    'O': { count: 8, points: 1 },
    'U': { count: 4, points: 1 },
    'L': { count: 4, points: 1 },
    'N': { count: 6, points: 1 },
    'S': { count: 4, points: 1 },
    'T': { count: 6, points: 1 },
    'R': { count: 6, points: 1 },
    // 2 point letters
    'D': { count: 4, points: 2 },
    'G': { count: 3, points: 2 },
    // 3 point letters
    'B': { count: 2, points: 3 },
    'C': { count: 2, points: 3 },
    'M': { count: 2, points: 3 },
    'P': { count: 2, points: 3 },
    // 4 point letters
    'F': { count: 2, points: 4 },
    'H': { count: 2, points: 4 },
    'V': { count: 2, points: 4 },
    'W': { count: 2, points: 4 },
    'Y': { count: 2, points: 4 },
    // 5 point letters
    'K': { count: 1, points: 5 },
    // 8 point letters
    'J': { count: 1, points: 8 },
    'X': { count: 1, points: 8 },
    // 10 point letters
    'Q': { count: 1, points: 10 },
    'Z': { count: 1, points: 10 },
    // Blank tiles
    ' ': { count: 2, points: 0 }
};
//# sourceMappingURL=types.js.map