# Developer Guide

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or Neon DB URI)

### 1. Installation
1. Clone the repository.
2. Install Backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install Frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### 2. Environment Variables
**Backend (`server/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@host/db"
JWT_SECRET="supersecret"
JWT_EXPIRES_IN="1d"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

### 3. Database Migration
To sync your database schema:
```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Running Locally
Start both servers:
- **Backend:** `cd server && npm run dev`
- **Frontend:** `cd frontend && npm run dev`
Visit `http://localhost:3000`.

## Expanding the Application

### How to add a new API Route
1. Create a route file: `server/src/routes/example.routes.js`.
2. Define validation in `validations/example.validation.js` using Zod.
3. Write logic in `controllers/example.controller.js` and `services/example.service.js`.
4. Register the route in `server/src/routes/index.js`.

### How to add a new Frontend Page
1. Create a folder in `frontend/src/app/(dashboard)/example`.
2. Add a `page.tsx`.
3. Create API hooks using React Query in a new feature folder `frontend/src/features/example/`.

## Deployment Guide

### Database (Neon)
1. Create a project on Neon.tech.
2. Copy the connection string to `DATABASE_URL`.

### Backend (Render)
1. Create a new Web Service on Render.
2. Connect your repo, set Root Directory to `server`.
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `npm start`
5. Add Env Vars: `DATABASE_URL`, `JWT_SECRET`, `PORT`.

### Frontend (Vercel)
1. Import repo into Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Next.js.
4. Add Env Var: `NEXT_PUBLIC_API_URL` (pointing to your Render backend URL).
5. Deploy.
