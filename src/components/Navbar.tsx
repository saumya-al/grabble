import React, { useState, useRef, useEffect } from 'react';
import { UI_MESSAGES } from '../constants/messages';

interface NavbarProps {
  currentPlayerName: string;
  onStartNewGame: () => void;
  onClearBoard: () => void;
  onToggleSound: () => void;
  onEndGame?: () => void;
  soundEnabled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  currentPlayerName,
  onStartNewGame,
  onClearBoard,
  onToggleSound,
  onEndGame,
  soundEnabled
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('grabble-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('grabble-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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

  const handleEndGame = () => {
    setMenuOpen(false);
    if (onEndGame) {
      onEndGame();
    }
  };

  const handleToggleDarkMode = () => {
    setMenuOpen(false);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <h1>{UI_MESSAGES.navbar.title}</h1>
        </div>
        <div className="turn-indicator">{currentPlayerName}</div>
        <div className="navbar-right" ref={menuRef}>
          {/* Theme toggle button */}
          <button
            className="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              // Sun icon for light mode
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
              </svg>
            )}
          </button>
          <button
            className="info-btn"
            onClick={() => setInfoOpen(true)}
            aria-label={UI_MESSAGES.navbar.howToPlay}
            title={UI_MESSAGES.navbar.howToPlay}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 160 160" fill="currentColor">
              <path d="m80 15c-35.88 0-65 29.12-65 65s29.12 65 65 65 65-29.12 65-65-29.12-65-65-65zm0 10c30.36 0 55 24.64 55 55s-24.64 55-55 55-55-24.64-55-55 24.64-55 55-55z" />
              <path d="m57.373 18.231a9.3834 9.1153 0 1 1 -18.767 0 9.3834 9.1153 0 1 1 18.767 0z" transform="matrix(1.1989 0 0 1.2342 21.214 28.75)" />
              <path d="m90.665 110.96c-0.069 2.73 1.211 3.5 4.327 3.82l5.008 0.1v5.12h-39.073v-5.12l5.503-0.1c3.291-0.1 4.082-1.38 4.327-3.82v-30.813c0.035-4.879-6.296-4.113-10.757-3.968v-5.074l30.665-1.105" />
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
                {UI_MESSAGES.buttons.startNewGame}
              </button>
              <button
                className="menu-item"
                onClick={handleClearBoard}
              >
                {UI_MESSAGES.buttons.requestClearBoard}
              </button>
              <button
                className="menu-item"
                onClick={handleToggleSound}
              >
                {soundEnabled ? UI_MESSAGES.buttons.turnSoundOff : UI_MESSAGES.buttons.turnSoundOn}
              </button>
              <button
                className="menu-item"
                onClick={handleToggleDarkMode}
              >
                {isDarkMode ? UI_MESSAGES.buttons.lightMode : UI_MESSAGES.buttons.darkMode}
              </button>
              {onEndGame && (
                <button
                  className="menu-item menu-item-danger"
                  onClick={handleEndGame}
                >
                  {UI_MESSAGES.buttons.endGame}
                </button>
              )}
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
        <h2>{UI_MESSAGES.navbar.howToPlayTitle}</h2>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="info-section">
          <h3>{UI_MESSAGES.navbar.objective}</h3>
          <p>{UI_MESSAGES.navbar.objectiveDescription}</p>
        </div>

        <div className="info-section">
          <h3>{UI_MESSAGES.navbar.placingTiles}</h3>
          <ul>
            {UI_MESSAGES.navbar.placingTilesItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>{UI_MESSAGES.navbar.formingWords}</h3>
          <ul>
            {UI_MESSAGES.navbar.formingWordsItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>{UI_MESSAGES.navbar.removingTiles}</h3>
          <ul>
            {UI_MESSAGES.navbar.removingTilesItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>{UI_MESSAGES.navbar.scoring}</h3>
          <ul>
            {UI_MESSAGES.navbar.scoringItems.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>{UI_MESSAGES.navbar.specialTiles}</h3>
          <ul>
            {UI_MESSAGES.navbar.specialTilesItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>{UI_MESSAGES.navbar.otherActions}</h3>
          <ul>
            {UI_MESSAGES.navbar.otherActionsItems.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

