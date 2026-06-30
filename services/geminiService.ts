import { GoogleGenAI, Type } from "@google/genai";
import { MODELS, DETECTOR_SYSTEM_INSTRUCTION, PORTAL_CONFIGS } from "../constants";
import { DetectionResult, ReasoningResult, FireReasoningResult, MedicalReasoningResult, PoliceReasoningResult, GovReasoningResult, HazmatReasoningResult, AnyReasoningResult, PortalConfig, PortalType } from "../types";

// Keep this untyped to avoid strict TS mismatches across @google/genai versions.
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
] as any;

/**
 * Stage 1: Fast Detection using Gemini 3 Flash (portal-agnostic)
 */
export const detectEmergency = async (base64Image: string): Promise<DetectionResult> => {
  if (!process.env.API_KEY) {
    return { isEmergency: false, description: "API_KEY not found in environment" };
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Prefer gemini-3.1-flash. If it fails, fall back to gemini-2.5-flash.
    try {
      const response = await ai.models.generateContent({
        model: MODELS.DETECTOR_PRIMARY,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Analyze this frame for emergencies." },
          ],
        },
        config: {
          systemInstruction: DETECTOR_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isEmergency: { type: Type.BOOLEAN },
              description: { type: Type.STRING },
            },
            required: ['isEmergency', 'description'],
            propertyOrdering: ['isEmergency', 'description'],
          },
          safetySettings: SAFETY_SETTINGS,
        },
      });

      const text = response.text;
      if (!text) return { isEmergency: false, description: "No text returned from API" };
      return JSON.parse(text) as DetectionResult;
    } catch {
      const response = await ai.models.generateContent({
        model: MODELS.DETECTOR_FALLBACK,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Analyze this frame for emergencies." },
          ],
        },
        config: {
          systemInstruction: DETECTOR_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isEmergency: { type: Type.BOOLEAN },
              description: { type: Type.STRING },
            },
            required: ['isEmergency', 'description'],
            propertyOrdering: ['isEmergency', 'description'],
          },
          safetySettings: SAFETY_SETTINGS,
        },
      });

      const text = response.text;
      if (!text) return { isEmergency: false, description: "No text returned from API" };
      return JSON.parse(text) as DetectionResult;
    }
  } catch (error: any) {
    console.error("Detector Error:", error);
    const msg = error?.message || error?.toString?.() || 'Unknown error';
    return { isEmergency: false, description: `API Error: ${msg.slice(0, 50)}...` };
  }
};

/**
 * Stage 2: Deep Reasoning for a SINGLE portal using Gemini 3 Pro
 */
export const analyzeEmergency = async (
  base64Image: string,
  portal: PortalConfig
): Promise<ReasoningResult | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: MODELS.REASONER,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `Emergency detected. Provide expert ${portal.name} response guidance immediately.` },
        ],
      },
      config: {
        systemInstruction: portal.reasonerInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ['Critical', 'High', 'Stable'] },
            reasoning: { type: Type.STRING },
            immediate_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            short_term_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            notification_brief: { type: Type.STRING },
            safety_warning: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["status", "urgency", "reasoning", "immediate_actions", "short_term_actions", "notification_brief", "safety_warning", "confidence"],
          propertyOrdering: ["status", "urgency", "reasoning", "immediate_actions", "short_term_actions", "notification_brief", "safety_warning", "confidence"],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Reasoner");
    return JSON.parse(text) as ReasoningResult;
  } catch (error) {
    console.error(`Reasoner Error [${portal.id}]:`, error);
    return null;
  }
};

/**
 * Stage 2 (HAZMAT): Deep Reasoning specifically for Hazmat portal — uses CBRN/zone/decon schema.
 */
