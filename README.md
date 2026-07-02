# Eventra

Eventra is a campus event management platform with a FastAPI backend and a React/Vite frontend.

## Getting Started

To run the project locally, you need to start both the backend and the frontend.

### Prerequisites

- Python 3.11+
- Node.js / Bun
- MongoDB (running locally or a cloud URI)

### Easy Start (Root Directory)

You can start both the backend and frontend simultaneously from the root directory using:

```powershell
npm install
npm run dev
```

### Manual Start Commands

#### 1. Backend
Navigate to the `backend` directory and start the FastAPI server:

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

#### 2. Frontend
Navigate to the `campus-connect-hub` directory and start the Vite dev server:

```powershell
cd campus-connect-hub
bun run dev
# OR if using npm
npm run dev
```

## Project Structure

- `/backend`: FastAPI application with MongoDB integration.
- `/campus-connect-hub`: React frontend built with Vite, Tailwind CSS, and shadcn/ui.
- `render.yaml`: Deployment configuration for Render.
