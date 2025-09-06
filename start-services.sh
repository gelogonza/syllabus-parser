#!/bin/bash

# Start both Next.js and Python PDF services

echo "Starting Syllabus Importer Services..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.11+ to run the PDF service."
    exit 1
fi

# Start PDF service in background
echo "Starting PDF parsing service..."
cd pdf-service

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -q -r requirements.txt

# Start PDF service in background
python main.py &
PDF_PID=$!
echo "PDF service started (PID: $PDF_PID) at http://localhost:8001"

cd ..

# Start Next.js development server
echo "Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!
echo "✅ Next.js started (PID: $NEXTJS_PID) at http://localhost:3000"

echo ""
echo "Both services are running!"
echo "   Next.js App: http://localhost:3000"
echo "   PDF Service: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $PDF_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    echo "Services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
