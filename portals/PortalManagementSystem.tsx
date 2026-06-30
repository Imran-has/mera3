import React, { useState, useEffect } from 'react';
import { useIncident } from '../context/IncidentContext';
import { PortalConfig, PortalType } from '../types';
import { AnalysisPanel } from '../components/AnalysisPanel';

interface PortalManagementSystemProps {
  portalConfig: PortalConfig;
}

export const PortalManagementSystem: React.FC<PortalManagementSystemProps> = ({ portalConfig }) => {
  const { activeIncident, updateAgencyStatus } = useIncident();
  const [notification, setNotification] = useState<string | null>(null);

  const portalId = portalConfig.id;
  const status = activeIncident?.agencyStatuses[portalId] || 'Pending';
  const result = activeIncident?.agencyResults[portalId];

  useEffect(() => {
    if (activeIncident && status === 'Pending') {
      setNotification(`NEW INCIDENT DETECTED: ${activeIncident.description}`);
      // Auto-clear notification after 10 seconds
      const timer = setTimeout(() => setNotification(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeIncident, status]);

  const handleAcknowledge = () => {
    updateAgencyStatus(portalId, 'Acknowledged');
    setNotification(null);
  };

  const handleDispatch = () => {
    updateAgencyStatus(portalId, 'Deployed');
  };

  const handleComplete = () => {
    updateAgencyStatus(portalId, 'Completed');
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-white">
      {/* Portal Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 rounded-xl" style={{ background: `${portalConfig.primaryColor}20`, border: `1px solid ${portalConfig.primaryColor}40` }}>
            {portalConfig.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{portalConfig.name} Management</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{portalConfig.callSign} • Incident Command</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-slate-500 text-[10px] font-mono uppercase">Unit Status</span>
            <span className="font-bold text-sm" style={{ color: portalConfig.primaryColor }}>{status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="bg-red-600/20 border border-red-500/50 p-4 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-red-200">{notification}</span>
          </div>
          <button 
            onClick={handleAcknowledge}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            ACKNOWLEDGE
          </button>
        </div>
      )}

      {!activeIncident ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
          <div className="text-6xl mb-4">📡</div>
          <h2 className="text-xl font-bold">Scanning for Emergencies</h2>
          <p className="text-slate-500 max-w-xs">Awaiting broadcast from Central Dispatch Center.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Live Feed / Image */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-black">
              <img src={activeIncident.image} alt="Incident" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-mono">LIVE EVIDENCE FEED</span>
              </div>
            </div>

            {/* AI Analysis Panel */}
            {result && (
              <AnalysisPanel result={result} portalConfig={portalConfig} />
            )}
          </div>

          <div className="space-y-6">
            {/* Management Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-widest border-b border-slate-800 pb-2">Mission Control</h3>
              <div className="flex flex-col gap-3">
                <button
                  disabled={status !== 'Pending'}
                  onClick={handleAcknowledge}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${status === 'Pending' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
                >
                  {status === 'Pending' ? '1. ACKNOWLEDGE INCIDENT' : '✓ ACKNOWLEDGED'}
                </button>
                <button
                  disabled={status !== 'Acknowledged'}
                  onClick={handleDispatch}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${status === 'Acknowledged' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' : status === 'Pending' ? 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
                >
                  {status === 'Deployed' || status === 'Completed' ? '✓ UNITS DISPATCHED' : '2. DISPATCH RESPONSE UNITS'}
                </button>
                <button
                  disabled={status !== 'Deployed'}
                  onClick={handleComplete}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${status === 'Deployed' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20' : status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed'}`}
                >
                  {status === 'Completed' ? '✓ MISSION COMPLETED' : '3. MARK SECURED / CLEAR'}
                </button>
              </div>
            </div>

            {/* Unit Intel */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-widest border-b border-slate-800 pb-2">Field Intelligence</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Incident ID</span>
                  <span className="text-slate-300 font-mono">{activeIncident.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Time Detected</span>
                  <span className="text-slate-300 font-mono">{activeIncident.timestamp}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Coordinates</span>
                  <span className="text-slate-300 font-mono">LAT: 33.6844 LON: 73.0479</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
