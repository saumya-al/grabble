# Deploying Grabble Socket.IO Server

This guide will help you deploy your Socket.IO server so it works with your GitHub Pages frontend.

## Option 1: Railway (Recommended - Easiest)

Railway is the easiest option with a generous free tier.

### Step 1: Prepare Your Repository

Make sure your `server` folder is committed to GitHub:
```bash
git add server/
git commit -m "Add server files"
git push origin sanya
```

### Step 2: Deploy to Railway

1. **Sign up for Railway**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `grabble` repository
   - Select the `sanya` branch (or `main` if you prefer)

3. **Configure Service**
   - Railway will auto-detect it's a Node.js project
   - **Important**: Set the **Root Directory** to `server`
     - Click on your service → Settings → Root Directory → Set to `server`
   - Railway will automatically:
     - Run `npm install`
     - Run `npm run build` (if build script exists)
     - Run `npm start`

4. **Get Your Server URL**
   - After deployment, Railway will give you a URL like:
     - `https://grabble-production.up.railway.app`
   - Copy this URL!

### Step 3: Update Your Frontend

1. **Update `src/hooks/useSocket.ts`**
   - Replace the placeholder URL with your Railway URL:
   ```typescript
   if (window.location.hostname.includes('github.io')) {
     return 'https://your-railway-url.railway.app'; // Replace with your actual URL
   }
   ```

2. **Rebuild and Deploy to GitHub Pages**
   ```bash
   npm run build
   npm run deploy
   ```

### Step 4: Test

1. Open your GitHub Pages site: https://saumyamishraal.github.io/grabble
2. Try creating a room - it should connect to your Railway server!

---

## Option 2: Render (Free Tier Available)

### Step 1: Deploy to Render

1. **Sign up**: Go to https://render.com and sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `sanya` branch

3. **Configure Service**
   - **Name**: `grabble-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you want better performance)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy
   - Get your URL: `https://grabble-server.onrender.com`

### Step 2: Update Frontend

Same as Railway - update `src/hooks/useSocket.ts` with your Render URL.

**Note**: Render free tier spins down after inactivity. First request may take ~30 seconds.

---

## Option 3: Fly.io (Good Free Tier)

### Step 1: Install Fly CLI

```bash
# Mac
brew install flyctl

# Or download from https://fly.io/docs/getting-started/installing-flyctl/
```

### Step 2: Login

```bash
flyctl auth login
```

### Step 3: Create App

```bash
cd server
flyctl launch
```

Follow the prompts. Fly.io will create a `fly.toml` config file.

### Step 4: Deploy

```bash
flyctl deploy
```

Get your URL: `https://your-app-name.fly.dev`

---

## Environment Variables (if needed)

Most platforms auto-set `PORT`. If you need custom env vars:

- **Railway**: Project → Service → Variables
- **Render**: Service → Environment
- **Fly.io**: `flyctl secrets set KEY=value`

---

## Troubleshooting

### Server won't start
- Check logs in your hosting platform
- Ensure `npm start` runs `node dist/index.js`
- Verify TypeScript compiled successfully

### CORS errors
- Your server already allows `https://saumyamishraal.github.io`
- If using a different domain, update CORS in `server/index.ts`

### Connection refused
- Check your server URL is correct in `useSocket.ts`
- Verify server is running (check hosting platform dashboard)
- Test server directly: `curl https://your-server-url.com`

---

## Recommended: Railway

Railway is recommended because:
- ✅ Easiest setup
- ✅ Free tier ($5 credit/month)
- ✅ Auto-deploys on git push
- ✅ Good performance
- ✅ Easy to scale

---

## After Deployment

Once your server is live:

1. Update `src/hooks/useSocket.ts` with your server URL
2. Commit and push
3. Rebuild and deploy to GitHub Pages: `npm run deploy`
4. Test multiplayer functionality!

