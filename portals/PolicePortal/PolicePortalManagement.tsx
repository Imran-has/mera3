import React, { useState, useEffect } from 'react';
import { useIncident } from '../../context/IncidentContext';
import { PoliceReasoningResult, PortalType } from '../../types';

const PRIMARY = '#3b82f6';
const GLOW    = 'rgba(59,130,246,0.3)';

// ─── Threat level config ───────────────────────────────────────────────────
const THREAT_CFG: Record<string, { color: string; bg: string; border: string; pulse: boolean }> = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.5)',  pulse: true  },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.4)', pulse: true  },
  MODERATE: { color: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.35)', pulse: false },
  STABLE:   { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',  pulse: false },
};

const WEAPON_CFG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  CONFIRMED: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.5)',  label: '🔴 CONFIRMED'  },
  POSSIBLE:  { color: '#eab308', bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.4)',  label: '🟡 POSSIBLE'   },
  NONE:      { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  label: '🟢 NONE'       },
};

const CROWD_LABEL: Record<string, string> = {
  PANIC_DISPERSING:  'Panic / Dispersing',
  HOSTILE_ADVANCING: 'Hostile / Advancing',
  GATHERED:          'Gathered / Watching',
  LOOTING:           'Looting',
  NORMAL:            'Normal Movement',
};

const DENSITY_COLOR: Record<string, string> = {
  LOW:    '#22c55e',
  MEDIUM: '#eab308',
  HIGH:   '#ef4444',
};

