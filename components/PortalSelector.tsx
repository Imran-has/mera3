import React from 'react';
import { PortalConfig } from '../types';
import { PORTAL_CONFIGS } from '../constants';

interface PortalSelectorProps {
  onSelect: (portal: PortalConfig) => void;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow centre */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            MERA<span style={{ color: '#6366f1' }}>-3</span>
          </h1>
        </div>

        <p className="text-slate-400 font-mono text-sm tracking-[0.25em] uppercase mb-2">
          Multimodal Emergency Reasoning Engine
        </p>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Select your emergency service portal to deploy a specialised AI response system tuned for your mission.
        </p>
      </div>

      {/* Portal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 w-full max-w-7xl relative z-10">
        {PORTAL_CONFIGS.map((portal) => (
          <PortalCard key={portal.id} portal={portal} onSelect={onSelect} />
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-slate-700 text-xs font-mono relative z-10">
        Powered by Gemini 3 Flash + Gemini 3 Pro • v3.0.1
      </p>
    </div>
  );
};

// ─── Individual Portal Card ────────────────────────────────────────────────
interface PortalCardProps {
  portal: PortalConfig;
  onSelect: (portal: PortalConfig) => void;
}

const PortalCard: React.FC<PortalCardProps> = ({ portal, onSelect }) => {
  const { theme } = portal;

  return (
    <button
      id={`portal-card-${portal.id.toLowerCase()}`}
      onClick={() => onSelect(portal)}
      className="group relative flex flex-col items-start text-left rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:scale-[1.03] hover:border-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 backdrop-blur-sm overflow-hidden"
      style={{
        '--glow': theme.glowColor,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 35px ${theme.glowColor}, 0 0 0 1px ${theme.primary}55`;
        (e.currentTarget as HTMLElement).style.borderColor = `${theme.primary}88`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '';
        (e.currentTarget as HTMLElement).style.borderColor = '';
      }}
    >
      {/* Top gradient stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)` }}
      />

      {/* Emoji Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${theme.primary}33, ${theme.primary}11)`,
          border: `1px solid ${theme.primary}44`,
          boxShadow: `0 0 18px ${theme.glowColor}`,
        }}
      >
        {portal.emoji}
      </div>

      {/* Portal Name */}
      <h2 className="text-white font-black text-lg leading-tight mb-1 group-hover:text-white transition-colors">
        {portal.name}
      </h2>

      {/* Callsign Badge */}
      <span
        className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded mb-3 border"
        style={{
          color: theme.primary,
          background: `${theme.primary}18`,
          borderColor: `${theme.primary}44`,
        }}
      >
        {portal.callSign}
      </span>

      {/* Subtitle */}
      <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">
        {portal.subtitle}
      </p>

      {/* Description */}
      <p className="text-slate-500 text-xs leading-relaxed flex-1">
        {portal.description}
      </p>

      {/* Activate Button */}
      <div
        className="mt-5 w-full py-2.5 rounded-lg text-center text-xs font-bold uppercase tracking-widest transition-all duration-300 group-hover:opacity-100 opacity-70"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}44, ${theme.primary}22)`,
          border: `1px solid ${theme.primary}55`,
          color: theme.primary,
        }}
      >
        Activate Portal →
      </div>
    </button>
  );
};
