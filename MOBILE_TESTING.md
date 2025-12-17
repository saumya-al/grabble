# Testing Grabble on Mobile Devices

## Option 1: Test on Local Network (Easiest)

### Steps:
1. **Find your computer's local IP address:**
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows:
   ipconfig
   ```
   Look for something like `192.168.1.xxx` or `10.0.0.xxx`

2. **Start the dev server with your IP:**
   ```bash
   # Set HOST environment variable to allow external connections
   HOST=0.0.0.0 npm start
   ```
   Or on Windows:
   ```bash
   set HOST=0.0.0.0 && npm start
   ```

3. **Access from your phone:**
   - Make sure your phone is on the same WiFi network as your computer
   - Open browser on phone and go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

## Option 2: Deploy to a Feature Branch on GitHub Pages

### Steps:
1. **Create a feature branch:**
   ```bash
   git checkout -b feature/mobile-improvements
   git add .
   git commit -m "Mobile responsive improvements"
   git push origin feature/mobile-improvements
   ```

2. **Deploy the branch to GitHub Pages:**
   ```bash
   npm run deploy
   ```
   This will deploy to `gh-pages` branch.

3. **Enable GitHub Pages for the branch:**
   - Go to your GitHub repo → Settings → Pages
   - Source: select `gh-pages` branch
   - Your app will be at: `https://saumyamishraal.github.io/grabble`
   - Note: This will show your latest deployment (from any branch)

## Option 3: Use ngrok (Tunnel to Localhost)

1. **Install ngrok:**
   ```bash
   # Mac (with Homebrew):
   brew install ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Start your dev server:**
   ```bash
   npm start
   ```

3. **In another terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Use the ngrok URL:**
   - ngrok will give you a URL like `https://abc123.ngrok.io`
   - Open this URL on your phone (works from anywhere!)

## Option 4: Use VS Code Live Server Extension

If you're using VS Code:
1. Install "Live Server" extension
2. Right-click on `build/index.html` (after running `npm run build`)
3. Select "Open with Live Server"
4. It will give you a local network URL

## Mobile Testing Checklist

- [ ] Tiles can be selected by tapping
- [ ] Tiles can be placed by tapping column headers
- [ ] Words can be selected by swiping/touching across tiles
- [ ] Text is not selectable when swiping
- [ ] Buttons are large enough to tap easily
- [ ] Board fits on screen without horizontal scrolling
- [ ] All UI elements are visible and accessible
- [ ] Blank tile editing works on mobile
- [ ] Tile removal (double-tap) works on mobile

## Troubleshooting

**Can't connect from phone:**
- Make sure both devices are on the same WiFi network
- Check firewall settings on your computer
- Try disabling firewall temporarily for testing

**Port 3000 blocked:**
- Use a different port: `PORT=3001 npm start`
- Update the URL accordingly

**ngrok not working:**
- Make sure you have an ngrok account (free tier available)
- Authenticate: `ngrok authtoken YOUR_TOKEN`

