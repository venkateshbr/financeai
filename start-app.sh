#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping FinanceAI..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting FinanceAI Backend Server..."
node server/index.js &
BACKEND_PID=$!

echo "Starting FinanceAI Frontend..."
npm run dev &
FRONTEND_PID=$!

echo "FinanceAI is running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press CTRL+C to stop."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
