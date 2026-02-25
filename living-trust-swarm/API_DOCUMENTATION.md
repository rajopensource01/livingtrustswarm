# Living Trust Swarm - API Documentation

Complete API reference for the Living Trust Swarm backend system.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. In production, implement JWT-based authentication.

## Response Format

All responses are in JSON format.

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "detail": "Error message"
}
```

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000000"
}
```

---

## Agencies

### Get All Agencies

Retrieve a list of all travel agencies.

**Endpoint:** `GET /agencies`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Travel Agency 1",
    "email": "agency1@example.com",
    "current_risk_score": 45,
    "risk_state": "Stressed",
    "credit_limit": 100000.0,
    "current_credit_used": 65000.0,
    "created_at": "2024-01-15T10:00:00.000000"
  }
]
```

### Get Agency Details

Retrieve detailed information about a specific agency.

**Endpoint:** `GET /agency/{agency_id}`

**Parameters:**
- `agency_id` (path parameter): Agency ID

**Response:**
```json
{
  "id": 1,
  "name": "Travel Agency 1",
  "email": "agency1@example.com",
  "current_risk_score": 45,
  "risk_state": "Stressed",
  "credit_limit": 100000.0,
  "current_credit_used": 65000.0,
  "created_at": "2024-01-15T10:00:00.000000",
  "latest_signal": {
    "id": 123,
    "agency_id": 1,
    "timestamp": "2024-01-15T10:30:00.000000",
    "booking_volume_per_day": 85,
    "payment_delay_days": 5,
    "credit_utilization": 0.65,
    "chargeback_ratio": 0.012,
    "login_time_variance": 1.5,
    "device_change_frequency": 2,
    "ip_geo_variance": 0.08,
    "booking_spike_ratio": 1.1,
    "peer_failure_rate": 0.05,
    "response_to_credit_terms": 3
  },
  "latest_consensus": {
    "id": 456,
    "agency_id": 1,
    "consensus_risk_score": 45,
    "disagreement_index": 0.25,
    "risk_state": "Stressed",
    "explanation_summary": "Swarm consensus indicates stressed risk...",
    "timestamp": "2024-01-15T10:30:00.000000"
  }
}
```

### Get Risk History

Retrieve historical risk scores for an agency.

**Endpoint:** `GET /agency/{agency_id}/history`

**Parameters:**
- `agency_id` (path parameter): Agency ID
- `limit` (query parameter, optional): Number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 456,
    "agency_id": 1,
    "consensus_risk_score": 45,
    "disagreement_index": 0.25,
    "risk_state": "Stressed",
    "explanation_summary": "Swarm consensus indicates stressed risk...",
    "timestamp": "2024-01-15T10:30:00.000000"
  }
]
```

---

## Agent Analysis

### Get Agent Votes

Get the latest votes and consensus from all agents for an agency.

**Endpoint:** `GET /agents/votes/{agency_id}`

**Parameters:**
- `agency_id` (path parameter): Agency ID

**Response:**
```json
{
  "consensus_risk_score": 45,
  "disagreement_index": 0.25,
  "risk_state": "Stressed",
  "explanation_summary": "Swarm consensus indicates stressed risk with deteriorating trajectory. Primary concerns from CreditAgent, MemoryAgent. Positive indicators from IdentityAgent, PeerAgent.",
  "agent_votes": [
    {
      "agent_name": "DriftAgent",
      "vote": 5,
      "confidence": 0.85,
      "reasoning": "Behavioral patterns remain stable with minimal deviation from historical baselines."
    },
    {
      "agent_name": "CreditAgent",
      "vote": 7,
      "confidence": 0.92,
      "reasoning": "Credit analysis indicates high credit utilization; moderate payment delays. Utilization: 65.0%, Delay: 5 days, Chargebacks: 1.20%."
    },
    {
      "agent_name": "IdentityAgent",
      "vote": 3,
      "confidence": 0.78,
      "reasoning": "Identity signals are stable with consistent device usage, IP location, and login patterns."
    },
    {
      "agent_name": "MemoryAgent",
      "vote": 6,
      "confidence": 0.88,
      "reasoning": "Detected moderate match with historical 'gradual_decline' failure pattern (score: 0.65). Additionally, historical trends show deteriorating behavior (trend risk: 0.45)."
    },
    {
      "agent_name": "PeerAgent",
      "vote": 4,
      "confidence": 0.82,
      "reasoning": "Peer analysis for medium group (3 agencies): significant payment_delay_days deviation from peers; moderate credit_utilization deviation."
    },
    {
      "agent_name": "PredictionAgent",
      "vote": 6,
      "confidence": 0.75,
      "reasoning": "Forecast indicates moderate risk with deteriorating trajectory. 30_days: moderate risk projected; 60_days: high risk projected."
    },
    {
      "agent_name": "IncentiveAgent",
      "vote": 5,
      "confidence": 0.80,
      "reasoning": "Incentive analysis: moderate response to credit terms; moderate credit utilization pressure. Credit term response score: 3/5, Utilization: 65.0%, Payment delay: 5 days."
    }
  ]
}
```

