from typing import Dict
import numpy as np
from .base_agent import BaseAgent


class DriftAgent(BaseAgent):
    """
    Detects behavioral pattern changes through statistical deviation analysis.
    Monitors how current behavior deviates from historical baselines.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__("DriftAgent", weight)
        self.historical_baselines = {}
    
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze behavioral drift by comparing current signals to historical patterns.
        """
        agency_id = signals.get('agency_id', 0)
        
        # Initialize or update historical baselines
        if agency_id not in self.historical_baselines:
            self.historical_baselines[agency_id] = self._initialize_baseline(signals)
        
        baseline = self.historical_baselines[agency_id]
        
        # Calculate drift scores for each signal
        drift_scores = self._calculate_drift_scores(signals, baseline)
        
        # Aggregate drift score
        total_drift = np.mean(list(drift_scores.values()))
        
        # Determine vote based on drift severity
        vote = self._normalize_vote(total_drift, 0.0, 2.0)
        
        # Calculate confidence based on consistency of drift signals
        confidence = self._calculate_confidence(
            signal_strength=min(1.0, total_drift),
            consistency=self._calculate_drift_consistency(drift_scores)
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(drift_scores, total_drift)
        
        # Update baseline with current signals (exponential moving average)
        self._update_baseline(agency_id, signals, alpha=0.1)
        
        return {
            'vote': vote,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _initialize_baseline(self, signals: Dict) -> Dict:
        """Initialize baseline from current signals."""
        return {
            'booking_volume_per_day': signals.get('booking_volume_per_day', 100),
            'payment_delay_days': signals.get('payment_delay_days', 0),
            'credit_utilization': signals.get('credit_utilization', 0.5),
            'chargeback_ratio': signals.get('chargeback_ratio', 0.0),
            'login_time_variance': signals.get('login_time_variance', 1.0),
            'device_change_frequency': signals.get('device_change_frequency', 0),
            'ip_geo_variance': signals.get('ip_geo_variance', 0.0),
            'booking_spike_ratio': signals.get('booking_spike_ratio', 1.0)
        }
    
    def _calculate_drift_scores(self, signals: Dict, baseline: Dict) -> Dict:
        """Calculate normalized drift scores for each signal."""
        drift_scores = {}
        
        # Booking volume drift (percentage change)
        booking_baseline = baseline.get('booking_volume_per_day', 100)
        booking_current = signals.get('booking_volume_per_day', 100)
        drift_scores['booking_volume'] = abs(booking_current - booking_baseline) / max(1, booking_baseline)
        
        # Payment delay drift (absolute change)
        delay_baseline = baseline.get('payment_delay_days', 0)
        delay_current = signals.get('payment_delay_days', 0)
        drift_scores['payment_delay'] = abs(delay_current - delay_baseline) / 10.0
        
        # Credit utilization drift
        util_baseline = baseline.get('credit_utilization', 0.5)
        util_current = signals.get('credit_utilization', 0.5)
        drift_scores['credit_utilization'] = abs(util_current - util_baseline)
        
        # Chargeback ratio drift
        chargeback_baseline = baseline.get('chargeback_ratio', 0.0)
        chargeback_current = signals.get('chargeback_ratio', 0.0)
        drift_scores['chargeback_ratio'] = abs(chargeback_current - chargeback_baseline) / 0.1
        
        # Login variance drift
        login_baseline = baseline.get('login_time_variance', 1.0)
        login_current = signals.get('login_time_variance', 1.0)
        drift_scores['login_variance'] = abs(login_current - login_baseline) / 2.0
        
        # Device change drift
        device_baseline = baseline.get('device_change_frequency', 0)
        device_current = signals.get('device_change_frequency', 0)
        drift_scores['device_changes'] = abs(device_current - device_baseline) / 5.0
        
        # IP variance drift
        ip_baseline = baseline.get('ip_geo_variance', 0.0)
        ip_current = signals.get('ip_geo_variance', 0.0)
        drift_scores['ip_variance'] = abs(ip_current - ip_baseline) / 0.5
        
        # Booking spike drift
        spike_baseline = baseline.get('booking_spike_ratio', 1.0)
        spike_current = signals.get('booking_spike_ratio', 1.0)
        drift_scores['booking_spike'] = abs(spike_current - spike_baseline) / 1.0
        
        return drift_scores
    
    def _calculate_drift_consistency(self, drift_scores: Dict) -> float:
        """Calculate how consistent the drift signals are across all metrics."""
        values = list(drift_scores.values())
        if len(values) == 0:
            return 0.5
        
        # High consistency if most metrics show similar drift levels
        std_dev = np.std(values)
        mean = np.mean(values)
        
        if mean == 0:
            return 1.0
        
        consistency = 1.0 - min(1.0, std_dev / mean)
        return consistency
    
    def _generate_reasoning(self, drift_scores: Dict, total_drift: float) -> str:
        """Generate natural language explanation of drift analysis."""
        # Find top drift factors
        sorted_drifts = sorted(drift_scores.items(), key=lambda x: x[1], reverse=True)
        top_drifts = sorted_drifts[:3]
        
        if total_drift < 0.3:
            return "Behavioral patterns remain stable with minimal deviation from historical baselines."
        
        reasons = []
        for factor, score in top_drifts:
            if score > 0.5:
                reasons.append(f"significant {factor.replace('_', ' ')} drift")
            elif score > 0.3:
                reasons.append(f"moderate {factor.replace('_', ' ')} drift")
        
        if not reasons:
            return f"Overall behavioral drift detected (score: {total_drift:.2f}) across multiple metrics."
        
        reason_text = ", ".join(reasons)
        return f"Detected {reason_text} with overall drift score of {total_drift:.2f}."
    
    def _update_baseline(self, agency_id: int, signals: Dict, alpha: float = 0.1):
        """Update baseline using exponential moving average."""
        if agency_id not in self.historical_baselines:
            return
        
        baseline = self.historical_baselines[agency_id]
        
        for key in baseline.keys():
            if key in signals:
                baseline[key] = alpha * signals[key] + (1 - alpha) * baseline[key]