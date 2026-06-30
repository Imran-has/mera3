import React, { useEffect, useRef, useState } from 'react';
import { useIncident } from '../context/IncidentContext';

export const AlarmSystem: React.FC = () => {
  const { isAlarmActive, triggerAlarm, activeIncident } = useIncident();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenNodeRef = useRef<OscillatorNode | null>(null);
  const lfoNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Speech Synthesis interval ref
  const speechIntervalRef = useRef<any>(null);

  // 1. Programmatic Web Audio Siren Synthesizer (No external file dependencies, offline capable)
  const startSiren = () => {
    try {
      stopSiren();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Primary oscillator (creates a powerful sawtooth wave for maximum visibility/alertness)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';

      // Gain node for smooth fade-in and volume control
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.15); // Friendly volume level

      // Low Frequency Oscillator to create the "wee-woo" pitch sweeps
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 1.5; // 1.5 sweep cycles per second

      // LFO Gain node to set the sweep range/depth
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 160; // Pitch sweep variance +/- 160Hz

      osc.frequency.value = 460; // Base frequency in Hz

      // Connect LFO modulation chain
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Connect primary audio chain
      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      osc.start();

      sirenNodeRef.current = osc;
      lfoNodeRef.current = lfo;
      gainNodeRef.current = gain;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      console.error("Failed to start programmatic siren:", e);
    }
  };

  const stopSiren = () => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, now + 0.15); // Smooth fade-out
      }

      setTimeout(() => {
        if (sirenNodeRef.current) {
          try { sirenNodeRef.current.stop(); } catch {}
          sirenNodeRef.current.disconnect();
          sirenNodeRef.current = null;
        }
        if (lfoNodeRef.current) {
          try { lfoNodeRef.current.stop(); } catch {}
          lfoNodeRef.current.disconnect();
          lfoNodeRef.current = null;
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
        }
        if (audioCtxRef.current) {
          if (audioCtxRef.current.state !== 'closed') {
            try { audioCtxRef.current.close(); } catch {}
          }
          audioCtxRef.current = null;
        }
      }, 160);
    } catch (e) {
      console.error("Error stopping siren:", e);
    }
  };

  // 2. Text-to-Speech (TTS) Voice Broadcast
  const startVoiceBroadcast = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Cancel any current speech queue

    const getEnglishVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      return voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
             voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
             voices.find(v => v.lang.startsWith('en')) ||
             voices[0] || null;
    };

    const speak = () => {
      const desc = activeIncident?.description || "Emergency Situation";
      const text = `Attention! Emergency detected: ${desc}. Repeat, emergency detected. All agency portals are now active. Please coordinate immediate dispatch.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0;
      utterance.rate = 0.95; // Authoritative, steady rate
      utterance.pitch = 0.95; // Authority tone

      const voice = getEnglishVoice();
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    };

    // Speak immediately
    speak();

    // Loop speech synthesis every 12 seconds
    if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    speechIntervalRef.current = setInterval(speak, 12000);
  };

  const stopVoiceBroadcast = () => {
    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // 3. Global click/interaction event listener to unlock browser audio limitations
  const unlockAudio = () => {
    if (isUnlocked) return;

    // Test run silent AudioContext to authorize future play requests
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      try {
        const ctx = new AudioContextClass();
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch (e) {
        console.warn("Audio Context unlock error:", e);
      }
    }

    // Speak a silent utterance to satisfy voice synthesis autoplay restrictions
    if ('speechSynthesis' in window) {
      try {
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn("Speech Synthesis unlock error:", e);
      }
    }

    setIsUnlocked(true);
    console.log("🔊 MERA-3 Audio & Voice engines unlocked successfully!");
  };

  useEffect(() => {
    const handleGesture = () => {
      unlockAudio();
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    window.addEventListener('touchstart', handleGesture);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, [isUnlocked]);

  // 4. Trigger audio & voice based on alarm activity AND re-trigger whenever a NEW incident is detected
  useEffect(() => {
    if (isAlarmActive && activeIncident) {
      startSiren();
      startVoiceBroadcast();
    } else {
      stopSiren();
      stopVoiceBroadcast();
    }

    return () => {
      stopSiren();
      stopVoiceBroadcast();
    };
  }, [isAlarmActive, activeIncident?.id]); // Re-triggers on alarm toggle OR whenever the specific active incident ID changes

  const handleManualUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    // Start playbacks directly inside the click event callback to bypass browser lock
    setTimeout(() => {
      startSiren();
      startVoiceBroadcast();
    }, 50);
  };

  if (!isAlarmActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Red Pulse Border */}
      <div className="absolute inset-0 border-[10px] border-red-600 animate-pulse opacity-30 shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]" />
      
      {/* Top Banner */}
      <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-2 text-center pointer-events-auto flex justify-between items-center px-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="animate-ping bg-white w-3 h-3 rounded-full" />
          <span className="font-black tracking-[0.2em] text-sm">EMERGENCY PROTOCOL ACTIVE</span>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs opacity-85">{activeIncident?.description}</span>
          
          {/* Fallback button in case of aggressive browser restriction */}
          {!isUnlocked && (
            <button
              onClick={handleManualUnlock}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded font-black text-xs animate-bounce transition-all shadow-lg flex items-center gap-1"
            >
              <span>🔊</span> ENABLE SOUND & VOICE ALERT
            </button>
          )}

          <button 
            onClick={() => triggerAlarm(false)}
            className="bg-white text-red-600 px-4 py-1 rounded font-bold text-xs hover:bg-red-50 transition-colors uppercase"
          >
            Acknowledge & Silence
          </button>
        </div>
      </div>

      {/* Warning Symbols (Corner) */}
      <div className="absolute bottom-10 right-10 animate-bounce">
         <div className="bg-red-600 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
         </div>
      </div>
    </div>
  );
};
