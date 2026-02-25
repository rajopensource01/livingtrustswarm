from typing import Dict
from .base_agent import BaseAgent


class IncentiveAgent(BaseAgent):
    """
    Evaluates response to pricing/credit pressure.
    Assesses how the agency reacts to credit terms and financial incentives.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__("IncentiveAgent", weight)
        self.agency_baseline_response = {}
    
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze agency's response to credit terms and incentives.
        """
        agency_id = signals.get('agency_id', 0)
        
        # Extract incentive-related signals
        response_to_credit_terms = signals.get('response_to_credit_terms', 3)
        credit_utilization = signals.get('credit_utilization', 0.0)
        payment_delay_days = signals.get('payment_delay_days', 0)
        booking_volume = signals.get('booking_volume_per_day', 0)
        
        # Calculate incentive response metrics
        credit_term_response = self._evaluate_credit_term_response(response_to_credit_terms)
        utilization_pressure = self._evaluate_utilization_pressure(credit_utilization)
        payment_behavior = self._evaluate_payment_behavior(payment_delay_days)
        volume_stability = self._evaluate_volume_stability(booking_volume)
        
        # Calculate overall incentive risk
        incentive_risk = (
            credit_term_response * 0.3 +
            utilization_pressure * 0.3 +
            payment_behavior * 0.25 +
            volume_stability * 0.15
        )
        
        # Determine vote
        vote = self._normalize_vote(incentive_risk, 0.0, 1.0)
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            signal_strength=incentive_risk,
            consistency=self._calculate_response_consistency(
                credit_term_response, utilization_pressure, payment_behavior
            )
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            response_to_credit_terms, credit_utilization, payment_delay_days,
            credit_term_response, utilization_pressure, payment_behavior
        )
        
        return {
            'vote': vote,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _evaluate_credit_term_response(self, response_score: int) -> float:
        """
        Evaluate response to credit terms (1-5 scale).
        1 = Poor response, 5 = Excellent response.
        """
        if response_score >= 4:
            return 0.0  # Excellent response
        elif response_score == 3:
            return 0.3  # Good response
        elif response_score == 2:
            return 0.6  # Poor response
        else:
            return 0.9  # Very poor response
    
    def _evaluate_utilization_pressure(self, utilization: float) -> float:
        """
        Evaluate if agency is under credit utilization pressure.
        """
        if utilization < 0.5:
            return 0.0  # No pressure
        elif utilization < 0.7:
            return 0.2  # Low pressure
        elif utilization < 0.85:
            return 0.5  # Moderate pressure
        elif utilization < 0.95:
            return 0.8  # High pressure
        else:
            return 1.0  # Critical pressure
    
    def _evaluate_payment_behavior(self, delay_days: int) -> float:
        """
        Evaluate payment behavior under pressure.
        """
        if delay_days == 0:
            return 0.0  # Excellent
        elif delay_days <= 3:
            return 0.2  # Good
        elif delay_days <= 7:
            return 0.4  # Acceptable
        elif delay_days <= 14:
            return 0.6  # Concerning
        elif delay_days <= 30:
            return 0.8  # Poor
        else:
            return 1.0  # Critical
    
    def _evaluate_volume_stability(self, booking_volume: int) -> float:
        """
        Evaluate if booking volume is stable under pressure.
        """
        if booking_volume > 150:
            return 0.0  # Strong volume
        elif booking_volume > 100:
            return 0.2  # Good volume
        elif booking_volume > 50:
            return 0.4  # Moderate volume
        elif booking_volume > 20:
            return 0.6  # Low volume
        else:
            return 0.8  # Critical volume
    
    def _calculate_response_consistency(self, credit_response: float, 
                                       util_pressure: float, 
                                       payment_behavior: float) -> float:
        """
        Calculate consistency of response signals.
        """
        responses = [credit_response, util_pressure, payment_behavior]
        max_response = max(responses)
        min_response = min(responses)
        
        if max_response == 0:
            return 1.0
        
        # High consistency if all responses are at similar levels
        consistency = 1.0 - ((max_response - min_response) / max_response)
        return consistency
    
    def _generate_reasoning(self, response_score: int, utilization: float, 
                           delay_days: int, credit_response: float,
                           util_pressure: float, payment_behavior: float) -> str:
        """
        Generate natural language explanation of incentive analysis.
        """
        reasons = []
        
        # Credit term response analysis
        if response_score <= 2:
            reasons.append("poor response to credit terms")
        elif response_score == 3:
            reasons.append("moderate response to credit terms")
        else:
            reasons.append("good response to credit terms")
        
        # Utilization pressure analysis
        if utilization >= 0.95:
            reasons.append("critical credit utilization pressure")
        elif utilization >= 0.85:
            reasons.append("high credit utilization pressure")
        elif utilization >= 0.7:
            reasons.append("moderate credit utilization pressure")
        
        # Payment behavior analysis
        if delay_days > 30:
            reasons.append("severe payment delays under pressure")
        elif delay_days > 14:
            reasons.append("significant payment delays")
        elif delay_days > 7:
            reasons.append("moderate payment delays")
        
        if not reasons:
            return "Agency responds well to credit incentives with stable utilization and timely payments."
        
        reason_text = "; ".join(reasons)
        return f"Incentive analysis: {reason_text}. Credit term response score: {response_score}/5, Utilization: {utilization:.1%}, Payment delay: {delay_days} days."