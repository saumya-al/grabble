/**
 * High Score Management for Solo Endless Mode
 * Uses localStorage to persist high scores across sessions
 */

const HIGH_SCORE_KEY = 'grabble_solo_high_score';

export function getHighScore(): number {
    try {
        const stored = localStorage.getItem(HIGH_SCORE_KEY);
        return stored ? parseInt(stored, 10) : 0;
    } catch {
        return 0;
    }
}

export function setHighScore(score: number): void {
    try {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch {
        console.warn('Failed to save high score to localStorage');
    }
}

export function updateHighScoreIfBetter(currentScore: number): boolean {
    const current = getHighScore();
    if (currentScore > current) {
        setHighScore(currentScore);
        return true; // New high score!
    }
    return false;
}
