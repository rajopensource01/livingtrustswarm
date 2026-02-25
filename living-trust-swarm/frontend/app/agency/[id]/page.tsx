'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAgency, getAgentVotes, runSimulation, applyAction, Agency, SwarmConsensus, SimulationResult } from '@/lib/api';
import RiskBadge from '@/components/RiskBadge';
import AgentVoteBar from '@/components/AgentVoteBar';
import { ArrowLeft, Play, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AgencyDetail() {
  const params = useParams();
  const agencyId = parseInt(params.id as string);
  
  const [agency, setAgency] = useState<Agency | null>(null);
  const [consensus, setConsensus] = useState<SwarmConsensus | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [applyingAction, setApplyingAction] = useState(false);

  useEffect(() => {
    loadData();
  }, [agencyId]);

  const loadData = async () => {
    try {
      const [agencyData, consensusData] = await Promise.all([
        getAgency(agencyId),
        getAgentVotes(agencyId)
      ]);
      setAgency(agencyData);
      setConsensus(consensusData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const result = await runSimulation(agencyId);
      setSimulation(result);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setSimulating(false);
    }
  };

  const handleApplyAction = async (actionType: string) => {
    setApplyingAction(true);
    try {
      await applyAction(agencyId, actionType, `Applied ${actionType} based on simulation results`);
      await loadData();
      setSimulation(null);
    } catch (error) {
      console.error('Failed to apply action:', error);
    } finally {
      setApplyingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agency) {
    return <div>Agency not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
              <p className="text-gray-600">{agency.email}</p>
            </div>
            <RiskBadge riskState={agency.risk_state} riskScore={agency.current_risk_score} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Credit Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Credit Information
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Credit Utilization</span>
                    <span className="font-medium">
                      {((agency.current_credit_used / agency.credit_limit) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(agency.current_credit_used / agency.credit_limit) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Credit Limit</p>
                    <p className="text-lg font-semibold">${agency.credit_limit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Credit Used</p>
                    <p className="text-lg font-semibold">${agency.current_credit_used.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Swarm Consensus */}
            {consensus && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Swarm Consensus
                </h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Explanation Summary</p>
                  <p className="text-gray-900">{consensus.explanation_summary}</p>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Disagreement Index</p>
                    <p className="text-lg font-semibold">{(consensus.disagreement_index * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Votes */}
            {consensus && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Votes</h2>
                <div className="space-y-4">
                  {consensus.agent_votes.map((vote) => (
                    <AgentVoteBar key={vote.agent_name} vote={vote} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Simulation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Play className="h-5 w-5 mr-2 text-blue-600" />
                Counterfactual Simulation
              </h2>
              
              {!simulation ? (
                <button
                  onClick={handleRunSimulation}
                  disabled={simulating}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  {simulating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Simulation...
                    </>
                  ) : (
                    'Run Simulation'
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Recommended Action</p>
                    <p className="text-lg font-bold text-blue-900 capitalize">
                      {simulation.recommended_action.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Minimum Regret: ${simulation.minimum_regret.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { action: simulation.do_nothing, label: 'Do Nothing', color: 'gray' },
                      { action: simulation.soft_contract, label: 'Soft Contract', color: 'yellow' },
                      { action: simulation.credit_freeze, label: 'Credit Freeze', color: 'red' }
                    ].map((item) => (
                      <div key={item.label} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{item.label}</h3>
                          <span className="text-sm text-gray-600">
                            Loss: ${item.action.expected_loss.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Collapse</p>
                            <p className="font-medium">{(item.action.collapse_probability * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Churn</p>
                            <p className="font-medium">{(item.action.churn_probability * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Recovery</p>
                            <p className="font-medium">{(item.action.recovery_probability * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleApplyAction(item.action.action_type)}
                          disabled={applyingAction}
                          className="mt-3 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 disabled:bg-gray-300 transition-colors text-sm"
                        >
                          {applyingAction ? 'Applying...' : `Apply ${item.label}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Minority Warnings */}
            {consensus && consensus.agent_votes.some(v => v.vote >= 8) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <h3 className="font-medium text-yellow-900">High Risk Detected</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Some agents are signaling high risk. Consider running a simulation to evaluate potential actions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}