# Margdarshak AI - Product Requirements Document

## Overview
Margdarshak is a spiritual guidance AI app rooted in Sanatana Dharma. It provides personalized guidance from Hindu scriptures (Bhagavad Gita, Vedas, Upanishads, Puranas) using AI (GPT-4o via Emergent LLM).

## Architecture
- **Backend**: FastAPI + MongoDB + Motor (async)
- **Frontend**: Expo/React Native + expo-router + Zustand
- **AI**: Emergent LLM Integration (GPT-4o)
- **RAG**: VR-RAG (Vectorless Reasoning-Based RAG) with BM25 scoring on scripture PDFs
- **Auth**: Google OAuth via Emergent Auth + Dev Login fallback

## Core Features
1. **Authentication**: Google OAuth (Emergent-managed) + dev-login for testing
2. **Onboarding**: 4-step personalization (Deity, Scriptures, Goals, Language)
3. **AI Chat**: Scripture-based spiritual guidance with shloka rendering
4. **VR-RAG**: BM25-based scripture retrieval from PDF databases
5. **YouTube Integration**: Contextual video recommendations via yt-dlp
6. **Guardrails**: Input/output filtering for safe content
7. **Conversation History**: Full conversation management with persistence

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

## Environment Variables
### Backend (.env)
- MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, LLM_MODEL, MAX_HISTORY_TURNS, MAX_TOKENS

### Frontend (.env)
- EXPO_TUNNEL_SUBDOMAIN, EXPO_PACKAGER_HOSTNAME, EXPO_PUBLIC_BACKEND_URL
