import React, { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  currentPlayerName: string;
  onStartNewGame: () => void;
  onClearBoard: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentPlayerName, 
  onStartNewGame, 
  onClearBoard, 
  onToggleSound,
  soundEnabled 
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking/touching outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [menuOpen]);

  const handleStartNewGame = () => {
    setMenuOpen(false);
    onStartNewGame();
  };

  const handleClearBoard = () => {
    setMenuOpen(false);
    onClearBoard();
  };

  const handleToggleSound = () => {
    setMenuOpen(false);
    onToggleSound();
  };

  return (
    <>
    <nav className="navbar">
        <div className="navbar-left">
      <h1>Grabble</h1>
        </div>
        <div className="turn-indicator">{currentPlayerName}</div>
        <div className="navbar-right" ref={menuRef}>
          <button 
            className="info-btn" 
            onClick={() => setInfoOpen(true)}
            aria-label="How to play"
            title="How to play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 160 160" fill="currentColor">
              <path d="m80 15c-35.88 0-65 29.12-65 65s29.12 65 65 65 65-29.12 65-65-29.12-65-65-65zm0 10c30.36 0 55 24.64 55 55s-24.64 55-55 55-55-24.64-55-55 24.64-55 55-55z"/>
              <path d="m57.373 18.231a9.3834 9.1153 0 1 1 -18.767 0 9.3834 9.1153 0 1 1 18.767 0z" transform="matrix(1.1989 0 0 1.2342 21.214 28.75)"/>
              <path d="m90.665 110.96c-0.069 2.73 1.211 3.5 4.327 3.82l5.008 0.1v5.12h-39.073v-5.12l5.503-0.1c3.291-0.1 4.082-1.38 4.327-3.82v-30.813c0.035-4.879-6.296-4.113-10.757-3.968v-5.074l30.665-1.105"/>
            </svg>
          </button>
          <button 
            className="menu-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <button 
                className="menu-item" 
                onClick={handleStartNewGame}
              >
                Start New Game
              </button>
              <button 
                className="menu-item" 
                onClick={handleClearBoard}
              >
                Request Clear Board
              </button>
              <button 
                className="menu-item" 
                onClick={handleToggleSound}
              >
                {soundEnabled ? 'Turn Sound Off' : 'Turn Sound On'}
              </button>
            </div>
          )}
        </div>
    </nav>
      {infoOpen && (
        <div className="modal show" onClick={() => setInfoOpen(false)}>
          <InfoModal onClose={() => setInfoOpen(false)} />
        </div>
      )}
    </>
  );
};

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="modal-content info-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>How to Play Grabble</h2>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
          <div className="info-section">
            <h3>Objective</h3>
            <p>Form words on a 7×7 grid using Scrabble tiles. Be the first to reach the target score!</p>
          </div>
          
          <div className="info-section">
            <h3>Placing Tiles</h3>
            <ul>
              <li>Drag tiles from your rack to the top row of any column</li>
              <li>Tiles automatically fall to the lowest empty space in that column (gravity)</li>
              <li>You can also drag tiles directly to any empty cell on the board</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Forming Words</h3>
            <ul>
              <li>Drag your cursor across tiles to select a word (horizontal, vertical, or diagonal)</li>
              <li>Words must be at least 3 letters long</li>
              <li>All words must be valid dictionary words</li>
              <li>You can select multiple words before submitting</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Removing Tiles</h3>
            <ul>
              <li>Double-click a tile to remove it (only tiles placed this turn)</li>
              <li>Drag a tile out of the board to remove it</li>
              <li>Click the × button on a tile to remove it</li>
              <li>You can only remove tiles you placed during your current turn</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Scoring</h3>
            <ul>
              <li><strong>Base Score:</strong> Sum of letter values</li>
              <li><strong>Diagonal Bonus:</strong> 2× multiplier for diagonal words</li>
              <li><strong>Palindrome Bonus:</strong> 2× multiplier for words that read the same forwards and backwards (e.g., "RADAR")</li>
              <li><strong>Emordnilap Bonus:</strong> 2× multiplier when a word and its reverse are both valid (e.g., "TIN" and "NIT")</li>
              <li>Bonuses stack multiplicatively</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Special Tiles</h3>
            <ul>
              <li><strong>Blank Tiles:</strong> Click to assign a letter. The letter is locked after you submit your move</li>
              <li>Blank tiles are worth 0 points</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Other Actions</h3>
            <ul>
              <li><strong>Swap Tiles:</strong> Select tiles from your rack and swap them for new ones (costs your turn)</li>
              <li><strong>Submit Move:</strong> Submit all selected words to score points</li>
            </ul>
          </div>
        </div>
      </div>
  );
};

export default Navbar;

