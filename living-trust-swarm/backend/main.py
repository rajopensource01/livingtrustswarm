from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
import asyncio
import json
from datetime import datetime

from models.database import get_db, init_db, Agency, Signal, AgentVote, RiskHistory, Action, SimulationResult
from models.schemas import (
    AgencyCreate, AgencyResponse, AgencyDetailResponse,
    SwarmConsensusResponse, AgentVoteResponse, SignalData, SimulationRequest, SimulationResponse,
    ActionRequest, ActionResponse, RiskHistoryResponse
)
from swarm.negotiation_engine import SwarmNegotiationEngine
from simulation.counterfactual_engine import CounterfactualSimulationEngine
from learning.feedback_loop import FeedbackLearningLoop
from data_stream.simulator import DataStreamSimulator

# Initialize FastAPI app
app = FastAPI(
    title="Living Trust Swarm API",
    description="Agentic AI decision-making system for B2B travel agency risk assessment",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
swarm_engine = SwarmNegotiationEngine()
simulation_engine = CounterfactualSimulationEngine()
learning_loop = FeedbackLearningLoop(swarm_engine)
data_simulator = DataStreamSimulator(num_agencies=10)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and create sample agencies."""
    init_db()
    db = next(get_db())
    
    # Create sample agencies if none exist
    if db.query(Agency).count() == 0:
        for i in range(1, 11):
            agency = Agency(
                name=f"Travel Agency {i}",
                email=f"agency{i}@example.com",
                credit_limit=100000.0
            )
            db.add(agency)
        db.commit()
    
    db.close()

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Agency endpoints
@app.get("/agencies", response_model=List[AgencyResponse])
async def get_agencies(db: Session = Depends(get_db)):
    """Get all agencies."""
    agencies = db.query(Agency).all()
    return agencies

@app.get("/agency/{agency_id}", response_model=AgencyDetailResponse)
async def get_agency(agency_id: int, db: Session = Depends(get_db)):
    """Get agency details with latest signals and consensus."""
    agency = db.query(Agency).filter(Agency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    # Get latest signal
    latest_signal_orm = db.query(Signal).filter(
        Signal.agency_id == agency_id
    ).order_by(Signal.timestamp.desc()).first()
    
    # Get latest consensus (RiskHistory)
    latest_consensus_orm = db.query(RiskHistory).filter(
        RiskHistory.agency_id == agency_id
    ).order_by(RiskHistory.timestamp.desc()).first()

    # Manually build SignalData from ORM object
    latest_signal = None
    if latest_signal_orm:
        latest_signal = SignalData(
            booking_volume_per_day=latest_signal_orm.booking_volume_per_day,
            payment_delay_days=latest_signal_orm.payment_delay_days,
            credit_utilization=float(latest_signal_orm.credit_utilization),
            chargeback_ratio=float(latest_signal_orm.chargeback_ratio),
            login_time_variance=float(latest_signal_orm.login_time_variance),
            device_change_frequency=latest_signal_orm.device_change_frequency,
            ip_geo_variance=float(latest_signal_orm.ip_geo_variance),
            booking_spike_ratio=float(latest_signal_orm.booking_spike_ratio),
            peer_failure_rate=float(latest_signal_orm.peer_failure_rate),
            response_to_credit_terms=latest_signal_orm.response_to_credit_terms,
        )

    # Manually build SwarmConsensusResponse from RiskHistory + AgentVotes
    latest_consensus = None
    if latest_consensus_orm:
        # Fetch agent votes associated with this consensus timestamp
        agent_votes_orm = db.query(AgentVote).filter(
            AgentVote.agency_id == agency_id
        ).order_by(AgentVote.timestamp.desc()).limit(7).all()

        agent_votes = [
            AgentVoteResponse(
                agent_name=v.agent_name,
                vote=v.vote,
                confidence=float(v.confidence),
                reasoning=v.reasoning,
            )
            for v in agent_votes_orm
        ]

        latest_consensus = SwarmConsensusResponse(
            consensus_risk_score=latest_consensus_orm.consensus_risk_score,
            disagreement_index=float(latest_consensus_orm.disagreement_index),
            risk_state=latest_consensus_orm.risk_state,
            explanation_summary=latest_consensus_orm.explanation_summary,
            agent_votes=agent_votes,
        )

    return AgencyDetailResponse(
        id=agency.id,
        name=agency.name,
        email=agency.email,
        current_risk_score=agency.current_risk_score,
        risk_state=agency.risk_state,
        credit_limit=float(agency.credit_limit),
        current_credit_used=float(agency.current_credit_used),
        created_at=agency.created_at,
        latest_signal=latest_signal,
        latest_consensus=latest_consensus,
    )

# Agent weight endpoints
@app.get("/agents/weights")
async def get_agent_weights():
    """Get current agent weights."""
    return swarm_engine.get_agent_weights()

@app.post("/agents/weights")
async def set_agent_weights(weights: Dict[str, float]):
    """Update agent weights."""
    for agent_name, weight in weights.items():
        swarm_engine.update_agent_weights(agent_name, float(weight))
    return swarm_engine.get_agent_weights()

# Agent vote endpoints
@app.get("/agents/votes/{agency_id}", response_model=SwarmConsensusResponse)
async def get_agent_votes(agency_id: int, db: Session = Depends(get_db)):
    """Get latest agent votes and consensus for an agency."""
    agency = db.query(Agency).filter(Agency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    # Get latest signal
    latest_signal = db.query(Signal).filter(
        Signal.agency_id == agency_id
    ).order_by(Signal.timestamp.desc()).first()
    
    if not latest_signal:
        raise HTTPException(status_code=404, detail="No signals found for agency")
    
    # Convert signal to dict
    signal_dict = {
        'agency_id': latest_signal.agency_id,
        'booking_volume_per_day': latest_signal.booking_volume_per_day,
        'payment_delay_days': latest_signal.payment_delay_days,
        'credit_utilization': float(latest_signal.credit_utilization),
        'chargeback_ratio': float(latest_signal.chargeback_ratio),
        'login_time_variance': latest_signal.login_time_variance,
        'device_change_frequency': latest_signal.device_change_frequency,
        'ip_geo_variance': float(latest_signal.ip_geo_variance),
        'booking_spike_ratio': float(latest_signal.booking_spike_ratio),
        'peer_failure_rate': float(latest_signal.peer_failure_rate),
        'response_to_credit_terms': latest_signal.response_to_credit_terms
    }
    
    # Run swarm evaluation
    swarm_result = swarm_engine.evaluate_agency(signal_dict)
    
    # Save agent votes to database
    for vote in swarm_result['agent_votes']:
        agent_vote = AgentVote(
            agency_id=agency_id,
            agent_name=vote['agent_name'],
            vote=vote['vote'],
            confidence=vote['confidence'],
            reasoning=vote['reasoning']
        )
        db.add(agent_vote)
    
    # Save risk history
    risk_history = RiskHistory(
        agency_id=agency_id,
        consensus_risk_score=swarm_result['consensus_risk_score'],
        disagreement_index=swarm_result['disagreement_index'],
        risk_state=swarm_result['risk_state'],
        explanation_summary=swarm_result['explanation_summary']
    )
    db.add(risk_history)
    
    # Update agency
    agency.current_risk_score = swarm_result['consensus_risk_score']
    agency.risk_state = swarm_result['risk_state']
    
    db.commit()
    
    return SwarmConsensusResponse(
        consensus_risk_score=swarm_result['consensus_risk_score'],
        disagreement_index=swarm_result['disagreement_index'],
        risk_state=swarm_result['risk_state'],
        explanation_summary=swarm_result['explanation_summary'],
        agent_votes=swarm_result['agent_votes']
    )

# Simulation endpoints
@app.post("/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest, db: Session = Depends(get_db)):
    """Run counterfactual simulation for an agency."""
    agency = db.query(Agency).filter(Agency.id == request.agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    # Get latest signal
    latest_signal = db.query(Signal).filter(
        Signal.agency_id == request.agency_id
    ).order_by(Signal.timestamp.desc()).first()
    
    if not latest_signal:
        raise HTTPException(status_code=404, detail="No signals found for agency")
    
    # Convert signal to dict
    signal_dict = {
        'agency_id': latest_signal.agency_id,
        'booking_volume_per_day': latest_signal.booking_volume_per_day,
        'payment_delay_days': latest_signal.payment_delay_days,
        'credit_utilization': float(latest_signal.credit_utilization),
        'chargeback_ratio': float(latest_signal.chargeback_ratio),
        'login_time_variance': latest_signal.login_time_variance,
        'device_change_frequency': latest_signal.device_change_frequency,
        'ip_geo_variance': float(latest_signal.ip_geo_variance),
        'booking_spike_ratio': float(latest_signal.booking_spike_ratio),
        'peer_failure_rate': float(latest_signal.peer_failure_rate),
        'response_to_credit_terms': latest_signal.response_to_credit_terms
    }
    
    # Apply modifications if provided
    if request.signal_modifications:
        for key, value in request.signal_modifications.dict().items():
            if value is not None:
                # Normalize frontend slider values to DB scale
                if key == 'credit_utilization':
                    # Frontend sends 0-100, DB stores 0.0-1.0
                    signal_dict[key] = value / 100.0 if value > 1.0 else value
                elif key == 'chargeback_ratio':
                    # Frontend sends 0-10 (percent), DB stores 0.0-0.5
                    signal_dict[key] = value / 100.0 if value > 1.0 else value
                else:
                    signal_dict[key] = value
        
    # Run simulation
    sim_result = simulation_engine.simulate_actions(
        signal_dict, agency.current_risk_score
    )
    
    # Save simulation results
    for action, result in sim_result.items():
        if action in ['do_nothing', 'soft_contract', 'credit_freeze']:
            sim_record = SimulationResult(
                agency_id=request.agency_id,
                action_type=action,
                expected_loss=result['expected_loss'],
                churn_probability=result['churn_probability'],
                recovery_probability=result['recovery_probability'],
                regret_score=sim_result['regret_scores'].get(action, 0.0)
            )
            db.add(sim_record)
    
    db.commit()
    
    # Inject regret_score into each action dict before passing to Pydantic
    for action in ['do_nothing', 'soft_contract', 'credit_freeze']:
        sim_result[action]['regret_score'] = sim_result['regret_scores'].get(action, 0.0)

    return SimulationResponse(
        agency_id=request.agency_id,
        do_nothing=sim_result['do_nothing'],
        soft_contract=sim_result['soft_contract'],
        credit_freeze=sim_result['credit_freeze'],
        recommended_action=sim_result['recommended_action'],
        minimum_regret=sim_result['minimum_regret']
    )

# Action endpoints
@app.post("/apply-action", response_model=ActionResponse)
async def apply_action(request: ActionRequest, db: Session = Depends(get_db)):
    """Apply an action to an agency."""
    agency = db.query(Agency).filter(Agency.id == request.agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    # Create action record
    action = Action(
        agency_id=request.agency_id,
        action_type=request.action_type,
        action_reason=request.reason,
        status='applied'
    )
    db.add(action)
    
    # Simulate outcome for learning
    outcome = learning_loop.simulate_outcome(
        request.agency_id, request.action_type, agency.current_risk_score
    )
    
    # Get latest agent votes for feedback
    latest_votes = db.query(AgentVote).filter(
        AgentVote.agency_id == request.agency_id
    ).order_by(AgentVote.timestamp.desc()).limit(7).all()
    
    agent_votes_dict = [
        {
            'agent_name': vote.agent_name,
            'vote': vote.vote,
            'confidence': float(vote.confidence)
        }
        for vote in latest_votes
    ]
    
    # Process feedback
    learning_loop.process_feedback(
        request.agency_id, outcome, agency.current_risk_score, agent_votes_dict
    )
    
    db.commit()
    
    return ActionResponse(
        id=action.id,
        agency_id=action.agency_id,
        action_type=action.action_type,
        action_reason=action.action_reason,
        timestamp=action.timestamp,
        status=action.status
    )

# Risk history endpoint
@app.get("/agency/{agency_id}/history", response_model=List[RiskHistoryResponse])
async def get_risk_history(agency_id: int, limit: int = 100, db: Session = Depends(get_db)):
    """Get risk history for an agency."""
    agency = db.query(Agency).filter(Agency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    history = db.query(RiskHistory).filter(
        RiskHistory.agency_id == agency_id
    ).order_by(RiskHistory.timestamp.desc()).limit(limit).all()
    
    return history

# Learning statistics endpoint
@app.get("/learning/statistics")
async def get_learning_statistics():
    """Get learning statistics."""
    return learning_loop.get_learning_statistics()

# WebSocket endpoint for live updates
@app.websocket("/ws/live-updates")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for live risk updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Generate new signals for all agencies
            for agency_id in range(1, 11):
                signal = data_simulator.generate_signal(agency_id)
                
                # Save signal to database
                db = next(get_db())
                db_signal = Signal(**signal)
                db.add(db_signal)
                db.commit()
                
                # Run swarm evaluation
                swarm_result = swarm_engine.evaluate_agency(signal)
                
                # Update agency
                agency = db.query(Agency).filter(Agency.id == agency_id).first()
                if agency:
                    agency.current_risk_score = swarm_result['consensus_risk_score']
                    agency.risk_state = swarm_result['risk_state']
                    db.commit()
                
                # Broadcast update
                await manager.broadcast({
                    'agency_id': agency_id,
                    'risk_score': swarm_result['consensus_risk_score'],
                    'risk_state': swarm_result['risk_state'],
                    'timestamp': datetime.utcnow().isoformat()
                })
                
                db.close()
            
            # Wait 5 seconds before next update
            await asyncio.sleep(5)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)