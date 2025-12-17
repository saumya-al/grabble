/**
 * Dictionary loader for server-side word validation
 */

import * as fs from 'fs';
import * as path from 'path';

const DICTIONARY_PATH = path.join(__dirname, '../public/dictionary.txt');
const FALLBACK_DICTIONARY_PATH = path.join(__dirname, '../react-ui/public/dictionary.txt');

/**
 * Load dictionary from file
 */
export async function loadDictionary(): Promise<Set<string>> {
    const dictionary = new Set<string>();

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
    } catch (error) {
        console.error('Error loading dictionary:', error);
    }

    return dictionary;
}
