import React, { useState, useEffect } from 'react';
import { useIncident } from '../../context/IncidentContext';
import { GovReasoningResult, GovInfrastructureAsset, PortalType } from '../../types';

const PRIMARY = '#a855f7';
const GLOW    = 'rgba(168,85,247,0.3)';

// ─── Config maps ───────────────────────────────────────────────────────────
const RISK_CFG: Record<string, { color: string; bg: string; border: string; pulse: boolean }> = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.5)',  pulse: true  },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.4)', pulse: false },
  MEDIUM:   { color: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.35)', pulse: false },
  LOW:      { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',  pulse: false },
};

const INFRA_ICON: Record<string, string> = {
  POWER_SUBSTATION:     '⚡',
  WATER_MAIN:           '💧',
  GAS_MAIN:             '🔥',
  ROAD_ARTERY:          '🛣️',
  COMMUNICATIONS_ASSET: '📡',
  HOSPITAL:             '🏥',
  BRIDGE:               '🌉',
  SHELTER:              '🏠',
  OTHER:                '⚠️',
};

const INFRA_COLOR: Record<string, string> = {
  POWER_SUBSTATION:     '#eab308',
  WATER_MAIN:           '#3b82f6',
  GAS_MAIN:             '#f97316',
  ROAD_ARTERY:          '#64748b',
  COMMUNICATIONS_ASSET: '#06b6d4',
  HOSPITAL:             '#ef4444',
  BRIDGE:               '#8b5cf6',
  SHELTER:              '#22c55e',
  OTHER:                '#94a3b8',
};

