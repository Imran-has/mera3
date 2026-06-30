<div align="center">
<img width="1200" height="475" alt="MERA-3 Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# MERA-3 AI Response Engine

**Multi-Agency Emergency Dispatch System powered by Gemini AI**
</div>

MERA-3 is an advanced, multi-portal architecture designed for rapid emergency response coordination. By leveraging Google's state-of-the-art **Gemini AI** (Gemini 3 Flash & Pro), MERA-3 provides real-time visual analysis and role-specific, tactical reasoning across five distinct emergency services simultaneously.

---

## 🚀 Core Architecture

MERA-3 employs a **Dual-Model Pipeline** to balance speed and tactical depth:

1. **Stage 1: Fast Detection (Gemini 3 Flash Preview)**
   - Continuously scans webcam video frames.
   - Acts as the "visual cortex," providing a portal-agnostic, low-latency evaluation to detect emergencies (fire, medical distress, violence, structural damage, etc.).
2. **Stage 2: Parallel Deep Reasoning (Gemini 3 Pro Preview)**
   - Triggered immediately upon emergency confirmation.
   - Dispatches **5 parallel API calls**—one to each agency portal.
   - Each call utilizes strict, role-specific system instructions to generate customized, structured JSON responses (Triage, Tactical Steps, Warnings, Confidence metrics).

---

## 🏢 Multi-Portal Agencies

MERA-3 operates 5 dedicated, themed portals. Each portal processes the exact same visual evidence but analyzes it through a distinct, specialized lens:

### 🔥 Fire Brigade (`FIRE COMMAND`)
- **Focus**: Fire classification and containment.
- **Capabilities**: Identifies fire types (Class A-K) and determines the correct suppression agent (Water, CO2, Dry Chemical, etc.).
- **Priorities**: Evacuate → Classify fire → Attack vector → Prevent spread.

### 🚑 Ambulance (`MED RESPONSE`)
- **Focus**: Clinical observation and mass casualty triage.
- **Capabilities**: Utilizes **START Triage** protocols (Red/Immediate, Yellow/Delayed, Green/Minor, Black/Expectant).
- **Priorities**: Airway → Haemorrhage control → Circulation → Transport decisions.

### 🚔 Police (`LAW ENFORCEMENT`)
- **Focus**: Tactical threat assessment and public safety.
- **Capabilities**: Assesses threat levels (Critical, High, Stable) based on visual violence, weapons, or suspicious activity.
- **Priorities**: Officer safety → Perimeter/cordon → De-escalation → Evidence preservation.

### 🏛️ Civil Defense (`CIVIL DEFENSE AI`)
- **Focus**: Strategic disaster management.
- **Capabilities**: Evaluates structural damage, large-scale evacuation zones, and multi-agency coordination needs.
- **Priorities**: Resource allocation → Infrastructure assessment → Public alerts.

### ⚠️ Hazmat (`HAZMAT CONTROL`)
- **Focus**: Hazardous materials and industrial accidents.
- **Capabilities**: Identifies chemical spills or airborne threats and dictates required **PPE Levels (A-D)**.
- **Priorities**: Deny entry (Hot/Warm/Cold zones) → Notify CHEMTREC → Decontamination.

---

## ✨ Application Features

- **Live Video Input**: Connects to the device's webcam to capture and analyze real-time frames.
- **Dynamic Dispatch Board**: Real-time dashboard that visually updates as each of the 5 agencies returns their AI-generated tactical plans.
- **Simulated 911 Audio Alerts**: Features dynamic, browser-generated siren audio and Text-to-Speech (TTS) emergency broadcasts upon incident detection.
- **Live Reasoning Logs**: A continuous diagnostic feed showing API calls, detection results, and system status changes.
- **Adaptive UI Styling**: Interfaces dynamically adapt their CSS variables, glow effects, and typography to match the active emergency response elements.

---

## 🛠️ Run Locally

**Prerequisites:** 
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A valid Google Gemini API Key

### 1. Installation

Clone the repository and navigate into the directory:
```bash
git clone <repository-url>
cd MERA-3
```

Install the required NPM packages:
```bash
npm install
```

### 2. Configuration

Create a `.env.local` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Application

Start the Vite development server:
```bash
npm run dev
```

Open your browser and navigate to the local URL (typically `http://localhost:3000` or `http://localhost:5173`).

*Note: Make sure to grant browser permissions for Webcam access when prompted.*

---

## ⚙️ Tech Stack & Dependencies

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **AI Integration**: Google GenAI SDK (`@google/genai` v1.38)
- **AI Models**: 
  - `gemini-3-flash-preview` (Stage 1 Detector)
  - `gemini-3-pro-preview` (Stage 2 Reasoner)
- **Styling**: Tailwind CSS, Vanilla CSS, and dynamic inline CSS variables for theming.
