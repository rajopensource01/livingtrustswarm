from abc import ABC, abstractmethod
from typing import Dict
import numpy as np


class BaseAgent(ABC):
    """Base class for all AI agents in the swarm."""
    
    def __init__(self, name: str, weight: float = 1.0):
        self.name = name
        self.weight = weight
        self.total_votes = 0
        self.correct_predictions = 0
    
    @abstractmethod
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze signals and return a vote with reasoning.
        
        Returns:
            {
                'vote': int (1-10),
                'confidence': float (0.0-1.0),
                'reasoning': str
            }
        """
        pass
    
    def _normalize_vote(self, raw_score: float, min_val: float, max_val: float) -> int:
        """Normalize a raw score to a 1-10 vote."""
        normalized = (raw_score - min_val) / (max_val - min_val) * 9 + 1
        return max(1, min(10, int(normalized)))
    
    def _calculate_confidence(self, signal_strength: float, consistency: float = 1.0) -> float:
        """Calculate confidence based on signal strength and consistency."""
        confidence = min(1.0, max(0.1, signal_strength * consistency))
        return round(confidence, 2)
    
    def update_weight(self, was_correct: bool):
        """Update agent weight based on prediction accuracy."""
        self.total_votes += 1
        if was_correct:
            self.correct_predictions += 1
            # Increase weight slightly for correct predictions
            self.weight = min(2.0, self.weight * 1.05)
        else:
            # Decrease weight for incorrect predictions
            self.weight = max(0.5, self.weight * 0.95)
    
    def get_accuracy(self) -> float:
        """Get agent's prediction accuracy."""
        if self.total_votes == 0:
            return 0.0
        return round(self.correct_predictions / self.total_votes, 2)