from typing import Dict, List
from .base_agent import BaseAgent


class MemoryAgent(BaseAgent):
    """
    Compares current behavior with historical failure patterns.
    Learns from past agency collapses to predict similar outcomes.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__("MemoryAgent", weight)
        # Historical failure patterns (simulated)
        self.failure_patterns = self._initialize_failure_patterns()
        self.agency_history = {}
    
    def _initialize_failure_patterns(self) -> List[Dict]:
        """Initialize known failure patterns from historical data."""
        return [
            {
                'pattern_name': 'gradual_decline',
                'characteristics': {
                    'payment_delay_days': (15, 45),
                    'credit_utilization': (0.8, 1.0),
                    'chargeback_ratio': (0.02, 0.1),
                    'booking_spike_ratio': (0.5, 0.8)
                },
                'severity': 0.9
            },
            {
                'pattern_name': 'sudden_spike',
                'characteristics': {
                    'booking_spike_ratio': (2.0, 5.0),
                    'chargeback_ratio': (0.05, 0.2),
                    'device_change_frequency': (5, 15),
                    'ip_geo_variance': (0.5, 1.0)
                },
                'severity': 0.95
            },
            {
                'pattern_name': 'identity_compromise',
                'characteristics': {
                    'device_change_frequency': (10, 20),
                    'ip_geo_variance': (0.7, 1.0),
                    'login_time_variance': (10.0, 24.0),
                    'payment_delay_days': (0, 10)
                },
                'severity': 0.85
            },
            {
                'pattern_name': 'credit_exhaustion',
                'characteristics': {
                    'credit_utilization': (0.95, 1.0),
                    'payment_delay_days': (30, 60),
                    'booking_volume_per_day': (10, 50),
                    'response_to_credit_terms': (1, 2)
                },
                'severity': 0.88
            }
        ]
    
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze current signals against historical failure patterns.
        """
        agency_id = signals.get('agency_id', 0)
        
        # Store current signals in history
        if agency_id not in self.agency_history:
            self.agency_history[agency_id] = []
        self.agency_history[agency_id].append(signals)
        
        # Keep only last 100 signals per agency
        if len(self.agency_history[agency_id]) > 100:
            self.agency_history[agency_id] = self.agency_history[agency_id][-100:]
        
        # Calculate pattern match scores
        pattern_matches = self._calculate_pattern_matches(signals)
        
        # Calculate trend analysis
        trend_risk = self._calculate_trend_risk(agency_id)
        
        # Combine pattern matching and trend analysis
        pattern_risk = max([match['score'] for match in pattern_matches], default=0.0)
        combined_risk = (pattern_risk * 0.6) + (trend_risk * 0.4)
        
        # Determine vote
        vote = self._normalize_vote(combined_risk, 0.0, 1.0)
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            signal_strength=combined_risk,
            consistency=self._calculate_pattern_consistency(pattern_matches)
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(pattern_matches, trend_risk)
        
        return {
            'vote': vote,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _calculate_pattern_matches(self, signals: Dict) -> List[Dict]:
        """Calculate how well current signals match historical failure patterns."""
        matches = []
        
        for pattern in self.failure_patterns:
            match_score = self._calculate_pattern_match_score(signals, pattern)
            matches.append({
                'pattern_name': pattern['pattern_name'],
                'score': match_score,
                'severity': pattern['severity']
            })
        
        return matches
    
    def _calculate_pattern_match_score(self, signals: Dict, pattern: Dict) -> float:
        """Calculate match score for a specific pattern."""
        characteristics = pattern['characteristics']
        match_scores = []
        
        for signal_key, (min_val, max_val) in characteristics.items():
            current_value = signals.get(signal_key, 0)
            
            # Check if current value falls within pattern range
            if min_val <= current_value <= max_val:
                # Perfect match
                match_scores.append(1.0)
            elif current_value < min_val:
                # Below range - partial match based on distance
                distance = min_val - current_value
                match_scores.append(max(0.0, 1.0 - (distance / min_val)))
            else:
                # Above range - partial match based on distance
                distance = current_value - max_val
                match_scores.append(max(0.0, 1.0 - (distance / max_val)))
        
        if not match_scores:
            return 0.0
        
        # Average match score weighted by pattern severity
        avg_match = sum(match_scores) / len(match_scores)
        return avg_match * pattern['severity']
    
    def _calculate_trend_risk(self, agency_id: int) -> float:
        """Calculate risk based on historical trends for this agency."""
        history = self.agency_history.get(agency_id, [])
        
        if len(history) < 5:
            return 0.0
        
        # Calculate trends for key metrics
        recent_signals = history[-10:]
        
        # Payment delay trend
        payment_delays = [s.get('payment_delay_days', 0) for s in recent_signals]
        payment_trend = self._calculate_trend(payment_delays)
        
        # Credit utilization trend
        credit_utils = [s.get('credit_utilization', 0) for s in recent_signals]
        util_trend = self._calculate_trend(credit_utils)
        
        # Chargeback trend
        chargebacks = [s.get('chargeback_ratio', 0) for s in recent_signals]
        chargeback_trend = self._calculate_trend(chargebacks)
        
        # Combine trends
        trend_risk = (
            max(0.0, payment_trend) * 0.4 +
            max(0.0, util_trend) * 0.4 +
            max(0.0, chargeback_trend) * 0.2
        )
        
        return min(1.0, trend_risk)
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate linear trend (slope) of values."""
        if len(values) < 2:
            return 0.0
        
        n = len(values)
        x = list(range(n))
        
        # Calculate slope using simple linear regression
        sum_x = sum(x)
        sum_y = sum(values)
        sum_xy = sum(xi * yi for xi, yi in zip(x, values))
        sum_x2 = sum(xi * xi for xi in x)
        
        denominator = n * sum_x2 - sum_x * sum_x
        if denominator == 0:
            return 0.0
        
        slope = (n * sum_xy - sum_x * sum_y) / denominator
        
        # Normalize slope
        return slope / max(1.0, sum(values) / n)
    
    def _calculate_pattern_consistency(self, pattern_matches: List[Dict]) -> float:
        """Calculate consistency of pattern matches."""
        if not pattern_matches:
            return 0.5
        
        scores = [match['score'] for match in pattern_matches]
        max_score = max(scores)
        
        if max_score == 0:
            return 0.5
        
        # High consistency if one pattern clearly matches
        sorted_scores = sorted(scores, reverse=True)
        if len(sorted_scores) >= 2:
            consistency = 1.0 - (sorted_scores[1] / max_score)
        else:
            consistency = 1.0
        
        return consistency
    
    def _generate_reasoning(self, pattern_matches: List[Dict], trend_risk: float) -> str:
        """Generate natural language explanation of memory analysis."""
        # Find best matching pattern
        best_match = max(pattern_matches, key=lambda x: x['score'], default=None)
        
        if best_match and best_match['score'] > 0.5:
            pattern_name = best_match['pattern_name']
            match_score = best_match['score']
            
            if match_score > 0.8:
                strength = "strong"
            elif match_score > 0.6:
                strength = "moderate"
            else:
                strength = "weak"
            
            reasoning = f"Detected {strength} match with historical '{pattern_name}' failure pattern (score: {match_score:.2f})."
            
            if trend_risk > 0.3:
                reasoning += f" Additionally, historical trends show deteriorating behavior (trend risk: {trend_risk:.2f})."
            
            return reasoning
        
        if trend_risk > 0.5:
            return f"No specific failure pattern match, but historical trends indicate concerning deterioration (trend risk: {trend_risk:.2f})."
        
        return "Current behavior does not match known historical failure patterns. Trends appear stable."