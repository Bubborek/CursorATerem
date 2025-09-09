#!/bin/bash
echo "Starting deployment process..."
echo "Running build process..."
npm run build
echo "Build completed, starting server..."
cd server
node index.js
