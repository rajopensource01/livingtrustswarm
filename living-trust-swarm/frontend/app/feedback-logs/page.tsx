'use client';

import { useEffect, useState } from 'react';
import { getLearningStatistics } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { TrendingUp, Brain, Hash } from 'lucide-react';

export default function FeedbackLogs() {
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLearningStatistics()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 22, height: 22 }} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">System Intelligence</p>
            <h1 className="page-title">Feedback Logs</h1>
          </div>
        </div>

        <div className="page-content">
          {stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Overview stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Feedback',  value: stats.total_feedback,                     sub: 'Instances processed',    icon: Hash },
                  { label: 'System Accuracy', value: `${(stats.accuracy * 100).toFixed(1)}%`,  sub: 'Prediction accuracy',    icon: TrendingUp },
                  { label: 'Active Agents',   value: stats.agent_info?.length ?? 7,             sub: 'Reasoning agents online', icon: Brain },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="stat-card"
                    style={{ animation: `fadeUp 0.22s ease ${i * 40}ms both` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span className="label">{item.label}</span>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--r-md)',
                          background: 'var(--bg-canvas)',
                          border: '1px solid var(--border-faint)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <item.icon style={{ width: 13, height: 13, color: 'var(--text-tertiary)', strokeWidth: 1.75 }} />
                      </div>
                    </div>
                    <p className="metric-lg" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {item.value}
                    </p>
                    <p className="meta-text">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Agent performance table */}
              <div className="card anim-3">
                <div className="card-header">
                  <span className="section-title">Agent Performance</span>
                </div>

                {/* Table header */}
                <div
                  className="table-head"
                  style={{ gridTemplateColumns: '2fr 1fr 1fr 1.2fr 2fr' }}
                >
                  {['Agent', 'Weight', 'Total Votes', 'Accuracy', 'Performance'].map(h => (
                    <span key={h} className="table-head-cell">{h}</span>
                  ))}
                </div>

                {stats.agent_info?.map((agent: any, idx: number) => {
                  const acc = agent.accuracy;
                  const dotColor =
                    acc >= 0.8 ? 'var(--risk-stable-dot)'    :
                    acc >= 0.6 ? 'var(--risk-stressed-dot)'  :
                    'var(--risk-collapsing-dot)';
                  const textColor =
                    acc >= 0.8 ? 'var(--risk-stable-text)'    :
                    acc >= 0.6 ? 'var(--risk-stressed-text)'  :
                    'var(--risk-collapsing-text)';
                  const bgColor =
                    acc >= 0.8 ? 'var(--risk-stable-bg)'    :
                    acc >= 0.6 ? 'var(--risk-stressed-bg)'  :
                    'var(--risk-collapsing-bg)';
                  const borderColor =
                    acc >= 0.8 ? 'var(--risk-stable-border)'    :
                    acc >= 0.6 ? 'var(--risk-stressed-border)'  :
                    'var(--risk-collapsing-border)';

                  return (
                    <div
                      key={agent.name}
                      className="table-row"
                      style={{ gridTemplateColumns: '2fr 1fr 1fr 1.2fr 2fr', cursor: 'default' }}
                    >
                      {/* Agent name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: dotColor,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.010em',
                          }}
                        >
                          {agent.name}
                        </span>
                      </div>

                      {/* Weight */}
                      <span
                        className="font-mono"
                        style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}
                      >
                        {agent.weight.toFixed(2)}
                      </span>

                      {/* Total votes */}
                      <span
                        className="font-mono"
                        style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}
                      >
                        {agent.total_votes}
                      </span>

                      {/* Accuracy badge */}
                      <span
                        className="font-mono"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--r-pill)',
                          background: bgColor,
                          color: textColor,
                          border: `1px solid ${borderColor}`,
                          width: 'fit-content',
                        }}
                      >
                        {(acc * 100).toFixed(1)}%
                      </span>

                      {/* Performance bar */}
                      <div style={{ paddingRight: '16px' }}>
                        <div className="vote-track">
                          <div
                            className="vote-fill"
                            style={{ width: `${acc * 100}%`, background: dotColor }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* How learning works */}
              <div className="card anim-4">
                <div className="card-header">
                  <span className="section-title">How Learning Works</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {[
                    {
                      step: '01',
                      label: 'Feedback Collection',
                      text: 'When actions are applied, the system tracks actual outcomes — stable, collapsed, or recovered — and compares them to predictions.',
                    },
                    {
                      step: '02',
                      label: 'Agent Rewards',
                      text: 'Agents that correctly predict outcomes receive positive feedback and their weights increase. Incorrect predictions reduce weight.',
                    },
                    {
                      step: '03',
                      label: 'Weight Adjustment',
                      text: 'Weights are dynamically adjusted via reinforcement learning, ensuring the most accurate agents carry greater consensus influence.',
                    },
                  ].map((item, i) => (
                    <div
                      key={item.step}
                      style={{
                        padding: '20px 24px',
                        borderRight: i < 2 ? '1px solid var(--border-faint)' : 'none',
                      }}
                    >
                      <p
                        className="font-mono"
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--text-placeholder)',
                          letterSpacing: '0.06em',
                          marginBottom: '10px',
                        }}
                      >
                        {item.step}
                      </p>
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.012em',
                          marginBottom: '6px',
                        }}
                      >
                        {item.label}
                      </p>
                      <p className="body-sm" style={{ lineHeight: 1.65 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}