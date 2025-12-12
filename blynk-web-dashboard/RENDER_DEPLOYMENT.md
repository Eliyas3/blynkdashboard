# Deploying Backend WebSocket Server to Render

Follow these steps to deploy your WebSocket server and connect it to your Blynk dashboard:

## Step 1: Create Render Account & Deploy

1. **Go to Render.com**
   - Visit https://render.com
   - Sign up with your GitHub account (recommended for easy integration)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select "Connect a repository" 
   - Choose your GitHub repository: `Eliyas3/Blynk`
   - Or use "Deploy from Git URL": https://github.com/Eliyas3/Blynk

3. **Configure the Service**
   - **Name**: `blynk-websocket-server` (or your preferred name)
   - **Region**: Choose closest to your location
   - **Branch**: `main`
   - **Root Directory**: `blynk-web-dashboard`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free` (select Free plan)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (2-3 minutes)
   - Copy your service URL (e.g., `https://blynk-websocket-server.onrender.com`)

## Step 2: Update Frontend Configuration

After getting your Render URL:

1. **Update `.env.production`**
   ```bash
   # Replace with your actual Render URL
   VITE_WS_URL=wss://blynk-websocket-server.onrender.com
   ```

2. **Rebuild and redeploy frontend**
   ```bash
   cd blynk-web-dashboard
   npm run build
   npm run deploy
   ```

3. **Wait for GitHub Pages to update** (2-5 minutes)

## Step 3: Test the Connection

1. Open https://eliyas3.github.io/Blynk/
2. Open browser console (F12)
3. Look for: `✅ Connected to WebSocket server`
4. The "Disconnected" indicator should disappear

## Step 4: Update ESP8266 Code

Update your ESP8266 code to connect to the deployed server:

```cpp
// Replace localhost with your Render domain
const char* SERVER_IP = "blynk-websocket-server.onrender.com";
const int SERVER_PORT = 443; // Use 443 for WSS (secure WebSocket)
```

Then flash the updated code to your ESP8266.

## Troubleshooting

**If Render deployment fails:**
- Check that `render.yaml` is in the root of your repository
- Verify `ws` package is listed in `package.json` dependencies
- Check Render logs for specific error messages

**If frontend doesn't connect:**
- Verify the WebSocket URL in `.env.production` matches your Render URL
- Use `wss://` (secure) not `ws://` for production
- Check browser console for connection errors
- Verify Render service is running in Render dashboard

**If ESP8266 doesn't connect:**
- For WSS (port 443), you may need to use WiFiClientSecure library
- Alternatively, Render supports both HTTP and HTTPS - try port 80 for WS
- Check Serial Monitor for connection error messages

## Notes

- **Render Free Tier**: Service may spin down after 15 minutes of inactivity and take 30-60 seconds to restart on new connections
- **WebSocket Protocol**: In production, use `wss://` (secure) instead of `ws://`
- **Cold Starts**: First connection after inactivity may be slow

## Alternative: Quick Test with Local Tunnel

If you want to test quickly without Render:

1. Install ngrok: https://ngrok.com/download
2. Run your local server: `node server.js`
3. In another terminal: `ngrok http 8080`
4. Use the ngrok URL in your frontend (e.g., `wss://abc123.ngrok.io`)

This is for testing only - ngrok free URLs expire after 2 hours.
