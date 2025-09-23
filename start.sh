#!/bin/bash
set -e

# Build frontend (Vite)
cd frontend
npm ci
npm run build

# Return to root (backend)
cd ..

# Install backend dependencies
npm ci

# Start backend
npm start