export const analyzeHazmatEmergency = async (
  base64Image: string
): Promise<HazmatReasoningResult | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const hazmatPortal = PORTAL_CONFIGS.find(p => p.id === PortalType.HAZMAT)!;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.REASONER,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Emergency detected. Provide expert HAZMAT CONTROL CBRN assessment and zone guidance immediately.' },
        ],
      },
      config: {
        systemInstruction: hazmatPortal.reasonerInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hazmat_present:    { type: Type.BOOLEAN },
            confidence:        { type: Type.NUMBER },
            confidence_note:   { type: Type.STRING },
            suspected_un_class:{ type: Type.NUMBER },
            suspected_agent:   { type: Type.STRING },
            cbrn_type:         { type: Type.STRING, enum: ['CHEMICAL_FLAMMABLE','CHEMICAL_TOXIC','BIOLOGICAL','RADIOLOGICAL','NUCLEAR','UNKNOWN'] },
            idlh_risk:         { type: Type.STRING, enum: ['LOW','MEDIUM','HIGH','CONFIRMED'] },
            zones: {
              type: Type.OBJECT,
              properties: {
                hot_radius_m:    { type: Type.NUMBER },
                warm_radius_m:   { type: Type.NUMBER },
                cold_boundary_m: { type: Type.NUMBER },
              },
              required: ['hot_radius_m','warm_radius_m','cold_boundary_m'],
            },
            ppe: {
              type: Type.OBJECT,
              properties: {
                hot_zone:  { type: Type.STRING },
                warm_zone: { type: Type.STRING },
                cold_zone: { type: Type.STRING },
              },
              required: ['hot_zone','warm_zone','cold_zone'],
            },
            decon_corridor: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                stations: { type: Type.NUMBER },
                note:     { type: Type.STRING },
              },
              required: ['location','stations','note'],
            },
            wind_direction:               { type: Type.STRING },
            no_ignition_zone_m:           { type: Type.NUMBER },
            immediate_actions:            { type: Type.ARRAY, items: { type: Type.STRING } },
            victim_decon_required:        { type: Type.BOOLEAN },
            ki_distribution_radius_m:     { type: Type.NUMBER },
            shelter_in_place_recommended: { type: Type.BOOLEAN },
            evacuation_recommended:       { type: Type.BOOLEAN },
            reasoning:                    { type: Type.STRING },
            confidence_score:             { type: Type.NUMBER },
          },
          required: [
            'hazmat_present','confidence','confidence_note','cbrn_type','idlh_risk',
            'zones','ppe','decon_corridor','no_ignition_zone_m','immediate_actions',
            'victim_decon_required','shelter_in_place_recommended','evacuation_recommended',
            'reasoning','confidence_score',
          ],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Hazmat Reasoner');
    return JSON.parse(text) as HazmatReasoningResult;
  } catch (error) {
    console.error('Hazmat Reasoner Error:', error);
    return null;
  }
};

/**
 * Stage 2 (MEDICAL): Deep Reasoning specifically for Medical portal — uses MCI triage schema.
 */
export const analyzeMedicalEmergency = async (
  base64Image: string
): Promise<MedicalReasoningResult | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const medPortal = PORTAL_CONFIGS.find(p => p.id === PortalType.AMBULANCE)!;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.REASONER,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Emergency detected. Provide expert MEDICAL COMMAND triage and transport guidance immediately.' },
        ],
      },
      config: {
        systemInstruction: medPortal.reasonerInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mci_declared: { type: Type.BOOLEAN },
            visible_casualties: { type: Type.NUMBER },
            casualty_confidence: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            triage: {
              type: Type.OBJECT,
              properties: {
                red_immediate:   { type: Type.NUMBER },
                yellow_delayed:  { type: Type.NUMBER },
                green_minor:     { type: Type.NUMBER },
                black_expectant: { type: Type.NUMBER },
              },
              required: ['red_immediate', 'yellow_delayed', 'green_minor', 'black_expectant'],
            },
            priority_transport:     { type: Type.ARRAY, items: { type: Type.STRING } },
            recommended_ams_units:  { type: Type.NUMBER },
            recommended_als_units:  { type: Type.NUMBER },
            staging_location:       { type: Type.STRING },
            hospital_type_required: { type: Type.STRING, enum: ['Level 1 Trauma Center', 'Level 2 Trauma Center', 'General ER'] },
            pediatric_flag:         { type: Type.BOOLEAN },
            immediate_actions:      { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning:              { type: Type.STRING },
            confidence:             { type: Type.NUMBER },
          },
          required: [
            'mci_declared', 'visible_casualties', 'casualty_confidence', 'triage',
            'priority_transport', 'recommended_ams_units', 'recommended_als_units',
            'staging_location', 'pediatric_flag', 'immediate_actions', 'reasoning', 'confidence',
          ],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Medical Reasoner');
    return JSON.parse(text) as MedicalReasoningResult;
  } catch (error) {
    console.error('Medical Reasoner Error:', error);
    return null;
  }
};

