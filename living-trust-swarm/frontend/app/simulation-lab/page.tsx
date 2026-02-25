'use client';

import { useState } from 'react';
import { runSimulation, SimulationResult } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Settings, Play, TrendingUp, AlertCircle } from 'lucide-react';

export default function SimulationLab() {
  const [selectedAgency, setSelectedAgency] = useState<number>(1);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [signalModifications, setSignalModifications] = useState({
    payment_delay_days: 0,
    credit_utilization: 0,
    chargeback_ratio: 0,
    booking_spike_ratio: 0,
  });

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const result = await runSimulation(selectedAgency, signalModifications);
      setSimulation(result);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSignalModifications({
      payment_delay_days: 0,
      credit_utilization: 0,
      chargeback_ratio: 0,
      booking_spike_ratio: 0,
    });
    setSimulation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-8 w-8 mr-3 text-blue-600" />
            Simulation Lab
          </h1>
          <p className="text-gray-600 mt-2">
            Run counterfactual simulations to predict outcomes under different scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agency Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agency
              </label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Travel Agency {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Signal Modifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Signal Modifications
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Adjust signals to simulate different scenarios
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Delay Days
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={signalModifications.payment_delay_days}
                    onChange={(e) => setSignalModifications({
                      ...signalModifications,
                      payment_delay_days: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 days</span>
                    <span>{signalModifications.payment_delay_days} days</span>
                    <span>60 days</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Utilization
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={signalModifications.credit_utilization}
                    onChange={(e) => setSignalModifications({
                      ...signalModifications,
                      credit_utilization: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{signalModifications.credit_utilization}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chargeback Ratio
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={signalModifications.chargeback_ratio}
                    onChange={(e) => setSignalModifications({
                      ...signalModifications,
                      chargeback_ratio: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{signalModifications.chargeback_ratio}%</span>
                    <span>10%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Spike Ratio
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={signalModifications.booking_spike_ratio}
                    onChange={(e) => setSignalModifications({
                      ...signalModifications,
                      booking_spike_ratio: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0x</span>
                    <span>{signalModifications.booking_spike_ratio}x</span>
                    <span>5x</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleRunSimulation}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {simulation ? (
              <div className="space-y-6">
                {/* Recommendation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <TrendingUp className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Recommended Action
                      </h3>
                      <p className="text-2xl font-bold text-blue-900 capitalize mb-2">
                        {simulation.recommended_action.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-blue-700">
                        Minimum Regret: ${simulation.minimum_regret.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { action: simulation.do_nothing, label: 'Do Nothing', color: 'gray' },
                    { action: simulation.soft_contract, label: 'Soft Contract', color: 'yellow' },
                    { action: simulation.credit_freeze, label: 'Credit Freeze', color: 'red' }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`bg-white rounded-lg shadow p-6 border-2 ${
                        simulation.recommended_action === item.action.action_type
                          ? 'border-blue-500'
                          : 'border-transparent'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-4">{item.label}</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-600">Expected Loss</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${item.action.expected_loss.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Collapse</span>
                              <span className="font-medium">{(item.action.collapse_probability * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${item.action.collapse_probability * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Churn</span>
                              <span className="font-medium">{(item.action.churn_probability * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${item.action.churn_probability * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Recovery</span>
                              <span className="font-medium">{(item.action.recovery_probability * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${item.action.recovery_probability * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {simulation.recommended_action === item.action.action_type && (
                        <div className="mt-4 flex items-center text-blue-600 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Recommended
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Analysis */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis</h3>
                  <div className="space-y-4 text-sm text-gray-700">
                    <p>
                      <strong>Do Nothing:</strong> Maintains current terms but carries the highest collapse risk 
                      if the agency is already showing signs of distress.
                    </p>
                    <p>
                      <strong>Soft Contract:</strong> Reduces credit limit moderately, balancing risk reduction 
                      with customer retention. Best for agencies showing early warning signs.
                    </p>
                    <p>
                      <strong>Credit Freeze:</strong> Maximum protection against loss but significantly increases 
                      churn risk. Use only when collapse is imminent.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center justify-center text-center">
                <Settings className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Simulation Results
                </h3>
                <p className="text-gray-600 max-w-md">
                  Select an agency, adjust signal modifications if desired, and run a simulation to see predicted outcomes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}