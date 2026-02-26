# Living Trust Swarm

An agentic AI decision-making system that predicts the collapse risk of B2B travel agencies using swarm intelligence.

## 🎯 Core Concept

B2B travel platforms give credit to agencies. Risk does not occur instantly—it evolves over time. Traditional systems are rule-based and detect fraud after damage. Our system continuously evaluates trust, predicts collapse BEFORE fraud, and takes preventive action.

**"Trust is static once, but risk is dynamic."**

## 🏗️ Architecture

### AI Agent System (7 Specialized Agents)

1. **Drift Agent** - Detects behavioral pattern changes through statistical deviation
2. **Credit Agent** - Evaluates financial stress and repayment probability
3. **Identity Agent** - Assesses account stability through device/IP consistency
4. **Memory Agent** - Compares with historical failure patterns
5. **Peer Agent** - Benchmarks against similar agencies
6. **Prediction Agent** - Forecasts future trajectory using time-series analysis
7. **Incentive Agent** - Evaluates response to pricing/credit pressure

### Swarm Negotiation Engine

- Collects votes from all agents
- Performs weighted consensus
- Detects disagreement and minority warnings
- Outputs risk vector (0-100)

### Counterfactual Simulation Engine

Predicts outcomes under 3 actions:
- **Do Nothing** - Maintain current terms
- **Soft Contract** - Reduce credit limit
- **Credit Freeze** - Suspend credit

Implements **Minimum Regret Decision Policy** to choose optimal action.

### Feedback Learning Loop

- Simulates outcomes after actions
- Rewards or penalizes agents based on accuracy
- Dynamically adjusts agent weights using reinforcement learning

## 📊 Data Signals (UEBA)

The system monitors 10 real-time behavioral signals:

- `booking_volume_per_day` - Daily booking count
- `payment_delay_days` - Days beyond payment terms
- `credit_utilization` - Credit limit usage percentage
- `chargeback_ratio` - Chargeback rate
- `login_time_variance` - Login pattern deviation
- `device_change_frequency` - Device switching rate
- `ip_geo_variance` - Geographic IP variation
- `booking_spike_ratio` - Sudden booking volume changes
- `peer_failure_rate` - Similar agency failure rate
- `response_to_credit_terms` - Responsiveness to credit changes

## 🚀 Tech Stack

### Backend
- **Python 3.11** with FastAPI
- **PostgreSQL** for data persistence
- **SQLAlchemy** ORM
- **WebSocket** for real-time updates
- **NumPy/Pandas** for data processing
- **Scikit-learn** for statistical analysis

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Recharts** for visualizations
- **Lucide React** for icons
- **Modern UI** with glass morphism and animations

### Infrastructure
- **Docker & Docker Compose** for containerization
- **PostgreSQL 15** database

## 📦 Project Structure

```
living-trust-swarm/
├── backend/
│   ├── agents/              # AI agent implementations
│   │   ├── base_agent.py
│   │   ├── drift_agent.py
│   │   ├── credit_agent.py
│   │   ├── identity_agent.py
│   │   ├── memory_agent.py
│   │   ├── peer_agent.py
│   │   ├── prediction_agent.py
│   │   └── incentive_agent.py
│   ├── swarm/               # Swarm negotiation engine
│   │   └── negotiation_engine.py
│   ├── simulation/          # Counterfactual simulation
│   │   └── counterfactual_engine.py
│   ├── learning/            # Feedback learning loop
│   │   └── feedback_loop.py
│   ├── data_stream/         # Data simulation
│   │   └── simulator.py
│   ├── models/              # Database models & schemas
│   │   ├── database.py
│   │   └── schemas.py
│   ├── main.py              # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                 # Next.js pages
│   │   ├── page.tsx         # Dashboard
│   │   ├── agency/[id]/     # Agency detail
│   │   ├── swarm-lab/       # Swarm analysis
│   │   ├── simulation-lab/  # Simulation tools
│   │   └── feedback-logs/   # Learning statistics
│   ├── components/          # React components
│   │   ├── Navbar.tsx
│   │   ├── RiskBadge.tsx
│   │   └── AgentVoteBar.tsx
│   ├── lib/                 # Utilities & API
│   │   ├── utils.ts
│   │   └── api.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── database/
│   └── schema.sql           # Database schema
├── docker/
│   └── docker-compose.yml   # Container orchestration
└── README.md
```

## 🛠️ Installation & Setup

### ⚡ Quick Start (Recommended)

**One command to start everything:**

**Linux/Mac:**
```bash
./START.sh
```

**Windows:**
```bash
START.bat
```

That's it! The system will automatically build and start all services.

### 📋 Prerequisites

- Docker and Docker Compose
- Git

### Manual Setup with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd living-trust-swarm
```

2. **Start all services**
```bash
cd docker
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- Next.js frontend on port 3000

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup (Development)

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database configuration
```

5. **Initialize database**
```bash
# Ensure PostgreSQL is running
# Run schema.sql to create tables
psql -U postgres -d living_trust_swarm -f ../database/schema.sql
```

6. **Start the backend server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set environment variable**
```bash
export NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Start the development server**
```bash
npm run dev
```

