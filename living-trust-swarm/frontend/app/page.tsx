'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAgencies, Agency } from '@/lib/api';
import RiskBadge from '@/components/RiskBadge';
import Navbar from '@/components/Navbar';
import {
  CheckCircle2, Clock, AlertTriangle, ShieldAlert,
  ArrowRight, Activity, Zap, TrendingUp,
} from 'lucide-react';

/* ── Stat Card ─────────────────────────────── */
function StatCard({
  label, value, description, icon: Icon, dotColor, delay,
}: {
  label: string; value: number; description: string;
  icon: React.ElementType; dotColor: string; delay: string;
}) {
  return (
    <div
      className="stat-card"
      style={{ animationDelay: delay, opacity: 0, animation: `fadeUp 0.22s ease ${delay} both` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span className="label">{label}</span>
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
          <Icon style={{ width: 13, height: 13, color: dotColor, strokeWidth: 2 }} />
        </div>
      </div>
      <p className="metric-lg" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
        {value}
      </p>
      <p className="meta-text">{description}</p>
    </div>
  );
}

/* ── Risk Icon ── */
const riskIcon = (state: string) => {
  const base = { strokeWidth: 1.9, style: { width: 14, height: 14, flexShrink: 0 } };
  if (state === 'Stable')    return <CheckCircle2  {...base} style={{ ...base.style, color: 'var(--risk-stable-dot)' }} />;
  if (state === 'Stressed')  return <Clock         {...base} style={{ ...base.style, color: 'var(--risk-stressed-dot)' }} />;
  if (state === 'Turbulent') return <AlertTriangle {...base} style={{ ...base.style, color: 'var(--risk-turbulent-dot)' }} />;
  if (state === 'Collapsing')return <ShieldAlert   {...base} style={{ ...base.style, color: 'var(--risk-collapsing-dot)' }} />;
  return <Clock {...base} style={{ ...base.style, color: 'var(--text-muted)' }} />;
};

/* ── Credit utilization color ── */
const utilColor = (pct: number) =>
  pct > 85 ? 'var(--risk-collapsing-dot)' :
  pct > 65 ? 'var(--risk-stressed-dot)'   :
  'var(--risk-stable-dot)';

/* ── Main ───────────────────────────────────── */
export default function Dashboard() {
  const [agencies,    setAgencies]    = useState<Agency[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  useEffect(() => {
    loadAgencies();
    const cleanup = setupWebSocket();
    return cleanup;
  }, []);

  const loadAgencies = async () => {
    try { setAgencies(await getAgencies()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/live-updates');
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setLiveUpdates(prev => [...prev.slice(-9), update]);
      setAgencies(prev => prev.map(a =>
        a.id === update.agency_id
          ? { ...a, current_risk_score: update.risk_score, risk_state: update.risk_state }
          : a
      ));
    };
    ws.onerror = () => {};
    return () => ws.close();
  };

  const stats = {
    stable:     agencies.filter(a => a.risk_state === 'Stable').length,
    stressed:   agencies.filter(a => a.risk_state === 'Stressed').length,
    turbulent:  agencies.filter(a => a.risk_state === 'Turbulent').length,
    collapsing: agencies.filter(a => a.risk_state === 'Collapsing').length,
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="spinner" />
            <p className="meta-text">Loading portfolio…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Risk Portfolio</p>
            <h1 className="page-title">Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="live-badge">
              <span className="live-dot" />
              Live data
            </div>
          </div>
        </div>

        <div className="page-content">

          {/* ── Summary Stats ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <StatCard label="Stable"     value={stats.stable}     description="Operating normally"       icon={CheckCircle2}  dotColor="var(--risk-stable-dot)"     delay="0ms"   />
            <StatCard label="Stressed"   value={stats.stressed}   description="Monitor closely"          icon={Clock}         dotColor="var(--risk-stressed-dot)"   delay="40ms"  />
            <StatCard label="Turbulent"  value={stats.turbulent}  description="Action recommended"       icon={AlertTriangle} dotColor="var(--risk-turbulent-dot)"  delay="80ms"  />
            <StatCard label="Collapsing" value={stats.collapsing} description="Immediate intervention"   icon={ShieldAlert}   dotColor="var(--risk-collapsing-dot)" delay="120ms" />
          </div>

          {/* ── Live Updates ── */}
          {liveUpdates.length > 0 && (
            <div className="card anim-3" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Zap style={{ width: 13, height: 13, color: 'var(--risk-stressed-dot)', strokeWidth: 2.2 }} />
                  <span className="section-title">Live Updates</span>
                </div>
                <span
                  className="font-mono"
                  style={{ fontSize: '11px', color: 'var(--text-muted)' }}
                >
                  {liveUpdates.length} events
                </span>
              </div>
              <div className="scroll-area" style={{ maxHeight: '200px' }}>
                {liveUpdates.slice().reverse().map((u, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 20px',
                      borderBottom: '1px solid var(--border-hairline)',
                      transition: 'background var(--t-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity style={{ width: 12, height: 12, color: 'var(--text-muted)', strokeWidth: 1.75 }} />
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        Agency {u.agency_id}
                      </span>
                    </div>
                    <RiskBadge riskState={u.risk_state} riskScore={u.risk_score} size="sm" />
                    <span
                      className="font-mono"
                      style={{ fontSize: '11px', color: 'var(--text-muted)' }}
                    >
                      {new Date(u.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Agency Table ── */}
          <div className="card anim-4">
            {/* Table Header */}
            <div className="card-header">
              <h2 className="section-title">All Agencies</h2>
              <span
                className="font-mono"
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-faint)',
                  padding: '2px 8px',
                  borderRadius: 'var(--r-pill)',
                }}
              >
                {agencies.length}
              </span>
            </div>

            {/* Column headers */}
            <div
              className="table-head"
              style={{ gridTemplateColumns: '2.2fr 1.5fr 1.4fr 32px' }}
            >
              <span className="table-head-cell">Agency</span>
              <span className="table-head-cell">Credit Exposure</span>
              <span className="table-head-cell">Risk State</span>
              <span />
            </div>

            {/* Rows */}
            {agencies.map((agency) => {
              const pct = (agency.current_credit_used / agency.credit_limit) * 100;
              const barColor = utilColor(pct);

              return (
                <Link
                  key={agency.id}
                  href={`/agency/${agency.id}`}
                  className="table-row"
                  style={{ gridTemplateColumns: '2.2fr 1.5fr 1.4fr 32px' }}
                >
                  {/* Agency info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {riskIcon(agency.risk_state)}
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.012em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {agency.name}
                      </p>
                      <p
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {agency.email}
                      </p>
                    </div>
                  </div>

                  {/* Credit bar */}
                  <div style={{ paddingRight: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span
                        className="font-mono"
                        style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}
                      >
                        ${(agency.current_credit_used / 1000).toFixed(0)}k
                        <span style={{ color: 'var(--text-placeholder)' }}>
                          {' '}/ ${(agency.credit_limit / 1000).toFixed(0)}k
                        </span>
                      </span>
                      <span
                        className="font-mono"
                        style={{ fontSize: '11px', fontWeight: 600, color: barColor }}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="credit-bar-track">
                      <div
                        className="credit-bar-fill"
                        style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                      />
                    </div>
                  </div>

                  {/* Risk badge */}
                  <RiskBadge riskState={agency.risk_state} riskScore={agency.current_risk_score} />

                  {/* Arrow */}
                  <ArrowRight
                    className="group-hover:translate-x-0.5"
                    style={{
                      width: 14,
                      height: 14,
                      color: 'var(--text-placeholder)',
                      strokeWidth: 1.75,
                      transition: 'transform var(--t-base)',
                    }}
                  />
                </Link>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}