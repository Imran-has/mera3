import React, { useState, useEffect } from 'react';
import { useIncident } from '../../context/IncidentContext';
import { MedicalReasoningResult, PortalType } from '../../types';

const PRIMARY = '#10b981';
const GLOW    = 'rgba(16,185,129,0.3)';

// ─── Triage color config ───────────────────────────────────────────────────
const TRIAGE = {
  red:    { label: 'RED',      sub: 'Immediate',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)'   },
  yellow: { label: 'YELLOW',   sub: 'Delayed',     color: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.4)'   },
  green:  { label: 'GREEN',    sub: 'Minor',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.4)'   },
  black:  { label: 'BLACK',    sub: 'Expectant',   color: '#94a3b8', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.4)' },
};

const CONFIDENCE_COLOR: Record<string, string> = {
  HIGH:   '#22c55e',
  MEDIUM: '#eab308',
  LOW:    '#ef4444',
};

const HOSPITAL_COLOR: Record<string, { color: string; bg: string }> = {
  'Level 1 Trauma Center': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  'Level 2 Trauma Center': { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  'General ER':            { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

// ─── Main Component ────────────────────────────────────────────────────────
export const MedicalPortalManagement: React.FC = () => {
  const { activeIncident, updateAgencyStatus } = useIncident();
  const [notification, setNotification] = useState<string | null>(null);

  const status = activeIncident?.agencyStatuses[PortalType.AMBULANCE] ?? 'Pending';
  const result = activeIncident?.agencyResults[PortalType.AMBULANCE] as MedicalReasoningResult | undefined;
  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;
  const totalCasualties = result
    ? result.triage.red_immediate + result.triage.yellow_delayed +
      result.triage.green_minor + result.triage.black_expectant
    : 0;

  useEffect(() => {
    if (activeIncident && status === 'Pending') {
      setNotification(`NEW MEDICAL INCIDENT: ${activeIncident.description}`);
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeIncident, status]);

  const handleAcknowledge = () => { updateAgencyStatus(PortalType.AMBULANCE, 'Acknowledged'); setNotification(null); };
  const handleDispatch    = () => updateAgencyStatus(PortalType.AMBULANCE, 'Deployed');
  const handleComplete    = () => updateAgencyStatus(PortalType.AMBULANCE, 'Completed');

  const hospitalCfg = result?.hospital_type_required
    ? HOSPITAL_COLOR[result.hospital_type_required]
    : null;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(16,185,129,0.25)' }}>
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', boxShadow: GLOW }}>
            🚑
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Medical Command</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-0.5">
              MED RESPONSE · Mass Casualty Triage &amp; Transport
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
          <h2 className="text-xl font-bold">Scanning for Medical Incidents</h2>
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
              style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <img src={activeIncident.image} alt="Incident Scene" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-mono">LIVE EVIDENCE FEED</span>
              </div>
              {result && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg font-mono text-xs font-bold"
                  style={{
                    background: result.mci_declared ? 'rgba(220,38,38,0.8)' : 'rgba(16,185,129,0.2)',
                    border: result.mci_declared ? '1px solid #dc2626' : '1px solid rgba(16,185,129,0.5)',
                    color: '#fff',
                  }}>
                  {result.mci_declared ? '⚠ MCI DECLARED' : '✓ NO MCI'}
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {!result && (
              <div className="rounded-xl p-5 border space-y-3"
                style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-2 text-sm animate-pulse" style={{ color: PRIMARY }}>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  MEDICAL COMMAND performing triage assessment...
                </div>
                {[85, 60, 92, 50, 75].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full animate-pulse"
                    style={{ width: `${w}%`, background: 'rgba(16,185,129,0.2)' }} />
                ))}
              </div>
            )}

            {result && (
              <>
                {/* ── MCI Status + Casualty Overview ── */}
                <div className="p-5 rounded-xl border-2 flex justify-between items-center"
                  style={{
                    background: result.mci_declared ? 'rgba(220,38,38,0.08)' : 'rgba(16,185,129,0.06)',
                    borderColor: result.mci_declared ? 'rgba(220,38,38,0.5)' : 'rgba(16,185,129,0.4)',
                  }}>
                  <div>
                    <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-1">Incident Classification</p>
                    <h2 className="text-2xl font-black"
                      style={{ color: result.mci_declared ? '#ef4444' : PRIMARY }}>
                      {result.mci_declared ? 'MASS CASUALTY INCIDENT' : 'STANDARD MEDICAL RESPONSE'}
                    </h2>
                    <p className="text-white/40 text-xs font-mono mt-1">
                      {result.visible_casualties} visible casualties · Confidence:{' '}
                      <span style={{ color: CONFIDENCE_COLOR[result.casualty_confidence] }}>
                        {result.casualty_confidence}
                      </span>
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

                {/* ── START Triage Board ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                    START Triage Assessment
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {/* RED */}
                    <div className="rounded-xl p-4 text-center border"
                      style={{ background: TRIAGE.red.bg, borderColor: TRIAGE.red.border }}>
                      <div className="text-3xl font-black" style={{ color: TRIAGE.red.color }}>
                        {result.triage.red_immediate}
                      </div>
                      <div className="font-black text-xs mt-1" style={{ color: TRIAGE.red.color }}>
                        {TRIAGE.red.label}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{TRIAGE.red.sub}</div>
                    </div>
                    {/* YELLOW */}
                    <div className="rounded-xl p-4 text-center border"
                      style={{ background: TRIAGE.yellow.bg, borderColor: TRIAGE.yellow.border }}>
                      <div className="text-3xl font-black" style={{ color: TRIAGE.yellow.color }}>
                        {result.triage.yellow_delayed}
                      </div>
                      <div className="font-black text-xs mt-1" style={{ color: TRIAGE.yellow.color }}>
                        {TRIAGE.yellow.label}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{TRIAGE.yellow.sub}</div>
                    </div>
                    {/* GREEN */}
                    <div className="rounded-xl p-4 text-center border"
                      style={{ background: TRIAGE.green.bg, borderColor: TRIAGE.green.border }}>
                      <div className="text-3xl font-black" style={{ color: TRIAGE.green.color }}>
                        {result.triage.green_minor}
                      </div>
                      <div className="font-black text-xs mt-1" style={{ color: TRIAGE.green.color }}>
                        {TRIAGE.green.label}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{TRIAGE.green.sub}</div>
                    </div>
                    {/* BLACK */}
                    <div className="rounded-xl p-4 text-center border"
                      style={{ background: TRIAGE.black.bg, borderColor: TRIAGE.black.border }}>
                      <div className="text-3xl font-black" style={{ color: TRIAGE.black.color }}>
                        {result.triage.black_expectant}
                      </div>
                      <div className="font-black text-xs mt-1" style={{ color: TRIAGE.black.color }}>
                        {TRIAGE.black.label}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{TRIAGE.black.sub}</div>
                    </div>
                  </div>
                  {/* Total bar */}
                  {totalCasualties > 0 && (
                    <div className="mt-4 h-2 rounded-full overflow-hidden bg-slate-800 flex">
                      {result.triage.red_immediate > 0 && (
                        <div className="h-full transition-all" style={{ width: `${(result.triage.red_immediate / totalCasualties) * 100}%`, background: TRIAGE.red.color }} />
                      )}
                      {result.triage.yellow_delayed > 0 && (
                        <div className="h-full transition-all" style={{ width: `${(result.triage.yellow_delayed / totalCasualties) * 100}%`, background: TRIAGE.yellow.color }} />
                      )}
                      {result.triage.green_minor > 0 && (
                        <div className="h-full transition-all" style={{ width: `${(result.triage.green_minor / totalCasualties) * 100}%`, background: TRIAGE.green.color }} />
                      )}
                      {result.triage.black_expectant > 0 && (
                        <div className="h-full transition-all" style={{ width: `${(result.triage.black_expectant / totalCasualties) * 100}%`, background: TRIAGE.black.color }} />
                      )}
                    </div>
                  )}
                </div>

                {/* ── Priority Transport ── */}
                {result.priority_transport.length > 0 && (
                  <div className="rounded-xl p-5 border"
                    style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.25)' }}>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                      Priority Transport Order
                    </p>
                    <div className="space-y-2.5">
                      {result.priority_transport.map((v, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs"
                            style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                            {i + 1}
                          </span>
                          <span className="text-slate-100 text-sm leading-snug">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Pediatric Flag ── */}
                {result.pediatric_flag && (
                  <div className="p-4 rounded-xl border flex items-start gap-3"
                    style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.4)' }}>
                    <span className="text-2xl flex-shrink-0">👶</span>
                    <div>
                      <p className="font-black text-yellow-300 text-sm uppercase tracking-wide">Pediatric Victim(s) Detected</p>
                      <p className="text-yellow-200/70 text-sm mt-1">
                        Age-appropriate care protocols required. Flag for pediatric-capable transport and facility routing.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Immediate Actions ── */}
                <div className="rounded-xl p-5 border"
                  style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.22)' }}>
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2"
                    style={{ color: PRIMARY }}>
                    ⚡ Immediate Actions
                    <span className="text-xs text-slate-500 font-normal normal-case tracking-normal">0–2 min</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {result.immediate_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{ background: 'rgba(16,185,129,0.18)', color: PRIMARY, border: '1px solid rgba(16,185,129,0.35)' }}>
                          {i + 1}
                        </span>
                        <span className="text-slate-100 text-sm leading-snug">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── AI Reasoning ── */}
                <div className="rounded-xl p-5 border border-slate-700 bg-slate-900/50">
                  <h4 className="text-slate-400 font-bold text-xs uppercase mb-3">AI Triage Reasoning</h4>
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
                  {status === 'Deployed' || status === 'Completed' ? '✓ UNITS DISPATCHED' : '2. DISPATCH MED UNITS'}
                </button>
                <button disabled={status !== 'Deployed'} onClick={handleComplete}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all"
                  style={status === 'Deployed'
                    ? { background: '#16a34a', color: '#fff', boxShadow: '0 0 16px rgba(22,163,74,0.3)' }
                    : status === 'Completed'
                    ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: '#0f172a', color: '#334155', border: '1px solid #1e293b', cursor: 'not-allowed' }}>
                  {status === 'Completed' ? '✓ SCENE CLEARED' : '3. MARK SCENE CLEARED'}
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
                      <span className="text-slate-500">Visible Casualties</span>
                      <span className="text-white font-bold font-mono">{result.visible_casualties}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">ALS Units Req.</span>
                      <span className="font-bold font-mono" style={{ color: PRIMARY }}>{result.recommended_als_units}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">AMS Units Req.</span>
                      <span className="font-bold font-mono" style={{ color: PRIMARY }}>{result.recommended_ams_units}</span>
                    </div>
                    {result.hospital_type_required && hospitalCfg && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Hospital Type</span>
                        <span className="font-bold font-mono text-right" style={{ color: hospitalCfg.color }}>
                          {result.hospital_type_required}
                        </span>
                      </div>
                    )}
                    <div className="text-xs border-t border-slate-800 pt-3 mt-2">
                      <span className="text-slate-500 block mb-1.5">Staging Location</span>
                      <span className="text-slate-300 font-mono leading-snug">{result.staging_location}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">AI Confidence</span>
                      <span className="text-slate-300 font-mono">{confidencePercent}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Pediatric Flag</span>
                      <span className={`font-bold font-mono ${result.pediatric_flag ? 'text-yellow-400' : 'text-slate-600'}`}>
                        {result.pediatric_flag ? 'YES ⚠' : 'NO'}
                      </span>
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
