@echo off
echo Installing Python dependencies...
py -m pip install -r requirements.txt

echo.
echo Starting Python server...
py server.py

pause