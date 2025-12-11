# Deployment Guide

## 🚀 Live Deployment

**Frontend Dashboard URL**: https://eliyas3.github.io/Blynk/

## 📋 Deployment Setup

This repository is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automated Deployment

Every push to the `main` branch automatically triggers a deployment workflow that:
1. Installs dependencies
2. Builds the React application
3. Deploys to GitHub Pages

### Manual Deployment

To manually deploy from your local machine:

```bash
# Navigate to the frontend directory
cd blynk-web-dashboard

# Install dependencies (if not already installed)
npm install

# Deploy to GitHub Pages
npm run deploy
```

This will:
- Build the project (`npm run build`)
- Push the `dist` folder to the `gh-pages` branch

## ⚙️ GitHub Pages Settings

To enable GitHub Pages:

1. Go to your repository: https://github.com/Eliyas3/Blynk
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click **Save**

Wait a few minutes for the deployment to complete. The URL will be: https://eliyas3.github.io/Blynk/

## 🔧 Configuration

### Vite Configuration

The `vite.config.js` is configured with:
```javascript
base: '/Blynk/'
```

This ensures all assets (CSS, JS, images) load correctly from the GitHub Pages subdirectory.

### Package Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to GitHub Pages
- `npm run preview` - Preview production build locally

## 🌐 Backend Deployment

> **Note**: GitHub Pages only hosts static files (frontend). The backend needs to be deployed separately.

Recommended backend hosting options:
- **Render** (https://render.com) - Free tier available
- **Railway** (https://railway.app) - Free tier available
- **Heroku** - Paid plans
- **Vercel** - Good for Node.js backends
- **AWS/Google Cloud/Azure** - For production deployments

### Connecting Frontend to Backend

After deploying the backend, update the API endpoint in your frontend code to point to the deployed backend URL.

## 🔍 Troubleshooting

### Assets not loading (404 errors)
- Ensure `base: '/Blynk/'` is set in `vite.config.js`
- Check GitHub Pages settings to verify source branch is `gh-pages`

### Workflow failing
- Check the Actions tab: https://github.com/Eliyas3/Blynk/actions
- Ensure `package-lock.json` exists in `blynk-web-dashboard/`
- Verify all dependencies are correctly listed in `package.json`

### Page not updating
- GitHub Pages caching can cause delays
- Force refresh with Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Wait 5-10 minutes for DNS propagation

## 📝 First Time Setup Checklist

- [x] Configure `vite.config.js` with base path
- [x] Add deployment scripts to `package.json`
- [x] Create GitHub Actions workflow
- [ ] Enable GitHub Pages in repository settings
- [ ] Push changes to trigger first deployment
- [ ] Verify live site is accessible

## 🎉 After First Deployment

Once deployed, every push to `main` will automatically update your live site!
