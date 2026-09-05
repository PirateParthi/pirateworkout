# 🏴‍☠️ PirateWorkout - Personalized Workout Tracking Platform

A modern, full-stack **Coach-to-Client Workout Tracking Web Application** built with **Java Spring Boot 3**, **PostgreSQL**, and **React 18 (Vite + Tailwind CSS)**.

Designed specifically so that an **Admin (Coach/You)** can assign tailored workout plans to **Friends/Clients**, monitor their workout completions in real-time, view actual logged weights/reps, and friends can track their workouts set-by-set with an interactive **Rest Timer Countdown**.

---

## 🚀 Key Features

### 🛡️ Admin / Coach Portal
- **Client Management**: View all friends, their goals, body weights, and active workout plans.
- **Custom Plan Builder**: Create and assign tailored multi-day routines (e.g., Push/Pull/Legs, Upper/Lower) with specific target sets, target reps, target weights, and rest seconds.
- **Live Activity Feed**: Monitor completed workouts in real-time, inspect every set lifted, duration, RPE difficulty, and friend notes.
- **Coach Review & Feedback**: Post coaching tips and encouragement directly onto completed workout logs.

### 🏋️ Client / Friend Portal
- **Today's Assigned Routine**: View only the personalized workout scheduled for today.
- **Interactive Set-by-Set Logging**: Tick off sets as completed `[✓]`, modify actual reps & weights lifted.
- **Live Rest Timer Countdown**:
  - Automatically triggers when a set is completed.
  - Preset intervals (30s, 60s, 90s, 120s) and custom countdowns.
  - Built-in sound chimes (via Web Audio API - no external sound files required!).
  - **Minimization Mode**: Can collapse into a floating pill widget while reviewing other exercises.
  - `+15s` quick rest extension button.
- **Session Duration & RPE Tracker**: Tracks total workout elapsed time and lets the friend submit an effort score (1-10) with notes.
- **Workout History**: Complete archive of past sessions, weights progression, and coach feedback.

---

## 🛠️ Technology Stack

- **Backend**:
  - Java 17+ / Spring Boot 3.2.x
  - Spring Security + Stateless JWT Authentication
  - Spring Data JPA + Hibernate
  - PostgreSQL Database (with auto schema generation)
  - Lombok & Bean Validation
- **Frontend**:
  - React 18 + Vite
  - Tailwind CSS + Lucide React Icons
  - Axios with JWT Interceptor
  - Canvas Confetti for workout completion celebrations
  - Web Audio API for rest countdown buzzer chimes

---

## ⚡ Quick Start Guide

### 1. Database Setup (PostgreSQL)

Create a PostgreSQL database named `pirateworkout_db`:
```sql
CREATE DATABASE pirateworkout_db;
```

*(Default credentials configured in `application.yml` are `username: postgres` and `password: postgres`. If yours differ, update `backend/src/main/resources/application.yml` or export environment variables `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`)*

---

### 2. Run Backend (Spring Boot)

Open a terminal in the `backend` directory:
```bash
cd backend
mvn clean spring-boot:run
```
The backend will start at `http://localhost:8080`.

> **Note**: On first run, `DataInitializer` will automatically seed the database with:
> - **Admin Account**: `admin@pirate.fit` / `admin123`
> - **Friend Account**: `karthik@pirate.fit` / `user123`
> - **Exercise Library**: Barbell Bench Press, Squats, Incline DB, Lat Pulldowns, Bicep Curls, etc.
> - **Assigned Sample Plan**: 4-Week Hypertrophy Split for Karthik!

---

### 3. Run Frontend (React + Vite)

Open a second terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The React frontend will start at `http://localhost:3000`.

---

## 🔑 Default Demo Accounts

| Role | Email | Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **Admin (Coach)** | `admin@pirate.fit` | `admin123` | View clients, assign plans, inspect live set logs & leave feedback |
| **Friend 1** | `karthik@pirate.fit` | `user123` | Track today's Push/Pull workout, log sets/weights, use rest timer |
| **Friend 2** | `vignesh@pirate.fit` | `user123` | Log in and receive custom plans |

---

## 📡 Core API Endpoints

### Auth
- `POST /api/auth/register` - Create new admin or client account
- `POST /api/auth/login` - Authenticate and receive JWT token

### Admin (`ROLE_ADMIN`)
- `GET /api/admin/clients` - List all registered friends
- `POST /api/admin/plans` - Create and assign customized routine to a user
- `GET /api/admin/logs` - View all completed workout logs
- `POST /api/admin/logs/{logId}/feedback` - Add coach feedback to a workout log
- `GET /api/admin/dashboard-stats` - Dashboard analytics

### User / Client (`ROLE_CLIENT`)
- `GET /api/user/active-plan` - Get assigned plan
- `GET /api/user/today-workout` - Get today's scheduled routine
- `GET /api/user/today-status` - Check if today's workout is completed
- `POST /api/user/log-workout` - Submit completed workout with sets, duration & RPE
- `GET /api/user/history` - View past workout history
