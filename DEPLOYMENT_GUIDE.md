# Margdarshak AI — Deployment Guide

## Architecture
```
[MongoDB Atlas] ←→ [Render: Backend API] ←→ [Vercel: Frontend Web]
                                          ←→ [Expo Go: Mobile App]
```

---

## Step 1: MongoDB Atlas (Free Tier — 512MB)

1. Go to **https://www.mongodb.com/atlas**
2. Sign up with `maithiligeek@gmail.com`
3. Create a **FREE M0 cluster** (choose closest region — e.g., Mumbai/Singapore)
4. Under **Database Access** → Add user:
   - Username: `margdarshak`
   - Password: (generate a strong one, save it!)
5. Under **Network Access** → Add IP: `0.0.0.0/0` (allow all — required for Render)
6. Click **Connect** → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://margdarshak:<password>@cluster0.xxxxx.mongodb.net/test_database?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

---

## Step 2: Deploy Backend on Render (Free Tier)

1. Go to **https://render.com** → Sign up with `maithiligeek@gmail.com`
2. Click **New** → **Web Service**
3. Connect your GitHub repo: `Mr-Amresh/MargdarshakAiApp`
4. Configure:
   - **Name**: `margdarshak-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | `mongodb+srv://margdarshak:<password>@cluster0.xxxxx.mongodb.net/test_database?retryWrites=true&w=majority` |
   | `DB_NAME` | `test_database` |
   | `EMERGENT_LLM_KEY` | `sk-emergent-dE1B9F7C38251B7F84` |
   | `LLM_MODEL` | `gpt-4o` |
   | `MAX_HISTORY_TURNS` | `6` |
   | `MAX_TOKENS` | `2000` |
6. Click **Create Web Service**
7. Wait for deploy → Your backend URL will be: `https://margdarshak-backend.onrender.com`

---

## Step 3: Deploy Frontend on Vercel (Free Tier)

1. Go to **https://vercel.com** → Sign up with `maithiligeek@gmail.com`
2. Click **Add New** → **Project**
3. Import your GitHub repo: `Mr-Amresh/MargdarshakAiApp`
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Other`
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `EXPO_PUBLIC_BACKEND_URL` | `https://margdarshak-backend.onrender.com` |
6. Click **Deploy**
7. Your frontend URL will be: `https://margdarshak-frontend.vercel.app` (or custom domain)

---

## Step 4: Update Google OAuth Redirect (if needed)

The app redirects to `window.location.origin + '/'` after Google OAuth.
If your Vercel domain changes, the redirect auto-adapts. No action needed.

---

## Step 5: Push Updated Code to GitHub

Before deploying, push your latest code (with email auth + fixes) to GitHub:

```bash
git add -A
git commit -m "Add email/password auth, fix OAuth, add deployment configs"
git push origin main
```

---

## Environment Variables Summary

### Backend (Render)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ | MongoDB Atlas connection string |
| `DB_NAME` | ✅ | `test_database` |
| `EMERGENT_LLM_KEY` | ✅ | `sk-emergent-dE1B9F7C38251B7F84` |
| `LLM_MODEL` | ✅ | `gpt-4o` |
| `MAX_HISTORY_TURNS` | ❌ | Default: `6` |
| `MAX_TOKENS` | ❌ | Default: `2000` |

### Frontend (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_BACKEND_URL` | ✅ | Your Render backend URL |

---

## Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **MongoDB Atlas** | 512MB storage, shared cluster |
| **Render** | 750 hrs/month, spins down after 15 min inactivity (cold start ~30s) |
| **Vercel** | 100GB bandwidth, unlimited deploys |

---

## Testing After Deployment

```bash
# Test backend health
curl https://margdarshak-backend.onrender.com/health

# Test registration
curl -X POST https://margdarshak-backend.onrender.com/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","password":"test1234"}'

# Test AI
curl -X POST https://margdarshak-backend.onrender.com/api/ask \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer SESSION_TOKEN_FROM_ABOVE' \
  -d '{"question":"What is karma?"}'
```
