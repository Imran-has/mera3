import React from 'react';
import { ReasoningResult, PortalConfig } from '../types';

interface AnalysisPanelProps {
  result: ReasoningResult | null;
  portalConfig: PortalConfig;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, portalConfig }) => {
  if (!result) return null;

  const { theme } = portalConfig;

  const getUrgencyStyle = (u: string): React.CSSProperties => {
    switch (u) {
      case 'Critical':
        return { background: 'linear-gradient(135deg, #dc2626, #991b1b)', borderColor: '#f87171' };
      case 'High':
        return { background: 'linear-gradient(135deg, #ea580c, #9a3412)', borderColor: '#fb923c' };
      default:
        return { background: `linear-gradient(135deg, ${theme.primary}55, ${theme.primary}33)`, borderColor: theme.primary };
    }
  };

  const confidencePercent = Math.min(100, Math.max(0, result.confidence));

  return (
    <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Top Status Bar */}
      <div
        className="p-5 rounded-xl border-2 shadow-2xl flex justify-between items-center"
        style={getUrgencyStyle(result.urgency)}
      >
        <div>
          <h2 className="text-xs font-mono text-white/60 uppercase tracking-widest mb-1">Status Assessment</h2>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">{result.status}</h1>
          <p className="text-white/50 text-xs font-mono mt-1">{portalConfig.callSign}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <span className="block text-xs font-mono text-white/60 uppercase mb-1">Urgency</span>
          <span className="block text-xl font-black text-white">{result.urgency}</span>
          {/* Confidence Bar */}
          <div className="mt-2">
            <span className="block text-[10px] text-white/50 mb-1">Confidence {confidencePercent}%</span>
            <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${confidencePercent}%`, background: '#fff' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Action Plans */}
        <div className="flex flex-col gap-4">
          {/* Immediate Actions */}
          <div
            className="rounded-xl p-5 shadow-lg backdrop-blur-sm border"
            style={{
              background: `${theme.primary}08`,
              borderColor: `${theme.primary}30`,
            }}
          >
            <h4
              className="font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-sm border-b pb-2"
              style={{ color: theme.primary, borderColor: `${theme.primary}30` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Immediate Actions
            </h4>
            <ul className="space-y-3">
              {result.immediate_actions.map((cmd, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-sm border"
                    style={{
                      color: theme.primary,
                      background: `${theme.primary}18`,
                      borderColor: `${theme.primary}44`,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-slate-100 font-medium text-base leading-snug">{cmd}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Short-term Actions */}
          <div
            className="rounded-xl p-5 shadow-lg backdrop-blur-sm border"
            style={{
              background: `${theme.primary}08`,
              borderColor: `${theme.primary}30`,
            }}
          >
            <h4
              className="font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-sm border-b pb-2"
              style={{ color: theme.primary, borderColor: `${theme.primary}30` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Short-term Strategy
            </h4>
            <ul className="space-y-3">
              {result.short_term_actions.map((cmd, idx) => (
                <li key={idx} className="flex items-start gap-3 opacity-80">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-sm border border-dashed"
                    style={{
                      color: theme.primary,
                      borderColor: `${theme.primary}44`,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 font-medium text-sm leading-snug">{cmd}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reasoning & Alerts */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 shadow-lg flex-1">
            <h4 className="text-slate-400 font-bold text-xs uppercase mb-2">AI Reasoning</h4>
            <p className="text-slate-300 font-mono text-sm leading-relaxed border-l-2 border-slate-600 pl-3">
              "{result.reasoning}"
            </p>
          </div>

          <div className="bg-blue-950/40 border border-blue-600/50 rounded-xl p-5 shadow-lg">
            <h4 className="text-blue-400 font-bold text-xs uppercase mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Cross-Portal Broadcast
            </h4>
            <p className="text-blue-100 italic text-sm">"{result.notification_brief}"</p>
          </div>

          <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-5 shadow-lg">
            <h4 className="text-amber-500 font-bold text-xs uppercase mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Safety Warning
            </h4>
            <p className="text-amber-100 font-bold text-base">{result.safety_warning}</p>
          </div>
        </div>
      </div>
    </div>
  );
};