// ─── Main Component ────────────────────────────────────────────────────────
export const GovPortalManagement: React.FC = () => {
  const { activeIncident, updateAgencyStatus } = useIncident();
  const [notification, setNotification] = useState<string | null>(null);
  const [alertTab, setAlertTab] = useState<'english' | 'urdu'>('english');

  const status = activeIncident?.agencyStatuses[PortalType.GOVERNMENT] ?? 'Pending';
  const result = activeIncident?.agencyResults[PortalType.GOVERNMENT] as GovReasoningResult | undefined;
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;

  useEffect(() => {
    if (activeIncident && status === 'Pending') {
      setNotification(`NEW CIVIL DEFENSE INCIDENT: ${activeIncident.description}`);
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeIncident, status]);

  const handleAcknowledge = () => { updateAgencyStatus(PortalType.GOVERNMENT, 'Acknowledged'); setNotification(null); };
  const handleDispatch    = () => updateAgencyStatus(PortalType.GOVERNMENT, 'Deployed');
  const handleComplete    = () => updateAgencyStatus(PortalType.GOVERNMENT, 'Completed');

  const riskCfg = result ? (RISK_CFG[result.infrastructure_risk_level] ?? RISK_CFG.LOW) : null;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(168,85,247,0.25)' }}>
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 rounded-xl"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', boxShadow: GLOW }}>
            🏛️
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Civil Defense Command</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-0.5">
              CIVIL DEFENSE AI · Strategic Infrastructure &amp; Public Protection
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
          <h2 className="text-xl font-bold">Scanning for Civil Defense Incidents</h2>
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
              style={{ borderColor: 'rgba(168,85,247,0.3)' }}>
              <img src={activeIncident.image} alt="Incident Scene" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-mono">LIVE EVIDENCE FEED</span>
              </div>
              {result && riskCfg && (
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg font-mono text-xs font-bold ${riskCfg.pulse ? 'animate-pulse' : ''}`}
                  style={{ background: riskCfg.bg, border: `1px solid ${riskCfg.border}`, color: riskCfg.color }}>
                  INFRA RISK: {result.infrastructure_risk_level}
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {!result && (
              <div className="rounded-xl p-5 border space-y-3"
                style={{ background: 'rgba(168,85,247,0.05)', borderColor: 'rgba(168,85,247,0.2)' }}>
                <div className="flex items-center gap-2 text-sm animate-pulse" style={{ color: PRIMARY }}>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  CIVIL DEFENSE COMMAND assessing infrastructure impact...
                </div>
                {[85, 60, 92, 50, 75].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full animate-pulse"
                    style={{ width: `${w}%`, background: 'rgba(168,85,247,0.2)' }} />
                ))}
              </div>
            )}

            {result && riskCfg && (
              <>
                {/* ── Infrastructure Risk Status ── */}
                <div className="p-5 rounded-xl border-2 flex justify-between items-center"
                  style={{ background: riskCfg.bg, borderColor: riskCfg.border }}>
                  <div>
                    <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-1">Infrastructure Risk Level</p>
                    <h2 className={`text-2xl font-black ${riskCfg.pulse ? 'animate-pulse' : ''}`}
                      style={{ color: riskCfg.color }}>
                      {result.infrastructure_risk_level}
                    </h2>
                    <p className="text-white/40 text-xs font-mono mt-1">
                      {result.at_risk_infrastructure.length} asset(s) identified at risk
                    </p>
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

                {/* ── At-Risk Infrastructure ── */}
                {result.at_risk_infrastructure.length > 0 && (
                  <div className="rounded-xl p-5 border"
                    style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.2)' }}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                      At-Risk Infrastructure Assets
                    </p>
                    <div className="space-y-3">
                      {result.at_risk_infrastructure.map((asset: GovInfrastructureAsset, i) => {
                        const color = INFRA_COLOR[asset.type] ?? '#94a3b8';
                        return (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border"
                            style={{ background: `${color}08`, borderColor: `${color}30` }}>
                            <span className="text-xl flex-shrink-0">{INFRA_ICON[asset.type] ?? '⚠️'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-xs font-mono" style={{ color }}>
                                  {asset.type.replace(/_/g, ' ')}
                                </span>
                                {asset.id && (
                                  <span className="text-[10px] font-mono text-slate-500">ID: {asset.id}</span>
                                )}
                                <span className="text-[10px] font-mono text-slate-500 ml-auto">
                                  ~{asset.distance_m}m
                                </span>
                              </div>
                              <p className="text-slate-200 text-sm mt-1">{asset.action}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Evacuation Zones ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.2)' }}>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                    Evacuation Zones
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border"
                      style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Zone A — Immediate (0–500m)</span>
                      <p className="text-slate-100 text-sm mt-1">{result.evacuation_zones.zone_a_immediate}</p>
                    </div>
                    <div className="p-3 rounded-lg border"
                      style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}>
                      <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase">Zone B — Precautionary (500m–2km)</span>
                      <p className="text-slate-100 text-sm mt-1">{result.evacuation_zones.zone_b_precautionary}</p>
                    </div>
                    <div className="p-3 rounded-lg border"
                      style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.3)' }}>
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">Zone C — Shelter in Place (2–5km)</span>
                      <p className="text-slate-100 text-sm mt-1">{result.evacuation_zones.zone_c_shelter}</p>
                    </div>
                  </div>
                </div>

                {/* ── Public Alert Draft ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.2)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      Public Alert Draft
                      <span className="ml-2 text-yellow-500">⚠ Pending Human Approval</span>
                    </p>
                    <div className="flex gap-1">
                      <button onClick={() => setAlertTab('english')}
                        className="px-3 py-1 text-xs font-bold rounded transition-all"
                        style={alertTab === 'english'
                          ? { background: PRIMARY, color: '#fff' }
                          : { background: 'rgba(168,85,247,0.1)', color: '#a78bfa' }}>
                        English
                      </button>
                      <button onClick={() => setAlertTab('urdu')}
                        className="px-3 py-1 text-xs font-bold rounded transition-all"
                        style={alertTab === 'urdu'
                          ? { background: PRIMARY, color: '#fff' }
                          : { background: 'rgba(168,85,247,0.1)', color: '#a78bfa' }}>
                        اردو
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/50">
                    <p className={`text-slate-100 text-sm leading-relaxed ${alertTab === 'urdu' ? 'text-right font-[Noto_Nastaliq_Urdu,serif] text-base' : 'font-mono'}`}
                      dir={alertTab === 'urdu' ? 'rtl' : 'ltr'}>
                      {alertTab === 'english' ? result.public_alert_draft.english : result.public_alert_draft.urdu}
                    </p>
                  </div>
                </div>

                {/* ── Road Closures ── */}
                {result.road_closures_required.length > 0 && (
                  <div className="rounded-xl p-5 border"
                    style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.25)' }}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                      Road Closures Required
                    </p>
                    <div className="space-y-2">
                      {result.road_closures_required.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-red-400">🚧</span>
                          <span className="text-slate-200">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── AI Reasoning ── */}
                <div className="rounded-xl p-5 border border-slate-700 bg-slate-900/50">
                  <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">AI Strategic Reasoning</h4>
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
                  {status === 'Deployed' || status === 'Completed' ? '✓ RESOURCES DEPLOYED' : '2. ISSUE PUBLIC ALERT'}
                </button>
                <button disabled={status !== 'Deployed'} onClick={handleComplete}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={status === 'Deployed'
                    ? { background: '#16a34a', color: '#fff', boxShadow: '0 0 16px rgba(22,163,74,0.3)' }
                    : status === 'Completed'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }}>
                  {status === 'Completed' ? '✓ RECOVERY PHASE' : '3. INITIATE RECOVERY'}
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
                {result && riskCfg && (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Infra Risk</span>
                      <span className="font-bold font-mono" style={{ color: riskCfg.color }}>
                        {result.infrastructure_risk_level}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Assets at Risk</span>
                      <span className="font-bold font-mono" style={{ color: PRIMARY }}>
                        {result.at_risk_infrastructure.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Road Closures</span>
                      <span className={`font-bold font-mono ${result.road_closures_required.length > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {result.road_closures_required.length > 0 ? `${result.road_closures_required.length} required` : 'None'}
                      </span>
                    </div>
                    <div className="text-xs border-t border-slate-800 pt-3 mt-1">
                      <span className="text-slate-500 block mb-2">Recovery Estimates</span>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-[10px]">Traffic</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {result.recovery_estimates.traffic_restoration_hours
                              ? `${result.recovery_estimates.traffic_restoration_hours}h`
                              : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-[10px]">Power</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {result.recovery_estimates.power_restoration_hours
                              ? `${result.recovery_estimates.power_restoration_hours}h`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-[10px]">Full Clearance</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {result.recovery_estimates.full_site_clearance_hours
                              ? `${result.recovery_estimates.full_site_clearance_hours}h`
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resource Requests */}
                    {result.resource_requests.length > 0 && (
                      <div className="border-t border-slate-800 pt-3">
                        <span className="text-slate-500 text-[10px] block mb-2 uppercase font-mono">Resource Requests</span>
                        <div className="space-y-1.5">
                          {result.resource_requests.map((r, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span style={{ color: PRIMARY }} className="flex-shrink-0 text-xs">→</span>
                              <span className="text-slate-400 text-[10px] leading-snug">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-3">
                      <span className="text-slate-500">Media Briefing</span>
                      <span className="text-slate-400 font-mono text-[10px] text-right max-w-[60%] leading-snug">
                        {result.media_briefing_point}
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
