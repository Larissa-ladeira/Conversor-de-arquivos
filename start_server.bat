@echo off
echo Starting conversion server...
cd /d "%~dp0"
start /b node server.js
echo Server started on http://localhost:3001
echo.
echo Pressione qualquer tecla para sair...
pause > nul