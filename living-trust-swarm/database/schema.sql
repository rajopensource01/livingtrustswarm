-- Living Trust Swarm Database Schema

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_risk_score INTEGER DEFAULT 0,
    risk_state VARCHAR(50) DEFAULT 'Stable',
    credit_limit DECIMAL(15, 2) DEFAULT 100000.00,
    current_credit_used DECIMAL(15, 2) DEFAULT 0.00
);

-- Signals table (real-time behavioral data)
CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_volume_per_day INTEGER DEFAULT 0,
    payment_delay_days INTEGER DEFAULT 0,
    credit_utilization DECIMAL(5, 2) DEFAULT 0.00,
    chargeback_ratio DECIMAL(5, 2) DEFAULT 0.00,
    login_time_variance DECIMAL(10, 2) DEFAULT 0.00,
    device_change_frequency INTEGER DEFAULT 0,
    ip_geo_variance DECIMAL(5, 2) DEFAULT 0.00,
    booking_spike_ratio DECIMAL(5, 2) DEFAULT 0.00,
    peer_failure_rate DECIMAL(5, 2) DEFAULT 0.00,
    response_to_credit_terms INTEGER DEFAULT 0
);

-- Agent votes table
CREATE TABLE IF NOT EXISTS agent_votes (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    vote INTEGER NOT NULL CHECK (vote >= 1 AND vote <= 10),
    confidence DECIMAL(5, 2) NOT NULL,
    reasoning TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk history table
CREATE TABLE IF NOT EXISTS risk_history (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
    consensus_risk_score INTEGER NOT NULL,
    disagreement_index DECIMAL(5, 2) NOT NULL,
    risk_state VARCHAR(50) NOT NULL,
    explanation_summary TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actions table
CREATE TABLE IF NOT EXISTS actions (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Simulation results table
CREATE TABLE IF NOT EXISTS simulation_results (
    id SERIAL PRIMARY KEY,
    agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    expected_loss DECIMAL(15, 2) NOT NULL,
    churn_probability DECIMAL(5, 2) NOT NULL,
    recovery_probability DECIMAL(5, 2) NOT NULL,
    regret_score DECIMAL(15, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent weights table (for learning)
CREATE TABLE IF NOT EXISTS agent_weights (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100) UNIQUE NOT NULL,
    weight DECIMAL(5, 2) DEFAULT 1.00,
    total_votes INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signals_agency_id ON signals(agency_id);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_votes_agency_id ON agent_votes(agency_id);
CREATE INDEX IF NOT EXISTS idx_risk_history_agency_id ON risk_history(agency_id);
CREATE INDEX IF NOT EXISTS idx_actions_agency_id ON actions(agency_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_agency_id ON simulation_results(agency_id);

-- Insert default agent weights
INSERT INTO agent_weights (agent_name, weight) VALUES
('DriftAgent', 1.00),
('CreditAgent', 1.00),
('IdentityAgent', 1.00),
('MemoryAgent', 1.00),
('PeerAgent', 1.00),
('PredictionAgent', 1.00),
('IncentiveAgent', 1.00)
ON CONFLICT (agent_name) DO NOTHING;