import { getRiskColor, getRiskTextColor } from '@/lib/utils';

interface RiskBadgeProps {
  riskState: string;
  riskScore: number;
}

export default function RiskBadge({ riskState, riskScore }: RiskBadgeProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(riskState)} text-white`}>
        {riskState}
      </span>
      <span className={`text-sm font-semibold ${getRiskTextColor(riskState)}`}>
        {riskScore}/100
      </span>
    </div>
  );
}