// ─── Main Component ────────────────────────────────────────────────────────
export const PolicePortalManagement: React.FC = () => {
  const { activeIncident, updateAgencyStatus } = useIncident();
  const [notification, setNotification] = useState<string | null>(null);

  const status = activeIncident?.agencyStatuses[PortalType.POLICE] ?? 'Pending';
  const result = activeIncident?.agencyResults[PortalType.POLICE] as PoliceReasoningResult | undefined;
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;
  const weaponConfidencePercent = result ? Math.round(result.weapon_confidence * 100) : 0;

  useEffect(() => {
    if (activeIncident && status === 'Pending') {
      setNotification(`NEW LAW ENFORCEMENT INCIDENT: ${activeIncident.description}`);
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeIncident, status]);

  const handleAcknowledge = () => { updateAgencyStatus(PortalType.POLICE, 'Acknowledged'); setNotification(null); };
  const handleDispatch    = () => updateAgencyStatus(PortalType.POLICE, 'Deployed');
  const handleComplete    = () => updateAgencyStatus(PortalType.POLICE, 'Completed');

  const threatCfg  = result ? (THREAT_CFG[result.threat_level] ?? THREAT_CFG.STABLE) : null;
  const weaponCfg  = result ? (WEAPON_CFG[result.weapon_detected] ?? WEAPON_CFG.NONE) : null;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(59,130,246,0.25)' }}>
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 rounded-xl"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', boxShadow: GLOW }}>
            🚔
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Law Enforcement Command</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-0.5">
              LAW ENFORCEMENT · Threat Assessment &amp; Perimeter Control
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
        <div className="border p-4 rounded-xl flex items-center justify-between"
          style={{ background: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.5)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
            <span className="font-bold text-red-200 text-sm">{notification}</span>
          </div>
          <button onClick={handleAcknowledge}
            className="ml-4 flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors">
            ACKNOWLEDGE
          </button>
        </div>
      )}

      {/* ── Idle State ── */}
      {!activeIncident && (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-24">
          <div className="text-6xl mb-4">📡</div>
          <h2 className="text-xl font-bold">Scanning for Security Incidents</h2>
          <p className="text-slate-500 max-w-xs mt-2 text-sm">Awaiting broadcast from Central Dispatch Center.</p>
        </div>
      )}

      {/* ── Active Incident ── */}
      {activeIncident && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Live Feed */}
            <div className="relative rounded-2xl overflow-hidden border aspect-video bg-black"
              style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
              <img src={activeIncident.image} alt="Incident Scene" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-mono">LIVE EVIDENCE FEED</span>
              </div>
              {result && threatCfg && (
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg font-mono text-xs font-bold ${threatCfg.pulse ? 'animate-pulse' : ''}`}
                  style={{ background: threatCfg.bg, border: `1px solid ${threatCfg.border}`, color: threatCfg.color }}>
                  ⚡ {result.threat_level}
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {!result && (
              <div className="rounded-xl p-5 border space-y-3"
                style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
                <div className="flex items-center gap-2 text-sm animate-pulse" style={{ color: PRIMARY }}>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  LAW ENFORCEMENT COMMAND assessing scene...
                </div>
                {[85, 60, 92, 50, 75].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full animate-pulse"
                    style={{ width: `${w}%`, background: 'rgba(59,130,246,0.2)' }} />
                ))}
              </div>
            )}

            {result && threatCfg && weaponCfg && (
              <>
                {/* ── DO NOT USE FORCE Banner ── */}
                {result.do_not_use_force_flag && (
                  <div className="p-4 rounded-xl border flex items-start gap-3 animate-pulse"
                    style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.6)' }}>
                    <span className="text-2xl flex-shrink-0">🚫</span>
                    <div>
                      <p className="font-black text-red-300 text-sm uppercase tracking-wide">
                        DO NOT USE FORCE — Supervisor Review Required
                      </p>
                      <p className="text-red-200/70 text-sm mt-1">
                        Civilians or victims are in the likely line of engagement. Force escalation must be authorized by a supervisor before field relay.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Threat Level / Scene Status ── */}
                <div className="p-5 rounded-xl border-2 flex justify-between items-center"
                  style={{ background: threatCfg.bg, borderColor: threatCfg.border }}>
                  <div>
                    <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-1">Threat Assessment</p>
                    <h2 className={`text-2xl font-black ${threatCfg.pulse ? 'animate-pulse' : ''}`}
                      style={{ color: threatCfg.color }}>
                      {result.threat_level}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${result.scene_secure ? 'text-green-300 bg-green-900/40' : 'text-red-300 bg-red-900/40'}`}>
                        {result.scene_secure ? '✓ SCENE SECURE' : '✗ UNSECURED'}
                      </span>
                      {result.active_aggressor && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded font-mono text-red-300 bg-red-900/40 animate-pulse">
                          ⚠ ACTIVE AGGRESSOR
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="block text-xs font-mono text-white/50 uppercase">AI Confidence</span>
                    <span className="block text-2xl font-black" style={{ color: PRIMARY }}>{confidencePercent}%</span>
                    <div className="mt-2 w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${confidencePercent}%`, background: PRIMARY }} />
                    </div>
                  </div>
                </div>

                {/* ── Weapon + Crowd ── */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Weapon Detection */}
                  <div className="rounded-xl p-5 border"
                    style={{ background: weaponCfg.bg, borderColor: weaponCfg.border }}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                      Weapon Detection
                    </p>
                    <div className="inline-block px-4 py-2 rounded-lg font-black text-base mb-2"
                      style={{ background: `${weaponCfg.color}18`, border: `2px solid ${weaponCfg.color}50`, color: weaponCfg.color }}>
                      {weaponCfg.label}
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-500 font-mono block mb-1">
                        Visual confidence: {weaponConfidencePercent}%
                      </span>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${weaponConfidencePercent}%`, background: weaponCfg.color }} />
                      </div>
                    </div>
                  </div>

                  {/* Crowd Behavior */}
                  <div className="rounded-xl p-5 border"
                    style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.22)' }}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                      Crowd Behavior
                    </p>
                    <p className="font-black text-white text-base">{CROWD_LABEL[result.crowd_behavior]}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-500">Density:</span>
                      <span className="text-xs font-bold font-mono"
                        style={{ color: DENSITY_COLOR[result.crowd_density] }}>
                        {result.crowd_density}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Perimeter / Cordon ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.22)' }}>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                    Perimeter Control
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono mb-1">Inner Cordon</p>
                      <p className="font-black text-xl" style={{ color: PRIMARY }}>
                        {result.inner_cordon_radius_m}m
                      </p>
                      <p className="text-slate-500 text-xs">Responders only</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono mb-1">Outer Cordon</p>
                      <p className="font-black text-xl text-slate-300">
                        {result.outer_cordon_radius_m}m
                      </p>
                      <p className="text-slate-500 text-xs">Public exclusion zone</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono mb-1">Safe Access Corridor</p>
                      <p className="text-slate-200 text-sm font-mono">{result.safe_access_corridor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono mb-1">Forward Command Post</p>
                      <p className="text-slate-200 text-sm font-mono">{result.forward_command_post}</p>
                    </div>
                  </div>
                </div>

                {/* ── Immediate Actions ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.22)' }}>
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2"
                    style={{ color: PRIMARY }}>
                    ⚡ Immediate Actions
                    <span className="text-xs text-slate-500 font-normal normal-case tracking-normal">0–2 min</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {result.immediate_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{ background: 'rgba(59,130,246,0.18)', color: PRIMARY, border: '1px solid rgba(59,130,246,0.35)' }}>
                          {i + 1}
                        </span>
                        <span className="text-slate-100 text-sm leading-snug">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── AI Reasoning ── */}
                <div className="rounded-xl p-5 border border-slate-700 bg-slate-900/50">
                  <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">AI Tactical Reasoning</h4>
                  <p className="text-slate-300 font-mono text-sm leading-relaxed border-l-2 pl-3"
                    style={{ borderColor: PRIMARY }}>
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
                <button disabled={status !== 'Pending'} onClick={handleAcknowledge}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={status === 'Pending'
                    ? { background: '#1e293b', color: '#fff' }
                    : { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                  {status === 'Pending' ? '1. ACKNOWLEDGE INCIDENT' : '✓ ACKNOWLEDGED'}
                </button>
                <button disabled={status !== 'Acknowledged'} onClick={handleDispatch}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={status === 'Acknowledged'
                    ? { background: PRIMARY, color: '#fff', boxShadow: GLOW }
                    : status === 'Pending'
                    ? { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }
                    : { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                  {status === 'Deployed' || status === 'Completed' ? '✓ UNITS DEPLOYED' : '2. DEPLOY UNITS'}
                </button>
                <button disabled={status !== 'Deployed'} onClick={handleComplete}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={status === 'Deployed'
                    ? { background: '#16a34a', color: '#fff', boxShadow: '0 0 16px rgba(22,163,74,0.3)' }
                    : status === 'Completed'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }}>
                  {status === 'Completed' ? '✓ SCENE SECURED' : '3. MARK SCENE SECURED'}
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
                      <span className="text-slate-500">Threat Level</span>
                      <span className="font-bold font-mono" style={{ color: threatCfg?.color ?? PRIMARY }}>
                        {result.threat_level}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Active Aggressor</span>
                      <span className={`font-bold font-mono ${result.active_aggressor ? 'text-red-400' : 'text-slate-500'}`}>
                        {result.active_aggressor ? 'YES ⚠' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Weapon Status</span>
                      <span className="font-bold font-mono" style={{ color: weaponCfg?.color ?? PRIMARY }}>
                        {result.weapon_detected}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Units Required</span>
                      <span className="font-bold font-mono" style={{ color: PRIMARY }}>{result.units_recommended}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Inner Cordon</span>
                      <span className="text-slate-300 font-mono">{result.inner_cordon_radius_m}m</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Outer Cordon</span>
                      <span className="text-slate-300 font-mono">{result.outer_cordon_radius_m}m</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Force Flag</span>
                      <span className={`font-bold font-mono ${result.do_not_use_force_flag ? 'text-red-400' : 'text-slate-500'}`}>
                        {result.do_not_use_force_flag ? '🚫 RESTRICTED' : 'CLEAR'}
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
