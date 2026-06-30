import React, { useState } from 'react';
import { IncidentProvider, useIncident } from './context/IncidentContext';
import { MainDispatch } from './views/MainDispatch';
import { FirePortal } from './portals/FirePortal';
import { MedicalPortal } from './portals/MedicalPortal';
import { PolicePortal } from './portals/PolicePortal';
import { GovPortal } from './portals/GovPortal';
import { HazmatPortal } from './portals/HazmatPortal';
import { AlarmSystem } from './components/AlarmSystem';

const Sidebar: React.FC<{ currentView: string; setView: (v: string) => void }> = ({ currentView, setView }) => {
  const { activeIncident } = useIncident();
  
  const navItems = [
    { id: 'dispatch', label: 'Dispatch Center', icon: '📡' },
    { id: 'fire', label: 'Fire Portal', icon: '🔥' },
    { id: 'medical', label: 'Medical Portal', icon: '🚑' },
    { id: 'police', label: 'Police Portal', icon: '🚔' },
    { id: 'gov', label: 'Civil Defense', icon: '🏛️' },
    { id: 'hazmat', label: 'Hazmat Portal', icon: '⚠️' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tighter">MERA<span className="text-cyan-500">-3</span></h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Management System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-bold text-sm">{item.label}</span>
            {activeIncident && item.id !== 'dispatch' && activeIncident.agencyStatuses[item.id === 'medical' ? 'AMBULANCE' : item.id === 'gov' ? 'GOVERNMENT' : item.id.toUpperCase() as any] === 'Pending' && (
               <div className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-500 uppercase">System Online</span>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentView, setView] = useState('dispatch');

  const renderView = () => {
    switch (currentView) {
      case 'dispatch': return <MainDispatch />;
      case 'fire': return <FirePortal />;
      case 'medical': return <MedicalPortal />;
      case 'police': return <PolicePortal />;
      case 'gov': return <GovPortal />;
      case 'hazmat': return <HazmatPortal />;
      default: return <MainDispatch />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AlarmSystem />
      <Sidebar currentView={currentView} setView={setView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <IncidentProvider>
      <AppContent />
    </IncidentProvider>
  );
};

export default App;
