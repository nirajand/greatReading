#!/bin/bash

echo "🔧 Fixing Backend..."
cd backend
pip install -r requirements.txt
# Ensure uploads dir exists
mkdir -p uploads
# Run background check
python3 test_setup.py

echo "🔧 Fixing Frontend..."
cd ../frontend
npm install
# Start both in background (or use concurrent shells)
echo "🚀 Starting Services..."
cd ..
# This runs both simultaneously
(cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) & (cd frontend && npm run dev)
