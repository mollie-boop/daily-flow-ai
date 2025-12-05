# Deployment Guide

## Step 1: Push to GitHub

Your code is committed but needs GitHub authentication to push.

### Option A: Use GitHub CLI (Recommended)
```bash
gh auth login
git push
```

### Option B: Use Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "DayLog Deploy"
4. Select scopes: `repo` (full control)
5. Generate and copy the token
6. Push with:
```bash
git push https://YOUR_TOKEN@github.com/mollie-boop/daily-flow-ai.git main
```

### Option C: Set up SSH Key
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: https://github.com/settings/keys
# Then update remote to use SSH
git remote set-url origin git@github.com:mollie-boop/daily-flow-ai.git
git push
```

## Step 2: Deploy to Render.com

### 2.1: Create Render Account
1. Go to https://render.com
2. Sign up or log in
3. Connect your GitHub account

### 2.2: Create New Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect your repository: `mollie-boop/daily-flow-ai`
3. Render will auto-detect the `render.yaml` configuration!

### 2.3: Configure Environment Variables
**Important:** Add your OpenAI API key:
1. In Render dashboard, go to your site
2. Click **"Environment"** tab
3. Add variable:
   - **Key:** `VITE_OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (sk-proj-...)

### 2.4: Deploy
1. Click **"Create Static Site"**
2. Render will automatically:
   - Install dependencies (`npm install`)
   - Build the app (`npm run build`)
   - Deploy to a live URL

## Your App Configuration

The `render.yaml` file is already configured with:
- ✅ Static site hosting
- ✅ Build command: `npm install && npm run build`
- ✅ Output directory: `./dist`
- ✅ Environment variable for OpenAI key
- ✅ Proper caching headers
- ✅ SPA routing (all routes redirect to index.html)

## Automatic Deployments

Once connected, Render will automatically deploy when you:
1. Push commits to `main` branch on GitHub
2. Your site rebuilds and deploys automatically

## Your Live URL

After deployment, Render gives you a URL like:
- `https://daily-flow-ai.onrender.com`

You can also add a custom domain in Render settings.

## Testing Your Deployment

After deployment:
1. Visit your Render URL
2. Check for **"AI Enabled"** badge
3. Create a test log entry
4. Verify localStorage works (refresh page - data should persist)

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json`

### AI Not Working
- Verify `VITE_OPENAI_API_KEY` is set in Render environment variables
- Check browser console for API errors
- Verify OpenAI API key is valid and has credits

### 404 on Routes
- The `render.yaml` is configured with SPA routing
- All routes should redirect to `index.html`
- If issues persist, check Render logs

### Data Not Persisting
- Check browser console for localStorage errors
- Verify browser allows localStorage
- Check if private/incognito mode is blocking storage

## Cost

Render.com Free Tier includes:
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment from Git
- ✅ Custom domains

Perfect for personal projects!

## Updating Your App

To deploy updates:
```bash
# Make changes to code
git add .
git commit -m "Your update message"
git push
```

Render automatically deploys the changes!

## GitHub Repository

Your repo: https://github.com/mollie-boop/daily-flow-ai
