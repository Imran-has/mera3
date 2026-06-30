import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PortalType, AnyReasoningResult } from '../types';

export interface Incident {
  id: string;
  timestamp: string;
  description: string;
  image: string; // base64
  status: 'Active' | 'Resolved';
  agencyResults: Partial<Record<PortalType, AnyReasoningResult>>;
  agencyStatuses: Partial<Record<PortalType, 'Acknowledged' | 'Deployed' | 'Completed' | 'Pending'>>;
}

interface IncidentContextType {
  activeIncident: Incident | null;
  incidentHistory: Incident[];
  isAlarmActive: boolean;
  setActiveIncident: (incident: Incident | null) => void;
  updateAgencyStatus: (portalId: PortalType, status: Incident['agencyStatuses'][PortalType]) => void;
  updateAgencyResult: (portalId: PortalType, result: AnyReasoningResult) => void;
  resolveIncident: () => void;
  triggerAlarm: (active: boolean) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeIncident, _setActiveIncident] = useState<Incident | null>(null);
  const [incidentHistory, setIncidentHistory] = useState<Incident[]>([]);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const setActiveIncident = useCallback((incident: Incident | null) => {
    _setActiveIncident(incident);
    if (incident) {
      setIncidentHistory(prev => [incident, ...prev]);
      setIsAlarmActive(true); // Auto-trigger alarm on new incident
    } else {
      setIsAlarmActive(false);
    }
  }, []);

  const triggerAlarm = useCallback((active: boolean) => {
    setIsAlarmActive(active);
  }, []);

  const updateAgencyStatus = useCallback((portalId: PortalType, status: Incident['agencyStatuses'][PortalType]) => {
    _setActiveIncident(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agencyStatuses: { ...prev.agencyStatuses, [portalId]: status }
      };
    });
  }, []);

  const updateAgencyResult = useCallback((portalId: PortalType, result: AnyReasoningResult) => {
    _setActiveIncident(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agencyResults: { ...prev.agencyResults, [portalId]: result }
      };
    });
  }, []);

  const resolveIncident = useCallback(() => {
    _setActiveIncident(prev => {
      if (!prev) return null;
      const resolved = { ...prev, status: 'Resolved' as const };
      return null; // For now, clearing active incident. Could also update history entry.
    });
  }, []);

  return (
    <IncidentContext.Provider value={{
      activeIncident,
      incidentHistory,
      isAlarmActive,
      setActiveIncident,
      updateAgencyStatus,
      updateAgencyResult,
      resolveIncident,
      triggerAlarm
    }}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
};
