#!/bin/bash

# Living Trust Swarm - Quick Start Script
# This script makes it easy to run the entire system

set -e

echo "🚀 Living Trust Swarm - Quick Start"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Navigate to docker directory
cd "$(dirname "$0")/docker"

echo "📦 Building and starting containers..."
echo ""

# Start all services
docker-compose up --build

echo ""
echo "✨ System is running!"
echo ""
echo "📱 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "🛑 To stop the system, press Ctrl+C"
echo "   Or run: docker-compose down"