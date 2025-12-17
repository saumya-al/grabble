"use strict";
/**
 * Dictionary loader for server-side word validation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDictionary = loadDictionary;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DICTIONARY_PATH = path.join(__dirname, '../public/dictionary.txt');
const FALLBACK_DICTIONARY_PATH = path.join(__dirname, '../react-ui/public/dictionary.txt');
/**
 * Load dictionary from file
 */
async function loadDictionary() {
    const dictionary = new Set();
    // Try main path first, then fallback
    let dictPath = DICTIONARY_PATH;
    if (!fs.existsSync(dictPath)) {
        dictPath = FALLBACK_DICTIONARY_PATH;
    }
    if (!fs.existsSync(dictPath)) {
        console.warn('⚠️ Dictionary file not found, using fallback dictionary');
        // Fallback: basic word list
        const fallbackWords = [
            'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD',
            'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS',
            'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'BOY',
            'DID', 'CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'SAT', 'MAT', 'PAT', 'FAT',
            'WORD', 'PLAY', 'GAME', 'TILE', 'DROP', 'GRAB', 'FALL', 'TURN', 'MOVE',
            'SCORE', 'POINT', 'BOARD', 'PLAYER', 'LETTER'
        ];
        fallbackWords.forEach(w => dictionary.add(w.toUpperCase()));
        return dictionary;
    }
    try {
        const content = fs.readFileSync(dictPath, 'utf-8');
        const words = content.split(/\r?\n/);
        for (const word of words) {
            const cleaned = word.trim().toUpperCase();
            // Only add words that are 3+ letters and contain only letters
            if (cleaned.length >= 3 && /^[A-Z]+$/.test(cleaned)) {
                dictionary.add(cleaned);
            }
        }
        console.log(`📖 Loaded ${dictionary.size} words from ${dictPath}`);
    }
    catch (error) {
        console.error('Error loading dictionary:', error);
    }
    return dictionary;
}
//# sourceMappingURL=dictionary.js.map