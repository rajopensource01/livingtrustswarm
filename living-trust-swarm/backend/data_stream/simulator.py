import random
import time
from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np


class DataStreamSimulator:
    """Simulates real-time behavioral data for B2B travel agencies."""
    
    def __init__(self, num_agencies: int = 10):
        self.num_agencies = num_agencies
        self.agency_baselines = self._initialize_baselines()
        self.agency_states = self._initialize_states()
    
    def _initialize_baselines(self) -> Dict[int, Dict]:
        """Initialize baseline behavior for each agency."""
        baselines = {}
        for i in range(1, self.num_agencies + 1):
            baselines[i] = {
                'booking_volume_per_day': random.randint(50, 200),
                'payment_delay_days': random.randint(0, 5),
                'credit_utilization': random.uniform(0.3, 0.7),
                'chargeback_ratio': random.uniform(0.0, 0.02),
                'login_time_variance': random.uniform(0.5, 2.0),
                'device_change_frequency': random.randint(0, 2),
                'ip_geo_variance': random.uniform(0.0, 0.1),
                'booking_spike_ratio': random.uniform(0.8, 1.2),
                'peer_failure_rate': random.uniform(0.0, 0.1),
                'response_to_credit_terms': random.randint(1, 5)
            }
        return baselines
    
    def _initialize_states(self) -> Dict[int, str]:
        """Initialize risk states for agencies."""
        states = {}
        for i in range(1, self.num_agencies + 1):
            # 70% stable, 20% stressed, 8% turbulent, 2% collapsing
            rand = random.random()
            if rand < 0.7:
                states[i] = 'Stable'
            elif rand < 0.9:
                states[i] = 'Stressed'
            elif rand < 0.98:
                states[i] = 'Turbulent'
            else:
                states[i] = 'Collapsing'
        return states
    
    def generate_signal(self, agency_id: int) -> Dict:
        """Generate a new signal for a specific agency."""
        baseline = self.agency_baselines.get(agency_id, self.agency_baselines[1])
        state = self.agency_states.get(agency_id, 'Stable')
        
        # Apply state-based modifications
        state_multiplier = self._get_state_multiplier(state)
        
        signal = {
            'agency_id': agency_id,
            'timestamp': datetime.utcnow(),
            'booking_volume_per_day': self._generate_booking_volume(baseline, state_multiplier),
            'payment_delay_days': self._generate_payment_delay(baseline, state_multiplier),
            'credit_utilization': self._generate_credit_utilization(baseline, state_multiplier),
            'chargeback_ratio': self._generate_chargeback_ratio(baseline, state_multiplier),
            'login_time_variance': self._generate_login_variance(baseline, state_multiplier),
            'device_change_frequency': self._generate_device_changes(baseline, state_multiplier),
            'ip_geo_variance': self._generate_ip_variance(baseline, state_multiplier),
            'booking_spike_ratio': self._generate_booking_spike(baseline, state_multiplier),
            'peer_failure_rate': self._generate_peer_failure(baseline, state_multiplier),
            'response_to_credit_terms': self._generate_credit_response(baseline, state_multiplier)
        }
        
        return signal
    
    def _get_state_multiplier(self, state: str) -> float:
        """Get multiplier based on risk state."""
        multipliers = {
            'Stable': 1.0,
            'Stressed': 1.3,
            'Turbulent': 1.7,
            'Collapsing': 2.5
        }
        return multipliers.get(state, 1.0)
    
    def _generate_booking_volume(self, baseline: Dict, multiplier: float) -> int:
        base = baseline['booking_volume_per_day']
        variance = random.uniform(0.8, 1.2)
        return int(base * variance * multiplier)
    
    def _generate_payment_delay(self, baseline: Dict, multiplier: float) -> int:
        base = baseline['payment_delay_days']
        variance = random.uniform(0.5, 1.5)
        return int(base * variance * multiplier)
    
    def _generate_credit_utilization(self, baseline: Dict, multiplier: float) -> float:
        base = baseline['credit_utilization']
        variance = random.uniform(0.9, 1.1)
        result = base * variance * multiplier
        return min(1.0, max(0.0, result))
    
    def _generate_chargeback_ratio(self, baseline: Dict, multiplier: float) -> float:
        base = baseline['chargeback_ratio']
        variance = random.uniform(0.5, 2.0)
        result = base * variance * multiplier
        return min(0.5, max(0.0, result))
    
    def _generate_login_variance(self, baseline: Dict, multiplier: float) -> float:
        base = baseline['login_time_variance']
        variance = random.uniform(0.8, 1.2)
        return base * variance * multiplier
    
    def _generate_device_changes(self, baseline: Dict, multiplier: float) -> int:
        base = baseline['device_change_frequency']
        variance = random.uniform(0.5, 2.0)
        return int(base * variance * multiplier)
    
    def _generate_ip_variance(self, baseline: Dict, multiplier: float) -> float:
        base = baseline['ip_geo_variance']
        variance = random.uniform(0.5, 2.0)
        result = base * variance * multiplier
        return min(1.0, max(0.0, result))
    
    def _generate_booking_spike(self, baseline: Dict, multiplier: float) -> float:
        base = baseline['booking_spike_ratio']
        variance = random.uniform(0.7, 1.3)
        result = base * variance * multiplier
        return min(3.0, max(0.5, result))
    
    def _generate_peer_failure(self, baseline: Dict, multiplier: float) -> float:
        base = baseline['peer_failure_rate']
        variance = random.uniform(0.8, 1.2)
        result = base * variance * multiplier
        return min(1.0, max(0.0, result))
    
    def _generate_credit_response(self, baseline: Dict, multiplier: float) -> int:
        base = baseline['response_to_credit_terms']
        variance = random.uniform(0.5, 1.5)
        result = int(base * variance / multiplier)
        return max(1, min(5, result))
    
    def update_agency_state(self, agency_id: int, new_state: str):
        """Update the risk state of an agency."""
        self.agency_states[agency_id] = new_state
    
    def get_all_signals(self) -> List[Dict]:
        """Generate signals for all agencies."""
        signals = []
        for agency_id in range(1, self.num_agencies + 1):
            signals.append(self.generate_signal(agency_id))
        return signals