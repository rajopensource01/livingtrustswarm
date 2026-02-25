from typing import Dict, List
import numpy as np
from .base_agent import BaseAgent


class PredictionAgent(BaseAgent):
    """
    Forecasts future trajectory using time-series forecasting.
    Predicts where the agency will be in 30, 60, and 90 days.
    """
    
    def __init__(self, weight: float = 1.0):
        super().__init__("PredictionAgent", weight)
        self.agency_history = {}
    
    def analyze(self, signals: Dict) -> Dict:
        """
        Analyze current signals and forecast future trajectory.
        """
        agency_id = signals.get('agency_id', 0)
        
        # Store signals in history
        if agency_id not in self.agency_history:
            self.agency_history[agency_id] = []
        self.agency_history[agency_id].append(signals)
        
        # Keep only last 50 signals
        if len(self.agency_history[agency_id]) > 50:
            self.agency_history[agency_id] = self.agency_history[agency_id][-50:]
        
        # Generate forecasts
        forecasts = self._generate_forecasts(agency_id)
        
        # Calculate prediction risk based on forecasts
        prediction_risk = self._calculate_prediction_risk(forecasts)
        
        # Determine vote
        vote = self._normalize_vote(prediction_risk, 0.0, 1.0)
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            signal_strength=prediction_risk,
            consistency=self._calculate_forecast_consistency(forecasts)
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(forecasts, prediction_risk)
        
        return {
            'vote': vote,
            'confidence': confidence,
            'reasoning': reasoning
        }
    
    def _generate_forecasts(self, agency_id: int) -> Dict:
        """Generate forecasts for 30, 60, and 90 days."""
        history = self.agency_history.get(agency_id, [])
        
        if len(history) < 3:
            # Not enough history - use current values with slight degradation
            current = history[-1] if history else {}
            return {
                '30_days': self._degrade_signals(current, 0.05),
                '60_days': self._degrade_signals(current, 0.10),
                '90_days': self._degrade_signals(current, 0.15)
            }
        
        # Use linear extrapolation for forecasting
        forecasts = {}
        for days in [30, 60, 90]:
            forecasts[f'{days}_days'] = self._extrapolate_signals(history, days)
        
        return forecasts
    
    def _extrapolate_signals(self, history: List[Dict], days_ahead: int) -> Dict:
        """Extrapolate signals using linear trend."""
        if not history:
            return {}
        
        forecast = {}
        n = len(history)
        
        # Calculate trend for each metric
        for key in history[0].keys():
            if key == 'agency_id' or key == 'timestamp':
                continue
            
            values = [h.get(key, 0) for h in history]
            
            # Calculate linear trend
            x = list(range(n))
            sum_x = sum(x)
            sum_y = sum(values)
            sum_xy = sum(xi * yi for xi, yi in zip(x, values))
            sum_x2 = sum(xi * xi for xi in x)
            
            denominator = n * sum_x2 - sum_x * sum_x
            if denominator == 0:
                slope = 0
            else:
                slope = (n * sum_xy - sum_x * sum_y) / denominator
            
            # Extrapolate
            current_value = values[-1]
            forecast_value = current_value + (slope * days_ahead)
            
            # Apply bounds
            forecast[key] = self._apply_bounds(key, forecast_value)
        
        return forecast
    
    def _degrade_signals(self, signals: Dict, degradation_rate: float) -> Dict:
        """Apply degradation to signals for forecasting."""
        degraded = {}
        
        for key, value in signals.items():
            if key == 'agency_id' or key == 'timestamp':
                degraded[key] = value
            elif key in ['payment_delay_days', 'chargeback_ratio', 
                        'login_time_variance', 'device_change_frequency',
                        'ip_geo_variance']:
                # These metrics tend to increase with risk
                degraded[key] = value * (1 + degradation_rate)
            elif key in ['booking_volume_per_day', 'response_to_credit_terms']:
                # These metrics tend to decrease with risk
                degraded[key] = max(0, value * (1 - degradation_rate))
            else:
                degraded[key] = value
        
        return degraded
    
    def _apply_bounds(self, key: str, value: float) -> float:
        """Apply reasonable bounds to forecasted values."""
        bounds = {
            'payment_delay_days': (0, 90),
            'credit_utilization': (0.0, 1.0),
            'chargeback_ratio': (0.0, 0.5),
            'login_time_variance': (0.0, 24.0),
            'device_change_frequency': (0, 30),
            'ip_geo_variance': (0.0, 1.0),
            'booking_spike_ratio': (0.0, 5.0),
            'response_to_credit_terms': (1, 5)
        }
        
        if key in bounds:
            min_val, max_val = bounds[key]
            return max(min_val, min(max_val, value))
        
        return value
    
    def _calculate_prediction_risk(self, forecasts: Dict) -> float:
        """Calculate overall prediction risk based on forecasts."""
        risk_scores = []
        
        for period, forecast in forecasts.items():
            # Calculate risk score for this forecast period
            period_risk = self._calculate_period_risk(forecast)
            risk_scores.append(period_risk)
        
        # Weight more recent periods higher
        weights = [0.5, 0.3, 0.2]  # 30, 60, 90 days
        weighted_risk = sum(r * w for r, w in zip(risk_scores, weights))
        
        return weighted_risk
    
    def _calculate_period_risk(self, forecast: Dict) -> float:
        """Calculate risk score for a specific forecast period."""
        risk_factors = []
        
        # Payment delay risk
        payment_delay = forecast.get('payment_delay_days', 0)
        if payment_delay > 30:
            risk_factors.append(1.0)
        elif payment_delay > 14:
            risk_factors.append(0.7)
        elif payment_delay > 7:
            risk_factors.append(0.4)
        else:
            risk_factors.append(0.0)
        
        # Credit utilization risk
        credit_util = forecast.get('credit_utilization', 0.0)
        if credit_util > 0.95:
            risk_factors.append(1.0)
        elif credit_util > 0.85:
            risk_factors.append(0.7)
        elif credit_util > 0.7:
            risk_factors.append(0.4)
        else:
            risk_factors.append(0.0)
        
        # Chargeback risk
        chargeback = forecast.get('chargeback_ratio', 0.0)
        if chargeback > 0.05:
            risk_factors.append(1.0)
        elif chargeback > 0.02:
            risk_factors.append(0.6)
        elif chargeback > 0.01:
            risk_factors.append(0.3)
        else:
            risk_factors.append(0.0)
        
        # Booking volume decline risk
        booking_spike = forecast.get('booking_spike_ratio', 1.0)
        if booking_spike < 0.5:
            risk_factors.append(0.8)
        elif booking_spike < 0.7:
            risk_factors.append(0.5)
        else:
            risk_factors.append(0.0)
        
        return sum(risk_factors) / len(risk_factors) if risk_factors else 0.0
    
    def _calculate_forecast_consistency(self, forecasts: Dict) -> float:
        """Calculate consistency across forecast periods."""
        risk_scores = [self._calculate_period_risk(f) for f in forecasts.values()]
        
        if len(risk_scores) < 2:
            return 0.5
        
        # High consistency if risk increases steadily over time
        is_increasing = all(risk_scores[i] <= risk_scores[i+1] for i in range(len(risk_scores)-1))
        
        if is_increasing:
            return 0.9
        else:
            return 0.6
    
    def _generate_reasoning(self, forecasts: Dict, prediction_risk: float) -> str:
        """Generate natural language explanation of prediction analysis."""
        period_risks = {
            period: self._calculate_period_risk(forecast)
            for period, forecast in forecasts.items()
        }
        
        # Identify trend
        risks = list(period_risks.values())
        if all(risks[i] <= risks[i+1] for i in range(len(risks)-1)):
            trend = "deteriorating"
        elif all(risks[i] >= risks[i+1] for i in range(len(risks)-1)):
            trend = "improving"
        else:
            trend = "fluctuating"
        
        # Generate detailed reasoning
        if prediction_risk > 0.7:
            severity = "critical"
        elif prediction_risk > 0.5:
            severity = "high"
        elif prediction_risk > 0.3:
            severity = "moderate"
        else:
            severity = "low"
        
        reasoning = f"Forecast indicates {severity} risk with {trend} trajectory. "
        
        # Add period-specific insights
        insights = []
        for period, risk in period_risks.items():
            if risk > 0.7:
                insights.append(f"{period.replace('_', ' ')}: critical risk projected")
            elif risk > 0.5:
                insights.append(f"{period.replace('_', ' ')}: high risk projected")
            elif risk > 0.3:
                insights.append(f"{period.replace('_', ' ')}: moderate risk projected")
        
        if insights:
            reasoning += " ".join(insights[:2]) + "."
        
        return reasoning