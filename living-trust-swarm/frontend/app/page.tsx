'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAgencies, Agency } from '@/lib/api';
import RiskBadge from '@/components/RiskBadge';
import Navbar from '@/components/Navbar';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  useEffect(() => {
    loadAgencies();
    setupWebSocket();
  }, []);

  const loadAgencies = async () => {
    try {
      const data = await getAgencies();
      setAgencies(data);
    } catch (error) {
      console.error('Failed to load agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/live-updates');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setLiveUpdates(prev => [...prev.slice(-9), update]);
      
      // Update agency in list
      setAgencies(prev => prev.map(agency => 
        agency.id === update.agency_id
          ? { ...agency, current_risk_score: update.risk_score, risk_state: update.risk_state }
          : agency
      ));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  };

  const getRiskIcon = (riskState: string) => {
    switch (riskState) {
      case 'Stable':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Stressed':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Turbulent':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'Collapsing':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStats = () => {
    const stable = agencies.filter(a => a.risk_state === 'Stable').length;
    const stressed = agencies.filter(a => a.risk_state === 'Stressed').length;
    const turbulent = agencies.filter(a => a.risk_state === 'Turbulent').length;
    const collapsing = agencies.filter(a => a.risk_state === 'Collapsing').length;
    return { stable, stressed, turbulent, collapsing };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stable</p>
                <p className="text-2xl font-bold text-green-600">{stats.stable}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stressed</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.stressed}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Turbulent</p>
                <p className="text-2xl font-bold text-orange-600">{stats.turbulent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collapsing</p>
                <p className="text-2xl font-bold text-red-600">{stats.collapsing}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Live Updates */}
        {liveUpdates.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Live Updates
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {liveUpdates.slice().reverse().map((update, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Agency {update.agency_id}</span>
                  <RiskBadge riskState={update.risk_state} riskScore={update.risk_score} />
                  <span className="text-gray-400 text-xs">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agencies List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agencies</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {agencies.map((agency) => (
              <Link
                key={agency.id}
                href={`/agency/${agency.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRiskIcon(agency.risk_state)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agency.name}</p>
                      <p className="text-sm text-gray-500">{agency.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Credit Used</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${agency.current_credit_used.toLocaleString()} / ${agency.credit_limit.toLocaleString()}
                      </p>
                    </div>
                    <RiskBadge riskState={agency.risk_state} riskScore={agency.current_risk_score} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}