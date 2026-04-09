# Stock Management Application

A full-stack application for managing stocks, tracking watchlists, and setting price alerts.

## Project Structure

- `frontend/`: Next.js web application.
- `backend/`: Spring Boot Java application.

## Deployment

### Backend (Render)

1. **Create a New Web Service** on Render.
2. **Connect your GitHub repository**.
3. **Set the Root Directory** to `backend`.
4. **Environment**: Select `Docker`.
5. **Add Environment Variables**:
   - `SPRING_DATASOURCE_URL`: Your Supabase PostgreSQL URL.
   - `SPRING_DATASOURCE_USERNAME`: Your Supabase database username.
   - `SPRING_DATASOURCE_PASSWORD`: Your Supabase database password.
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_JWT_SECRET`: Your Supabase JWT secret.
   - `SUPABASE_ANON_KEY`: Your Supabase anon key.
6. Render will automatically build the service using the `Dockerfile` provided in the `backend` directory.

### Frontend (Vercel)

1. **Create a New Project** on Vercel.
2. **Connect your GitHub repository**.
3. **Set the Root Directory** to `frontend`.
4. **Framework Preset**: Next.js.
5. **Add Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Your Supabase anon key.
   - `NEXT_PUBLIC_BACKEND_API_URL`: The URL of your deployed Render backend (e.g., `https://stock-backend.onrender.com`).
6. Deploy!

## Local Development

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm run dev
```
