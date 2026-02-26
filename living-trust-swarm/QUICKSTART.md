# 🚀 Quick Start Guide

Start the Living Trust Swarm system in under 5 minutes!

## One-Command Start

### Linux/Mac
```bash
./START.sh
```

### Windows
```bash
START.bat
```

That's it! The system will automatically:
- ✅ Build all Docker containers
- ✅ Start PostgreSQL database
- ✅ Initialize database schema
- ✅ Start FastAPI backend
- ✅ Start Next.js frontend
- ✅ Create sample agencies

## Access the Application

Once started, open your browser:

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs

## What You'll See

### Dashboard
- Real-time risk monitoring of 10 travel agencies
- Live updates every 5 seconds
- Risk distribution statistics
- Color-coded risk states (Stable, Stressed, Turbulent, Collapsing)

### Features
- **7 AI Agents** analyzing each agency independently
- **Swarm Consensus** combining agent opinions
- **Counterfactual Simulation** predicting outcomes
- **Real-time Updates** via WebSocket
- **Interactive Visualizations** with modern UI

## Stopping the System

Press `Ctrl+C` in the terminal, or run:

```bash
cd docker
docker-compose down
```

## Troubleshooting

### Port Already in Use?
If you see "port is already allocated" errors, stop other services using ports 3000, 8000, or 5432.

### Docker Not Running?
Make sure Docker Desktop is running on your computer.

### Can't Access Frontend?
Wait 30-60 seconds for all services to fully start. The frontend needs the backend to be ready first.

## Next Steps

1. **Explore the Dashboard** - Click on any agency to see detailed analysis
2. **Run Simulations** - Test what-if scenarios in the Simulation Lab
3. **View Agent Votes** - See how each AI agent evaluates risk
4. **Check Learning Stats** - Track system accuracy over time

## Manual Start (Alternative)

If you prefer manual control:

```bash
cd living-trust-swarm/docker
docker-compose up --build
```

## System Requirements

- Docker (Desktop or Engine)
- Docker Compose
- 4GB RAM minimum
- 10GB disk space

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- View [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
- See [DOCKER_SETUP.md](DOCKER_SETUP.md) for Docker troubleshooting

---

**Built with ❤️ by SuperNinja AI**