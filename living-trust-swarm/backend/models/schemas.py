from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class SignalData(BaseModel):
    booking_volume_per_day: int = 0
    payment_delay_days: int = 0
    credit_utilization: float = 0.0
    chargeback_ratio: float = 0.0
    login_time_variance: float = 0.0
    device_change_frequency: int = 0
    ip_geo_variance: float = 0.0
    booking_spike_ratio: float = 0.0
    peer_failure_rate: float = 0.0
    response_to_credit_terms: int = 0

    class Config:
        from_attributes = True


class AgentVoteResponse(BaseModel):
    agent_name: str
    vote: int
    confidence: float
    reasoning: str


class SwarmConsensusResponse(BaseModel):
    consensus_risk_score: int
    disagreement_index: float
    risk_state: str
    explanation_summary: str
    agent_votes: List[AgentVoteResponse]

    class Config:
        from_attributes = True


class SimulationActionResult(BaseModel):
    action_type: str
    collapse_probability: float
    expected_loss: float
    churn_probability: float
    recovery_probability: float
    regret_score: float


class SimulationResponse(BaseModel):
    agency_id: int
    do_nothing: SimulationActionResult
    soft_contract: SimulationActionResult
    credit_freeze: SimulationActionResult
    recommended_action: str
    minimum_regret: float


class AgencyCreate(BaseModel):
    name: str
    email: str
    credit_limit: float = 100000.0


class AgencyResponse(BaseModel):
    id: int
    name: str
    email: str
    current_risk_score: int
    risk_state: str
    credit_limit: float
    current_credit_used: float
    created_at: datetime

    class Config:
        from_attributes = True


class AgencyDetailResponse(AgencyResponse):
    latest_signal: Optional[SignalData] = None
    latest_consensus: Optional[SwarmConsensusResponse] = None


class ActionRequest(BaseModel):
    agency_id: int
    action_type: str  # "do_nothing", "soft_contract", "credit_freeze"
    reason: str


class ActionResponse(BaseModel):
    id: int
    agency_id: int
    action_type: str
    action_reason: str
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True


class SimulationRequest(BaseModel):
    agency_id: int
    signal_modifications: Optional[SignalData] = None


class RiskHistoryResponse(BaseModel):
    id: int
    agency_id: int
    consensus_risk_score: int
    disagreement_index: float
    risk_state: str
    explanation_summary: str
    timestamp: datetime

    class Config:
        from_attributes = True