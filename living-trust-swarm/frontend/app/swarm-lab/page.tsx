'use client';

import { useEffect, useState } from 'react';
import { getAgentVotes, getAgentWeights, updateAgentWeights, SwarmConsensus } from '@/lib/api';
import AgentVoteBar from '@/components/AgentVoteBar';
import Navbar from '@/components/Navbar';
import { Brain, Info, SlidersHorizontal, Save, RotateCcw } from 'lucide-react';

export default function SwarmLab() {
  const [selectedAgency, setSelectedAgency] = useState(1);
  const [consensus,      setConsensus]      = useState<SwarmConsensus | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [weights,        setWeights]        = useState<Record<string, number>>({});
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);

  // Load weights once on mount
  useEffect(() => {
    getAgentWeights()
      .then(setWeights)
      .catch(console.error);
  }, []);

  useEffect(() => { load(); }, [selectedAgency]);

  const load = async () => {
    setLoading(true);
    try { setConsensus(await getAgentVotes(selectedAgency)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleWeightChange = (agentName: string, value: number) => {
    setWeights(prev => ({ ...prev, [agentName]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAgentWeights(weights);
      setSaved(true);
      // Re-run evaluation so consensus reflects updated weights
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const defaults: Record<string, number> = {};
    Object.keys(weights).forEach(k => { defaults[k] = 1.0; });
    setWeights(defaults);
    setSaved(false);
    try {
      await updateAgentWeights(defaults);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const scoreColor =
    consensus && consensus.consensus_risk_score >= 70 ? 'var(--risk-collapsing-dot)' :
    consensus && consensus.consensus_risk_score >= 50 ? 'var(--risk-stressed-dot)'   :
    'var(--risk-stable-dot)';

  const disagreeColor =
    consensus && consensus.disagreement_index > 0.4 ? 'var(--risk-stressed-dot)' :
    'var(--text-primary)';

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Collective Intelligence</p>
            <h1 className="page-title">Swarm Lab</h1>
          </div>

          <select
            value={selectedAgency}
            onChange={e => setSelectedAgency(parseInt(e.target.value))}
            style={{ width: '180px' }}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i+1} value={i+1}>Travel Agency {i+1}</option>
            ))}
          </select>
        </div>

        <div className="page-content">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <div className="spinner" style={{ width: 22, height: 22 }} />
            </div>
          ) : consensus ? (
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>

              {/* LEFT — Agent votes */}
              <div className="card anim-1">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Brain style={{ width: 13, height: 13, color: 'var(--text-muted)', strokeWidth: 1.75 }} />
                    <span className="section-title">Agent Votes</span>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-faint)',
                      padding: '2px 8px',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
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

              {/* RIGHT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Consensus metrics */}
                <div className="card anim-2">
                  <div className="card-header">
                    <span className="section-title">Consensus Summary</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-faint)' }}>
                    <div style={{ padding: '16px 20px', borderRight: '1px solid var(--border-faint)' }}>
                      <p className="label" style={{ marginBottom: '8px' }}>Risk Score</p>
                      <p className="metric-md" style={{ color: scoreColor }}>
                        {consensus.consensus_risk_score}
                        <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0 }}>/100</span>
                      </p>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      <p className="label" style={{ marginBottom: '8px' }}>Disagreement</p>
                      <p className="metric-md" style={{ color: disagreeColor }}>
                        {(consensus.disagreement_index * 100).toFixed(0)}
                        <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0 }}>%</span>
                      </p>
                    </div>
                  </div>
                  <div style={{ padding: '14px 20px' }}>
                    <p className="label" style={{ marginBottom: '5px' }}>State</p>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {consensus.risk_state}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="card anim-3">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Info style={{ width: 13, height: 13, color: 'var(--text-muted)', strokeWidth: 1.75 }} />
                      <span className="section-title">Explanation</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <p className="body-sm">{consensus.explanation_summary}</p>
                  </div>
                </div>

                {/* Agent weights */}
                <div className="card anim-4">
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <SlidersHorizontal style={{ width: 13, height: 13, color: 'var(--text-muted)', strokeWidth: 1.75 }} />
                      <span className="section-title">Agent Weights</span>
                    </div>
                    <button
                      onClick={handleReset}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', color: 'var(--text-muted)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                    >
                      <RotateCcw style={{ width: 11, height: 11 }} />
                      Reset
                    </button>
                  </div>

                  <div style={{ padding: '16px 20px' }}>
                    <p className="meta-text" style={{ marginBottom: '16px' }}>
                      Adjust influence on consensus formation
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {consensus.agent_votes.map(v => {
                        const w = weights[v.agent_name] ?? 1.0;
                        return (
                          <div key={v.agent_name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                                width: '120px',
                                flexShrink: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {v.agent_name.replace('Agent', '')}
                            </span>
                            <input
                              type="range"
                              min="0.1"
                              max="2.0"
                              step="0.1"
                              value={w}
                              onChange={e => handleWeightChange(v.agent_name, parseFloat(e.target.value))}
                              style={{ flex: 1 }}
                            />
                            <span
                              className="font-mono"
                              style={{
                                fontSize: '11.5px',
                                color: w !== 1.0 ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: w !== 1.0 ? 600 : 400,
                                width: '28px',
                                textAlign: 'right',
                                flexShrink: 0,
                              }}
                            >
                              {w.toFixed(1)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Save button */}
                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      style={{
                        marginTop: '20px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 0',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid var(--border-faint)',
                        background: saved ? 'var(--bg-canvas)' : 'var(--accent)',
                        color: saved ? 'var(--text-muted)' : '#fff',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: saving || saved ? 'default' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {saving ? (
                        <div className="spinner" style={{ width: 13, height: 13 }} />
                      ) : (
                        <Save style={{ width: 12, height: 12 }} />
                      )}
                      {saved ? 'Saved — consensus updated' : saving ? 'Saving…' : 'Save & Re-evaluate'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}