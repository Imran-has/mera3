export enum AppStatus {
  IDLE = 'IDLE',
  MONITORING = 'MONITORING',
  EMERGENCY_DETECTED = 'EMERGENCY_DETECTED',
  REASONING = 'REASONING',
}

export enum PortalType {
  FIRE = 'FIRE',
  AMBULANCE = 'AMBULANCE',
  POLICE = 'POLICE',
  GOVERNMENT = 'GOVERNMENT',
  HAZMAT = 'HAZMAT',
}

export interface PortalConfig {
  id: PortalType;
  name: string;
  callSign: string;
  subtitle: string;
  description: string;
  emoji: string;
  primaryColor: string;
  glowColor: string;
  theme: {
    primary: string;
    glowColor: string;
  };
  detectorInstruction: string;
  reasonerInstruction: string;
}

export interface PortalDispatch {
  portalId: PortalType;
  result: ReasoningResult | null;
  isLoading: boolean;
}

export interface ReasoningResult {
  status: string;
  urgency: 'Critical' | 'High' | 'Stable';
  reasoning: string;
  immediate_actions: string[];
  short_term_actions: string[];
  notification_brief: string;
  safety_warning: string;
  confidence: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  modelUsed?: 'Gemini 3 Flash' | 'Gemini 3 Pro';
}

export interface DetectionResult {
  isEmergency: boolean;
  description: string;
}

// ─── Fire Portal — Extended Result Schema ──────────────────────────────────
export interface FireReasoningResult {
  status: 'NO_FIRE' | 'CONTAINED' | 'ACTIVE_FIRE' | 'CRITICAL';
  fire_class: 'A' | 'B' | 'C' | 'D' | 'K' | null;
  suppression_agent: 'WATER' | 'FOAM' | 'CO2' | 'DRY_CHEMICAL' | 'WET_CHEMICAL' | 'CLASS_D_POWDER' | null;
  water_prohibited: boolean;
  water_prohibition_reason: string | null;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  collapse_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMINENT';
  collapse_timeframe_estimate: string | null;
  spread_vectors: string[];
  immediate_actions: string[];
  short_term_actions: string[];
  reasoning: string;
  confidence: number; // 0.0 to 1.0
}

// ─── Medical Portal — Extended Result Schema ───────────────────────────────
export interface MedicalReasoningResult {
  mci_declared: boolean;
  visible_casualties: number;
  casualty_confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  triage: {
    red_immediate: number;
    yellow_delayed: number;
    green_minor: number;
    black_expectant: number;
  };
  priority_transport: string[];
  recommended_ams_units: number;
  recommended_als_units: number;
  staging_location: string;
  hospital_type_required: 'Level 1 Trauma Center' | 'Level 2 Trauma Center' | 'General ER' | null;
  pediatric_flag: boolean;
  immediate_actions: string[];
  reasoning: string;
  confidence: number; // 0.0 to 1.0
}

// ─── Police Portal — Extended Result Schema ────────────────────────────────
export interface PoliceReasoningResult {
  threat_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STABLE';
  scene_secure: boolean;
  active_aggressor: boolean;
  weapon_detected: 'CONFIRMED' | 'POSSIBLE' | 'NONE';
  weapon_confidence: number; // 0.0 to 1.0
  crowd_behavior: 'PANIC_DISPERSING' | 'HOSTILE_ADVANCING' | 'GATHERED' | 'LOOTING' | 'NORMAL';
  crowd_density: 'LOW' | 'MEDIUM' | 'HIGH';
  inner_cordon_radius_m: number;
  outer_cordon_radius_m: number;
  safe_access_corridor: string;
  forward_command_post: string;
  units_recommended: number;
  immediate_actions: string[];
  do_not_use_force_flag: boolean;
  reasoning: string;
  confidence: number; // 0.0 to 1.0
}

// ─── Civil Defense Portal — Extended Result Schema ─────────────────────────
export interface GovInfrastructureAsset {
  type: 'POWER_SUBSTATION' | 'WATER_MAIN' | 'GAS_MAIN' | 'ROAD_ARTERY' | 'COMMUNICATIONS_ASSET' | 'HOSPITAL' | 'BRIDGE' | 'SHELTER' | 'OTHER';
  id: string | null;
  distance_m: number;
  action: string;
}

export interface GovReasoningResult {
  infrastructure_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  at_risk_infrastructure: GovInfrastructureAsset[];
  evacuation_zones: {
    zone_a_immediate: string;
    zone_b_precautionary: string;
    zone_c_shelter: string;
  };
  public_alert_draft: {
    english: string;
    urdu: string;
  };
  road_closures_required: string[];
  resource_requests: string[];
  recovery_estimates: {
    traffic_restoration_hours: string | null;
    power_restoration_hours: string | null;
    full_site_clearance_hours: string | null;
  };
  media_briefing_point: string;
  reasoning: string;
  confidence: number; // 0.0 to 1.0
}

// ─── Hazmat Portal — Extended Result Schema ────────────────────────────────
export interface HazmatReasoningResult {
  hazmat_present: boolean;
  confidence: number;           // 0.0 to 1.0
  confidence_note: string;
  suspected_un_class: number | null;
  suspected_agent: string | null;
  cbrn_type: 'CHEMICAL_FLAMMABLE' | 'CHEMICAL_TOXIC' | 'BIOLOGICAL' | 'RADIOLOGICAL' | 'NUCLEAR' | 'UNKNOWN';
  idlh_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CONFIRMED';
  zones: {
    hot_radius_m: number;
    warm_radius_m: number;
    cold_boundary_m: number;
  };
  ppe: {
    hot_zone: string;
    warm_zone: string;
    cold_zone: string;
  };
  decon_corridor: {
    location: string;
    stations: number;
    note: string;
  };
  wind_direction: string | null;
  no_ignition_zone_m: number;
  immediate_actions: string[];
  victim_decon_required: boolean;
  ki_distribution_radius_m: number | null;
  shelter_in_place_recommended: boolean;
  evacuation_recommended: boolean;
  reasoning: string;
  confidence_score: number;     // same as confidence, for schema compliance
}

export type AnyReasoningResult = ReasoningResult | FireReasoningResult | MedicalReasoningResult | PoliceReasoningResult | GovReasoningResult | HazmatReasoningResult;