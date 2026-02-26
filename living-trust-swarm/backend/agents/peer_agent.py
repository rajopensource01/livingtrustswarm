from typing import Dict, List
import random
from .base_agent import BaseAgent


class PeerAgent(BaseAgent):
    """
    Compares agency behavior with similar agencies (peer group analysis).
    Identifies outliers and contextualizes risk within the peer group.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__("PeerAgent", weight)
        # Simulated peer groups (agencies grouped by size and type)
        self.peer_groups = self._initialize_peer_groups()
        self.peer_baselines = {}
    
    def _initialize_peer_groups(self) -> Dict[int, List[int]]:
        """Initialize peer groups for agencies."""
        # Group agencies by size (booking volume ranges)
        groups = {}
        
        # Small agencies (1-50 bookings/day)
        groups['small'] = list(range(1, 4))
        
        # Medium agencies (51-150 bookings/day)
        groups['medium'] = list(range(4, 7))
        
        # Large agencies (151+ bookings/day)
        groups['large'] = list(range(7, 11))
        
        return groups
    
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze agency behavior relative to peer group.
        """
        agency_id = signals.get('agency_id', 0)
        booking_volume = signals.get('booking_volume_per_day', 0)
        
        # Determine peer group
        peer_group = self._determine_peer_group(booking_volume)
        peer_agencies = self.peer_groups.get(peer_group, [])
        
        # Get peer baselines (simulated)
        peer_baselines = self._get_peer_baselines(peer_group, signals)
        
        # Calculate peer deviation scores
        deviation_scores = self._calculate_peer_deviations(signals, peer_baselines)
        
        # Calculate peer failure rate impact
        peer_failure_rate = signals.get('peer_failure_rate', 0.0)
        failure_risk = self._calculate_failure_risk(peer_failure_rate)
        
        # Combine deviation and failure risk
        avg_deviation = sum(deviation_scores.values()) / len(deviation_scores) if deviation_scores else 0.0
        peer_risk = (avg_deviation * 0.7) + (failure_risk * 0.3)
        
        # Determine vote
        vote = self._normalize_vote(peer_risk, 0.0, 1.5)
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            signal_strength=peer_risk,
            consistency=self._calculate_deviation_consistency(deviation_scores)
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            deviation_scores, peer_failure_rate, peer_group, len(peer_agencies)
        )
        
        return {
            'vote': vote,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _determine_peer_group(self, booking_volume: int) -> str:
        """Determine which peer group an agency belongs to."""
        if booking_volume <= 50:
            return 'small'
        elif booking_volume <= 150:
            return 'medium'
        else:
            return 'large'
    
    def _get_peer_baselines(self, peer_group: str, signals: Dict) -> Dict:
        """Get baseline metrics for peer group."""
        # Simulate peer baselines based on group characteristics
        if peer_group == 'small':
            return {
                'booking_volume_per_day': 30,
                'payment_delay_days': 2,
                'credit_utilization': 0.45,
                'chargeback_ratio': 0.008,
                'login_time_variance': 1.2,
                'device_change_frequency': 1,
                'ip_geo_variance': 0.05,
                'booking_spike_ratio': 1.1
            }
        elif peer_group == 'medium':
            return {
                'booking_volume_per_day': 100,
                'payment_delay_days': 3,
                'credit_utilization': 0.55,
                'chargeback_ratio': 0.01,
                'login_time_variance': 1.5,
                'device_change_frequency': 2,
                'ip_geo_variance': 0.08,
                'booking_spike_ratio': 1.0
            }
        else:  # large
            return {
                'booking_volume_per_day': 200,
                'payment_delay_days': 4,
                'credit_utilization': 0.65,
                'chargeback_ratio': 0.012,
                'login_time_variance': 2.0,
                'device_change_frequency': 3,
                'ip_geo_variance': 0.1,
                'booking_spike_ratio': 0.95
            }
    
    def _calculate_peer_deviations(self, signals: Dict, peer_baselines: Dict) -> Dict:
        """Calculate deviation from peer group baselines."""
        deviations = {}
        
        # Calculate normalized deviations for each metric
        metrics = [
            'payment_delay_days',
            'credit_utilization',
            'chargeback_ratio',
            'login_time_variance',
            'device_change_frequency',
            'ip_geo_variance',
            'booking_spike_ratio'
        ]
        
        for metric in metrics:
            current_value = signals.get(metric, 0)
            baseline_value = peer_baselines.get(metric, 0)
            
            if baseline_value == 0:
                deviation = 0.0
            else:
                deviation = abs(current_value - baseline_value) / baseline_value
            
            deviations[metric] = deviation
        
        return deviations
    
    def _calculate_failure_risk(self, peer_failure_rate: float) -> float:
        """Calculate risk based on peer group failure rate."""
        if peer_failure_rate < 0.05:
            return 0.0
        elif peer_failure_rate < 0.1:
            return 0.2
        elif peer_failure_rate < 0.2:
            return 0.5
        elif peer_failure_rate < 0.3:
            return 0.8
        else:
            return 1.2
    
    def _calculate_deviation_consistency(self, deviation_scores: Dict) -> float:
        """Calculate consistency of deviations across metrics."""
        if not deviation_scores:
            return 0.5
        
        values = list(deviation_scores.values())
        max_dev = max(values)
        
        if max_dev == 0:
            return 1.0
        
        # High consistency if most metrics show similar deviation levels
        std_dev = (sum((v - sum(values)/len(values))**2 for v in values) / len(values))**0.5
        consistency = 1.0 - min(1.0, std_dev / max_dev)
        
        return consistency
    
    def _generate_reasoning(self, deviation_scores: Dict, peer_failure_rate: float,
                           peer_group: str, peer_count: int) -> str:
        """Generate natural language explanation of peer analysis."""
        # Find metrics with highest deviations
        sorted_deviations = sorted(deviation_scores.items(), key=lambda x: x[1], reverse=True)
        top_deviations = sorted_deviations[:3]
        
        reasons = []
        
        for metric, deviation in top_deviations:
            if deviation > 1.0:
                reasons.append(f"severe {metric.replace('_', ' ')} deviation from peer group")
            elif deviation > 0.5:
                reasons.append(f"significant {metric.replace('_', ' ')} deviation from peers")
            elif deviation > 0.3:
                reasons.append(f"moderate {metric.replace('_', ' ')} deviation")
        
        # Add peer failure rate context
        if peer_failure_rate > 0.3:
            reasons.append(f"high peer group failure rate ({peer_failure_rate:.1%})")
        elif peer_failure_rate > 0.2:
            reasons.append(f"elevated peer group failure rate ({peer_failure_rate:.1%})")
        
        if not reasons:
            return f"Agency behavior aligns well with {peer_group} peer group ({peer_count} agencies). No significant deviations detected."
        
        reason_text = "; ".join(reasons)
        return f"Peer analysis for {peer_group} group ({peer_count} agencies): {reason_text}."