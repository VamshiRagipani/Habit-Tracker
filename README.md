# Embers — Habit Tracker

Embers is a polished, daily habit tracking app designed to help users build consistency through small actions. The experience combines a calm, modern UI with practical progress tracking, streaks, reflections, and weekly planning.

## Overview

This project is a full-stack web application with:

- A React + TypeScript frontend for the daily habit experience
- An Express + TypeScript backend for API logic and business rules
- Supabase for authentication, database storage, and real-time-friendly data access
- A clean, motivating interface that emphasizes progress over perfection

## Key Features

- Secure sign-in with Supabase Auth using Google or email/password
- Daily habit tracking with one-tap completion
- Progress visualization through a circular progress indicator
- Streak tracking based on consecutive successful days
- Reflection journaling for each day
- Weekly planning and focus prompts
- History view to review previous performance
- Responsive design optimized for both mobile and desktop experiences

## Streak Logic

The streak system rewards consistency without requiring users to complete every habit every day. A day counts as successful when the user completes at least 50% of today’s habits, rounded up.

Example:
- 6 habits → required: 3 completed
- 5 habits → required: 3 completed
- 4 habits → required: 2 completed

If the completed count is below that threshold, the streak resets to zero.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Framer Motion for animations
- Lucide React for icons
- Supabase JS client

### Backend
- Express
- TypeScript
- Zod for validation
- Helmet, CORS, and rate limiting
- Supabase JS server client

### Data & Auth
- Supabase PostgreSQL
- Supabase Auth
- SQL schema included in the repository

## Project Structure

```text
backend/
  src/
    controllers/
    middleware/
    routes/
    services/
    schemas/
    config/
    types/
frontend/
  src/
    components/
    lib/
    App.tsx
    main.tsx
supabase/
  schema.sql
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd habit-tracker-app
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

Create environment files for both apps.

#### Backend
Create a file named `.env` inside the backend folder with:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
CORS_ORIGIN=http://localhost:5173
```

#### Frontend
Create a file named `.env` inside the frontend folder with:

```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run locally

```bash
# Backend
cd backend
npm run dev
```

In a second terminal:

```bash
# Frontend
cd frontend
npm run dev
```

The frontend will run at `http://localhost:5173` and the backend at `http://localhost:4000`.

## Database Setup

Run the SQL from [supabase/schema.sql](supabase/schema.sql) in your Supabase SQL editor to create the required tables, row-level security policies, and user bootstrap logic.

## Deployment

### Backend
This project includes deployment configuration for Render.

- Use the provided [render.yaml](render.yaml) file
- Set the required environment variables in your Render service
- Deploy the backend from the repository root or the backend folder depending on your setup

### Frontend
The frontend is ready for deployment on Vercel or any static hosting platform.

- Connect the repository
- Set the frontend root directory to `frontend`
- Add the frontend environment variables in your hosting dashboard

## Scripts

### Backend
```bash
cd backend
npm run dev      # start development server
npm run build    # compile TypeScript
npm run start    # run production build
```

### Frontend
```bash
cd frontend
npm run dev      # start Vite dev server
npm run build    # create production build
npm run preview  # preview production build locally
```

## Notes

- The app is intentionally designed around sustainable habits rather than perfection.
- The streak feature is based on progress consistency, not strict all-or-nothing completion.
- The current UI and copy are tailored around a calm, focused daily routine experience.

## License

This project is intended for personal or educational use unless otherwise specified by the repository owner.
