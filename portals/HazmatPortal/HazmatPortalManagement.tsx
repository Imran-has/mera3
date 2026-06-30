import React, { useState, useEffect } from 'react';
import { useIncident } from '../../context/IncidentContext';
import { HazmatReasoningResult, PortalType } from '../../types';

const PRIMARY = '#eab308';
const GLOW    = 'rgba(234,179,8,0.3)';

// ─── Config maps ───────────────────────────────────────────────────────────
const IDLH_CFG: Record<string, { color: string; bg: string; border: string; pulse: boolean }> = {
  LOW:       { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',  pulse: false },
  MEDIUM:    { color: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.35)', pulse: false },
  HIGH:      { color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.4)', pulse: true  },
  CONFIRMED: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.55)', pulse: true  },
};

const CBRN_CFG: Record<string, { label: string; color: string; icon: string }> = {
  CHEMICAL_FLAMMABLE: { label: 'Chemical — Flammable',  color: '#f97316', icon: '🔥' },
  CHEMICAL_TOXIC:     { label: 'Chemical — Toxic',      color: '#ef4444', icon: '☠️' },
  BIOLOGICAL:         { label: 'Biological',             color: '#22c55e', icon: '🦠' },
  RADIOLOGICAL:       { label: 'Radiological',           color: '#a855f7', icon: '☢️' },
  NUCLEAR:            { label: 'Nuclear',                color: '#dc2626', icon: '💥' },
  UNKNOWN:            { label: 'Unknown Hazard',         color: '#eab308', icon: '⚠️' },
};

const PPE_COLOR: Record<string, string> = {
  'Level A': '#ef4444',
  'Level B': '#f97316',
  'Level C': '#eab308',
  'Level D': '#22c55e',
};

const getPpeColor = (ppe: string): string => {
  for (const [key, color] of Object.entries(PPE_COLOR)) {
    if (ppe.startsWith(key)) return color;
  }
  return '#94a3b8';
};

