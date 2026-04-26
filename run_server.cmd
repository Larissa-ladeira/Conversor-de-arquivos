@echo off
cd /d "%~dp0"
title Servidor Conversor
echo Starting server...
cmd /c "node server.js"
pause