interface RiskBadgeProps {
  riskState: string;
  riskScore: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({
  riskState,
  riskScore,
  showScore = true,
  size = 'md',
}: RiskBadgeProps) {
  const cls = {
    Stable:    'risk-stable',
    Stressed:  'risk-stressed',
    Turbulent: 'risk-turbulent',
    Collapsing:'risk-collapsing',
  }[riskState] ?? 'risk-stable';

  const scoreColor = {
    Stable:    'var(--risk-stable-text)',
    Stressed:  'var(--risk-stressed-text)',
    Turbulent: 'var(--risk-turbulent-text)',
    Collapsing:'var(--risk-collapsing-text)',
  }[riskState] ?? 'var(--text-tertiary)';

  const fontSize = size === 'lg' ? '11.5px' : size === 'sm' ? '10.5px' : '11px';
  const scoreFontSize = size === 'lg' ? '13.5px' : '12px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span className={`risk-badge ${cls}`} style={{ fontSize }}>
        <span className="risk-dot" />
        {riskState}
      </span>
      {showScore && (
        <span
          className="font-mono tabular"
          style={{
            fontSize: scoreFontSize,
            fontWeight: 500,
            color: scoreColor,
            letterSpacing: '-0.02em',
          }}
        >
          {riskScore}
          <span style={{ color: 'var(--text-placeholder)', fontWeight: 400 }}>/100</span>
        </span>
      )}
    </div>
  );
}