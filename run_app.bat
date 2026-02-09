@echo off
echo ===================================================
echo   Starting CultFit DSA Fitness App
echo ===================================================

:: 1. Start Backend
echo.
echo [1/2] Starting Flask Backend...
start "Flask Backend" cmd /k "pip install -r backend/requirements.txt & python backend/app.py || py backend/app.py || python3 backend/app.py"

:: 2. Start Frontend
echo.
echo [2/2] Starting React Frontend...
cd frontend
call npm install
echo Starting Vite Server...
npm run dev

echo.
echo App should be running at:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://127.0.0.1:5000
echo.
pause
