import React, { useState, useEffect } from 'react';
import { useIncident } from '../../context/IncidentContext';
import { FireReasoningResult, PortalType } from '../../types';

const PRIMARY = '#f97316';
const GLOW = 'rgba(249,115,22,0.35)';

// ─── Display config maps ───────────────────────────────────────────────────

const FIRE_CLASS_CONFIG: Record<string, { description: string; examples: string; color: string }> = {
  A: { description: 'Ordinary Combustibles', examples: 'Wood · Paper · Cloth · Trash', color: '#22c55e' },
  B: { description: 'Flammable Liquids', examples: 'Fuel · Oils · Solvents · Gases', color: '#f97316' },
  C: { description: 'Electrical Equipment', examples: 'Panels · Cables · Transformers', color: '#3b82f6' },
  D: { description: 'Combustible Metals', examples: 'Magnesium · Titanium · Sodium', color: '#a855f7' },
  K: { description: 'Cooking Oils & Fats', examples: 'Fryers · Commercial Kitchens', color: '#eab308' },
};

const AGENT_CONFIG: Record<string, { label: string; color: string }> = {
  WATER:         { label: 'WATER',          color: '#3b82f6' },
  FOAM:          { label: 'FOAM',           color: '#f97316' },
  CO2:           { label: 'CO₂',            color: '#8b5cf6' },
  DRY_CHEMICAL:  { label: 'DRY CHEMICAL',   color: '#eab308' },
  WET_CHEMICAL:  { label: 'WET CHEMICAL',   color: '#22c55e' },
  CLASS_D_POWDER:{ label: 'CLASS D POWDER', color: '#6b7280' },
};

const COLLAPSE_CONFIG: Record<string, { color: string; bg: string; border: string; pulse: boolean }> = {
  LOW:     { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',  pulse: false },
  MEDIUM:  { color: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.3)',  pulse: false },
  HIGH:    { color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.4)', pulse: true  },
  IMMINENT:{ color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.55)', pulse: true  },
};

const URGENCY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  LOW:     { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)'  },
  MEDIUM:  { color: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.3)'  },
  HIGH:    { color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.4)' },
  CRITICAL:{ color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.55)' },
};

// ─── Main Component ────────────────────────────────────────────────────────

