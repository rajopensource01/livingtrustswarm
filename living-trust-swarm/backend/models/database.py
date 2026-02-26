from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/living_trust_swarm")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    current_risk_score = Column(Integer, default=0)
    risk_state = Column(String(50), default="Stable")
    credit_limit = Column(DECIMAL(15, 2), default=100000.00)
    current_credit_used = Column(DECIMAL(15, 2), default=0.00)

    signals = relationship("Signal", back_populates="agency", cascade="all, delete-orphan")
    agent_votes = relationship("AgentVote", back_populates="agency", cascade="all, delete-orphan")
    risk_history = relationship("RiskHistory", back_populates="agency", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="agency", cascade="all, delete-orphan")
    simulation_results = relationship("SimulationResult", back_populates="agency", cascade="all, delete-orphan")


class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    booking_volume_per_day = Column(Integer, default=0)
    payment_delay_days = Column(Integer, default=0)
    credit_utilization = Column(DECIMAL(5, 2), default=0.00)
    chargeback_ratio = Column(DECIMAL(5, 2), default=0.00)
    login_time_variance = Column(Float, default=0.00)
    device_change_frequency = Column(Integer, default=0)
    ip_geo_variance = Column(DECIMAL(5, 2), default=0.00)
    booking_spike_ratio = Column(DECIMAL(5, 2), default=0.00)
    peer_failure_rate = Column(DECIMAL(5, 2), default=0.00)
    response_to_credit_terms = Column(Integer, default=0)

    agency = relationship("Agency", back_populates="signals")


class AgentVote(Base):
    __tablename__ = "agent_votes"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"))
    agent_name = Column(String(100), nullable=False)
    vote = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    agency = relationship("Agency", back_populates="agent_votes")


class RiskHistory(Base):
    __tablename__ = "risk_history"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"))
    consensus_risk_score = Column(Integer, nullable=False)
    disagreement_index = Column(Float, nullable=False)
    risk_state = Column(String(50), nullable=False)
    explanation_summary = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    agency = relationship("Agency", back_populates="risk_history")


class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"))
    action_type = Column(String(50), nullable=False)
    action_reason = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="pending")

    agency = relationship("Agency", back_populates="actions")


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"))
    action_type = Column(String(50), nullable=False)
    expected_loss = Column(DECIMAL(15, 2), nullable=False)
    churn_probability = Column(DECIMAL(5, 2), nullable=False)
    recovery_probability = Column(DECIMAL(5, 2), nullable=False)
    regret_score = Column(DECIMAL(15, 2), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    agency = relationship("Agency", back_populates="simulation_results")


class AgentWeight(Base):
    __tablename__ = "agent_weights"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100), unique=True, nullable=False)
    weight = Column(DECIMAL(5, 2), default=1.00)
    total_votes = Column(Integer, default=0)
    correct_predictions = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)