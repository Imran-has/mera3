<div align="center">
<img width="1200" height="475" alt="MERA-3 Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# MERA-3: Multi-Agency Emergency Response Engine
**Unified AI Intelligence for Simultaneous First Responder Coordination**

[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue.svg)](https://deepmind.google/technologies/gemini/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
</div>

---

## 📖 Executive Summary
**MERA-3** (Multi-Agency Emergency Response Engine) is a next-generation dispatch intelligence system designed to eliminate the "communication lag" inherent in traditional emergency response. When a major incident occurs, every second lost to manual cross-agency briefing costs lives. 

MERA-3 solves this by acting as a **centralized visual cortex**. It takes a single visual feed and instantly generates five parallel, expert-level tactical plans—one for each responding agency—simultaneously.

---

## 🎯 Product Scope
MERA-3 is designed for high-stakes environments such as:
- **Smart City Operations Centers**: Integrating with CCTV networks for automated incident detection.
- **Industrial & Chemical Plants**: Monitoring for leaks, fires, or structural failures.
- **Public Safety Command Centers**: Providing rapid triage during mass casualty events or public unrest.
- **Remote Monitoring**: Enabling high-level expert analysis in areas where senior human dispatchers may not be immediately available.

### Core Objectives:
1.  **Eliminate Information Silos**: Ensure all agencies operate from the same visual ground truth.
2.  **Accelerate Tactical Planning**: Move from "Detection" to "Actionable Intel" in under 5 seconds.
3.  **Expert Persona Injection**: Provide specialized guidance (e.g., START Triage, Hazmat PPE levels) that usually requires years of training.

---

## ⚙️ How the System Works: The Dual-Model Pipeline
MERA-3 utilizes a sophisticated **two-stage AI pipeline** to balance cost-efficiency, speed, and analytical depth.

### Stage 1: The "Visual Cortex" (Gemini 3.1 Flash)
*   **Action**: Continuous, low-latency monitoring.
*   **Logic**: A lightweight model scans the live video feed every few seconds. Its only job is to detect if an emergency is occurring.
*   **Output**: A binary "Yes/No" flag with a brief description. This ensures the heavy-duty reasoning models only run when absolutely necessary, saving API costs and processing power.

### Stage 2: The "Tactical Brains" (Gemini 3 Pro)
*   **Action**: Parallel Deep Reasoning.
*   **Logic**: Upon a positive detection, MERA-3 triggers **5 simultaneous API calls**. Each call uses a unique "System Instruction" that forces the AI into a specific expert persona.
*   **Output**: Five structured JSON objects containing status, urgency, reasoning, and immediate/short-term tactical steps.

---

## 🏢 Portal Deep Dives: The Five Agencies
Each portal in MERA-3 represents a specialized command center. They all see the same image, but "think" completely differently.

### 🔥 FIRE COMMAND (Fire Brigade)
*   **Perspective**: Thermal dynamics, suppression agents, and containment.
*   **Specialized Logic**:
    *   **Fire Classification**: Automatically identifies Class A (Solids), B (Liquids), C (Electrical), D (Metals), or K (Kitchen).
    *   **Suppression Intelligence**: Dictates whether to use water, CO2, foam, or dry chemicals based on the visual context.
*   **Primary Goal**: Prevent structural collapse and uncontrolled spread.

### 🚑 MED RESPONSE (Ambulance/EMS)
*   **Perspective**: Clinical observation and mass casualty triage.
*   **Specialized Logic**:
    *   **START Triage Protocol**: Categorizes victims into RED (Immediate), YELLOW (Delayed), GREEN (Minor), or BLACK (Expectant).
    *   **Clinical Priorities**: Focuses on the "ABC" (Airway, Breathing, Circulation) sequence.
*   **Primary Goal**: Stabilize life and optimize transport logistics.

### 🚔 LAW ENFORCEMENT (Police)
*   **Perspective**: Threat assessment, perimeter control, and public safety.
*   **Specialized Logic**:
    *   **Threat Levels**: Assesses situational violence, weapon presence, and crowd behavior (Critical, High, Stable).
    *   **Tactical Geometry**: Recommends perimeter cordons and secure access routes for other responders.
*   **Primary Goal**: Secure the scene and ensure responder/civilian safety.

### 🏛️ CIVIL DEFENSE AI (Government/Disaster Management)
*   **Perspective**: Strategic resource allocation and infrastructure impact.
*   **Specialized Logic**:
    *   **Disaster Management**: Analyzes the impact on utilities, traffic arteries, and nearby residential zones.
    *   **Public Alerts**: Drafts strategic evacuation orders and multi-agency resource requests.
*   **Primary Goal**: Minimize city-wide disruption and manage long-term recovery.

### ⚠️ HAZMAT CONTROL (Hazardous Materials)
*   **Perspective**: Chemical, Biological, Radiological, and Nuclear (CBRN) hazards.
*   **Specialized Logic**:
    *   **PPE Protocols**: Dictates the required protection level (Level A-D) for entry teams.
    *   **Zone Isolation**: Establishes Hot, Warm, and Cold zones to prevent cross-contamination.
*   **Primary Goal**: Contain invisible threats and protect responders from toxic exposure.

---

## ✨ Key Technical Features
*   **Live Reasoning Logs**: A real-time diagnostic stream showing the raw AI thought process and API latency.
*   **Dynamic UI Theming**: The entire interface shifts its color palette, glow effects, and typography based on the urgency level detected by the AI.
*   **Multi-Agent Orchestration**: Handles complex asynchronous state management, ensuring the UI stays responsive while 5 heavy AI models run in parallel.
*   **Emergency Audio Broadcast**: Integrated Text-to-Speech (TTS) and siren system for hands-free situational awareness.

---

## 🛠️ Technology Stack
*   **Core**: React 19 + TypeScript
*   **Build/Dev**: Vite 6
*   **AI Engine**: Google Generative AI (SDK v1.38)
*   **Models**: 
    *   `gemini-3.1-flash` (Detector)
    *   `gemini-3-pro-preview` (Reasoner)
*   **Styling**: Tailwind CSS + Dynamic Inline CSS Variables
*   **State Management**: React Context API (Incident State Engine)

---

## 🔮 Future Vision
*   **Multi-Source Fusion**: Aggregating data from drone feeds, IoT smoke sensors, and social media reporting into the same reasoning engine.
*   **History Learning**: Using past incident data to fine-tune the "Tactical Personas" for specific city layouts.
*   **Predictive Dispatch**: Analyzing historical patterns to pre-stage units in high-risk zones before a detection even occurs.

---
**Developed by Gemini CLI for VibeCodekaregaPakistan**
 