# 🚀 Margdarshak AI — Complete Deployment Guide
> Deploy Backend (Render) + Frontend (Vercel) + Database (MongoDB Atlas) + Google Sign-In

---

## 📁 Files Already Created for Deployment

| File | Location | Purpose |
|------|----------|---------|
| `requirements.txt` | `/backend/requirements.txt` | Python packages (FastAPI, motor, bcrypt, PyMuPDF, yt-dlp, openai, etc.) |
| `Dockerfile` | `/backend/Dockerfile` | Docker container for Render deploy |
| `render.yaml` | `/backend/render.yaml` | Render service config with env vars |
| `vercel.json` | `/frontend/vercel.json` | Vercel SPA config with rewrites |

---

## STEP 1: MongoDB Atlas (Free 512MB) — 3 minutes

### 1.1 Create Account
1. Go to **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with **maithiligeek@gmail.com**
3. Choose **FREE M0 Shared** cluster

### 1.2 Create Cluster
1. Cloud Provider: **AWS**
2. Region: **Mumbai (ap-south-1)** or closest to your users
3. Cluster Name: `MargdarshakCluster`
4. Click **Create Deployment**

### 1.3 Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Auth Method: **Password**
4. Username: `margdarshak`
5. Password: Click **Autogenerate Secure Password** → **COPY AND SAVE THIS PASSWORD**
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 1.4 Allow Network Access
1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **ALLOW ACCESS FROM ANYWHERE** (adds `0.0.0.0/0`)
4. Click **Confirm** — Required for Render to connect

### 1.5 Get Connection String
1. Go to **Database** (left sidebar) → Click **Connect** on your cluster
2. Choose **Drivers**
3. Copy the connection string:
```
mongodb+srv://margdarshak:<PASSWORD>@margdarshakcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. **Replace `<PASSWORD>`** with the password you saved in step 1.3
5. **Add database name** after the `/`:
```
mongodb+srv://margdarshak:YOUR_PASSWORD@margdarshakcluster.xxxxx.mongodb.net/test_database?retryWrites=true&w=majority
```

✅ **Save this connection string — you'll need it for Render**

---

## STEP 2: Deploy Backend on Render (Free) — 3 minutes

### 2.1 Create Render Account
1. Go to **https://render.com**
2. Sign up with **maithiligeek@gmail.com** (or GitHub login)
3. Connect your GitHub account

### 2.2 Create Web Service
1. Click **New** → **Web Service**
2. Connect your GitHub repo: **`Mr-Amresh/MargdarshakAiApp`**
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `margdarshak-backend` |
| **Region** | Singapore or closest |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | **Free** |

### 2.3 Add Environment Variables
Click **Environment** tab → Add these variables:

| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://margdarshak:YOUR_PASSWORD@margdarshakcluster.xxxxx.mongodb.net/test_database?retryWrites=true&w=majority` |
| `DB_NAME` | `test_database` |
| `OPENAI_API_KEY` | Your OpenAI API key (`sk-proj-...`) |
| `LLM_MODEL` | `gpt-5-nano` |
| `MAX_HISTORY_TURNS` | `6` |
| `MAX_TOKENS` | `2000` |
| `PYTHON_VERSION` | `3.11.0` |

⚠️ **IMPORTANT**: For `MONGO_URL`, paste the FULL connection string from Step 1.5 with your real password

### 2.4 Deploy
1. Click **Create Web Service**
2. Wait 3-5 minutes for the first deploy
3. Your backend URL will be: **`https://margdarshak-backend.onrender.com`**

### 2.5 Verify Backend
Open in browser: `https://margdarshak-backend.onrender.com/health`
Expected response: `{"status":"healthy","database":"connected"}`

⚠️ **Note**: Render free tier sleeps after 15 min inactivity. First request after sleep takes ~30 seconds.

---

## STEP 3: Deploy Frontend on Vercel (Free) — 3 minutes

### 3.1 Create Vercel Account
1. Go to **https://vercel.com**
2. Sign up with **maithiligeek@gmail.com** (or GitHub login)

### 3.2 Import Project
1. Click **Add New** → **Project**
2. Import your GitHub repo: **`Mr-Amresh/MargdarshakAiApp`**
3. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Other` |
| **Build Command** | `npx expo export --platform web` |
| **Output Directory** | `dist` |

### 3.3 Add Environment Variable
Click **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `EXPO_PUBLIC_BACKEND_URL` | `https://margdarshak-backend.onrender.com` |

