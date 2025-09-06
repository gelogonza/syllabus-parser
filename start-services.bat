@echo off

echo 🚀 Starting Syllabus Importer Services...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11+ to run the PDF service.
    pause
    exit /b 1
)

REM Start PDF service
echo 📄 Starting PDF parsing service...
cd pdf-service

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 🔧 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

REM Start PDF service in background
start "PDF Service" python main.py
echo ✅ PDF service started at http://localhost:8001

cd ..

REM Start Next.js development server
echo 🌐 Starting Next.js development server...
start "Next.js" npm run dev
echo ✅ Next.js started at http://localhost:3000

echo.
echo 🎉 Both services are running!
echo    📱 Next.js App: http://localhost:3000
echo    🐍 PDF Service: http://localhost:8001
echo.
echo Close the command windows to stop the services
pause
