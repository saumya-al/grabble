import React, { useState } from 'react';

type GameModeSelection = 'normal' | 'solo';

interface SetupModalProps {
  onStartGame: (
    numPlayers: number,
    playerNames: string[],
    targetScore: number,
    hintsEnabled: boolean,
    gameMode: GameModeSelection,
    zenMode: boolean
  ) => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ onStartGame }) => {
  const [gameMode, setGameMode] = useState<GameModeSelection>('normal');
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [targetScore, setTargetScore] = useState(100);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [soloPlayerName, setSoloPlayerName] = useState('Player');

  const handleNumPlayersChange = (value: number) => {
    setNumPlayers(value);
    const newNames = Array.from({ length: value }, (_, i) =>
      i < playerNames.length ? playerNames[i] : `Player ${i + 1}`
    );
    setPlayerNames(newNames);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameMode === 'solo') {
      // Solo mode: 1 player, no target score (endless)
      onStartGame(1, [soloPlayerName], 0, hintsEnabled, 'solo', zenMode);
    } else {
      onStartGame(numPlayers, playerNames, targetScore, hintsEnabled, 'normal', false);
    }
  };

  return (
    <div className="modal show">
      <div className="modal-content">
        <h2>Start New Game</h2>
        <form onSubmit={handleSubmit}>
          {/* Game Mode Selection */}
          <div className="form-group">
            <label>Game Mode:</label>
            <div className="game-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${gameMode === 'normal' ? 'active' : ''}`}
                onClick={() => setGameMode('normal')}
              >
                🎮 Versus
              </button>
              <button
                type="button"
                className={`mode-btn ${gameMode === 'solo' ? 'active' : ''}`}
                onClick={() => setGameMode('solo')}
              >
                🧘 Solo Endless
              </button>
            </div>
          </div>

          {gameMode === 'normal' ? (
            <>
              {/* Normal Mode Options */}
              <div className="form-group">
                <label>Number of Players:</label>
                <select
                  value={numPlayers}
                  onChange={(e) => handleNumPlayersChange(parseInt(e.target.value))}
                >
                  <option value="2">2 Players</option>
                  <option value="3">3 Players</option>
                  <option value="4">4 Players</option>
                </select>
              </div>

              {playerNames.map((name, index) => (
                <div key={index} className="form-group">
                  <label>Player {index + 1} Name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}

              <div className="form-group">
                <label>Target Score:</label>
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value) || 100)}
                  min="50"
                  max="500"
                />
              </div>
            </>
          ) : (
            <>
              {/* Solo Mode Options */}
              <div className="form-group">
                <label>Your Name:</label>
                <input
                  type="text"
                  value={soloPlayerName}
                  onChange={(e) => setSoloPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={zenMode}
                    onChange={(e) => setZenMode(e.target.checked)}
                  />
                  🧘 Zen Mode (hide score)
                </label>
              </div>

              <div className="solo-info">
                <p>🎯 Build words endlessly until the board fills up!</p>
                <p>📈 Your high score will be saved locally.</p>
              </div>
            </>
          )}

          <div className="form-group form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={hintsEnabled}
                onChange={(e) => setHintsEnabled(e.target.checked)}
              />
              💡 Enable Hints
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            {gameMode === 'solo' ? '🧘 Start Solo' : '🎮 Start Game'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupModal;
