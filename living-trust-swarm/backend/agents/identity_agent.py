from typing import Dict
from .base_agent import BaseAgent


class IdentityAgent(BaseAgent):
    """
    Evaluates account stability through device and IP consistency analysis.
    Detects potential account takeover or fraudulent access patterns.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__("IdentityAgent", weight)
    
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze identity-related signals to assess account stability.
        """
        # Extract identity-related signals
        device_change_frequency = signals.get('device_change_frequency', 0)
        ip_geo_variance = signals.get('ip_geo_variance', 0.0)
        login_time_variance = signals.get('login_time_variance', 0.0)
        
        # Calculate individual risk factors
        device_risk = self._calculate_device_risk(device_change_frequency)
        ip_risk = self._calculate_ip_risk(ip_geo_variance)
        login_risk = self._calculate_login_risk(login_time_variance)
        
        # Calculate weighted identity risk score
        identity_risk_score = (
            device_risk * 0.4 +
            ip_risk * 0.4 +
            login_risk * 0.2
        )
        
        # Determine vote
        vote = self._normalize_vote(identity_risk_score, 0.0, 1.5)
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            signal_strength=identity_risk_score,
            consistency=self._calculate_signal_consistency(
                device_risk, ip_risk, login_risk
            )
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            device_change_frequency, ip_geo_variance, login_time_variance,
            device_risk, ip_risk, login_risk
        )
        
        return {
            'vote': vote,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _calculate_device_risk(self, device_changes: int) -> float:
        """Calculate risk based on device change frequency."""
        if device_changes == 0:
            return 0.0
        elif device_changes == 1:
            return 0.2
        elif device_changes == 2:
            return 0.5
        elif device_changes <= 4:
            return 0.8
        elif device_changes <= 7:
            return 1.1
        else:
            return 1.5
    
    def _calculate_ip_risk(self, ip_variance: float) -> float:
        """Calculate risk based on IP geographic variance."""
        if ip_variance < 0.1:
            return 0.0
        elif ip_variance < 0.2:
            return 0.3
        elif ip_variance < 0.4:
            return 0.6
        elif ip_variance < 0.6:
            return 0.9
        elif ip_variance < 0.8:
            return 1.2
        else:
            return 1.5
    
    def _calculate_login_risk(self, login_variance: float) -> float:
        """Calculate risk based on login time variance."""
        if login_variance < 1.0:
            return 0.0
        elif login_variance < 2.0:
            return 0.2
        elif login_variance < 4.0:
            return 0.5
        elif login_variance < 8.0:
            return 0.8
        elif login_variance < 12.0:
            return 1.1
        else:
            return 1.5
    
    def _calculate_signal_consistency(self, device_risk: float, ip_risk: float, login_risk: float) -> float:
        """Calculate consistency across identity signals."""
        risks = [device_risk, ip_risk, login_risk]
        max_risk = max(risks)
        min_risk = min(risks)
        
        if max_risk == 0:
            return 1.0
        
        consistency = 1.0 - ((max_risk - min_risk) / max_risk)
        return consistency
    
    def _generate_reasoning(self, device_changes: int, ip_variance: float, login_variance: float,
                           device_risk: float, ip_risk: float, login_risk: float) -> str:
        """Generate natural language explanation of identity analysis."""
        reasons = []
        
        # Device analysis
        if device_changes > 7:
            reasons.append("extremely high device change frequency indicating potential account sharing")
        elif device_changes > 4:
            reasons.append("high device change frequency")
        elif device_changes > 2:
            reasons.append("moderate device changes")
        elif device_changes > 0:
            reasons.append("minor device changes")
        
        # IP analysis
        if ip_variance >= 0.8:
            reasons.append("critical IP geographic variance suggesting multiple locations")
        elif ip_variance >= 0.6:
            reasons.append("high IP geographic variance")
        elif ip_variance >= 0.4:
            reasons.append("moderate IP variance")
        elif ip_variance >= 0.2:
            reasons.append("minor IP variance")
        
        # Login analysis
        if login_variance >= 12.0:
            reasons.append("severe login time pattern disruption")
        elif login_variance >= 8.0:
            reasons.append("significant login time variance")
        elif login_variance >= 4.0:
            reasons.append("moderate login time variance")
        elif login_variance >= 2.0:
            reasons.append("minor login time variance")
        
        if not reasons:
            return "Identity signals are stable with consistent device usage, IP location, and login patterns."
        
        reason_text = "; ".join(reasons)
        return f"Identity analysis reveals {reason_text}. Device changes: {device_changes}, IP variance: {ip_variance:.2f}, Login variance: {login_variance:.2f}."