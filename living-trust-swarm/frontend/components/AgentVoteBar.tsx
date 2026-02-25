import { AgentVote } from '@/lib/api';
import { getRiskColor } from '@/lib/utils';

interface AgentVoteBarProps {
  vote: AgentVote;
}

export default function AgentVoteBar({ vote }: AgentVoteBarProps) {
  const votePercentage = (vote.vote / 10) * 100;
  
  let barColor = 'bg-gray-500';
  if (vote.vote >= 8) barColor = 'bg-collapsing';
  else if (vote.vote >= 6) barColor = 'bg-turbulent';
  else if (vote.vote >= 4) barColor = 'bg-stressed';
  else barColor = 'bg-stable';

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{vote.agent_name}</span>
        <span className="text-sm font-bold text-gray-900">{vote.vote}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`${barColor} h-4 rounded-full transition-all duration-300`}
          style={{ width: `${votePercentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">Confidence: {(vote.confidence * 100).toFixed(0)}%</span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 w-64 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full shadow-lg">
        <p className="font-semibold mb-1">{vote.agent_name}</p>
        <p>{vote.reasoning}</p>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
      </div>
    </div>
  );
}