## 📡 API Endpoints

### Agencies
- `GET /agencies` - List all agencies
- `GET /agency/{id}` - Get agency details
- `GET /agency/{id}/history` - Get risk history

### Agent Analysis
- `GET /agents/votes/{agency_id}` - Get agent votes and consensus

### Simulation
- `POST /simulate` - Run counterfactual simulation

### Actions
- `POST /apply-action` - Apply action to agency

### Learning
- `GET /learning/statistics` - Get learning statistics

### WebSocket
- `WS /ws/live-updates` - Live risk updates (every 5 seconds)

## 🎨 Frontend Pages

### Dashboard (`/`)
- Overview of all agencies
- Real-time risk status
- Live updates via WebSocket
- Risk distribution statistics

### Agency Detail (`/agency/{id}`)
- Individual agency analysis
- Agent vote visualization
- Risk timeline
- Simulation results
- Action recommendations

### Swarm Lab (`/swarm-lab`)
- Detailed agent analysis
- Agent reasoning explanations
- Agent weight adjustments
- Consensus breakdown

### Simulation Lab (`/simulation-lab`)
- What-if scenario testing
- Signal modification sliders
- Action outcome predictions
- Minimum regret analysis

### Feedback Logs (`/feedback-logs`)
- Learning statistics
- Agent performance metrics
- Weight optimization history
- System accuracy tracking

## 🔬 Risk States

| Score Range | State | Description |
|-------------|-------|-------------|
| 0-25 | Stable | Low risk, normal behavior |
| 26-50 | Stressed | Moderate risk, monitoring needed |
| 51-75 | Turbulent | High risk, consider action |
| 76-100 | Collapsing | Critical risk, immediate action required |

## 🧠 How It Works

1. **Data Ingestion**: Real-time behavioral signals are collected for each agency
2. **Agent Analysis**: Each of 7 specialized agents analyzes signals independently
3. **Swarm Consensus**: Weighted voting combines agent opinions into risk score
4. **Disagreement Detection**: Minority warnings highlight conflicting views
5. **Simulation**: Counterfactual engine predicts outcomes for 3 actions
6. **Decision**: Minimum regret policy selects optimal action
7. **Learning**: Feedback loop adjusts agent weights based on outcomes

## 🔄 Continuous Learning

The system improves over time through:

1. **Outcome Tracking**: Actual outcomes (stable/collapsed/recovered) are recorded
2. **Agent Evaluation**: Each agent's prediction accuracy is measured
3. **Weight Adjustment**: Accurate agents gain weight, inaccurate agents lose weight
4. **Consensus Optimization**: Swarm becomes more accurate as agents learn

## 📈 Key Features

- ✅ Real-time risk monitoring with live updates
- ✅ Multi-agent AI reasoning (7 specialized agents)
- ✅ Predictive analytics (30/60/90 day forecasts)
- ✅ Counterfactual simulation with what-if scenarios
- ✅ Minimum regret decision making
- ✅ Reinforcement learning for continuous improvement
- ✅ WebSocket live updates (5-second intervals)
- ✅ Modern, responsive UI with animations
- ✅ Interactive visualizations and charts
- ✅ Glass morphism design with smooth transitions
- ✅ One-command startup with Docker

## 🧪 Testing

### Test the API

```bash
# Get all agencies
curl http://localhost:8000/agencies

# Get agent votes for agency 1
curl http://localhost:8000/agents/votes/1

# Run simulation
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{"agency_id": 1}'

# Get learning statistics
curl http://localhost:8000/learning/statistics
```

### Test WebSocket

Connect to `ws://localhost:8000/ws/live-updates` to receive live risk updates every 5 seconds.

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps`
- Check database credentials in `.env`
- Verify database schema is created

### Frontend API Errors
- Confirm backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS settings in backend

### WebSocket Not Connecting
- Ensure backend is running
- Check firewall settings
- Verify WebSocket endpoint is accessible

## 📝 License

This project is part of the Living Trust Swarm system.

## 🤝 Contributing

This is a production-style MVP demonstrating agentic AI systems for financial risk assessment.

## 📧 Support

For questions or issues, please refer to:
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Docker troubleshooting
- Interactive API docs at http://localhost:8000/docs

## 🎨 UI Features

The enhanced frontend includes:
- **Modern Design**: Clean, professional interface with gradient accents
- **Smooth Animations**: Fade-in effects, hover transitions, and pulse indicators
- **Glass Morphism**: Subtle transparency effects for depth
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Color-Coded Risk States**: Visual indicators for quick risk assessment
- **Interactive Components**: Hover effects, tooltips, and smooth transitions
- **Real-Time Updates**: Live WebSocket updates with visual feedback
- **Accessible UI**: High contrast ratios and keyboard navigation support