⚠️ Replace with YOUR actual Render backend URL from Step 2.4

### 3.4 Deploy
1. Click **Deploy**
2. Wait 2-3 minutes
3. Your frontend URL: **`https://margdarshak-aiapp.vercel.app`** (or whatever Vercel assigns)

### 3.5 Verify Frontend
Open your Vercel URL → You should see the Margdarshak login screen with:
- OM (ॐ) logo
- Email & Password fields
- "Sign In" button
- "Continue with Google" button
- Bhagavad Gita verse at the bottom

---

## STEP 4: Google Sign-In Setup — 2 minutes

Google Sign-In **already works** through Emergent Auth. Here's how it flows:

```
User clicks "Continue with Google"
  → Redirect to https://auth.emergentagent.com/?redirect=YOUR_VERCEL_URL/
  → Google OAuth login
  → Redirect back to YOUR_VERCEL_URL/#session_id=xxxx
  → Frontend exchanges session_id for session_token via POST /api/auth/session
  → User logged in!
```

### What you need to do:
**Nothing extra!** The OAuth redirect URL is dynamically constructed from `window.location.origin`, so it auto-adapts to whatever domain you deploy on (Vercel, custom domain, etc.).

### Testing Google Sign-In:
1. Open your Vercel URL
2. Click "Continue with Google"
3. Sign in with **agentstackaiapp@gmail.com** or **maithiligeek@gmail.com**
4. You should be redirected back and logged in

### If Google Sign-In doesn't work:
- Check that your Render backend is running (not sleeping)
- Check browser console for errors
- The `POST /api/auth/session` endpoint needs to be reachable from the frontend

---

## STEP 5: Verify Everything Works

### Test 1: Email Registration
```bash
curl -X POST https://margdarshak-backend.onrender.com/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"testuser@example.com","password":"test1234"}'
```
Expected: Returns `user_id`, `email`, `name`, `session_token`

### Test 2: Email Login
```bash
curl -X POST https://margdarshak-backend.onrender.com/api/auth/email-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"testuser@example.com","password":"test1234"}'
```
Expected: Returns same user with new `session_token`

### Test 3: AI Question
```bash
curl -X POST https://margdarshak-backend.onrender.com/api/ask \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer SESSION_TOKEN_FROM_ABOVE' \
  -d '{"question":"What is karma?"}'
```
Expected: AI response with scripture references

### Test 4: Frontend
1. Open Vercel URL
2. Register with email/password
3. Complete onboarding (choose deity, scriptures, goals, language)
4. Ask a question → Get AI response with shlokas

---

## 📋 All Environment Variables Summary

### Backend (Render) — 7 variables
```env
MONGO_URL=mongodb+srv://margdarshak:PASSWORD@cluster.mongodb.net/test_database?retryWrites=true&w=majority
DB_NAME=test_database
OPENAI_API_KEY=sk-proj-...your-key-here...
LLM_MODEL=gpt-5-nano
MAX_HISTORY_TURNS=6
MAX_TOKENS=2000
PYTHON_VERSION=3.11.0
```

### Frontend (Vercel) — 1 variable
```env
EXPO_PUBLIC_BACKEND_URL=https://margdarshak-backend.onrender.com
```

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Backend returns 503 | Render is sleeping — wait 30s and retry |
| "Failed to fetch" on frontend | Check EXPO_PUBLIC_BACKEND_URL is correct, no trailing slash |
| MongoDB connection fails | Check MONGO_URL has real password, Network Access allows 0.0.0.0/0 |
| Google Sign-In redirects to wrong URL | The redirect auto-adapts to window.location.origin — no config needed |
| CORS errors in browser | Backend already allows all origins (`*`) — check Render is running |
| Build fails on Vercel | Ensure Root Directory is `frontend`, Build Command is `npx expo export --platform web` |

---

## 💰 Free Tier Limits

| Service | Free Limit |
|---------|------------|
| **MongoDB Atlas M0** | 512MB storage, 100 connections |
| **Render Free** | 750 hrs/month, sleeps after 15 min idle, ~30s cold start |
| **Vercel Hobby** | 100GB bandwidth, 6000 min build time/month |

---

## 🔗 Quick Links
- MongoDB Atlas: https://cloud.mongodb.com
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Emergent Auth: https://auth.emergentagent.com (Google OAuth provider)
