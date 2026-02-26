'use client';

import { useState } from 'react';
import { AgentVote } from '@/lib/api';

interface AgentVoteBarProps {
  vote: AgentVote;
  showTooltip?: boolean;
}

const AGENT_LABELS: Record<string, string> = {
  PaymentHistoryAgent:    'Payment History',
  CreditUtilizationAgent: 'Credit Utilization',
  BookingPatternAgent:    'Booking Patterns',
  ChargebackAgent:        'Chargeback Rate',
  MacroEconomicAgent:     'Macro Conditions',
  BehavioralAgent:        'Behavioral Signals',
  TrendAnalysisAgent:     'Trend Analysis',
};

function getRiskStyle(vote: number) {
  if (vote >= 8) return {
    bar:    'var(--risk-collapsing-dot)',
    text:   'var(--risk-collapsing-text)',
    bg:     'var(--risk-collapsing-bg)',
    border: 'var(--risk-collapsing-border)',
    label:  'High Risk',
  };
  if (vote >= 6) return {
    bar:    'var(--risk-turbulent-dot)',
    text:   'var(--risk-turbulent-text)',
    bg:     'var(--risk-turbulent-bg)',
    border: 'var(--risk-turbulent-border)',
    label:  'Elevated',
  };
  if (vote >= 4) return {
    bar:    'var(--risk-stressed-dot)',
    text:   'var(--risk-stressed-text)',
    bg:     'var(--risk-stressed-bg)',
    border: 'var(--risk-stressed-border)',
    label:  'Moderate',
  };
  return {
    bar:    'var(--risk-stable-dot)',
    text:   'var(--risk-stable-text)',
    bg:     'var(--risk-stable-bg)',
    border: 'var(--risk-stable-border)',
    label:  'Low Risk',
  };
}

export default function AgentVoteBar({ vote, showTooltip = true }: AgentVoteBarProps) {
  const [open, setOpen] = useState(false);
  const pct = (vote.vote / 10) * 100;
  const s = getRiskStyle(vote.vote);
  const label = AGENT_LABELS[vote.agent_name] ?? vote.agent_name;

  return (
    <div
      className="vote-item relative"
      onMouseEnter={() => showTooltip && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: s.bar,
              flexShrink: 0,
              display: 'block',
            }}
          />
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '-0.010em',
            }}
          >
            {label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              padding: '2px 7px',
              borderRadius: '100px',
              background: s.bg,
              border: `1px solid ${s.border}`,
              color: s.text,
            }}
          >
            {s.label}
          </span>
          <span
            className="font-mono tabular"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            {vote.vote}
            <span style={{ color: 'var(--text-placeholder)', fontWeight: 400 }}>/10</span>
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="vote-track">
        <div className="vote-fill" style={{ width: `${pct}%`, background: s.bar }} />
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
        <span
          className="font-mono"
          style={{ fontSize: '10.5px', color: 'var(--text-placeholder)' }}
        >
          {vote.agent_name}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Conf.{' '}
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {(vote.confidence * 100).toFixed(0)}%
          </span>
        </span>
      </div>

      {/* Tooltip */}
      {open && (
        <div
          className="tooltip-panel"
          style={{
            bottom: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            borderColor: s.border,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: s.bar,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {label}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {vote.reasoning}
          </p>
          <div
            className="tooltip-caret"
            style={{
              bottom: '-5px',
              left: '20px',
              borderColor: s.border,
            }}
          />
        </div>
      )}
    </div>
  );
}