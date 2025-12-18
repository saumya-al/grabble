# Grabble

🎮 Scrabble with Gravity - A turn-based multiplayer word game built with React and TypeScript.

**[Play Live Demo →](https://saumyamishraal.github.io/grabble/)**

## Overview

Grabble is played on a 7×7 grid where players drop tiles from column tops. Gravity resolves after placement, and players claim words for scoring. First player to reach the target score wins!

## Game Modes

- **🏠 Local Mode**: Play on a single device (hot-seat multiplayer)
- **🌐 Multiplayer Mode**: Real-time online play via Socket.IO

## Features

- 🎮 2-4 players (local or online)
- 📱 Mobile-first responsive design
- 🎯 Gravity mechanics - tiles fall straight down
- 📝 Drag-to-select word claiming
- 🏆 Scoring with bonuses (diagonal ×2, palindrome ×2, emordnilap ×2)
- 🔤 Blank tiles (wildcards)
- 📚 Dictionary validation (78,000+ words)
- ⚛️ React + TypeScript + Socket.IO

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Local Game Only (Single Device)

```bash
# Install dependencies
npm install

# Start frontend
npm start
```
Opens at http://localhost:3000 → Click **"Play Local"**

### Multiplayer (Online)

```bash
# Terminal 1: Start frontend
npm start

# Terminal 2: Start server
cd server
npm install
npx ts-node index.ts
```
- Frontend: http://localhost:3000
- Server: http://localhost:3001

---

## How to Play

1. **Setup**: Choose Local or Multiplayer mode
2. **Place Tiles**: Drag tiles from rack to any column (gravity applies)
3. **Select Words**: Drag across board tiles to select words
4. **Submit**: Click "Submit Move" to score selected words
5. **Win**: First to reach target score wins!

### Controls
| Action | How |
|--------|-----|
| Place tile | Drag from rack to board |
| Remove tile | Click placed tile (your own, current turn only) |
| Select word | Drag across tiles on board |
| Swap tiles | Select rack tiles → click "Swap" |

---

## Game Rules

- **Tiles fall** with gravity after placement
- **Words must be:**
  - 3+ letters
  - In dictionary
  - Straight line (horizontal/vertical/diagonal)
  - Include at least one tile placed this turn
- **Bonuses stack multiplicatively:**
  - Diagonal: ×2
  - Palindrome: ×2
  - Emordnilap: ×2 (reverse is different valid word)

---

## Project Structure

```
grabble/
├── src/                      # React Frontend
│   ├── components/           # UI components (11 total)
│   ├── hooks/useSocket.ts    # Socket.IO client hook
│   ├── game-engine.ts        # Core game logic
│   ├── game-state-manager.ts # Game lifecycle
│   └── App.tsx               # Main app
├── server/                   # Node.js Server
│   ├── index.ts              # Express + Socket.IO
│   ├── socket-events.ts      # Event handlers
│   └── room-manager.ts       # Lobby management
├── public/dictionary.txt     # 78,000+ words
└── ARCHITECTURE.md           # Detailed docs
```

---

## Development

```bash
# Frontend dev server
npm start

# Server (in /server directory)
npx ts-node index.ts

# Build for production
npm run build
```

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- System architecture diagrams
- All React components explained
- Game engine methods (25+)
- Socket events reference
- Scoring system details

---

## License

ISC

## Contributing

Contributions welcome! Please submit a Pull Request.
