'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getAgency, getAgentVotes, runSimulation, applyAction,
  Agency, SwarmConsensus, SimulationResult,
} from '@/lib/api';
import RiskBadge from '@/components/RiskBadge';
import AgentVoteBar from '@/components/AgentVoteBar';
import Navbar from '@/components/Navbar';
import {
  ArrowLeft, Play, AlertCircle, BarChart2,
  CheckCircle2, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

/* ── Probability row ── */
function ProbRow({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = (value * 100).toFixed(0);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{label}</span>
        <span className="font-mono" style={{ fontSize: '11.5px', fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div className="vote-track">
        <div className="vote-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Simulation action card ── */
function SimCard({
  label, desc, action, isRec, onApply, applying,
}: {
  label: string; desc: string; action: any;
  isRec: boolean; onApply: () => void; applying: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 'var(--r-lg)',
        padding: '16px',
        border: `1px solid ${isRec ? 'var(--accent-border)' : 'var(--border-faint)'}`,
        background: isRec ? 'var(--accent-bg)' : 'var(--bg-surface)',
        boxShadow: isRec ? 'var(--shadow-sm)' : 'none',
        transition: 'all var(--t-base)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.012em' }}>
          {label}
        </p>
        {isRec && (
          <span className="rec-badge">
            <CheckCircle2 style={{ width: 9, height: 9 }} />
            Recommended
          </span>
        )}
      </div>
      <p style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '14px' }}>{desc}</p>

      <div className="card-inset" style={{ padding: '10px 14px', marginBottom: '14px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Expected Loss</p>
        <p className="metric-sm" style={{ color: 'var(--text-primary)' }}>
          ${action.expected_loss.toLocaleString()}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        <ProbRow label="Collapse"  value={action.collapse_probability}  color="var(--risk-collapsing-dot)" />
        <ProbRow label="Churn"     value={action.churn_probability}     color="var(--risk-stressed-dot)"   />
        <ProbRow label="Recovery"  value={action.recovery_probability}  color="var(--risk-stable-dot)"     />
      </div>

      <button
        onClick={onApply}
        disabled={applying}
        className={`btn w-full ${isRec ? 'btn-primary' : 'btn-secondary'}`}
        style={{ width: '100%' }}
      >
        {applying
          ? <><span className="spinner" style={{ width: 13, height: 13 }} />Applying…</>
          : <>Apply {label} <ChevronRight style={{ width: 13, height: 13 }} /></>
        }
      </button>
    </div>
  );
}

/* ── Main ─────────────────────────────────── */
export default function AgencyDetail() {
  const params   = useParams();
  const agencyId = parseInt(params.id as string);

  // ✅ ALL hooks declared first — before any conditional returns
  const [agency,         setAgency]        = useState<Agency | null>(null);
  const [consensus,      setConsensus]      = useState<SwarmConsensus | null>(null);
  const [simulation,     setSimulation]     = useState<SimulationResult | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [simulating,     setSimulating]     = useState(false);
  const [applyingAction, setApplyingAction] = useState(false);

  useEffect(() => {
    if (!isNaN(agencyId)) loadData();
    else setLoading(false);
  }, [agencyId]);

  const loadData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [a, c] = await Promise.all([
        getAgency(agencyId),
        getAgentVotes(agencyId),
      ]);
      setAgency(a);
      setConsensus(c);
    } catch (e: any) {
      console.error('Agency load error:', e);
      setError(e?.message ?? 'Failed to load agency data');
    } finally {
      setLoading(false);
    }
  };

  const handleSim = async () => {
    setSimulating(true);
    try { setSimulation(await runSimulation(agencyId)); }
    catch (e) { console.error(e); }
    finally { setSimulating(false); }
  };

  const handleApply = async (type: string) => {
    setApplyingAction(true);
    try {
      await applyAction(agencyId, type, `Applied ${type}`);
      await loadData();
      setSimulation(null);
    } catch (e) { console.error(e); }
    finally { setApplyingAction(false); }
  };

  // ── Conditional renders AFTER all hooks ──

  if (isNaN(agencyId)) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Invalid agency ID</p>
            <Link href="/" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>← Back to Dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="spinner" style={{ width: 22, height: 22 }} />
            <p className="meta-text">Loading agency…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--risk-collapsing-text)', marginBottom: '12px' }}>{error}</p>
            <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ marginRight: '8px' }}>
              Retry
            </button>
            <Link href="/" style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none' }}>
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!agency) return null;

  const pct = (agency.current_credit_used / agency.credit_limit) * 100;
  const barColor =
    pct > 85 ? 'var(--risk-collapsing-dot)' :
    pct > 65 ? 'var(--risk-stressed-dot)'   :
    'var(--risk-stable-dot)';
  const hasHighRisk = consensus?.agent_votes.some(v => v.vote >= 8);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        {/* ── Page Header ── */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href="/"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none',
                padding: '5px 8px', borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-faint)', background: 'var(--bg-surface)',
                transition: 'all var(--t-fast)',
              }}
            >
              <ArrowLeft style={{ width: 13, height: 13 }} />
              Back
            </Link>
            <div style={{ width: '1px', height: '16px', background: 'var(--border-medium)' }} />
            <div>
              <p className="page-eyebrow">Agency Detail</p>
              <h1 className="page-title">{agency.name}</h1>
            </div>
          </div>
          <RiskBadge riskState={agency.risk_state} riskScore={agency.current_risk_score} size="lg" />
        </div>

        <div className="page-content">

          {/* ── Metric Strip ── */}
          <div className="stat-row anim-1" style={{ marginBottom: '20px' }}>
            <div className="stat-row-cell">
              <p className="label" style={{ marginBottom: '6px' }}>Credit Limit</p>
              <p className="metric-md" style={{ color: 'var(--text-primary)' }}>
                ${agency.credit_limit.toLocaleString()}
              </p>
            </div>
            <div className="stat-row-cell">
              <p className="label" style={{ marginBottom: '6px' }}>Credit Used</p>
              <p className="metric-md" style={{ color: 'var(--text-primary)' }}>
                ${agency.current_credit_used.toLocaleString()}
              </p>
            </div>
            <div className="stat-row-cell">
              <p className="label" style={{ marginBottom: '6px' }}>Utilization</p>
              <p className="metric-md" style={{ color: barColor }}>
                {pct.toFixed(1)}%
              </p>
            </div>
            <div className="stat-row-cell" style={{ flex: 2 }}>
              <p className="label" style={{ marginBottom: '10px' }}>Credit Utilization Bar</p>
              <div className="credit-bar-track" style={{ height: '5px' }}>
                <div className="credit-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span className="meta-text">$0</span>
                <span className="meta-text">${(agency.credit_limit / 1000).toFixed(0)}k limit</span>
              </div>
            </div>
          </div>

          {/* ── High risk alert ── */}
          {hasHighRisk && (
            <div
              className="anim-2"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 16px', borderRadius: 'var(--r-md)', marginBottom: '20px',
                background: 'var(--risk-collapsing-bg)',
                border: '1px solid var(--risk-collapsing-border)',
              }}
            >
              <AlertCircle style={{ width: 14, height: 14, marginTop: '1px', flexShrink: 0, color: 'var(--risk-collapsing-dot)', strokeWidth: 2 }} />
              <div>
                <p style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '2px', color: 'var(--risk-collapsing-text)' }}>
                  High risk signal detected
                </p>
                <p style={{ fontSize: '12px', color: 'var(--risk-collapsing-text)', opacity: 0.75 }}>
                  One or more agents indicate critical levels. Consider running a simulation.
                </p>
              </div>
            </div>
          )}

          {/* ── Content Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>

            {/* LEFT — Agent votes + consensus */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {consensus && (
                <div className="card anim-3">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <BarChart2 style={{ width: 13, height: 13, color: 'var(--text-muted)', strokeWidth: 1.75 }} />
                      <span className="section-title">Agent Votes</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-canvas)', border: '1px solid var(--border-faint)', padding: '2px 8px', borderRadius: 'var(--r-pill)' }}>
                      {consensus.agent_votes.length} agents
                    </span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {consensus.agent_votes.map(v => (
                        <AgentVoteBar key={v.agent_name} vote={v} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {consensus && (
                <div className="card anim-4">
                  <div className="card-header">
                    <span className="section-title">Swarm Consensus</span>
                  </div>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border-faint)' }}>
                    {[
                      { label: 'Consensus Score',    value: `${consensus.consensus_risk_score}`, unit: '/100' },
                      { label: 'Disagreement Index', value: `${(consensus.disagreement_index * 100).toFixed(0)}`, unit: '%' },
                    ].map((item, i) => (
                      <div key={i} style={{ flex: 1, padding: '16px 20px', borderRight: i === 0 ? '1px solid var(--border-faint)' : 'none' }}>
                        <p className="label" style={{ marginBottom: '8px' }}>{item.label}</p>
                        <p className="metric-md" style={{ color: 'var(--text-primary)' }}>
                          {item.value}
                          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0 }}>{item.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <p className="label" style={{ marginBottom: '8px' }}>Summary</p>
                    <p className="body-sm">{consensus.explanation_summary}</p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Simulation */}
            <div>
              <div className="card anim-5">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Play style={{ width: 13, height: 13, color: 'var(--text-muted)', strokeWidth: 1.75 }} />
                    <span className="section-title">Counterfactual Simulation</span>
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  {!simulation ? (
                    <div>
                      <p className="body-sm" style={{ marginBottom: '16px', lineHeight: 1.7 }}>
                        Model counterfactual outcomes across three intervention strategies to determine the minimum-regret action.
                      </p>
                      <button
                        onClick={handleSim}
                        disabled={simulating}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        {simulating
                          ? <><span className="spinner" style={{ width: 13, height: 13, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Running…</>
                          : <><Play style={{ width: 13, height: 13 }} />Run Simulation</>
                        }
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="rec-panel">
                        <p className="label" style={{ marginBottom: '6px' }}>Recommended action</p>
                        <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--accent-text)', letterSpacing: '-0.025em', textTransform: 'capitalize', marginBottom: '4px' }}>
                          {simulation.recommended_action.replace('_', ' ')}
                        </p>
                        <p className="meta-text">
                          Min regret:{' '}
                          <span className="font-mono" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                            ${simulation.minimum_regret.toLocaleString()}
                          </span>
                        </p>
                      </div>

                      {[
                        { action: simulation.do_nothing,    label: 'Do Nothing',    desc: 'Maintain current terms' },
                        { action: simulation.soft_contract, label: 'Soft Contract', desc: 'Moderate credit reduction' },
                        { action: simulation.credit_freeze, label: 'Credit Freeze', desc: 'Maximum risk protection' },
                      ].map(item => (
                        <SimCard
                          key={item.label}
                          label={item.label}
                          desc={item.desc}
                          action={item.action}
                          isRec={simulation.recommended_action === item.action.action_type}
                          onApply={() => handleApply(item.action.action_type)}
                          applying={applyingAction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}