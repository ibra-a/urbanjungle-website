@echo off
echo Starting Nike Landing Page with ERPNext Integration...
echo.

echo Starting Flask Backend (ERPNext API)...
cd backend
start "Flask Backend" cmd /k "python app.py"
cd ..

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting React Frontend...
start "React Frontend" cmd /k "npm run dev"

echo.
echo Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul 