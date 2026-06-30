import React from 'react';
import { PortalConfig, AnyReasoningResult, FireReasoningResult, MedicalReasoningResult, PoliceReasoningResult, GovReasoningResult, HazmatReasoningResult, PortalType } from '../types';
import { PORTAL_CONFIGS } from '../constants';

interface DispatchBoardProps {
  results: Partial<Record<PortalType, AnyReasoningResult>>;
  loading: Partial<Record<PortalType, boolean>>;
  isActive: boolean; // true when an emergency has been triggered
}

export const DispatchBoard: React.FC<DispatchBoardProps> = ({ results, loading, isActive }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`}
          />
          <h2 className="text-slate-300 font-mono font-bold text-sm uppercase tracking-[0.2em]">
            Agency Dispatch Board
          </h2>
        </div>
        <span className="text-slate-600 text-xs font-mono">
          {isActive
            ? `${Object.keys(results).length} / ${PORTAL_CONFIGS.length} agencies responded`
            : 'Awaiting emergency signal...'}
        </span>
      </div>

      {/* Portal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PORTAL_CONFIGS.map((portal) => {
          const result = results[portal.id] ?? null;
          const isLoading = loading[portal.id] ?? false;
          return (
            <PortalCard
              key={portal.id}
              portal={portal}
              result={result}
              isLoading={isLoading}
              isActive={isActive}
            />
          );
        })}
      </div>
    </div>
  );
};

// ─── Individual Portal Card ────────────────────────────────────────────────
interface PortalCardProps {
  portal: PortalConfig;
  result: AnyReasoningResult | null;
  isLoading: boolean;
  isActive: boolean;
}

const urgencyStyle = (urgency: string, primaryColor: string) => {
  switch (urgency) {
    case 'Critical':
    case 'CRITICAL':
      return { bg: 'rgba(220,38,38,0.2)', border: '#dc2626', text: '#fca5a5' };
    case 'High':
    case 'HIGH':
      return { bg: 'rgba(234,88,12,0.2)', border: '#ea580c', text: '#fdba74' };
    case 'MEDIUM':
      return { bg: 'rgba(234,179,8,0.2)', border: '#eab308', text: '#fef08a' };
    case 'LOW':
    case 'Stable':
    default:
      return { bg: `${primaryColor}18`, border: primaryColor, text: primaryColor };
  }
};

const PortalCard: React.FC<PortalCardProps> = ({ portal, result, isLoading, isActive }) => {
  const { primaryColor, glowColor } = portal;

  // ── STANDBY STATE ────────────────────────────────────────────────────────
  if (!isActive) {
    return (
      <div
        className="relative rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[200px] transition-all duration-500"
      >
        <div className="text-3xl opacity-40">{portal.emoji}</div>
        <div className="text-slate-600 font-mono text-xs font-bold uppercase tracking-widest">{portal.callSign}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span className="text-slate-700 text-[10px] font-mono uppercase tracking-wider">Standby</span>
        </div>
      </div>
    );
  }

  // ── LOADING STATE ────────────────────────────────────────────────────────
  if (isLoading && !result) {
    return (
      <div
        className="relative rounded-xl border p-4 flex flex-col gap-3 min-h-[200px] overflow-hidden"
        style={{
          borderColor: `${primaryColor}50`,
          background: `${primaryColor}08`,
          boxShadow: `0 0 20px ${glowColor}`,
        }}
      >
        {/* Animated top stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 animate-pulse"
          style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}
        />

        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{portal.emoji}</span>
          <div>
            <div className="text-white font-bold text-sm leading-tight">{portal.name}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: primaryColor }}>
              {portal.callSign}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="flex flex-col gap-2 flex-1 justify-center">
          <div className="text-center">
            <div
              className="inline-flex items-center gap-2 text-xs font-mono animate-pulse"
              style={{ color: primaryColor }}
            >
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-2 rounded-full animate-pulse"
                style={{ background: `${primaryColor}25`, width: `${70 + i * 8}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── FAILED / NULL STATE ──────────────────────────────────────────────────
  if (!result) {
    return (
      <div
        className="relative rounded-xl border border-slate-700 bg-slate-900/60 p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[200px]"
      >
        <div className="text-2xl">{portal.emoji}</div>
        <div className="text-slate-400 font-mono text-xs font-bold uppercase tracking-widest">{portal.callSign}</div>
        <div className="text-slate-600 text-xs">No response</div>
      </div>
    );
  }

  // ── RESULT STATE ─────────────────────────────────────────────────────────
  const isFireResult    = 'fire_class' in result;
  const isMedicalResult = 'mci_declared' in result;
  const isPoliceResult  = 'threat_level' in result;
  const isGovResult     = 'infrastructure_risk_level' in result;
  const isHazmatResult  = 'cbrn_type' in result;

  // Urgency: derive from portal-specific field
  const urgencyKey = isMedicalResult
    ? ((result as MedicalReasoningResult).mci_declared ? 'CRITICAL' : 'MEDIUM')
    : isPoliceResult
    ? (result as PoliceReasoningResult).threat_level
    : isGovResult
    ? (result as GovReasoningResult).infrastructure_risk_level
    : isHazmatResult
    ? ({ LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CONFIRMED: 'CRITICAL' }[(result as HazmatReasoningResult).idlh_risk] ?? 'HIGH')
    : (result as any).urgency ?? 'Stable';
  const urg = urgencyStyle(urgencyKey, primaryColor);

  // Normalize confidence: extended portals use 0.0–1.0, old ReasoningResult uses 0–100
  const isExtended = isFireResult || isMedicalResult || isPoliceResult || isGovResult || isHazmatResult;
  const confidencePercent = isExtended
    ? Math.round((result as any).confidence * 100)
    : Math.round((result as any).confidence);

  // Safety / alert text per portal type
  const safetyText = 'safety_warning' in result
    ? (result as any).safety_warning
    : isFireResult && (result as FireReasoningResult).water_prohibited
    ? `🚫 ${(result as FireReasoningResult).water_prohibition_reason || 'Water application prohibited'}`
    : isMedicalResult && (result as MedicalReasoningResult).pediatric_flag
    ? '⚠ Pediatric victim(s) detected — age-appropriate care required'
    : isPoliceResult && (result as PoliceReasoningResult).do_not_use_force_flag
    ? '🚫 DO NOT USE FORCE — Supervisor review required'
    : isGovResult && (result as GovReasoningResult).road_closures_required.length > 0
    ? `🚧 ${(result as GovReasoningResult).road_closures_required.length} road closure(s) required`
    : isHazmatResult && (result as HazmatReasoningResult).victim_decon_required
    ? '☢ DECON REQUIRED — No direct hospital transport'
    : null;

  return (
    <div
      className="relative rounded-xl border flex flex-col gap-3 p-4 min-h-[200px] animate-in fade-in slide-in-from-bottom-3 duration-500 overflow-hidden"
      style={{
        borderColor: `${primaryColor}60`,
        background: `linear-gradient(160deg, ${primaryColor}12, #0f172a 60%)`,
        boxShadow: `0 0 25px ${glowColor}, 0 0 0 1px ${primaryColor}20`,
      }}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{portal.emoji}</span>
          <div className="min-w-0">
            <div className="text-white font-black text-sm leading-tight truncate">{portal.name}</div>
            <div className="text-[9px] font-mono uppercase tracking-widest" style={{ color: primaryColor }}>
              {portal.callSign}
            </div>
          </div>
        </div>
        {/* Urgency Badge */}
        <div
          className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border"
          style={{
            background: urg.bg,
            borderColor: urg.border,
            color: urg.text,
          }}
        >
          {result.urgency.toUpperCase()}
        </div>
      </div>

      {/* Status / Scene Label */}
      <div
        className="text-xs font-bold uppercase leading-snug border-l-2 pl-2"
        style={{ color: primaryColor, borderColor: primaryColor }}
      >
        {isMedicalResult
          ? ((result as MedicalReasoningResult).mci_declared ? 'MCI DECLARED' : 'NO MCI')
          : isPoliceResult
          ? `${(result as PoliceReasoningResult).threat_level} · ${(result as PoliceReasoningResult).scene_secure ? 'SECURE' : 'UNSECURED'}`
          : isGovResult
          ? `INFRA RISK: ${(result as GovReasoningResult).infrastructure_risk_level}`
          : isHazmatResult
          ? `${(result as HazmatReasoningResult).cbrn_type.replace(/_/g, ' ')} · IDLH: ${(result as HazmatReasoningResult).idlh_risk}`
          : (result as any).status?.replace(/_/g, ' ')}
      </div>

      {/* Fire Class Badge */}
      {isFireResult && (result as FireReasoningResult).fire_class && (
        <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded w-fit"
          style={{ background: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}40` }}>
          CLASS {(result as FireReasoningResult).fire_class} •{' '}
          {(result as FireReasoningResult).suppression_agent?.replace(/_/g, ' ')}
        </div>
      )}

      {/* Police Threat Badge */}
      {isPoliceResult && (
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold flex-wrap">
          <div className="px-1.5 py-0.5 rounded"
            style={{ background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}40` }}>
            {(result as PoliceReasoningResult).crowd_behavior.replace(/_/g, ' ')}
          </div>
          <div className="px-1.5 py-0.5 rounded"
            style={{ background: (result as PoliceReasoningResult).weapon_detected === 'NONE' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.15)',
                     color: (result as PoliceReasoningResult).weapon_detected === 'NONE' ? '#22c55e' : '#f87171',
                     border: `1px solid ${(result as PoliceReasoningResult).weapon_detected === 'NONE' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.4)'}` }}>
            WPN: {(result as PoliceReasoningResult).weapon_detected}
          </div>
        </div>
      )}

      {/* Gov Infrastructure Badge */}
      {isGovResult && (
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold flex-wrap">
          <div className="px-1.5 py-0.5 rounded"
            style={{ background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}40` }}>
            {(result as GovReasoningResult).at_risk_infrastructure.length} assets at risk
          </div>
          {(result as GovReasoningResult).road_closures_required.length > 0 && (
            <div className="px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' }}>
              🚧 {(result as GovReasoningResult).road_closures_required.length} closures
            </div>
          )}
        </div>
      )}

      {/* Hazmat Zone Badge */}
      {isHazmatResult && (
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold flex-wrap">
          <div className="px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}>
            🔴 HOT {(result as HazmatReasoningResult).zones.hot_radius_m}m
          </div>
          <div className="px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(234,179,8,0.12)', color: '#fde047', border: '1px solid rgba(234,179,8,0.4)' }}>
            🟡 WARM {(result as HazmatReasoningResult).zones.warm_radius_m}m
          </div>
        </div>
      )}

      {/* Medical Triage Badge */}
      {isMedicalResult && (
        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-bold text-center">
          <div className="bg-red-900/50 border border-red-600/40 rounded px-1 py-0.5 text-red-300">
            🔴{(result as MedicalReasoningResult).triage.red_immediate}
          </div>
          <div className="bg-yellow-900/50 border border-yellow-600/40 rounded px-1 py-0.5 text-yellow-300">
            🟡{(result as MedicalReasoningResult).triage.yellow_delayed}
          </div>
          <div className="bg-green-900/50 border border-green-600/40 rounded px-1 py-0.5 text-green-300">
            🟢{(result as MedicalReasoningResult).triage.green_minor}
          </div>
          <div className="bg-slate-800 border border-slate-600/40 rounded px-1 py-0.5 text-slate-400">
            ⚫{(result as MedicalReasoningResult).triage.black_expectant}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-1.5 flex-1">
        {result.immediate_actions.slice(0, 3).map((action, idx) => (
          <div key={idx} className="flex items-start gap-1.5">
            <span
              className="flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5"
              style={{ background: `${primaryColor}25`, color: primaryColor }}
            >
              {idx + 1}
            </span>
            <span className="text-slate-300 text-[11px] leading-snug">{action}</span>
          </div>
        ))}
      </div>

      {/* Safety / Warning */}
      {safetyText && (
        <div className="bg-amber-950/40 border border-amber-700/40 rounded-lg p-2 mt-auto">
          <div className="text-amber-400 text-[9px] font-bold uppercase mb-0.5">⚠ Safety</div>
          <div className="text-amber-100 text-[10px] leading-snug">{safetyText}</div>
        </div>
      )}

      {/* Confidence Footer */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${confidencePercent}%`, background: primaryColor }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-500">{confidencePercent}%</span>
      </div>
    </div>
  );
};
