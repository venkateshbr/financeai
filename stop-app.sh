#!/bin/bash

echo "Stopping FinanceAI services..."

# Find and kill the backend server process
pkill -f "node server/index.js"
if [ $? -eq 0 ]; then
    echo "Backend server stopped."
else
    echo "Backend server was not running."
fi

# Find and kill the frontend vite process
pkill -f "vite"
if [ $? -eq 0 ]; then
    echo "Frontend server stopped."
else
    echo "Frontend server was not running."
fi

echo "All services stopped."
