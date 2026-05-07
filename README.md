# Reality Drift - AI Life Pattern Simulator

Welcome to Reality Drift. This application tracks your daily habits, analyzes your behavioral patterns, and uses AI to predict and simulate your future progression over the next 30 days.

## 🏗️ Architecture
- **Frontend**: Next.js App Router, Tailwind CSS, Recharts (Glassmorphism & Dark Theme)
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenAI / Gemini integration for narrative simulations
- **Infra**: Dockerized for Google Cloud Run deployment

## 🚀 Getting Started

### 1. Database Setup
Ensure you have a PostgreSQL instance running.
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

## ☁️ Deployment (Cloud Run)
1. Navigate to the `infra/` folder.
2. Build your Docker image using the `Dockerfile`.
3. Apply the `cloudrun.yaml` configuration to deploy the backend.
4. Deploy the frontend to Vercel or Cloud Run as well.

## 🧠 AI Module
Prompts for the simulation engine and daily coaching are located in the `ai/prompts/` directory. These are used by the backend service to generate realistic and narrative outputs based on user data.
