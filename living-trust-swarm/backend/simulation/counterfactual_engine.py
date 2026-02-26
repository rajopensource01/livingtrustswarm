from typing import Dict, List
import numpy as np


class CounterfactualSimulationEngine:
    """
    Simulates outcomes under different actions using counterfactual reasoning.
    Implements Minimum Regret Decision Policy for action selection.
    """
    
    def __init__(self):
        self.action_types = ['do_nothing', 'soft_contract', 'credit_freeze']
    
    def simulate_actions(self, signals: Dict, current_risk_score) -> Dict:
        """
        Simulate outcomes for all three actions and recommend the best one.
        """
        # Guard against None / NaN risk score
        if current_risk_score is None or (isinstance(current_risk_score, float) and np.isnan(current_risk_score)):
            current_risk_score = 0

        action_results = {}
        
        for action in self.action_types:
            result = self._simulate_action(signals, action, current_risk_score)
            action_results[action] = result
        
        # Calculate regret scores
        regret_scores = self._calculate_regret_scores(action_results)
        
        # Find minimum regret action
        recommended_action = min(regret_scores.items(), key=lambda x: x[1])[0]
        minimum_regret = regret_scores[recommended_action]
        
        return {
            'do_nothing': action_results['do_nothing'],
            'soft_contract': action_results['soft_contract'],
            'credit_freeze': action_results['credit_freeze'],
            'recommended_action': recommended_action,
            'minimum_regret': minimum_regret,
            'regret_scores': regret_scores
        }
    
    def _simulate_action(self, signals: Dict, action: str, current_risk_score: int) -> Dict:
        """
        Simulate the outcome of a specific action.
        """
        # Extract key signals
        credit_utilization = signals.get('credit_utilization', 0.0)
        payment_delay_days = signals.get('payment_delay_days', 0)
        booking_volume = signals.get('booking_volume_per_day', 0)
        chargeback_ratio = signals.get('chargeback_ratio', 0.0)
        
        # Calculate base probabilities
        base_collapse_prob = current_risk_score / 100.0
        base_churn_prob = self._calculate_base_churn_prob(signals)
        base_recovery_prob = 1.0 - base_collapse_prob
        
        # Apply action modifiers
        if action == 'do_nothing':
            collapse_prob = base_collapse_prob
            churn_prob = base_churn_prob
            recovery_prob = base_recovery_prob
            expected_loss = self._calculate_expected_loss(
                collapse_prob, signals, action_modifier=1.0
            )
        
        elif action == 'soft_contract':
            # Soft contract reduces risk but increases churn slightly
            collapse_prob = base_collapse_prob * 0.6  # 40% risk reduction
            churn_prob = base_churn_prob * 1.3  # 30% churn increase
            recovery_prob = 1.0 - collapse_prob
            expected_loss = self._calculate_expected_loss(
                collapse_prob, signals, action_modifier=0.7
            )
        
        elif action == 'credit_freeze':
            # Credit freeze drastically reduces risk but significantly increases churn
            collapse_prob = base_collapse_prob * 0.2  # 80% risk reduction
            churn_prob = base_churn_prob * 2.5  # 150% churn increase
            recovery_prob = 1.0 - collapse_prob
            expected_loss = self._calculate_expected_loss(
                collapse_prob, signals, action_modifier=0.3
            )
        
        else:
            raise ValueError(f"Unknown action: {action}")
        
        return {
            'action_type': action,
            'collapse_probability': round(collapse_prob, 3),
            'churn_probability': round(churn_prob, 3),
            'recovery_probability': round(recovery_prob, 3),
            'expected_loss': round(expected_loss, 2)
        }
    
    def _calculate_base_churn_prob(self, signals: Dict) -> float:
        """Calculate base churn probability based on signals."""
        credit_utilization = signals.get('credit_utilization', 0.0)
        payment_delay_days = signals.get('payment_delay_days', 0)
        booking_volume = signals.get('booking_volume_per_day', 0)
        
        # Higher utilization and delays increase churn risk
        churn_prob = 0.1  # Base 10% churn
        
        if credit_utilization > 0.8:
            churn_prob += 0.15
        elif credit_utilization > 0.6:
            churn_prob += 0.05
        
        if payment_delay_days > 14:
            churn_prob += 0.1
        elif payment_delay_days > 7:
            churn_prob += 0.05
        
        # Higher volume reduces churn (more invested)
        if booking_volume > 150:
            churn_prob -= 0.05
        elif booking_volume < 50:
            churn_prob += 0.05
        
        return max(0.0, min(1.0, churn_prob))
    
    def _calculate_expected_loss(self, collapse_prob: float, signals: Dict, 
                                action_modifier: float) -> float:
        """
        Calculate expected loss given collapse probability and signals.
        """
        # Calculate potential loss amount
        credit_limit = 100000.0  # Default credit limit
        credit_utilization = signals.get('credit_utilization', 0.0)
        booking_volume = signals.get('booking_volume_per_day', 0)
        
        # Loss = credit used + potential future bookings
        credit_used = credit_limit * credit_utilization
        future_bookings = booking_volume * 30 * 100  # 30 days, $100 avg booking
        
        potential_loss = credit_used + future_bookings
        
        # Expected loss = collapse_prob * potential_loss * action_modifier
        expected_loss = collapse_prob * potential_loss * action_modifier
        
        return expected_loss
    
    def _calculate_regret_scores(self, action_results: Dict) -> Dict[str, float]:
        """
        Calculate regret scores for each action using Minimum Regret Decision Policy.
        Regret = Expected Loss + (Churn Penalty * Churn Probability)
        """
        regret_scores = {}
        
        for action, result in action_results.items():
            expected_loss = result['expected_loss']
            churn_prob = result['churn_probability']
            
            # Churn penalty: losing a customer has long-term value loss
            churn_penalty = 50000.0  # $50k customer lifetime value
            
            regret = expected_loss + (churn_penalty * churn_prob)
            regret_scores[action] = regret
        
        return regret_scores
    
    def simulate_with_modifications(self, signals: Dict, current_risk_score: int,
                                   modifications: Dict) -> Dict:
        """
        Simulate actions with modified signals (what-if scenarios).
        """
        # Apply modifications to signals
        modified_signals = signals.copy()
        for key, value in modifications.items():
            modified_signals[key] = value
        
        # Run simulation with modified signals
        return self.simulate_actions(modified_signals, current_risk_score)
    
    def get_action_explanation(self, action: str, result: Dict) -> str:
        """
        Generate natural language explanation for an action.
        """
        collapse_prob = result['collapse_probability']
        churn_prob = result['churn_probability']
        recovery_prob = result['recovery_probability']
        expected_loss = result['expected_loss']
        
        if action == 'do_nothing':
            return (f"Maintaining current terms: {collapse_prob:.1%} collapse risk, "
                   f"{churn_prob:.1%} churn risk, ${expected_loss:,.0f} expected loss.")
        
        elif action == 'soft_contract':
            return (f"Soft credit reduction: {collapse_prob:.1%} collapse risk, "
                   f"{churn_prob:.1%} churn risk, ${expected_loss:,.0f} expected loss. "
                   f"Balances risk reduction with customer retention.")
        
        elif action == 'credit_freeze':
            return (f"Full credit freeze: {collapse_prob:.1%} collapse risk, "
                   f"{churn_prob:.1%} churn risk, ${expected_loss:,.0f} expected loss. "
                   f"Maximum protection but high churn risk.")
        
        else:
            return f"Unknown action: {action}"