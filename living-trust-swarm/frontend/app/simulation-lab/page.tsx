'use client';

import { useState } from 'react';
import { runSimulation, SimulationResult } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { FlaskConical, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

/* ── Slider row ── */
function SliderRow({
  label, min, max, step = 1, value, onChange, format,
}: {
  label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
        <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 450 }}>
          {label}
        </label>
        <span
          className="font-mono"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-faint)',
            borderRadius: 'var(--r-sm)',
            padding: '2px 7px',
            minWidth: '42px',
            textAlign: 'right',
          }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--text-primary) ${pct}%, var(--border-subtle) ${pct}%)`,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{format(min)}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>{format(max)}</span>
      </div>
    </div>
  );
}

/* ── Prob bar ── */
function ProbBar({ label, value, color }: { label: string; value: number; color: string }) {
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

export default function SimulationLab() {
  const [selectedAgency, setSelectedAgency] = useState(1);
  const [simulation,     setSimulation]     = useState<SimulationResult | null>(null);
  const [loading,        setLoading]        = useState(false);

  const [signals, setSignals] = useState({
    payment_delay_days: 0,
    credit_utilization: 0,
    chargeback_ratio: 0,
    booking_spike_ratio: 0,
  });

  const run = async () => {
    setLoading(true);
    try { setSimulation(await runSimulation(selectedAgency, signals)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setSignals({ payment_delay_days: 0, credit_utilization: 0, chargeback_ratio: 0, booking_spike_ratio: 0 });
    setSimulation(null);
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Predictive Modelling</p>
            <h1 className="page-title">Simulation Lab</h1>
          </div>
        </div>

        <div className="page-content">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>

            {/* ── Controls Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Agency picker */}
              <div className="card anim-1">
                <div className="card-header">
                  <span className="section-title">Target Agency</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <select
                    value={selectedAgency}
                    onChange={e => setSelectedAgency(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={i+1}>Travel Agency {i+1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Signal modifications */}
              <div className="card anim-2">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <FlaskConical style={{ width: 13, height: 13, color: 'var(--text-muted)', strokeWidth: 1.75 }} />
                    <span className="section-title">Signal Modifications</span>
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  <p className="meta-text" style={{ marginBottom: '18px' }}>
                    Stress-test under modified conditions
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <SliderRow
                      label="Payment Delay"
                      min={0} max={60}
                      value={signals.payment_delay_days}
                      onChange={v => setSignals(s => ({ ...s, payment_delay_days: v }))}
                      format={v => `${v}d`}
                    />
                    <SliderRow
                      label="Credit Utilization"
                      min={0} max={100}
                      value={signals.credit_utilization}
                      onChange={v => setSignals(s => ({ ...s, credit_utilization: v }))}
                      format={v => `${v}%`}
                    />
                    <SliderRow
                      label="Chargeback Ratio"
                      min={0} max={10} step={0.1}
                      value={signals.chargeback_ratio}
                      onChange={v => setSignals(s => ({ ...s, chargeback_ratio: v }))}
                      format={v => `${v.toFixed(1)}%`}
                    />
                    <SliderRow
                      label="Booking Spike"
                      min={0} max={5} step={0.1}
                      value={signals.booking_spike_ratio}
                      onChange={v => setSignals(s => ({ ...s, booking_spike_ratio: v }))}
                      format={v => `${v.toFixed(1)}×`}
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderTop: '1px solid var(--border-faint)',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button onClick={run} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                    {loading
                      ? <><span className="spinner" style={{ width: 13, height: 13, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Simulating…</>
                      : <><Play style={{ width: 13, height: 13 }} />Run</>
                    }
                  </button>
                  <button onClick={reset} className="btn btn-secondary btn-icon">
                    <RotateCcw style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Results Column ── */}
            <div>
              {simulation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="anim-1">

                  {/* Recommendation banner */}
                  <div className="rec-panel">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p className="label" style={{ marginBottom: '6px' }}>Recommended action</p>
                        <p
                          style={{
                            fontSize: '20px',
                            fontWeight: 600,
                            color: 'var(--accent-text)',
                            letterSpacing: '-0.030em',
                            textTransform: 'capitalize',
                          }}
                        >
                          {simulation.recommended_action.replace('_', ' ')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="label" style={{ marginBottom: '6px' }}>Minimum regret</p>
                        <p className="metric-md" style={{ color: 'var(--text-primary)' }}>
                          ${simulation.minimum_regret.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                      { action: simulation.do_nothing,    label: 'Do Nothing',    desc: 'Maintain current terms' },
                      { action: simulation.soft_contract, label: 'Soft Contract', desc: 'Moderate credit reduction' },
                      { action: simulation.credit_freeze, label: 'Credit Freeze', desc: 'Maximum risk protection' },
                    ].map(item => {
                      const isRec = simulation.recommended_action === item.action.action_type;
                      return (
                        <div
                          key={item.label}
                          style={{
                            borderRadius: 'var(--r-lg)',
                            padding: '16px',
                            border: `1px solid ${isRec ? 'var(--accent)' : 'var(--border-faint)'}`,
                            background: 'var(--bg-surface)',
                            boxShadow: isRec ? '0 0 0 1px var(--accent-border), var(--shadow-sm)' : 'var(--shadow-card)',
                            transition: 'all var(--t-base)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.012em' }}>
                              {item.label}
                            </p>
                            {isRec && <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--accent)', strokeWidth: 2, flexShrink: 0 }} />}
                          </div>
                          <p className="meta-text" style={{ marginBottom: '14px' }}>{item.desc}</p>

                          <div className="card-inset" style={{ padding: '10px 12px', marginBottom: '14px' }}>
                            <p className="label" style={{ marginBottom: '4px' }}>Expected Loss</p>
                            <p className="metric-sm" style={{ color: 'var(--text-primary)' }}>
                              ${item.action.expected_loss.toLocaleString()}
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <ProbBar label="Collapse"  value={item.action.collapse_probability}  color="var(--risk-collapsing-dot)" />
                            <ProbBar label="Churn"     value={item.action.churn_probability}     color="var(--risk-stressed-dot)"   />
                            <ProbBar label="Recovery"  value={item.action.recovery_probability}  color="var(--risk-stable-dot)"     />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Analysis notes */}
                  <div className="card">
                    <div className="card-header">
                      <span className="section-title">Analysis Notes</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      {[
                        { label: 'Do Nothing',    text: 'Maintains current terms. Carries highest collapse risk if the agency is already in distress.' },
                        { label: 'Soft Contract', text: 'Reduces credit limit moderately. Balances risk reduction with retention. Best for early warning signals.' },
                        { label: 'Credit Freeze', text: 'Maximum loss protection but significantly increases churn risk. Reserve for imminent collapse scenarios.' },
                      ].map((n, i) => (
                        <div
                          key={n.label}
                          style={{
                            padding: '16px 20px',
                            borderRight: i < 2 ? '1px solid var(--border-faint)' : 'none',
                          }}
                        >
                          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                            {n.label}
                          </p>
                          <p className="body-sm" style={{ lineHeight: 1.65 }}>{n.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="card anim-1"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '320px',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--r-lg)',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <FlaskConical style={{ width: 18, height: 18, color: 'var(--text-muted)', strokeWidth: 1.5 }} />
                  </div>
                  <p className="section-title" style={{ marginBottom: '6px' }}>No simulation results</p>
                  <p className="meta-text" style={{ textAlign: 'center', maxWidth: '260px' }}>
                    Configure signal modifications and run a simulation to compare intervention outcomes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}