---

## Simulation

### Run Simulation

Run counterfactual simulation to predict outcomes under different actions.

**Endpoint:** `POST /simulate`

**Request Body:**
```json
{
  "agency_id": 1,
  "signal_modifications": {
    "payment_delay_days": 10,
    "credit_utilization": 0.8,
    "chargeback_ratio": 0.02,
    "booking_spike_ratio": 1.5
  }
}
```

**Parameters:**
- `agency_id` (required): Agency ID to simulate
- `signal_modifications` (optional): Modified signal values for what-if scenarios

**Response:**
```json
{
  "agency_id": 1,
  "do_nothing": {
    "action_type": "do_nothing",
    "collapse_probability": 0.45,
    "churn_probability": 0.15,
    "recovery_probability": 0.55,
    "expected_loss": 45000.0
  },
  "soft_contract": {
    "action_type": "soft_contract",
    "collapse_probability": 0.27,
    "churn_probability": 0.195,
    "recovery_probability": 0.73,
    "expected_loss": 31500.0
  },
  "credit_freeze": {
    "action_type": "credit_freeze",
    "collapse_probability": 0.09,
    "churn_probability": 0.375,
    "recovery_probability": 0.91,
    "expected_loss": 13500.0
  },
  "recommended_action": "soft_contract",
  "minimum_regret": 40250.0
}
```

---

## Actions

### Apply Action

Apply a risk mitigation action to an agency.

**Endpoint:** `POST /apply-action`

**Request Body:**
```json
{
  "agency_id": 1,
  "action_type": "soft_contract",
  "reason": "High credit utilization and payment delays detected"
}
```

**Parameters:**
- `agency_id` (required): Agency ID
- `action_type` (required): One of `do_nothing`, `soft_contract`, `credit_freeze`
- `reason` (required): Explanation for the action

**Response:**
```json
{
  "id": 789,
  "agency_id": 1,
  "action_type": "soft_contract",
  "action_reason": "High credit utilization and payment delays detected",
  "timestamp": "2024-01-15T10:35:00.000000",
  "status": "applied"
}
```

---

## Learning

### Get Learning Statistics

Get statistics about the learning system and agent performance.

**Endpoint:** `GET /learning/statistics`

**Response:**
```json
{
  "total_feedback": 150,
  "accuracy": 0.873,
  "agent_weights": {
    "DriftAgent": 1.05,
    "CreditAgent": 1.12,
    "IdentityAgent": 0.95,
    "MemoryAgent": 1.08,
    "PeerAgent": 0.98,
    "PredictionAgent": 1.02,
    "IncentiveAgent": 0.99
  },
  "agent_info": [
    {
      "name": "DriftAgent",
      "weight": 1.05,
      "total_votes": 150,
      "accuracy": 0.85
    },
    {
      "name": "CreditAgent",
      "weight": 1.12,
      "total_votes": 150,
      "accuracy": 0.89
    },
    {
      "name": "IdentityAgent",
      "weight": 0.95,
      "total_votes": 150,
      "accuracy": 0.82
    },
    {
      "name": "MemoryAgent",
      "weight": 1.08,
      "total_votes": 150,
      "accuracy": 0.87
    },
    {
      "name": "PeerAgent",
      "weight": 0.98,
      "total_votes": 150,
      "accuracy": 0.84
    },
    {
      "name": "PredictionAgent",
      "weight": 1.02,
      "total_votes": 150,
      "accuracy": 0.86
    },
    {
      "name": "IncentiveAgent",
      "weight": 0.99,
      "total_votes": 150,
      "accuracy": 0.83
    }
  ]
}
```

