from typing import Dict, List
import numpy as np
from agents import (
    DriftAgent, CreditAgent, IdentityAgent, MemoryAgent,
    PeerAgent, PredictionAgent, IncentiveAgent
)


class SwarmNegotiationEngine:
    """
    Orchestrates multiple AI agents to reach consensus on risk assessment.
    Performs weighted voting, disagreement detection, and minority alerting.
    """
    
    def __init__(self):
        # Initialize all agents
        self.agents = {
            'DriftAgent': DriftAgent(),
            'CreditAgent': CreditAgent(),
            'IdentityAgent': IdentityAgent(),
            'MemoryAgent': MemoryAgent(),
            'PeerAgent': PeerAgent(),
            'PredictionAgent': PredictionAgent(),
            'IncentiveAgent': IncentiveAgent()
        }
        
        # Agent weights (can be updated through learning)
        self.agent_weights = {
            'DriftAgent': 1.0,
            'CreditAgent': 1.0,
            'IdentityAgent': 1.0,
            'MemoryAgent': 1.0,
            'PeerAgent': 1.0,
            'PredictionAgent': 1.0,
            'IncentiveAgent': 1.0
        }
    
    def evaluate_agency(self, signals: Dict) -> Dict:
        """
        Evaluate an agency by collecting votes from all agents and reaching consensus.
        """
        # Collect votes from all agents
        agent_votes = self._collect_agent_votes(signals)
        
        # Perform weighted consensus
        consensus_result = self._perform_weighted_consensus(agent_votes)
        
        # Detect disagreement
        disagreement_index = self._calculate_disagreement_index(agent_votes)
        
        # Detect minority warnings
        minority_warnings = self._detect_minority_warnings(agent_votes, consensus_result)
        
        # Classify risk state
        risk_state = self._classify_risk_state(consensus_result['consensus_risk_score'])
        
        # Generate explanation summary
        explanation_summary = self._generate_explanation_summary(
            agent_votes, consensus_result, minority_warnings
        )
        
        return {
            'consensus_risk_score': consensus_result['consensus_risk_score'],
            'disagreement_index': disagreement_index,
            'risk_state': risk_state,
            'explanation_summary': explanation_summary,
            'agent_votes': agent_votes,
            'minority_warnings': minority_warnings
        }
    
    def _collect_agent_votes(self, signals: Dict) -> List[Dict]:
        """Collect votes from all agents."""
        votes = []
        
        for agent_name, agent in self.agents.items():
            try:
                vote_result = agent.analyze(signals)
                votes.append({
                    'agent_name': agent_name,
                    'vote': vote_result['vote'],
                    'confidence': vote_result['confidence'],
                    'reasoning': vote_result['reasoning'],
                    'weight': self.agent_weights[agent_name]
                })
            except Exception as e:
                # Handle agent errors gracefully
                votes.append({
                    'agent_name': agent_name,
                    'vote': 5,  # Neutral vote on error
                    'confidence': 0.0,
                    'reasoning': f"Agent error: {str(e)}",
                    'weight': self.agent_weights[agent_name]
                })
        
        return votes
    
    def _perform_weighted_consensus(self, agent_votes: List[Dict]) -> Dict:
        """Perform weighted voting to reach consensus."""
        total_weight = 0.0
        weighted_sum = 0.0
        
        for vote in agent_votes:
            weight = vote['weight']
            vote_value = vote['vote']
            confidence = vote['confidence']
            
            # Adjust weight by confidence
            adjusted_weight = weight * confidence
            total_weight += adjusted_weight
            weighted_sum += vote_value * adjusted_weight
        
        if total_weight == 0:
            consensus_score = 5  # Neutral if no valid votes
        else:
            consensus_score = weighted_sum / total_weight
        
        # Convert to 0-100 scale
        consensus_risk_score = int((consensus_score / 10) * 100)
        
        return {
            'consensus_risk_score': consensus_risk_score,
            'raw_consensus_score': consensus_score
        }
    
    def _calculate_disagreement_index(self, agent_votes: List[Dict]) -> float:
        """
        Calculate disagreement index among agents.
        0.0 = unanimous, 1.0 = maximum disagreement.
        """
        if not agent_votes:
            return 0.0
        
        votes = [vote['vote'] for vote in agent_votes]
        
        # Calculate standard deviation
        std_dev = np.std(votes)
        
        # Normalize to 0-1 range (max std dev for 1-10 scale is ~4.5)
        disagreement_index = min(1.0, std_dev / 4.5)
        
        return round(disagreement_index, 2)
    
    def _detect_minority_warnings(self, agent_votes: List[Dict], 
                                  consensus_result: Dict) -> List[Dict]:
        """
        Detect minority agents that disagree significantly with consensus.
        """
        consensus_score = consensus_result['raw_consensus_score']
        minority_warnings = []
        
        for vote in agent_votes:
            vote_value = vote['vote']
            agent_name = vote['agent_name']
            
            # Check if vote deviates significantly from consensus
            deviation = abs(vote_value - consensus_score)
            
            if deviation >= 3:  # Significant disagreement
                minority_warnings.append({
                    'agent_name': agent_name,
                    'vote': vote_value,
                    'consensus': consensus_score,
                    'deviation': deviation,
                    'reasoning': vote['reasoning'],
                    'warning_type': 'high_risk_minority' if vote_value > consensus_score else 'low_risk_minority'
                })
        
        return minority_warnings
    
    def _classify_risk_state(self, risk_score: int) -> str:
        """
        Classify risk score into state categories.
        """
        if risk_score <= 25:
            return 'Stable'
        elif risk_score <= 50:
            return 'Stressed'
        elif risk_score <= 75:
            return 'Turbulent'
        else:
            return 'Collapsing'
    
    def _generate_explanation_summary(self, agent_votes: List[Dict],
                                      consensus_result: Dict,
                                      minority_warnings: List[Dict]) -> str:
        """
        Generate a natural language summary of the swarm's decision.
        """
        risk_score = consensus_result['consensus_risk_score']
        risk_state = self._classify_risk_state(risk_score)
        
        # Find agents with highest and lowest votes
        sorted_votes = sorted(agent_votes, key=lambda x: x['vote'], reverse=True)
        highest_voter = sorted_votes[0]
        lowest_voter = sorted_votes[-1]
        
        # Build summary
        summary_parts = []
        
        # Overall assessment
        summary_parts.append(
            f"Swarm consensus indicates {risk_state.lower()} risk (score: {risk_score}/100)."
        )
        
        # Key concerns from high-voting agents
        high_vote_agents = [v for v in agent_votes if v['vote'] >= 7]
        if high_vote_agents:
            concerns = [v['agent_name'] for v in high_vote_agents[:2]]
            summary_parts.append(
                f"Primary concerns from {', '.join(concerns)}."
            )
        
        # Positive indicators from low-voting agents
        low_vote_agents = [v for v in agent_votes if v['vote'] <= 4]
        if low_vote_agents:
            positives = [v['agent_name'] for v in low_vote_agents[:2]]
            summary_parts.append(
                f"Positive indicators from {', '.join(positives)}."
            )
        
        # Minority warnings
        if minority_warnings:
            warning_count = len(minority_warnings)
            summary_parts.append(
                f"Note: {warning_count} agent(s) disagree significantly with consensus."
            )
        
        return " ".join(summary_parts)
    
    def update_agent_weights(self, agent_name: str, new_weight: float):
        """Update the weight of a specific agent."""
        if agent_name in self.agent_weights:
            self.agent_weights[agent_name] = max(0.1, min(2.0, new_weight))
    
    def get_agent_weights(self) -> Dict[str, float]:
        """Get current agent weights."""
        return self.agent_weights.copy()
    
    def get_agent_info(self) -> List[Dict]:
        """Get information about all agents."""
        info = []
        for agent_name, agent in self.agents.items():
            info.append({
                'name': agent_name,
                'weight': self.agent_weights[agent_name],
                'total_votes': agent.total_votes,
                'accuracy': agent.get_accuracy()
            })
        return info