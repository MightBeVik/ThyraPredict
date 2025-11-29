# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- Git installed
- Your project pushed to GitHub

## Quick Start (5 minutes)

### Option 1: Deploy from GitHub (Recommended)

1. **Connect GitHub to Railway**
   - Go to https://railway.app
   - Click "Create New Project"
   - Select "Deploy from GitHub"
   - Authorize Railway to access your repos
   - Select your ThyroPredict repository

2. **Configure Environment**
   - Railway automatically detects Python project
   - Sets up with Procfile configuration
   - No additional setup needed!

3. **Deploy**
   - Push changes to main branch
   - Railway automatically redeploys
   - Your app is live!

### Option 2: Deploy from Local (Advanced)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize project**
   ```bash
   cd ThyroPredict
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

---

## What's Configured for Railway

### Files Added:
- ✅ `Dockerfile` - Container configuration
- ✅ `railway.json` - Railway deployment settings
- ✅ `Procfile` - Web process configuration

### Updated Files:
- ✅ `requirements.txt` - Added xgboost dependency
- ✅ `runtime.txt` - Python 3.10.13 specified

### Configuration Details:

**Procfile:**
```
web: gunicorn --workers 2 --threads 2 --worker-class gthread --worker-tmp-dir /dev/shm app:app
```

**Dockerfile:**
- Uses Python 3.10-slim (smaller size)
- Installs build tools for scikit-learn/xgboost compilation
- Sets Python environment variables
- Exposes port 8000
- Runs gunicorn with threading support

**railway.json:**
- Configures build and deploy settings
- Auto-restart on failure
- 5 retry attempts

---

## Environment Variables

If needed, set these on Railway dashboard:

```
FLASK_ENV=production
PORT=8000
```

(Most are auto-configured)

---

## Model Files

The ML models are included in the repository:
- `Model/rf_model.pkl` (3.8 MB)
- `Model/xgb_model.pkl` (1.2 MB)
- `Model/gb_model.pkl` (3.0 MB)
- `Model/svm_model.pkl` (142 KB)
- `Model/lr_model.pkl` (1.7 KB)
- `Model/scaler.pkl`
- `Model/class_mapping.pkl`

Total size: ~12.5 MB (well within Railway limits)

---

## Memory & Performance

Railway specs for ThyroPredict:
- **CPU**: 1 vCPU (sufficient for Flask app)
- **Memory**: 512 MB (minimum, recommended)
- **Deployment time**: ~2-3 minutes
- **Startup time**: ~30-60 seconds

**Increase memory if needed:**
- Go to Railway dashboard
- Select your service
- Adjust resource limits
- Railway charges by usage ($0.000231/GB-hour)

---

## Monitoring

**View Logs:**
```bash
railway logs
```

**View Deployments:**
- Railway Dashboard → Your Project → Deployments

**Monitor Performance:**
- Railway Dashboard → Monitoring

---

## Troubleshooting

### Build Fails
- Check Python version compatibility
- Verify all dependencies in requirements.txt
- Check Dockerfile for syntax errors

### App Won't Start
```bash
railway logs
```
- Look for import errors
- Check model file paths
- Verify PORT environment variable

### Slow Response
- Railway may be on free tier
- Upgrade to paid plan for better resources
- Increase worker threads in Procfile

### Models Not Loading
- Ensure Model/ folder is committed to git
- Check .gitignore doesn't exclude .pkl files
- Verify file permissions

---

## Cost Estimation

**Free Tier:**
- $5/month credit
- Limited uptime
- Good for testing

**Production:**
- Pay-as-you-go
- ~$0-5/month for ThyroPredict
- Depends on traffic

---

## Updating Deployment

### Code Changes
```bash
git add .
git commit -m "Update message"
git push origin main
```
Railway auto-redeploys (if connected to GitHub)

### Model Updates
1. Retrain locally
2. Replace .pkl files
3. Commit to git
4. Push to GitHub
5. Railway redeploys automatically

---

## Custom Domain

1. Go to Railway dashboard
2. Select your service
3. Settings → Domain
4. Add custom domain
5. Update DNS records

---

## Security Tips

1. Keep requirements.txt updated
2. Don't commit secrets (API keys, passwords)
3. Use Railway environment variables for secrets
4. Keep Flask in production mode
5. Use HTTPS (automatic with Railway)

---

## Health Check

Railway automatically checks if app is running.

Health endpoint (optional):
```python
@app.route('/health')
def health():
    return {'status': 'ok'}, 200
```

---

## Rollback

To rollback to previous deployment:
1. Go to Railway dashboard
2. Select your service
3. Deployments tab
4. Click previous version
5. Select "Redeploy"

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app
- Discord: https://discord.gg/railway

---

## After Deployment

✅ Your app is live at: `https://your-app-name.railway.app`

✅ Test the prediction endpoint:
```bash
curl -X POST https://your-app-name.railway.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{"age": 45, "gender": "female", ...}'
```

✅ Visit the website:
`https://your-app-name.railway.app`

---

**Status**: Ready for Railway deployment ✅
