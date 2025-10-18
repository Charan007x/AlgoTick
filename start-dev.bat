@echo off

echo Starting Landing Page (http://localhost:3001)...
start "Landing - 3001" cmd /k "cd /d %~dp0landing && npm run dev"

echo Starting Backend API (http://localhost:5000)...
start "Backend - 5000" cmd /k "cd /d %~dp0backend && npm run dev"

echo Starting Frontend (http://localhost:3000)...
start "Frontend - 3000" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo All servers started in separate windows!
echo Close those windows to stop the servers.
echo.