/**
 * Stage 2 (POLICE): Deep Reasoning specifically for Police portal — uses threat/perimeter schema.
 */
export const analyzePoliceEmergency = async (
  base64Image: string
): Promise<PoliceReasoningResult | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const policePortal = PORTAL_CONFIGS.find(p => p.id === PortalType.POLICE)!;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.REASONER,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Emergency detected. Provide expert LAW ENFORCEMENT COMMAND threat assessment and perimeter guidance immediately.' },
        ],
      },
      config: {
        systemInstruction: policePortal.reasonerInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threat_level:           { type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MODERATE', 'STABLE'] },
            scene_secure:           { type: Type.BOOLEAN },
            active_aggressor:       { type: Type.BOOLEAN },
            weapon_detected:        { type: Type.STRING, enum: ['CONFIRMED', 'POSSIBLE', 'NONE'] },
            weapon_confidence:      { type: Type.NUMBER },
            crowd_behavior:         { type: Type.STRING, enum: ['PANIC_DISPERSING', 'HOSTILE_ADVANCING', 'GATHERED', 'LOOTING', 'NORMAL'] },
            crowd_density:          { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            inner_cordon_radius_m:  { type: Type.NUMBER },
            outer_cordon_radius_m:  { type: Type.NUMBER },
            safe_access_corridor:   { type: Type.STRING },
            forward_command_post:   { type: Type.STRING },
            units_recommended:      { type: Type.NUMBER },
            immediate_actions:      { type: Type.ARRAY, items: { type: Type.STRING } },
            do_not_use_force_flag:  { type: Type.BOOLEAN },
            reasoning:              { type: Type.STRING },
            confidence:             { type: Type.NUMBER },
          },
          required: [
            'threat_level', 'scene_secure', 'active_aggressor', 'weapon_detected',
            'weapon_confidence', 'crowd_behavior', 'crowd_density',
            'inner_cordon_radius_m', 'outer_cordon_radius_m',
            'safe_access_corridor', 'forward_command_post', 'units_recommended',
            'immediate_actions', 'do_not_use_force_flag', 'reasoning', 'confidence',
          ],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Police Reasoner');
    return JSON.parse(text) as PoliceReasoningResult;
  } catch (error) {
    console.error('Police Reasoner Error:', error);
    return null;
  }
};

/**
 * Stage 2 (GOV): Deep Reasoning specifically for Civil Defense portal — uses infrastructure/evacuation schema.
 */
export const analyzeGovEmergency = async (
  base64Image: string
): Promise<GovReasoningResult | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const govPortal = PORTAL_CONFIGS.find(p => p.id === PortalType.GOVERNMENT)!;

  const infrastructureItemSchema = {
    type: Type.OBJECT,
    properties: {
      type:        { type: Type.STRING, enum: ['POWER_SUBSTATION','WATER_MAIN','GAS_MAIN','ROAD_ARTERY','COMMUNICATIONS_ASSET','HOSPITAL','BRIDGE','SHELTER','OTHER'] },
      id:          { type: Type.STRING },
      distance_m:  { type: Type.NUMBER },
      action:      { type: Type.STRING },
    },
    required: ['type', 'distance_m', 'action'],
  };

  try {
    const response = await ai.models.generateContent({
      model: MODELS.REASONER,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Emergency detected. Provide expert CIVIL DEFENSE COMMAND infrastructure and evacuation guidance immediately.' },
        ],
      },
      config: {
        systemInstruction: govPortal.reasonerInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            infrastructure_risk_level: { type: Type.STRING, enum: ['LOW','MEDIUM','HIGH','CRITICAL'] },
            at_risk_infrastructure:    { type: Type.ARRAY, items: infrastructureItemSchema },
            evacuation_zones: {
              type: Type.OBJECT,
              properties: {
                zone_a_immediate:    { type: Type.STRING },
                zone_b_precautionary:{ type: Type.STRING },
                zone_c_shelter:      { type: Type.STRING },
              },
              required: ['zone_a_immediate','zone_b_precautionary','zone_c_shelter'],
            },
            public_alert_draft: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING },
                urdu:    { type: Type.STRING },
              },
              required: ['english','urdu'],
            },
            road_closures_required: { type: Type.ARRAY, items: { type: Type.STRING } },
            resource_requests:      { type: Type.ARRAY, items: { type: Type.STRING } },
            recovery_estimates: {
              type: Type.OBJECT,
              properties: {
                traffic_restoration_hours:  { type: Type.STRING },
                power_restoration_hours:    { type: Type.STRING },
                full_site_clearance_hours:  { type: Type.STRING },
              },
              required: ['traffic_restoration_hours','power_restoration_hours','full_site_clearance_hours'],
            },
            media_briefing_point: { type: Type.STRING },
            reasoning:            { type: Type.STRING },
            confidence:           { type: Type.NUMBER },
          },
          required: [
            'infrastructure_risk_level','at_risk_infrastructure','evacuation_zones',
            'public_alert_draft','road_closures_required','resource_requests',
            'recovery_estimates','media_briefing_point','reasoning','confidence',
          ],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Gov Reasoner');
    return JSON.parse(text) as GovReasoningResult;
  } catch (error) {
    console.error('Gov Reasoner Error:', error);
    return null;
  }
};

