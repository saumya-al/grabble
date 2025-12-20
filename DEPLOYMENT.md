# Deploying Grabble to Production

This guide covers deploying both your **frontend** (React app) and **backend** (Socket.IO server) for multiplayer functionality.

---

## 🎯 Deployment Strategy

**Frontend** → Vercel or GitHub Pages (static hosting)  
**Backend** → Render, Fly.io, or paid hosting (WebSocket server)

> **Note**: Vercel serverless doesn't support persistent WebSocket connections, so your backend must be deployed separately.

---

## 📦 Part 1: Deploy Backend (Socket.IO Server)

### Option 1: Render (Free Tier - Recommended) ⭐

**Pros**: Free tier available, reliable  
**Cons**: Cold starts after 15 min inactivity (~30-60s spin-up time on first connection)

#### Step 1: Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub

2. Click **"New +"** → **"Web Service"**

3. Connect your repository and select your branch

4. **Configure the service**:
   ```
   Name:           grabble-server
   Root Directory: server
   Environment:    Node
   Build Command:  npm install && npm run build
   Start Command:  npm start
   Plan:           Free
   ```

5. Click **"Create Web Service"**

6. **Copy your server URL**: `https://grabble-server.onrender.com`

---

### Option 2: Fly.io (Free Tier - No Cold Starts) 🚀

**Pros**: Free tier, always-on (no cold starts), great performance  
**Cons**: Requires CLI setup

#### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Other: https://fly.io/docs/getting-started/installing-flyctl/
```

#### Step 2: Login and Deploy

```bash
# Login
flyctl auth login

# Navigate to server directory
cd server

# Launch (creates fly.toml config)
flyctl launch

# Follow prompts, then deploy
flyctl deploy
```

Your server URL: `https://your-app-name.fly.dev`

---

### Option 3: Paid Options ($5-7/month)

For production use without cold starts:

| Platform | Cost | Notes |
|----------|------|-------|
| **Render** | $7/month | Starter tier, no cold starts |
| **Railway** | ~$5/month | Pay-as-you-go, easy setup |
| **Fly.io** | ~$2-5/month | Only pay for what you use |
| **DigitalOcean** | $5/month | App Platform, reliable |

---

## 🎨 Part 2: Deploy Frontend

### Option 1: Vercel (Recommended) ⭐

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. Click **"New Project"** → Select your repository

3. **Configure**:
   ```
   Framework Preset: Create React App
   Root Directory:   (leave empty - uses project root)
   Build Command:    npm run build
   Output Directory: build
   ```

4. Click **"Deploy"**

5. **Your frontend URL**: `https://grabble-yourusername.vercel.app`

---

### Option 2: GitHub Pages (Alternative)

Already set up! Just run:
```bash
npm run deploy
```

Your app deploys to: `https://saumyamishraal.github.io/grabble`

---

## 🔗 Part 3: Connect Frontend to Backend

### Step 1: Update Socket URL

Edit [`src/hooks/useSocket.ts`](file:///Users/saumyamishra/Projects/grabble/src/hooks/useSocket.ts):

```typescript
const getSocketUrl = () => {
  // Production: use your deployed backend URL
  if (window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('github.io')) {
    return 'https://grabble-server.onrender.com'; // ← Replace with YOUR backend URL
  }
  
  // Local development
  return 'http://localhost:3001';
};
```

### Step 2: Update CORS on Backend

Edit [`server/index.ts`](file:///Users/saumyamishra/Projects/grabble/server/index.ts) (line 26) to add your frontend domain:

```typescript
cors: {
  origin: [
    'http://localhost:3000',
    'https://saumyamishraal.github.io',
    'https://grabble-yourusername.vercel.app', // ← Add your Vercel URL
    // ... other origins
  ],
  // ...
}
```

### Step 3: Redeploy

```bash
# Commit changes
git add .
git commit -m "Update for production deployment"
git push

# Backend auto-redeploys (Render/Fly.io watches your repo)

# Frontend - redeploy
npm run build
npm run deploy  # or push to trigger Vercel build
```

---

## ✅ Testing Your Deployment

1. Open your frontend URL
2. Click **"Create Room"**
3. If using Render free tier, wait 30-60s on first connection (cold start)
4. Share the room code with a friend
5. Play Grabble! 🎮

---

## 🛠️ Troubleshooting

### "WebSocket connection failed"
- Check console for CORS errors
- Verify backend URL in `useSocket.ts` matches your deployed server
- Ensure backend is running (visit server URL in browser)

### Cold starts too slow (Render free tier)
- Upgrade to Render paid tier ($7/month)
- Or switch to Fly.io free tier (no cold starts)

### Backend logs show errors
- **Render**: Dashboard → Service → Logs
- **Fly.io**: `flyctl logs`

### CORS errors
- Make sure your frontend domain is in `server/index.ts` CORS config
- Redeploy backend after CORS changes

---

## 💡 Recommended Setup

**For casual play with friends (Free)**:
- Frontend: Vercel or GitHub Pages
- Backend: Render free tier (accept 30s cold start)

**For production/no cold starts ($5-7/month)**:
- Frontend: Vercel
- Backend: Render paid tier or Fly.io

---

## 📊 Understanding Cold Starts

**What is a cold start?**  
On free tiers, your server "sleeps" after 15 minutes of inactivity to save resources. The next connection takes 30-60s to "wake up" the server.

**Real-world impact**:
- First game of the day: 30-60s wait ⏳
- Subsequent games: Instant connections ⚡
- After 15 min idle: Cold start again

**Paid tiers** keep your server always-on (no cold starts).

