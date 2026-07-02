@echo off
echo Starting Eventra...

echo.
echo [1/2] Starting Backend (FastAPI)...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"

echo [2/2] Starting Frontend (Vite)...
start cmd /k "cd campus-connect-hub && bun run dev"

echo.
echo Eventra is starting!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
pause
