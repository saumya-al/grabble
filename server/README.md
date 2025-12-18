# Grabble Socket.IO Server

Socket.IO server for Grabble multiplayer game.

## Local Development

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3001`

## Deployment

### Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your `grabble` repository
   - Set root directory to `/server`

3. **Configure Environment**
   - Railway will auto-detect Node.js
   - PORT is automatically set by Railway
   - No additional env vars needed

4. **Deploy**
   - Railway will build and deploy automatically
   - Get your server URL (e.g., `https://grabble-server.railway.app`)

5. **Update Client**
   - Update `src/hooks/useSocket.ts` with your Railway URL
   - Or set `REACT_APP_SOCKET_URL` environment variable

### Render (Alternative)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Set:
     - **Name**: `grabble-server`
     - **Root Directory**: `server`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Port**: Auto-detected

3. **Deploy**
   - Render will build and deploy
   - Get your server URL (e.g., `https://grabble-server.onrender.com`)

### Fly.io (Alternative)

1. **Install Fly CLI**: `brew install flyctl` (Mac) or see https://fly.io/docs/getting-started/installing-flyctl/

2. **Login**: `flyctl auth login`

3. **Create App**: `flyctl launch` (in server directory)

4. **Deploy**: `flyctl deploy`

## Environment Variables

- `PORT` - Server port (auto-set by hosting platform)

## CORS Configuration

Server is configured to allow connections from:
- `http://localhost:3000` (local dev)
- `https://saumyamishraal.github.io` (GitHub Pages)
- `https://*.github.io` (all GitHub Pages)