// ─── Main Component ────────────────────────────────────────────────────────
export const HazmatPortalManagement: React.FC = () => {
  const { activeIncident, updateAgencyStatus } = useIncident();
  const [notification, setNotification] = useState<string | null>(null);

  const status = activeIncident?.agencyStatuses[PortalType.HAZMAT] ?? 'Pending';
  const result = activeIncident?.agencyResults[PortalType.HAZMAT] as HazmatReasoningResult | undefined;
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;

  useEffect(() => {
    if (activeIncident && status === 'Pending') {
      setNotification(`NEW HAZMAT INCIDENT: ${activeIncident.description}`);
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeIncident, status]);

  const handleAcknowledge = () => { updateAgencyStatus(PortalType.HAZMAT, 'Acknowledged'); setNotification(null); };
  const handleDispatch    = () => updateAgencyStatus(PortalType.HAZMAT, 'Deployed');
  const handleComplete    = () => updateAgencyStatus(PortalType.HAZMAT, 'Completed');

  const idlhCfg  = result ? (IDLH_CFG[result.idlh_risk] ?? IDLH_CFG.HIGH) : null;
  const cbrnCfg  = result ? (CBRN_CFG[result.cbrn_type] ?? CBRN_CFG.UNKNOWN) : null;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(234,179,8,0.25)' }}>
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 rounded-xl"
            style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', boxShadow: GLOW }}>
            ⚠️
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Hazmat Control</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-0.5">
              HAZMAT CONTROL · CBRN Specialist · Chemical, Biological, Radiological &amp; Nuclear
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
          <h2 className="text-xl font-bold">Scanning for CBRN Incidents</h2>
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
              style={{ borderColor: 'rgba(234,179,8,0.3)' }}>
              <img src={activeIncident.image} alt="Incident Scene" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-mono">LIVE EVIDENCE FEED</span>
              </div>
              {result && idlhCfg && (
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg font-mono text-xs font-bold ${idlhCfg.pulse ? 'animate-pulse' : ''}`}
                  style={{ background: idlhCfg.bg, border: `1px solid ${idlhCfg.border}`, color: idlhCfg.color }}>
                  IDLH: {result.idlh_risk}
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {!result && (
              <div className="rounded-xl p-5 border space-y-3"
                style={{ background: 'rgba(234,179,8,0.05)', borderColor: 'rgba(234,179,8,0.2)' }}>
                <div className="flex items-center gap-2 text-sm animate-pulse" style={{ color: PRIMARY }}>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  HAZMAT CONTROL performing CBRN assessment...
                </div>
                {[85, 60, 92, 50, 75].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full animate-pulse"
                    style={{ width: `${w}%`, background: 'rgba(234,179,8,0.2)' }} />
                ))}
              </div>
            )}

            {result && idlhCfg && cbrnCfg && (
              <>
                {/* ── Victim Decon Warning ── */}
                {result.victim_decon_required && (
                  <div className="p-4 rounded-xl border flex items-start gap-3 animate-pulse"
                    style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.5)' }}>
                    <span className="text-2xl flex-shrink-0">☢</span>
                    <div>
                      <p className="font-black text-yellow-300 text-sm uppercase tracking-wide">
                        Victim Decontamination Required
                      </p>
                      <p className="text-yellow-200/70 text-sm mt-1">
                        No direct hospital transport until decon is complete. Notify Medical to include decon staging before transfer.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── CBRN Type + IDLH ── */}
                <div className="p-5 rounded-xl border-2 flex justify-between items-center"
                  style={{ background: idlhCfg.bg, borderColor: idlhCfg.border }}>
                  <div>
                    <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-1">CBRN Classification</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{cbrnCfg.icon}</span>
                      <h2 className={`text-xl font-black ${idlhCfg.pulse ? 'animate-pulse' : ''}`}
                        style={{ color: cbrnCfg.color }}>
                        {cbrnCfg.label}
                      </h2>
                    </div>
                    <p className="text-white/40 text-xs font-mono">
                      {result.suspected_agent ?? 'Agent not confirmed — meter required'}
                    </p>
                    {result.suspected_un_class && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{ background: `${PRIMARY}20`, color: PRIMARY, border: `1px solid ${PRIMARY}40` }}>
                        UN CLASS {result.suspected_un_class}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="block text-xs font-mono text-white/50 uppercase">IDLH Risk</span>
                    <span className={`block text-2xl font-black ${idlhCfg.pulse ? 'animate-pulse' : ''}`}
                      style={{ color: idlhCfg.color }}>
                      {result.idlh_risk}
                    </span>
                    <div className="mt-2">
                      <span className="block text-[10px] text-white/40 mb-1">Confidence {confidencePercent}%</span>
                      <div className="w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${confidencePercent}%`, background: PRIMARY }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Confidence Note ── */}
                <div className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-900/40 text-slate-400 text-xs font-mono">
                  ⚠ {result.confidence_note}
                </div>

                {/* ── Zone Control ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(234,179,8,0.04)', borderColor: 'rgba(234,179,8,0.22)' }}>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                    CBRN Zone Control
                  </p>
                  <div className="space-y-3">
                    {/* Hot Zone */}
                    <div className="p-3 rounded-lg border flex items-center justify-between"
                      style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)' }}>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-red-400 uppercase">🔴 Hot Zone</span>
                        <p className="text-white font-bold text-sm mt-0.5">Radius: {result.zones.hot_radius_m}m</p>
                        <p className="text-red-300/70 text-xs">Immediate source — Entry prohibited without authorization</p>
                      </div>
                      <div className="text-right text-xs font-mono ml-3 flex-shrink-0"
                        style={{ color: getPpeColor(result.ppe.hot_zone) }}>
                        {result.ppe.hot_zone.split('—')[0].trim()}
                      </div>
                    </div>
                    {/* Warm Zone */}
                    <div className="p-3 rounded-lg border flex items-center justify-between"
                      style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.35)' }}>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase">🟡 Warm Zone</span>
                        <p className="text-white font-bold text-sm mt-0.5">Radius: {result.zones.warm_radius_m}m</p>
                        <p className="text-yellow-300/70 text-xs">Contamination reduction & decon corridor</p>
                      </div>
                      <div className="text-right text-xs font-mono ml-3 flex-shrink-0"
                        style={{ color: getPpeColor(result.ppe.warm_zone) }}>
                        {result.ppe.warm_zone.split('—')[0].trim()}
                      </div>
                    </div>
                    {/* Cold Zone */}
                    <div className="p-3 rounded-lg border flex items-center justify-between"
                      style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.3)' }}>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-green-400 uppercase">🟢 Cold Zone</span>
                        <p className="text-white font-bold text-sm mt-0.5">Boundary: {result.zones.cold_boundary_m}m</p>
                        <p className="text-green-300/70 text-xs">Command, staging & support area</p>
                      </div>
                      <div className="text-right text-xs font-mono ml-3 flex-shrink-0"
                        style={{ color: getPpeColor(result.ppe.cold_zone) }}>
                        {result.ppe.cold_zone.split('—')[0].trim()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── PPE Detail ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(234,179,8,0.04)', borderColor: 'rgba(234,179,8,0.22)' }}>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">PPE Requirements</p>
                  <div className="space-y-2.5">
                    {[
                      { zone: 'Hot Zone',  ppe: result.ppe.hot_zone  },
                      { zone: 'Warm Zone', ppe: result.ppe.warm_zone },
                      { zone: 'Cold Zone', ppe: result.ppe.cold_zone },
                    ].map(({ zone, ppe }) => (
                      <div key={zone} className="flex items-start gap-3">
                        <span className="flex-shrink-0 text-xs font-mono text-slate-500 w-16 pt-0.5">{zone}</span>
                        <div className="flex-1 p-2 rounded-lg text-xs"
                          style={{
                            background: `${getPpeColor(ppe)}12`,
                            border: `1px solid ${getPpeColor(ppe)}35`,
                            color: getPpeColor(ppe),
                          }}>
                          {ppe}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Decon Corridor ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(234,179,8,0.04)', borderColor: 'rgba(234,179,8,0.22)' }}>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                    Decontamination Corridor
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">Location</span>
                      <p className="text-slate-100 text-sm mt-0.5">{result.decon_corridor.location}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono block">Stations</span>
                        <span className="font-black text-xl" style={{ color: PRIMARY }}>{result.decon_corridor.stations}</span>
                      </div>
                      <div className="flex-1 p-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-300 text-xs leading-snug">
                        {result.decon_corridor.note}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Environmental & Evacuation ── */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-4 border"
                    style={{ background: 'rgba(234,179,8,0.04)', borderColor: 'rgba(234,179,8,0.22)' }}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Wind / Plume</p>
                    <p className="text-slate-100 text-sm font-mono">
                      {result.wind_direction ?? 'Unknown — assume worst direction'}
                    </p>
                    {result.no_ignition_zone_m > 0 && (
                      <p className="text-orange-400 text-xs font-bold mt-2">
                        🚫 No ignition within {result.no_ignition_zone_m}m
                      </p>
                    )}
                    {result.ki_distribution_radius_m && (
                      <p className="text-purple-400 text-xs font-bold mt-2">
                        ☢ KI distribution: {result.ki_distribution_radius_m}m radius
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl p-4 border"
                    style={{ background: 'rgba(234,179,8,0.04)', borderColor: 'rgba(234,179,8,0.22)' }}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Public Action</p>
                    {result.evacuation_recommended && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <span className="text-red-300 text-xs font-bold">EVACUATE</span>
                      </div>
                    )}
                    {result.shelter_in_place_recommended && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="text-blue-300 text-xs font-bold">SHELTER IN PLACE</span>
                      </div>
                    )}
                    {!result.evacuation_recommended && !result.shelter_in_place_recommended && (
                      <span className="text-slate-500 text-xs">No public action ordered</span>
                    )}
                  </div>
                </div>

                {/* ── Immediate Actions ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(234,179,8,0.05)', borderColor: 'rgba(234,179,8,0.22)' }}>
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2"
                    style={{ color: PRIMARY }}>
                    ⚡ Immediate Actions
                    <span className="text-xs text-slate-500 font-normal normal-case tracking-normal">0–2 min</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {result.immediate_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{ background: 'rgba(234,179,8,0.18)', color: PRIMARY, border: '1px solid rgba(234,179,8,0.35)' }}>
                          {i + 1}
                        </span>
                        <span className="text-slate-100 text-sm leading-snug">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── AI Reasoning ── */}
                <div className="rounded-xl p-5 border border-slate-700 bg-slate-900/50">
                  <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">AI CBRN Reasoning</h4>
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
                    ? { background: PRIMARY, color: '#000', boxShadow: GLOW }
                    : status === 'Pending'
                    ? { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }
                    : { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                  {status === 'Deployed' || status === 'Completed' ? '✓ HAZMAT TEAM DEPLOYED' : '2. DEPLOY HAZMAT TEAM'}
                </button>
                <button disabled={status !== 'Deployed'} onClick={handleComplete}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={status === 'Deployed'
                    ? { background: '#16a34a', color: '#fff', boxShadow: '0 0 16px rgba(22,163,74,0.3)' }
                    : status === 'Completed'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }}>
                  {status === 'Completed' ? '✓ SCENE DECONTAMINATED' : '3. MARK DECON COMPLETE'}
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
                {result && idlhCfg && cbrnCfg && (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">CBRN Type</span>
                      <span className="font-bold font-mono" style={{ color: cbrnCfg.color }}>
                        {cbrnCfg.icon} {result.cbrn_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">IDLH Risk</span>
                      <span className={`font-bold font-mono ${idlhCfg.pulse ? 'animate-pulse' : ''}`}
                        style={{ color: idlhCfg.color }}>
                        {result.idlh_risk}
                      </span>
                    </div>
                    {result.suspected_un_class && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">UN Class</span>
                        <span className="font-bold font-mono" style={{ color: PRIMARY }}>
                          CLASS {result.suspected_un_class}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Hot Zone</span>
                      <span className="text-red-400 font-mono">{result.zones.hot_radius_m}m</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Warm Zone</span>
                      <span className="text-yellow-400 font-mono">{result.zones.warm_radius_m}m</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Cold Boundary</span>
                      <span className="text-green-400 font-mono">{result.zones.cold_boundary_m}m</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">No Ignition</span>
                      <span className="text-orange-400 font-mono">{result.no_ignition_zone_m}m</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Victim Decon</span>
                      <span className={`font-bold font-mono ${result.victim_decon_required ? 'text-yellow-400' : 'text-slate-500'}`}>
                        {result.victim_decon_required ? '☢ REQUIRED' : 'NOT REQUIRED'}
                      </span>
                    </div>
                    {result.ki_distribution_radius_m && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">KI Radius</span>
                        <span className="text-purple-400 font-mono">{result.ki_distribution_radius_m}m</span>
                      </div>
                    )}
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
