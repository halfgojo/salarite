# Salarite Virtual HR + ATS Dashboard

## Overview
This repository contains the completed assignment for the **Salarite Virtual HR & ATS** platform. It consists of a single codebase housing a Python FastAPI backend and a React (Vite) frontend. The system allows an Employer to assign tasks, Virtual HRs to execute them, and features real-time live activity updates.

## Tech Stack
- **Backend**: Python 3, FastAPI, SQLite, SQLAlchemy, WebSockets
- **Frontend**: React 18, Vite, React Router DOM, Lucide Icons, Vanilla CSS (Glassmorphism + Modern UI)

## Getting Started

### 1. Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy websockets pydantic
   ```
4. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The SQLite database (`salarite.db`) and seed data will be created automatically upon initial launch.*

### 2. Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL in your browser (usually `http://localhost:5173`).

## Demo Instructions (Role Play)

The application simulates authentication by letting you choose a role at launch:

1. **Login as Employer**
   - Head to the Dashboard: You can create new Tasks here and view summary statistics.
   - You will see the **Live Activity Feed** on the right side.
2. **Login as Virtual HR** (Open a separate browser tab or window)
   - You will see tasks allocated to you.
   - Click "Start Task" and "Mark Complete" to transition the ATS workflow.
   - Navigate to **Schedule Interview** to create new candidate interview events. You can open the internal ATS Call Room from the list.
3. **Real-time Monitoring**
   - Watch the Employer's screen as the Virtual HR performs actions. The Live Activity Feed will dynamically update via WebSockets instantly without requiring page refreshes!

## Assignment Scope
- [x] Required screens (Employer Dashboard, Virtual HR Dashboard, Interview Scheduler, Call Room).
- [x] Auto-refresh / Real-time WebSocket activity feeds.
- [x] Inbuilt Call Room link structures (`/call-room/{id}`).
- [x] Clean architecture and codebase separation.
