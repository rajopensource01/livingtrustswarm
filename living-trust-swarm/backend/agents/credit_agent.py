from typing import Dict
from .base_agent import BaseAgent


class CreditAgent(BaseAgent):
    """
    Evaluates financial stress and repayment probability.
    Focuses on credit utilization, payment delays, and chargeback patterns.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__("CreditAgent", weight)
    
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze credit-related signals to assess financial health.
        """
        # Extract credit-related signals
        credit_utilization = signals.get('credit_utilization', 0.0)
        payment_delay_days = signals.get('payment_delay_days', 0)
        chargeback_ratio = signals.get('chargeback_ratio', 0.0)
        booking_volume = signals.get('booking_volume_per_day', 0)
        
        # Calculate individual risk factors
        utilization_risk = self._calculate_utilization_risk(credit_utilization)
        delay_risk = self._calculate_delay_risk(payment_delay_days)
        chargeback_risk = self._calculate_chargeback_risk(chargeback_ratio)
        
        # Calculate weighted credit risk score
        credit_risk_score = (
            utilization_risk * 0.4 +
            delay_risk * 0.4 +
            chargeback_risk * 0.2
        )
        
        # Adjust for booking volume (higher volume = more at stake)
        volume_multiplier = self._calculate_volume_multiplier(booking_volume)
        adjusted_risk = credit_risk_score * volume_multiplier
        
        # Determine vote
        vote = self._normalize_vote(adjusted_risk, 0.0, 1.5)
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            signal_strength=adjusted_risk,
            consistency=self._calculate_signal_consistency(
                utilization_risk, delay_risk, chargeback_risk
            )
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            credit_utilization, payment_delay_days, chargeback_ratio,
            utilization_risk, delay_risk, chargeback_risk
        )
        
        return {
            'vote': vote,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _calculate_utilization_risk(self, utilization: float) -> float:
        """Calculate risk based on credit utilization percentage."""
        if utilization < 0.5:
            return 0.0
        elif utilization < 0.7:
            return 0.3
        elif utilization < 0.85:
            return 0.6
        elif utilization < 0.95:
            return 0.9
        else:
            return 1.2
    
    def _calculate_delay_risk(self, delay_days: int) -> float:
        """Calculate risk based on payment delay days."""
        if delay_days == 0:
            return 0.0
        elif delay_days <= 3:
            return 0.2
        elif delay_days <= 7:
            return 0.5
        elif delay_days <= 14:
            return 0.8
        elif delay_days <= 30:
            return 1.1
        else:
            return 1.5
    
    def _calculate_chargeback_risk(self, chargeback_ratio: float) -> float:
        """Calculate risk based on chargeback ratio."""
        if chargeback_ratio < 0.005:  # Less than 0.5%
            return 0.0
        elif chargeback_ratio < 0.01:  # Less than 1%
            return 0.3
        elif chargeback_ratio < 0.02:  # Less than 2%
            return 0.6
        elif chargeback_ratio < 0.05:  # Less than 5%
            return 1.0
        else:
            return 1.5
    
    def _calculate_volume_multiplier(self, booking_volume: int) -> float:
        """Calculate multiplier based on booking volume."""
        if booking_volume < 50:
            return 0.8
        elif booking_volume < 100:
            return 0.9
        elif booking_volume < 200:
            return 1.0
        elif booking_volume < 500:
            return 1.1
        else:
            return 1.2
    
    def _calculate_signal_consistency(self, util_risk: float, delay_risk: float, chargeback_risk: float) -> float:
        """Calculate consistency across credit signals."""
        risks = [util_risk, delay_risk, chargeback_risk]
        max_risk = max(risks)
        min_risk = min(risks)
        
        if max_risk == 0:
            return 1.0
        
        # High consistency if all risks are at similar levels
        consistency = 1.0 - ((max_risk - min_risk) / max_risk)
        return consistency
    
    def _generate_reasoning(self, utilization: float, delay_days: int, chargeback_ratio: float,
                           util_risk: float, delay_risk: float, chargeback_risk: float) -> str:
        """Generate natural language explanation of credit analysis."""
        reasons = []
        
        # Utilization analysis
        if utilization >= 0.95:
            reasons.append("critical credit utilization near limit")
        elif utilization >= 0.85:
            reasons.append("high credit utilization")
        elif utilization >= 0.7:
            reasons.append("elevated credit utilization")
        
        # Payment delay analysis
        if delay_days > 30:
            reasons.append("severe payment delays exceeding 30 days")
        elif delay_days > 14:
            reasons.append("significant payment delays")
        elif delay_days > 7:
            reasons.append("moderate payment delays")
        elif delay_days > 0:
            reasons.append("minor payment delays")
        
        # Chargeback analysis
        if chargeback_ratio >= 0.05:
            reasons.append("extremely high chargeback ratio")
        elif chargeback_ratio >= 0.02:
            reasons.append("elevated chargeback ratio")
        elif chargeback_ratio >= 0.01:
            reasons.append("concerning chargeback levels")
        
        if not reasons:
            return "Credit metrics are healthy with low utilization, timely payments, and minimal chargebacks."
        
        reason_text = "; ".join(reasons)
        return f"Credit analysis indicates {reason_text}. Utilization: {utilization:.1%}, Delay: {delay_days} days, Chargebacks: {chargeback_ratio:.2%}."