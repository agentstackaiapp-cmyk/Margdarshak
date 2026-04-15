# Margdarshak AI - Product Requirements Document

## Overview
Margdarshak is a spiritual guidance AI app rooted in Sanatana Dharma. It provides personalized guidance from Hindu scriptures (Bhagavad Gita, Vedas, Upanishads, Puranas) using AI (GPT-4o via Emergent LLM).

## Architecture
- **Backend**: FastAPI + MongoDB + Motor (async)
- **Frontend**: Expo/React Native + expo-router + Zustand
- **AI**: Emergent LLM Integration (GPT-4o)
- **RAG**: VR-RAG (Vectorless Reasoning-Based RAG) with BM25 scoring on scripture PDFs
- **Auth**: Google OAuth via Emergent Auth (redirect to root with hash param) + Dev Login fallback

## Auth Flow (Production)
1. User clicks "Continue with Google" → redirect to `https://auth.emergentagent.com/?redirect=ORIGIN/`
2. After Google login → redirected back to `/#session_id=...`
3. `index.tsx` App component detects `session_id` in hash → exchanges for session token via `POST /api/auth/session`
4. Session token stored in AsyncStorage → user logged in
5. No separate `/auth-callback` route needed (eliminates expo-router mount race condition)

## Routes
- `/` — Main app (login → onboarding → chat, all in one screen)
- All legacy routes removed (home, ask, history, profile) — consolidated into single-page architecture

## API Endpoints
- `POST /api/auth/dev-login` - Dev login
- `POST /api/auth/session` - Google OAuth session exchange
- `GET /api/auth/me` - Current user info
- `POST /api/auth/logout` - Logout
- `POST /api/ask` - Ask AI question
- `POST /api/ask/stream` - Streaming AI response
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `GET /api/daily-tip` - Daily dharma tip
- `GET /api/databases` - Scripture database catalogue
- `GET /api/youtube/video` - YouTube video search
- `GET /api/preferences/schema` - Onboarding schema
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Save user preferences
