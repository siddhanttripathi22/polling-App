#!/bin/bash
set -e

# Build frontend (Vite)
cd frontend
npm ci
npm run build

# Return to root (backend)
cd ..

# Install backend dependencies (fixed line)
npm ci --omit=dev

# Start backend
npm start
