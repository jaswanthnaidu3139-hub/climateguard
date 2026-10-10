# ClimateGuard AI — Deployment Guide

## 1. Architecture Overview
- **Frontend**: React (Vite) Single-Page Application deployed to **Vercel** or **Netlify**.
- **Backend**: FastAPI Python application deployed to **Render**, **Railway**, or **Fly.io**.
- **Database**: PostgreSQL hosted on **Supabase**.

---

## 2. Database Setup (Supabase)
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** in the Supabase Dashboard.
3. Open `climateguard-ai/database/schema.sql` and execute the DDL queries to create the tables (`locations`, `climate_records`, `risk_assessments`) and indexes.
4. Open `climateguard-ai/database/seed.sql` and execute the insert statements to populate initial locations (Vijayawada, Hyderabad, Visakhapatnam, Bengaluru, Chennai, Mumbai, Delhi, Kolkata).
5. In **Project Settings -> API**, copy:
   - `Project URL`
   - `service_role` secret key (Keep private; never expose to frontend).

---

## 3. Backend Deployment (Render.com)
1. Create a new **Web Service** connected to your GitHub repository.
2. Set **Root Directory**: `climateguard-ai/backend`
3. Set **Runtime**: Python 3
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `APP_ENV`: `production`
   - `FRONTEND_ORIGIN`: `https://your-frontend-app.vercel.app`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_service_role_key_here`
   - `CACHE_TTL_SECONDS`: `900`
7. Click **Deploy**. Note your service URL (e.g. `https://climateguard-backend.onrender.com`).

---

## 4. Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory**: `climateguard-ai/frontend`
3. Framework Preset: **Vite**
4. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://climateguard-backend.onrender.com`
5. Click **Deploy**.

---

## 5. Local Demonstration (Zero Cloud Dependencies)
ClimateGuard AI is architected with a full in-memory fallback mode:
- If Supabase environment variables are omitted, the app smoothly serves built-in seed locations and records assessments in memory.
- If Open-Meteo experiences public API rate throttling or network loss, the backend automatically serves clearly labeled fallback demonstration records with `is_demo=True`.
- This ensures 100% demo reliability under hackathon stage conditions.
