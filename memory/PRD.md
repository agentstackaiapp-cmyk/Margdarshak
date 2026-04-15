# Margdarshak AI - Product Requirements Document

## Overview
Margdarshak is a spiritual guidance AI app rooted in Sanatana Dharma. Provides personalized guidance from Hindu scriptures using GPT-4o.

## Auth Methods
1. **Email/Password** — Register (`POST /api/auth/register`) + Login (`POST /api/auth/email-login`) with bcrypt hashing
2. **Google OAuth** — Via Emergent Auth, redirect to `/#session_id=...`, exchanged via `POST /api/auth/session`
3. **Dev Login** — For testing only (`POST /api/auth/dev-login`)

## Deployment
- **Backend**: Render (Python) — `Dockerfile` + `render.yaml` ready
- **Frontend**: Vercel (Expo web export) — `vercel.json` ready
- **Database**: MongoDB Atlas (free tier)
- **Full guide**: `/app/DEPLOYMENT_GUIDE.md`
