# Deploying Grabble Server from a Forked Repository

If the `grabble` repository is owned by someone else, here are your deployment options:

## Option 1: Fork the Repository (Recommended)

### Step 1: Fork on GitHub
1. Go to the original repository on GitHub
2. Click the "Fork" button in the top right
3. This creates a copy in your GitHub account

### Step 2: Update Your Local Remote
```bash
# Add your fork as a new remote
git remote add myfork https://github.com/YOUR_USERNAME/grabble.git

# Push your branch to your fork
git push myfork sanya
```

### Step 3: Deploy from Your Fork
- Railway/Render: Connect to **your fork** instead of the original repo
- Select your fork when deploying
- Everything else works the same!

---

## Option 2: Deploy Without GitHub (Manual Deployment)

### Railway - Manual Deploy

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Empty Project" (not GitHub)

2. **Connect via GitHub CLI or Manual Upload**
   - Install Railway CLI: `npm i -g @railway/cli`
   - Login: `railway login`
   - In your `server` directory: `railway init`
   - Deploy: `railway up`

### Fly.io - Manual Deploy

1. **Install Fly CLI**
   ```bash
   brew install flyctl  # Mac
   # Or see: https://fly.io/docs/getting-started/installing-flyctl/
   ```

2. **Login and Deploy**
   ```bash
   cd server
   flyctl auth login
   flyctl launch
   # Follow prompts, then:
   flyctl deploy
   ```

### Render - Manual Deploy

1. **Create Web Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Select "Public Git repository"
   - Enter repository URL manually
   - Or use "Manual" deployment option

---

## Option 3: Deploy from Local Files (No Git Required)

### Using Railway CLI

```bash
cd server
npm install -g @railway/cli
railway login
railway init
railway up
```

### Using Fly.io

```bash
cd server
flyctl launch
flyctl deploy
```

### Using Docker + Any Platform

Create a `Dockerfile` in the `server` directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
```

Then deploy to:
- Railway (supports Docker)
- Fly.io (supports Docker)
- Render (supports Docker)
- DigitalOcean App Platform
- AWS ECS/Fargate
- Google Cloud Run

---

## Option 4: Keep Working Locally, Deploy Later

If you want to test locally first:

1. **Test locally** (you're already doing this!)
   ```bash
   cd server
   npm run dev
   ```

2. **When ready to deploy**, fork the repo or use manual deployment

---

## Recommended Approach

**If you have write access to the repo:**
- Just deploy directly - Railway/Render can connect to any GitHub repo you have access to

**If you don't have write access:**
- **Fork the repo** → Deploy from your fork (easiest)
- Or use **Fly.io CLI** for manual deployment (no GitHub needed)

---

## Quick Fly.io Deployment (No GitHub Required)

```bash
# 1. Install Fly CLI
brew install flyctl

# 2. Login
flyctl auth login

# 3. In server directory
cd server
flyctl launch
# Answer prompts:
#   - App name: grabble-server (or your choice)
#   - Region: choose closest to you
#   - Postgres: No
#   - Redis: No

# 4. Deploy
flyctl deploy

# 5. Get your URL
flyctl status
```

Your server will be live at: `https://your-app-name.fly.dev`

Then update `src/hooks/useSocket.ts` with this URL!

