'use client';

import { useEffect, useState } from 'react';
import { getAgentVotes, SwarmConsensus } from '@/lib/api';
import AgentVoteBar from '@/components/AgentVoteBar';
import Navbar from '@/components/Navbar';
import { Brain, Settings, Info } from 'lucide-react';

export default function SwarmLab() {
  const [selectedAgency, setSelectedAgency] = useState<number>(1);
  const [consensus, setConsensus] = useState<SwarmConsensus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConsensus();
  }, [selectedAgency]);

  const loadConsensus = async () => {
    setLoading(true);
    try {
      const data = await getAgentVotes(selectedAgency);
      setConsensus(data);
    } catch (error) {
      console.error('Failed to load consensus:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-600" />
            Swarm Lab
          </h1>
          <p className="text-gray-600 mt-2">
            Analyze individual agent reasoning and adjust agent weights
          </p>
        </div>

        {/* Agency Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : consensus ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Votes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Votes</h2>
              <div className="space-y-4">
                {consensus.agent_votes.map((vote) => (
                  <AgentVoteBar key={vote.agent_name} vote={vote} />
                ))}
              </div>
            </div>

            {/* Swarm Analysis */}
            <div className="space-y-6">
              {/* Consensus Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Consensus Summary</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Risk Score</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {consensus.consensus_risk_score}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk State</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {consensus.risk_state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disagreement Index</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {(consensus.disagreement_index * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Explanation Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {consensus.explanation_summary}
                </p>
              </div>

              {/* Agent Weights (Placeholder for future implementation) */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Agent Weights
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Adjust agent weights to influence consensus calculation
                </p>
                <div className="space-y-3">
                  {consensus.agent_votes.map((vote) => (
                    <div key={vote.agent_name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{vote.agent_name}</span>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        defaultValue="1.0"
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600 w-12 text-right">1.0</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}