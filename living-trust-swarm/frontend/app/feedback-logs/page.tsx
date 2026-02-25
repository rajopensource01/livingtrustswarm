'use client';

import { useEffect, useState } from 'react';
import { getLearningStatistics } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { History, TrendingUp, Brain, Award } from 'lucide-react';

export default function FeedbackLogs() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getLearningStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <History className="h-8 w-8 mr-3 text-blue-600" />
            Feedback Logs & Learning Statistics
          </h1>
          <p className="text-gray-600 mt-2">
            Track system performance and agent learning progress
          </p>
        </div>

        {stats && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_feedback}</p>
                  </div>
                  <History className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Accuracy</p>
                    <p className="text-3xl font-bold text-green-600">
                      {(stats.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Agents</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.agent_info?.length || 7}</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Agent Weights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                Agent Weights & Performance
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Votes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.agent_info?.map((agent: any) => (
                      <tr key={agent.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {agent.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.weight.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.total_votes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(agent.accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                agent.accuracy >= 0.8 ? 'bg-green-500' :
                                agent.accuracy >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${agent.accuracy * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Accuracy</p>
                    <p className="text-xs text-gray-600">Overall prediction accuracy</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {(stats.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Feedback Collected</p>
                    <p className="text-xs text-gray-600">Total feedback instances processed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.total_feedback}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Agent Optimization</p>
                    <p className="text-xs text-gray-600">Weights adjusted based on performance</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How Learning Works</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Feedback Collection:</strong> When actions are applied, the system tracks actual outcomes 
                  (stable, collapsed, or recovered) and compares them to predictions.
                </p>
                <p>
                  <strong>Agent Rewards:</strong> Agents that correctly predict outcomes receive positive feedback 
                  and their weights increase. Incorrect predictions result in weight reductions.
                </p>
                <p>
                  <strong>Weight Adjustment:</strong> Agent weights are dynamically adjusted using reinforcement 
                  learning, ensuring the most accurate agents have greater influence on consensus.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}