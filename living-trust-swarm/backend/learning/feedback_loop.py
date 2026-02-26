from typing import Dict, List
from swarm.negotiation_engine import SwarmNegotiationEngine


class FeedbackLearningLoop:
    """
    Implements reinforcement learning to adjust agent weights based on feedback.
    Rewards or penalizes agents based on prediction accuracy.
    """
    
    def __init__(self, swarm_engine: SwarmNegotiationEngine):
        self.swarm_engine = swarm_engine
        self.learning_rate = 0.1
        self.decay_factor = 0.95
        
        # Track feedback history
        self.feedback_history = []
    
    def process_feedback(self, agency_id: int, actual_outcome: str, 
                        predicted_risk_score: int, agent_votes: List[Dict]):
        """
        Process feedback and adjust agent weights.
        
        Args:
            agency_id: ID of the agency
            actual_outcome: 'stable', 'collapsed', or 'recovered'
            predicted_risk_score: Risk score predicted by swarm
            agent_votes: List of agent votes
        """
        # Determine if prediction was correct
        was_correct = self._evaluate_prediction(
            predicted_risk_score, actual_outcome
        )
        
        # Calculate reward/penalty for each agent
        agent_rewards = self._calculate_agent_rewards(
            agent_votes, actual_outcome, was_correct
        )
        
        # Update agent weights
        self._update_agent_weights(agent_rewards)
        
        # Record feedback
        feedback_record = {
            'agency_id': agency_id,
            'actual_outcome': actual_outcome,
            'predicted_risk_score': predicted_risk_score,
            'was_correct': was_correct,
            'agent_rewards': agent_rewards,
            'timestamp': None  # Will be set when saved
        }
        self.feedback_history.append(feedback_record)
        
        return feedback_record
    
    def _evaluate_prediction(self, predicted_score: int, actual_outcome: str) -> bool:
        """
        Evaluate if the swarm's prediction was correct.
        """
        if actual_outcome == 'collapsed':
            # High risk prediction should have been made
            return predicted_score >= 75
        elif actual_outcome == 'stable':
            # Low risk prediction should have been made
            return predicted_score <= 50
        elif actual_outcome == 'recovered':
            # Medium risk prediction should have been made
            return 50 < predicted_score < 75
        else:
            return False
    
    def _calculate_agent_rewards(self, agent_votes: List[Dict], 
                                 actual_outcome: str, 
                                 swarm_correct: bool) -> Dict[str, float]:
        """
        Calculate reward/penalty for each agent based on their vote.
        """
        agent_rewards = {}
        
        for vote in agent_votes:
            agent_name = vote['agent_name']
            agent_vote = vote['vote']
            confidence = vote['confidence']
            
            # Determine if agent's vote was aligned with actual outcome
            agent_correct = self._evaluate_agent_vote(agent_vote, actual_outcome)
            
            # Calculate reward
            if agent_correct:
                # Reward correct predictions
                reward = 1.0 * confidence
            else:
                # Penalize incorrect predictions
                reward = -0.5 * confidence
            
            # Adjust reward based on swarm correctness
            if swarm_correct and agent_correct:
                reward *= 1.2  # Bonus for contributing to correct swarm decision
            elif not swarm_correct and agent_correct:
                reward *= 1.5  # Larger bonus for being correct when swarm was wrong
            elif swarm_correct and not agent_correct:
                reward *= 0.8  # Smaller penalty if swarm was still correct
            
            agent_rewards[agent_name] = reward
        
        return agent_rewards
    
    def _evaluate_agent_vote(self, agent_vote: int, actual_outcome: str) -> bool:
        """
        Evaluate if an individual agent's vote was correct.
        """
        if actual_outcome == 'collapsed':
            return agent_vote >= 7
        elif actual_outcome == 'stable':
            return agent_vote <= 4
        elif actual_outcome == 'recovered':
            return 4 < agent_vote < 7
        else:
            return False
    
    def _update_agent_weights(self, agent_rewards: Dict[str, float]):
        """
        Update agent weights based on rewards.
        """
        for agent_name, reward in agent_rewards.items():
            current_weight = self.swarm_engine.agent_weights.get(agent_name, 1.0)
            
            # Apply learning rate
            weight_change = reward * self.learning_rate
            new_weight = current_weight + weight_change
            
            # Apply bounds
            new_weight = max(0.1, min(2.0, new_weight))
            
            # Update swarm engine
            self.swarm_engine.update_agent_weights(agent_name, new_weight)
    
    def simulate_outcome(self, agency_id: int, action_taken: str, 
                        current_risk_score: int) -> str:
        """
        Simulate an outcome for testing purposes.
        In production, this would be replaced with actual outcome data.
        """
        import random
        
        # Simulate outcome based on action and risk score
        if action_taken == 'credit_freeze':
            # Credit freeze usually prevents collapse but may cause churn
            if current_risk_score > 80:
                return random.choices(
                    ['collapsed', 'stable', 'recovered'],
                    weights=[0.1, 0.7, 0.2]
                )[0]
            else:
                return random.choices(
                    ['collapsed', 'stable', 'recovered'],
                    weights=[0.05, 0.85, 0.1]
                )[0]
        
        elif action_taken == 'soft_contract':
            # Soft contract has moderate effect
            if current_risk_score > 75:
                return random.choices(
                    ['collapsed', 'stable', 'recovered'],
                    weights=[0.3, 0.5, 0.2]
                )[0]
            else:
                return random.choices(
                    ['collapsed', 'stable', 'recovered'],
                    weights=[0.1, 0.8, 0.1]
                )[0]
        
        else:  # do_nothing
            # Do nothing has highest risk
            if current_risk_score > 70:
                return random.choices(
                    ['collapsed', 'stable', 'recovered'],
                    weights=[0.6, 0.3, 0.1]
                )[0]
            elif current_risk_score > 50:
                return random.choices(
                    ['collapsed', 'stable', 'recovered'],
                    weights=[0.3, 0.5, 0.2]
                )[0]
            else:
                return random.choices(
                    ['collapsed', 'stable', 'recovered'],
                    weights=[0.05, 0.9, 0.05]
                )[0]
    
    def get_learning_statistics(self) -> Dict:
        """
        Get statistics about the learning process.
        """
        if not self.feedback_history:
            return {
                'total_feedback': 0,
                'accuracy': 0.0,
                'agent_weights': self.swarm_engine.get_agent_weights()
            }
        
        total_feedback = len(self.feedback_history)
        correct_predictions = sum(
            1 for f in self.feedback_history if f['was_correct']
        )
        accuracy = correct_predictions / total_feedback
        
        return {
            'total_feedback': total_feedback,
            'accuracy': round(accuracy, 3),
            'agent_weights': self.swarm_engine.get_agent_weights(),
            'agent_info': self.swarm_engine.get_agent_info()
        }
    
    def reset_learning(self):
        """Reset learning state."""
        self.feedback_history = []
        # Reset agent weights to default
        for agent_name in self.swarm_engine.agent_weights:
            self.swarm_engine.update_agent_weights(agent_name, 1.0)