/**
 * Stage 2 (FIRE): Deep Reasoning specifically for Fire portal — uses extended schema.
 */
export const analyzeFireEmergency = async (
  base64Image: string
): Promise<FireReasoningResult | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const firePortal = PORTAL_CONFIGS.find(p => p.id === PortalType.FIRE)!;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.REASONER,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: 'Emergency detected. Provide expert FIRE COMMAND response guidance immediately.' },
        ],
      },
      config: {
        systemInstruction: firePortal.reasonerInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['NO_FIRE', 'CONTAINED', 'ACTIVE_FIRE', 'CRITICAL'] },
            fire_class: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'K'] },
            suppression_agent: { type: Type.STRING, enum: ['WATER', 'FOAM', 'CO2', 'DRY_CHEMICAL', 'WET_CHEMICAL', 'CLASS_D_POWDER'] },
            water_prohibited: { type: Type.BOOLEAN },
            water_prohibition_reason: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            collapse_risk: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'IMMINENT'] },
            collapse_timeframe_estimate: { type: Type.STRING },
            spread_vectors: { type: Type.ARRAY, items: { type: Type.STRING } },
            immediate_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            short_term_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: [
            'status', 'water_prohibited', 'urgency', 'collapse_risk',
            'spread_vectors', 'immediate_actions', 'short_term_actions',
            'reasoning', 'confidence',
          ],
        },
        safetySettings: SAFETY_SETTINGS,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Fire Reasoner');
    return JSON.parse(text) as FireReasoningResult;
  } catch (error) {
    console.error('Fire Reasoner Error:', error);
    return null;
  }
};

/**
 * Stage 2 (ALL): Dispatches 5 parallel Gemini Pro calls — one per agency portal.
 * Fire portal uses its own extended schema; others use the standard schema.
 * Calls onPortalResult as each one resolves so UI updates in real-time.
 */
export const analyzeAllPortals = async (
  base64Image: string,
  onPortalResult: (portalId: PortalType, result: AnyReasoningResult | null) => void
): Promise<void> => {
  await Promise.allSettled(
    PORTAL_CONFIGS.map(async (portal) => {
      let result: AnyReasoningResult | null;
      if (portal.id === PortalType.FIRE) {
        result = await analyzeFireEmergency(base64Image);
      } else if (portal.id === PortalType.AMBULANCE) {
        result = await analyzeMedicalEmergency(base64Image);
      } else if (portal.id === PortalType.POLICE) {
        result = await analyzePoliceEmergency(base64Image);
      } else if (portal.id === PortalType.GOVERNMENT) {
        result = await analyzeGovEmergency(base64Image);
      } else if (portal.id === PortalType.HAZMAT) {
        result = await analyzeHazmatEmergency(base64Image);
      } else {
        result = await analyzeEmergency(base64Image, portal);
      }
      onPortalResult(portal.id, result);
    })
  );
};

