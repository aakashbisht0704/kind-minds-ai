@echo off
setlocal

rem Ensure we run from the directory containing this script
cd /d "%~dp0"

echo Starting KindMinds Backend Server...

if not exist ".env" (
    echo .env file not found! Please create one with GROQ_API_KEY
    exit /b 1
)

echo Checking for existing processes on port 8000...
set "foundProcess=0"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8000"') do (
    if not "%%P"=="" (
        set "foundProcess=1"
        echo Killing process with PID %%P
        taskkill /F /PID %%P >nul 2>&1
    )
)
if "%foundProcess%"=="0" (
    echo No existing process found on port 8000.
)

echo Starting FastAPI server on http://localhost:8000
python main.py

endlocal
exit /b

