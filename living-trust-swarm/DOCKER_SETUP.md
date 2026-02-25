# Docker Setup Guide

This guide provides detailed instructions for running the Living Trust Swarm system using Docker and Docker Compose.

## Prerequisites

Before starting, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

Verify installations:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Clone and Navigate

```bash
cd living-trust-swarm/docker
```

### 2. Start All Services

```bash
docker-compose up --build
```

This command will:
- Build Docker images for backend and frontend
- Start PostgreSQL database
- Initialize database schema
- Start FastAPI backend server
- Start Next.js frontend development server
- Create sample agencies

### 3. Access the Application

Once all services are running:

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Docs**: http://localhost:8000/redoc

## Service Details

### PostgreSQL Database
- **Container Name**: `living_trust_swarm_db`
- **Port**: 5432
- **Database**: `living_trust_swarm`
- **User**: `postgres`
- **Password**: `postgres`
- **Data Persistence**: Volume `postgres_data`

### FastAPI Backend
- **Container Name**: `living_trust_swarm_backend`
- **Port**: 8000
- **Auto-reload**: Enabled (for development)
- **Health Check**: Depends on PostgreSQL

### Next.js Frontend
- **Container Name**: `living_trust_swarm_frontend`
- **Port**: 3000
- **Hot Reload**: Enabled (for development)
- **Depends On**: Backend

## Docker Compose Commands

### Start Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Build and start
docker-compose up --build
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands in Containers

```bash
# Access backend container
docker-compose exec backend bash

# Access frontend container
docker-compose exec frontend sh

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d living_trust_swarm
```

## Environment Configuration

### Backend Environment Variables

The backend uses these environment variables (defined in `docker-compose.yml`):

```yaml
environment:
  DATABASE_URL: postgresql://postgres:postgres@postgres:5432/living_trust_swarm
  SECRET_KEY: your-secret-key-change-in-production
```

For production, create a `.env` file in the backend directory:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your-production-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables

The frontend needs to know the backend URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production deployment, update this to your backend URL.

## Database Management

### Initialize Database

The database schema is automatically initialized on first run via `schema.sql`.

To manually initialize:

```bash
# Copy schema to container
docker cp ../database/schema.sql living_trust_swarm_db:/tmp/schema.sql

# Execute schema
docker-compose exec postgres psql -U postgres -d living_trust_swarm -f /tmp/schema.sql
```

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d living_trust_swarm

# Once connected, you can run SQL commands
\dt                    # List tables
SELECT * FROM agencies;  # View agencies
\q                     # Quit
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres living_trust_swarm > backup.sql

# Restore from backup
cat backup.sql | docker-compose exec -T postgres psql -U postgres living_trust_swarm
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes (deletes all data)
docker-compose down -v

# Start services (fresh database)
docker-compose up --build
```

## Development Workflow

### 1. Make Code Changes

Edit files in `backend/` or `frontend/` directories.

### 2. Auto-Reload

Both backend and frontend have hot-reload enabled:
- Backend: Changes trigger automatic restart (uvicorn --reload)
- Frontend: Changes trigger automatic rebuild (Next.js dev server)

### 3. View Changes

Refresh your browser at http://localhost:3000

### 4. Debugging

View logs to see errors:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Production Deployment

### 1. Update Environment Variables

Edit `docker-compose.yml` to use production values:

```yaml
environment:
  DATABASE_URL: postgresql://prod_user:prod_pass@prod-db:5432/living_trust_swarm
  SECRET_KEY: ${SECRET_KEY}  # Use environment variable
```

### 2. Build Production Images

```bash
# Build without development dependencies
docker-compose -f docker-compose.prod.yml build
```

### 3. Run Production Containers

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Security Considerations

- Change default PostgreSQL password
- Use strong SECRET_KEY
- Enable HTTPS/TLS
- Configure firewall rules
- Use environment variables for secrets
- Remove auto-reload in production

## Troubleshooting

### Port Already in Use

If you see "port is already allocated" errors:

```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify database exists
docker-compose exec postgres psql -U postgres -l
```

### Container Won't Start

```bash
# Check container status
docker-compose ps

# View logs for errors
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Out of Disk Space

```bash
# Clean up unused Docker resources
docker system prune -a

# Remove specific volumes
docker volume rm living-trust-swarm_postgres_data
```

### Frontend Can't Connect to Backend

1. Verify backend is running: `docker-compose ps backend`
2. Check backend logs: `docker-compose logs backend`
3. Verify API URL: Check `NEXT_PUBLIC_API_URL` in frontend
4. Test backend directly: `curl http://localhost:8000/health`

### WebSocket Connection Issues

1. Ensure backend is running
2. Check WebSocket endpoint: `ws://localhost:8000/ws/live-updates`
3. Verify no firewall blocking WebSocket connections
4. Check browser console for errors

## Performance Optimization

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Database Optimization

- Add indexes to frequently queried columns
- Use connection pooling
- Optimize queries
- Regular database maintenance

### Caching

Consider adding Redis for:
- Session storage
- API response caching
- Real-time data caching

## Monitoring

### View Resource Usage

```bash
# View container resource usage
docker stats

# View specific container
docker stats living_trust_swarm_backend
```

### Health Checks

```bash
# Check backend health
curl http://localhost:8000/health

# Check database connection
docker-compose exec postgres pg_isready -U postgres
```

## Updating the Application

### 1. Pull Latest Code

```bash
git pull origin main
```

### 2. Rebuild and Restart

```bash
docker-compose down
docker-compose up --build
```

### 3. Database Migrations

If schema changes:

```bash
# Backup first
docker-compose exec postgres pg_dump -U postgres living_trust_swarm > backup.sql

# Apply migrations
docker-compose exec backend python migrate.py
```

## Cleanup

### Remove All Containers and Volumes

```bash
docker-compose down -v
docker system prune -a
```

### Remove Specific Volume

```bash
docker volume rm living-trust-swarm_postgres_data
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

For issues specific to this project, refer to the main README.md or check the logs:
```bash
docker-compose logs
```