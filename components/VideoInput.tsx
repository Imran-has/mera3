import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AppStatus } from '../types';

interface VideoInputProps {
  status: AppStatus;
  onFrameCapture: (base64Data: string) => void;
  onStatusChange: (status: AppStatus) => void;
}

export const VideoInput: React.FC<VideoInputProps> = ({ status, onFrameCapture, onStatusChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceType, setSourceType] = useState<'camera' | 'file' | 'url' | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.removeAttribute('crossOrigin');
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setSourceType('camera');
        setShowUrlInput(false);
        onStatusChange(AppStatus.IDLE);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow permissions or upload a file.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.removeAttribute('crossOrigin');
      videoRef.current.src = url;
      videoRef.current.loop = true;
      videoRef.current.play();
      setSourceType('file');
      setShowUrlInput(false);
      onStatusChange(AppStatus.IDLE);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput && videoRef.current) {
      if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
        alert("YouTube links cannot be analyzed directly due to browser security restrictions. Please use a direct link to a video file (.mp4, .webm).");
        return;
      }
      videoRef.current.crossOrigin = "anonymous";
      videoRef.current.src = urlInput;
      videoRef.current.loop = true;
      videoRef.current.play()
        .then(() => {
          setSourceType('url');
          setShowUrlInput(false);
          onStatusChange(AppStatus.IDLE);
        })
        .catch(err => {
          console.error("Video load error", err);
          alert("Could not load video. The URL might be broken, or the server blocks direct access. Try a different direct link.");
        });
    }
  };

  // Frame Extraction Logic
  useEffect(() => {
    let intervalId: any;
    if (status === AppStatus.MONITORING && videoRef.current && canvasRef.current) {
      intervalId = setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState >= 2) {
          const context = canvas.getContext('2d');
          if (context) {
            try {
              canvas.width = 640;
              canvas.height = 360;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              const base64Data = dataUrl.split(',')[1];
              onFrameCapture(base64Data);
            } catch (e) {
              console.error("Frame extraction error (likely CORS):", e);
              onStatusChange(AppStatus.IDLE);
              alert("Security Error: Cannot analyze this video URL because the server does not allow cross-origin access (CORS). Please download the video and upload it as a file instead.");
              clearInterval(intervalId);
            }
          }
        }
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [status, onFrameCapture, onStatusChange]);

  const isAlarmActive = status === AppStatus.EMERGENCY_DETECTED || status === AppStatus.REASONING;

  return (
    <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ${isAlarmActive ? 'ring-4 ring-red-600 shadow-red-900/50' : 'border border-slate-800'}`}>
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-all duration-300 ${isAlarmActive ? 'sepia contrast-125' : ''}`}
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Visual Alarm Overlay */}
      {isAlarmActive && (
        <div className="absolute inset-0 pointer-events-none z-10 animate-pulse bg-red-500/10 box-border border-[8px] border-red-600/50" />
      )}

      {/* Scanlines & Vignette */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-30" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${sourceType && status !== AppStatus.IDLE ? 'opacity-0 hover:opacity-100' : 'opacity-100'} z-20`}>
        {!sourceType || showUrlInput ? (
          !showUrlInput ? (
            <div className="flex flex-col gap-6 items-center animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <button
                  onClick={startCamera}
                  className="group px-8 py-5 bg-gradient-to-br from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white font-bold rounded-2xl shadow-lg shadow-cyan-900/50 transition-all transform hover:scale-105 flex flex-col items-center gap-2 w-48"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8v8a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>CAMERA</span>
                </button>
                <div className="relative">
                  <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group px-8 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105 flex flex-col items-center gap-2 w-48"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>UPLOAD FILE</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowUrlInput(true)}
                className="text-slate-400 hover:text-white text-sm font-mono underline decoration-slate-600 underline-offset-4 transition-colors"
              >
                Or paste a direct video URL...
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                Load Video from URL
              </h3>
              <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                  required
                />
                <p className="text-xs text-slate-500">
                  * Must be a direct link (.mp4, .webm). YouTube links are not supported due to security restrictions.
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-sm transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    LOAD VIDEO
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          status === AppStatus.IDLE && (
            <div className="flex flex-col gap-4 items-center">
              <button
                id="btn-start-monitoring"
                onClick={() => onStatusChange(AppStatus.MONITORING)}
                className="px-10 py-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-black tracking-widest rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse hover:animate-none transform hover:scale-110 transition-all border-4 border-emerald-400/30"
              >
                START MONITORING
              </button>
              <button
                onClick={() => {
                  setSourceType(null);
                  if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.src = "";
                    videoRef.current.srcObject = null;
                  }
                }}
                className="text-slate-400 hover:text-white text-xs uppercase tracking-widest hover:underline"
              >
                Change Source
              </button>
            </div>
          )
        )}
      </div>

      {/* Active Monitoring Badge */}
      {status === AppStatus.MONITORING && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/30 shadow-lg z-20">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-emerald-400 text-xs font-mono font-bold tracking-wider">SYSTEM ACTIVE</span>
        </div>
      )}

      {isAlarmActive && (
        <div className="absolute top-4 left-4 right-4 flex justify-center z-20">
          <div className="bg-red-600 text-white font-black text-lg px-6 py-2 rounded shadow-lg animate-bounce uppercase tracking-widest border-2 border-white">
            ⚠ CRITICAL ALERT — DISPATCHING ALL AGENCIES
          </div>
        </div>
      )}
    </div>
  );
};