import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VideoInput } from '../components/VideoInput';
import { ReasoningLog } from '../components/ReasoningLog';
import { DispatchBoard } from '../components/DispatchBoard';
import { AppStatus, LogEntry, AnyReasoningResult, PortalType } from '../types';
import { detectEmergency, analyzeAllPortals } from '../services/geminiService';
import { useIncident } from '../context/IncidentContext';

export const MainDispatch: React.FC = () => {
  const { setActiveIncident, updateAgencyResult, activeIncident } = useIncident();
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const statusRef = useRef<AppStatus>(AppStatus.IDLE);
  
  const [dispatchResults, setDispatchResults] = useState<Partial<Record<PortalType, AnyReasoningResult>>>({});
  const [dispatchLoading, setDispatchLoading] = useState<Partial<Record<PortalType, boolean>>>({});
  const [isDispatchActive, setIsDispatchActive] = useState(false);
  const [detectedDescription, setDetectedDescription] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Internal status tracking to match existing logic
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const addLog = useCallback((message: string, type: LogEntry['type'], model?: LogEntry['modelUsed']) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 2 } as any),
      message,
      type,
      modelUsed: model,
    }]);
  }, []);

  const handleFrameCapture = useCallback(async (base64Image: string) => {
    if (statusRef.current !== AppStatus.MONITORING) return;

    try {
      const detection = await detectEmergency(base64Image);
      if (statusRef.current !== AppStatus.MONITORING) return;

      if (detection.isEmergency) {
        setDetectedDescription(detection.description);
        addLog(`🚨 Emergency Detected: ${detection.description}`, 'alert', 'Gemini 3 Flash');
        setStatus(AppStatus.REASONING);

        setIsDispatchActive(true);
        setDispatchResults({});
        setDispatchLoading({
          [PortalType.FIRE]: true,
          [PortalType.AMBULANCE]: true,
          [PortalType.POLICE]: true,
          [PortalType.GOVERNMENT]: true,
          [PortalType.HAZMAT]: true,
        });

        // Broadcast to Global Incident Context
        setActiveIncident({
          id: `INC-${Math.floor(Math.random() * 9000) + 1000}`,
          timestamp: new Date().toLocaleTimeString(),
          description: detection.description,
          image: `data:image/jpeg;base64,${base64Image}`,
          status: 'Active',
          agencyResults: {},
          agencyStatuses: {
            [PortalType.FIRE]: 'Pending',
            [PortalType.AMBULANCE]: 'Pending',
            [PortalType.POLICE]: 'Pending',
            [PortalType.GOVERNMENT]: 'Pending',
            [PortalType.HAZMAT]: 'Pending',
          }
        });

        await analyzeAllPortals(base64Image, (portalId, result) => {
          setDispatchLoading(prev => ({ ...prev, [portalId]: false }));
          if (result) {
            setDispatchResults(prev => ({ ...prev, [portalId]: result }));
            updateAgencyResult(portalId, result);
            addLog(`✅ ${portalId} response received`, 'success', 'Gemini 3 Pro');
          }
        });

        setStatus(AppStatus.EMERGENCY_DETECTED);
      }
    } catch (e) {
      addLog('Processing Error', 'warning');
    }
  }, [addLog, setActiveIncident, updateAgencyResult]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">CENTRAL DISPATCH CENTER</h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Global Monitoring & AI Detection</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded text-xs font-mono font-bold ${status === AppStatus.MONITORING ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            DETECTOR: {status === AppStatus.MONITORING ? 'SCANNING' : 'IDLE'}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <VideoInput 
            status={status} 
            onFrameCapture={handleFrameCapture} 
            onStatusChange={setStatus} 
          />
          
          {isDispatchActive && (
            <div className="bg-red-950/40 border border-red-700/50 p-4 rounded-xl flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <div>
                <span className="text-red-300 text-[10px] font-mono uppercase">Incident Active</span>
                <p className="text-white font-bold">{detectedDescription}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 h-full">
          <ReasoningLog logs={logs} />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <DispatchBoard 
          results={dispatchResults} 
          loading={dispatchLoading} 
          isActive={isDispatchActive} 
        />
      </div>
    </div>
  );
};