---

## WebSocket

### Live Updates

Receive real-time risk updates for all agencies.

**Endpoint:** `WS /ws/live-updates`

**Message Format:**
```json
{
  "agency_id": 1,
  "risk_score": 45,
  "risk_state": "Stressed",
  "timestamp": "2024-01-15T10:30:00.000000"
}
```

**Update Frequency:** Every 5 seconds

**Example (JavaScript):**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/live-updates');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Agency ${update.agency_id}: ${update.risk_state} (${update.risk_score}/100)`);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 404 | Resource not found |
| 422 | Validation error |
| 500 | Internal server error |

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, implement rate limiting to prevent abuse.

---

## Data Models

### SignalData

```typescript
{
  booking_volume_per_day: number;
  payment_delay_days: number;
  credit_utilization: number;
  chargeback_ratio: number;
  login_time_variance: number;
  device_change_frequency: number;
  ip_geo_variance: number;
  booking_spike_ratio: number;
  peer_failure_rate: number;
  response_to_credit_terms: number;
}
```

### AgentVote

```typescript
{
  agent_name: string;
  vote: number;  // 1-10
  confidence: number;  // 0.0-1.0
  reasoning: string;
}
```

### SwarmConsensus

```typescript
{
  consensus_risk_score: number;  // 0-100
  disagreement_index: number;  // 0.0-1.0
  risk_state: string;  // "Stable" | "Stressed" | "Turbulent" | "Collapsing"
  explanation_summary: string;
  agent_votes: AgentVote[];
}
```

### SimulationAction

```typescript
{
  action_type: string;
  collapse_probability: number;
  churn_probability: number;
  recovery_probability: number;
  expected_loss: number;
}
```

---

## Interactive API Documentation

The backend provides interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to:
- Browse all endpoints
- View request/response schemas
- Test endpoints directly from the browser
- Download OpenAPI specification

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Get all agencies
curl http://localhost:8000/agencies

# Get agent votes
curl http://localhost:8000/agents/votes/1

# Run simulation
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{"agency_id": 1}'

# Apply action
curl -X POST http://localhost:8000/apply-action \
  -H "Content-Type: application/json" \
  -d '{"agency_id": 1, "action_type": "soft_contract", "reason": "Test"}'

# Get learning statistics
curl http://localhost:8000/learning/statistics
```

### Using Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Get agencies
response = requests.get(f"{BASE_URL}/agencies")
agencies = response.json()

# Get agent votes
response = requests.get(f"{BASE_URL}/agents/votes/1")
consensus = response.json()

# Run simulation
response = requests.post(
    f"{BASE_URL}/simulate",
    json={"agency_id": 1}
)
simulation = response.json()
```

### Using JavaScript

```javascript
const BASE_URL = "http://localhost:8000";

// Get agencies
const response = await fetch(`${BASE_URL}/agencies`);
const agencies = await response.json();

// Get agent votes
const response = await fetch(`${BASE_URL}/agents/votes/1`);
const consensus = await response.json();

// Run simulation
const response = await fetch(`${BASE_URL}/simulate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agency_id: 1 })
});
const simulation = await response.json();
```

---

## Best Practices

1. **Error Handling**: Always check response status codes
2. **Rate Limiting**: Implement client-side rate limiting
3. **Caching**: Cache responses where appropriate
4. **WebSocket**: Reconnect on connection loss
5. **Pagination**: Use pagination for large datasets
6. **Validation**: Validate request data before sending

---

## Support

For issues or questions, refer to the main README.md or check the interactive documentation at `/docs`.