import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface ReasoningLogProps {
  logs: LogEntry[];
}

export const ReasoningLog: React.FC<ReasoningLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl h-full flex flex-col overflow-hidden">
      <div className="bg-slate-800/80 p-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-cyan-400 font-mono text-sm font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          SYSTEM_LOG
        </h3>
        <span className="text-xs text-slate-500 font-mono">v3.0.1-b</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
        {logs.length === 0 && (
          <div className="text-slate-500 text-center mt-10 italic">Waiting for stream input...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-2 items-baseline text-xs opacity-50 mb-1">
              <span className="text-cyan-600">[{log.timestamp}]</span>
              {log.modelUsed && (
                <span className="text-purple-400 uppercase tracking-wider text-[10px] border border-purple-500/30 px-1 rounded">
                  {log.modelUsed}
                </span>
              )}
            </div>
            <div className={`
              p-2 rounded border-l-2 pl-3
              ${log.type === 'info'    ? 'border-slate-500 text-slate-300' : ''}
              ${log.type === 'warning' ? 'border-amber-500 text-amber-200 bg-amber-900/10' : ''}
              ${log.type === 'alert'   ? 'border-red-500 text-red-100 bg-red-900/20 font-bold' : ''}
              ${log.type === 'success' ? 'border-emerald-500 text-emerald-300' : ''}
            `}>
              {log.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};