export const FirePortalManagement: React.FC = () => {
  const { activeIncident, updateAgencyStatus } = useIncident();
  const [notification, setNotification] = useState<string | null>(null);

  const status = activeIncident?.agencyStatuses[PortalType.FIRE] ?? 'Pending';
  const result = activeIncident?.agencyResults[PortalType.FIRE] as FireReasoningResult | undefined;
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;

  useEffect(() => {
    if (activeIncident && status === 'Pending') {
      setNotification(`NEW FIRE INCIDENT: ${activeIncident.description}`);
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeIncident, status]);

  const handleAcknowledge = () => {
    updateAgencyStatus(PortalType.FIRE, 'Acknowledged');
    setNotification(null);
  };
  const handleDispatch  = () => updateAgencyStatus(PortalType.FIRE, 'Deployed');
  const handleComplete  = () => updateAgencyStatus(PortalType.FIRE, 'Completed');

  // ── Urgency helpers ──
  const urgCfg = result ? (URGENCY_CONFIG[result.urgency] ?? URGENCY_CONFIG.HIGH) : null;
  const colCfg = result ? (COLLAPSE_CONFIG[result.collapse_risk] ?? COLLAPSE_CONFIG.LOW) : null;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(249,115,22,0.25)' }}>
        <div className="flex items-center gap-4">
          <div
            className="text-4xl p-3 rounded-xl"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              boxShadow: GLOW,
            }}
          >
            🔥
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Fire Brigade Management</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-0.5">
              FIRE COMMAND · Thermal Dynamics &amp; Suppression
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-slate-500 text-[10px] font-mono uppercase">Unit Status</span>
          <span className="font-bold text-sm" style={{ color: PRIMARY }}>{status.toUpperCase()}</span>
        </div>
      </div>

      {/* ── Alert Banner ── */}
      {notification && (
        <div
          className="border p-4 rounded-xl flex items-center justify-between"
          style={{ background: 'rgba(220,38,38,0.12)', borderColor: 'rgba(220,38,38,0.5)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
            <span className="font-bold text-red-200 text-sm">{notification}</span>
          </div>
          <button
            onClick={handleAcknowledge}
            className="ml-4 flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            ACKNOWLEDGE
          </button>
        </div>
      )}

      {/* ── Idle State ── */}
      {!activeIncident && (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-24">
          <div className="text-6xl mb-4">📡</div>
          <h2 className="text-xl font-bold">Scanning for Fire Incidents</h2>
          <p className="text-slate-500 max-w-xs mt-2 text-sm">Awaiting broadcast from Central Dispatch Center.</p>
        </div>
      )}

      {/* ── Active Incident ── */}
      {activeIncident && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Live Feed */}
            <div
              className="relative rounded-2xl overflow-hidden border aspect-video bg-black"
              style={{ borderColor: 'rgba(249,115,22,0.3)' }}
            >
              <img src={activeIncident.image} alt="Incident Scene" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-mono">LIVE EVIDENCE FEED</span>
              </div>
              {result && urgCfg && (
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-lg font-mono text-xs font-bold"
                  style={{ background: urgCfg.bg, border: `1px solid ${urgCfg.border}`, color: urgCfg.color }}
                >
                  ⚡ {result.urgency}
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {!result && (
              <div
                className="rounded-xl p-5 border space-y-3"
                style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.2)' }}
              >
                <div className="flex items-center gap-2 text-sm animate-pulse" style={{ color: PRIMARY }}>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  FIRE COMMAND analyzing scene...
                </div>
                {[85, 60, 92, 50, 75].map((w, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded-full animate-pulse"
                    style={{ width: `${w}%`, background: 'rgba(249,115,22,0.2)' }}
                  />
                ))}
              </div>
            )}

            {result && urgCfg && colCfg && (
              <>
                {/* ── Urgency / Status Bar ── */}
                <div
                  className="p-5 rounded-xl border-2 flex justify-between items-center"
                  style={{ background: urgCfg.bg, borderColor: urgCfg.border }}
                >
                  <div>
                    <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-1">Scene Status</p>
                    <h2 className="text-2xl font-black uppercase" style={{ color: urgCfg.color }}>
                      {result.status.replace(/_/g, ' ')}
                    </h2>
                    <p className="text-white/40 text-xs font-mono mt-1">FIRE COMMAND · GEMINI PRO</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="block text-xs font-mono text-white/50 uppercase">Urgency</span>
                    <span className="block text-2xl font-black" style={{ color: urgCfg.color }}>
                      {result.urgency}
                    </span>
                    <div className="mt-2">
                      <span className="block text-[10px] text-white/40 mb-1">Confidence {confidencePercent}%</span>
                      <div className="w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${confidencePercent}%`, background: urgCfg.color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Fire Class + Suppression Agent ── */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Fire Class */}
                  <div
                    className="rounded-xl p-5 border"
                    style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.22)' }}
                  >
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Fire Classification</p>
                    {result.fire_class ? (
                      <>
                        <div
                          className="inline-block px-4 py-2 rounded-lg font-black text-xl mb-2"
                          style={{
                            background: `${FIRE_CLASS_CONFIG[result.fire_class].color}18`,
                            border: `2px solid ${FIRE_CLASS_CONFIG[result.fire_class].color}50`,
                            color: FIRE_CLASS_CONFIG[result.fire_class].color,
                          }}
                        >
                          CLASS {result.fire_class}
                        </div>
                        <p className="text-white font-bold text-sm">
                          {FIRE_CLASS_CONFIG[result.fire_class].description}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {FIRE_CLASS_CONFIG[result.fire_class].examples}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500 text-sm">Unknown — Limited Visibility</p>
                    )}
                  </div>

                  {/* Suppression Agent */}
                  <div
                    className="rounded-xl p-5 border"
                    style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.22)' }}
                  >
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Suppression Agent</p>
                    {result.suppression_agent ? (
                      <>
                        <div
                          className="inline-block px-4 py-2 rounded-lg font-black text-base mb-2"
                          style={{
                            background: `${AGENT_CONFIG[result.suppression_agent].color}18`,
                            border: `2px solid ${AGENT_CONFIG[result.suppression_agent].color}50`,
                            color: AGENT_CONFIG[result.suppression_agent].color,
                          }}
                        >
                          {AGENT_CONFIG[result.suppression_agent].label}
                        </div>
                        {result.water_prohibited && (
                          <p className="text-red-400 text-xs font-bold mt-1">🚫 WATER PROHIBITED</p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-500 text-sm">TBD — Pending Classification</p>
                    )}
                  </div>
                </div>

                {/* ── Water Prohibited Warning ── */}
                {result.water_prohibited && result.water_prohibition_reason && (
                  <div
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ background: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.45)' }}
                  >
                    <span className="text-2xl flex-shrink-0">🚫</span>
                    <div>
                      <p className="font-black text-red-300 text-sm uppercase tracking-wide">
                        Water Application Prohibited
                      </p>
                      <p className="text-red-200/80 text-sm mt-1">{result.water_prohibition_reason}</p>
                    </div>
                  </div>
                )}

                {/* ── Collapse Risk ── */}
                <div
                  className="rounded-xl p-5 border"
                  style={{ background: colCfg.bg, borderColor: colCfg.border }}
                >
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                    Structural Collapse Risk
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`inline-block px-4 py-1.5 rounded-lg font-black text-lg ${colCfg.pulse ? 'animate-pulse' : ''}`}
                        style={{
                          background: `${colCfg.color}18`,
                          border: `2px solid ${colCfg.color}45`,
                          color: colCfg.color,
                        }}
                      >
                        {result.collapse_risk}
                      </span>
                      {result.collapse_timeframe_estimate && (
                        <p className="text-slate-400 text-xs mt-2">
                          ⏱ Est. timeframe: {result.collapse_timeframe_estimate}
                        </p>
                      )}
                    </div>
                    {(result.collapse_risk === 'HIGH' || result.collapse_risk === 'IMMINENT') && (
                      <div className="text-right">
                        <p className="text-red-300 font-bold text-sm">⚠ DEFENSIVE OPS ONLY</p>
                        <p className="text-red-400/70 text-xs mt-1">No interior entry authorized</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Spread Vectors ── */}
                {result.spread_vectors.length > 0 && (
                  <div
                    className="rounded-xl p-5 border"
                    style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.22)' }}
                  >
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                      Likely Spread Vectors
                    </p>
                    <div className="space-y-2">
                      {result.spread_vectors.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="font-bold" style={{ color: PRIMARY }}>→</span>
                          <span className="text-slate-200">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Tactical Actions ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Immediate */}
                  <div
                    className="rounded-xl p-5 border"
                    style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.22)' }}
                  >
                    <h4
                      className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2"
                      style={{ color: PRIMARY }}
                    >
                      ⚡ Immediate Actions
                      <span className="text-xs text-slate-500 font-normal normal-case tracking-normal">0–2 min</span>
                    </h4>
                    <ul className="space-y-2.5">
                      {result.immediate_actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{
                              background: 'rgba(249,115,22,0.18)',
                              color: PRIMARY,
                              border: '1px solid rgba(249,115,22,0.35)',
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-slate-100 text-sm leading-snug">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Short-term */}
                  <div
                    className="rounded-xl p-5 border"
                    style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.22)' }}
                  >
                    <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2 text-slate-400">
                      🕐 Short-term Strategy
                      <span className="text-xs text-slate-600 font-normal normal-case tracking-normal">0–15 min</span>
                    </h4>
                    <ul className="space-y-2.5">
                      {result.short_term_actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2.5 opacity-80">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border border-dashed text-slate-400 border-slate-600">
                            {i + 1}
                          </span>
                          <span className="text-slate-300 text-sm leading-snug">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ── AI Reasoning ── */}
                <div className="rounded-xl p-5 border border-slate-700 bg-slate-900/50">
                  <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">AI Tactical Reasoning</h4>
                  <p
                    className="text-slate-300 font-mono text-sm leading-relaxed border-l-2 pl-3"
                    style={{ borderColor: PRIMARY }}
                  >
                    "{result.reasoning}"
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-5">

            {/* Mission Control */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-widest border-b border-slate-800 pb-2">
                Mission Control
              </h3>
              <div className="flex flex-col gap-3">
                {/* Step 1 — Acknowledge */}
                <button
                  disabled={status !== 'Pending'}
                  onClick={handleAcknowledge}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={
                    status === 'Pending'
                      ? { background: '#1e293b', color: '#fff' }
                      : { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                  }
                >
                  {status === 'Pending' ? '1. ACKNOWLEDGE INCIDENT' : '✓ ACKNOWLEDGED'}
                </button>

                {/* Step 2 — Dispatch */}
                <button
                  disabled={status !== 'Acknowledged'}
                  onClick={handleDispatch}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={
                    status === 'Acknowledged'
                      ? { background: PRIMARY, color: '#fff', boxShadow: GLOW }
                      : status === 'Pending'
                      ? { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }
                      : { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                  }
                >
                  {status === 'Deployed' || status === 'Completed'
                    ? '✓ FIRE UNITS DISPATCHED'
                    : '2. DISPATCH FIRE UNITS'}
                </button>

                {/* Step 3 — Controlled */}
                <button
                  disabled={status !== 'Deployed'}
                  onClick={handleComplete}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={
                    status === 'Deployed'
                      ? { background: '#16a34a', color: '#fff', boxShadow: '0 0 16px rgba(22,163,74,0.3)' }
                      : status === 'Completed'
                      ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                      : { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }
                  }
                >
                  {status === 'Completed' ? '✓ FIRE CONTROLLED' : '3. MARK FIRE CONTROLLED'}
                </button>
              </div>
            </div>

            {/* Field Intelligence */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-widest border-b border-slate-800 pb-2">
                Field Intelligence
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Incident ID</span>
                  <span className="text-slate-300 font-mono">{activeIncident.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Time Detected</span>
                  <span className="text-slate-300 font-mono">{activeIncident.timestamp}</span>
                </div>
                {result && (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Fire Class</span>
                      <span
                        className="font-mono font-bold"
                        style={{ color: result.fire_class ? FIRE_CLASS_CONFIG[result.fire_class].color : '#64748b' }}
                      >
                        {result.fire_class ? `CLASS ${result.fire_class}` : 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Suppression</span>
                      <span
                        className="font-mono font-bold"
                        style={{ color: result.suppression_agent ? AGENT_CONFIG[result.suppression_agent].color : '#64748b' }}
                      >
                        {result.suppression_agent ? AGENT_CONFIG[result.suppression_agent].label : 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Collapse Risk</span>
                      <span className="font-mono font-bold" style={{ color: colCfg?.color ?? PRIMARY }}>
                        {result.collapse_risk}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">AI Confidence</span>
                      <span className="text-slate-300 font-mono">{confidencePercent}%</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Coordinates</span>
                  <span className="text-slate-300 font-mono">LAT 33.6844 LON 73.0479</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
