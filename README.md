# Reality Drift - AI Life Pattern Simulator

Welcome to Reality Drift. This application tracks your daily habits, analyzes your behavioral patterns, and uses AI to predict and simulate your future progression over the next 30 days.

## 🏗️ Architecture
- **Frontend**: Next.js App Router, Tailwind CSS, Recharts (Glassmorphism & Dark Theme)
- **Backend**: Node.js, Express, Prisma ORM (deployed as Vercel Serverless Functions)
- **Database**: SQLite (local) / PostgreSQL (production)
- **AI**: Gemini integration for narrative simulations

## 🚀 Getting Started

### 1. Database Setup
```bash
cd backend
npm install
# Configure your DATABASE_URL in backend/.env
npx prisma generate
npx prisma db push
```

### 2. Backend Server
```bash
cd backend
npm run start
```
The server will run on `http://localhost:8080`.

### 3. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
The application will run on `http://localhost:3000`.

## ☁️ Deployment (Vercel)

### Backend
1. Create a new Vercel project and set the **Root Directory** to `backend`.
2. Add these environment variables: `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`.
3. Deploy. Copy the deployment URL.

### Frontend
1. Create a new Vercel project and set the **Root Directory** to `frontend`.
2. Add this environment variable: `NEXT_PUBLIC_API_URL=https://<your-backend>.vercel.app/api`.
3. Deploy.

## 🧠 AI Module
Prompts for the simulation engine and daily coaching are located in the `ai/prompts/` directory. These are used by the backend service to generate realistic and narrative outputs based on user data.
