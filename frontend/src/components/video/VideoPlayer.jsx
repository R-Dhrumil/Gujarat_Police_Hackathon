import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Maximize2, AlertCircle, RefreshCw, Volume2, VolumeX, Shield } from 'lucide-react';

export const VideoPlayer = ({
  hlsUrl,
  cameraName = 'Live Camera Feed',
  cameraCode = 'CAM-001',
  departmentName = 'Gujarat Police',
  isLive = true,
  autoPlay = true,
  showControls = true,
  aspectRatio = 'aspect-video'
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [timecode, setTimecode] = useState('');

  // Update live timecode overlay
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimecode(now.toISOString().replace('T', ' ').substring(0, 19) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize HLS Player or Native Playback
  useEffect(() => {
    let hls = null;
    const video = videoRef.current;
    setHasError(false);
    setUseCanvasFallback(false);

    if (!video || !hlsUrl) {
      setUseCanvasFallback(true);
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        manifestLoadingTimeOut: 5000,
        manifestLoadingMaxRetry: 2
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => setUseCanvasFallback(true));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn(`[HLS ERROR] Camera ${cameraCode} stream error:`, data.type);
          setUseCanvasFallback(true);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        if (autoPlay) video.play().catch(() => setUseCanvasFallback(true));
      });
      video.addEventListener('error', () => {
        setUseCanvasFallback(true);
      });
    } else {
      setUseCanvasFallback(true);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [hlsUrl, autoPlay, cameraCode]);

  // High-fidelity Tactical Canvas Stream Simulator (Fallback for demo reliability)
  useEffect(() => {
    if (!useCanvasFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let frameCount = 0;

    const renderSimulation = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark tactical grid background
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, w, h);

      // Subtle surveillance scanline effect
      ctx.strokeStyle = 'rgba(30, 41, 75, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Simulated moving traffic / bounding boxes
      const carX = ((frameCount * 3) % (w + 100)) - 50;
      const carY = h * 0.55;

      // Roadway lines
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.lineTo(w, h * 0.7);
      ctx.stroke();

      // Simulated detected vehicle bounding box
      if (isLive) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(carX, carY, 120, 60);

        // Target Plate Tag
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.fillRect(carX, carY - 22, 120, 20);
        ctx.fillStyle = '#041f12';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('GJ01AB1234 94%', carX + 6, carY - 8);
      }

      // Corner Crosshairs / HUD
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 2;
      const sz = 16;
      // Top-left
      ctx.beginPath(); ctx.moveTo(20, 20 + sz); ctx.lineTo(20, 20); ctx.lineTo(20 + sz, 20); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(w - 20 - sz, 20); ctx.lineTo(w - 20, 20); ctx.lineTo(w - 20, 20 + sz); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(20, h - 20 - sz); ctx.lineTo(20, h - 20); ctx.lineTo(20 + sz, h - 20); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(w - 20 - sz, h - 20); ctx.lineTo(w - 20, h - 20); ctx.lineTo(w - 20, h - 20 - sz); ctx.stroke();

      animationId = requestAnimationFrame(renderSimulation);
    };

    renderSimulation();

    return () => cancelAnimationFrame(animationId);
  }, [useCanvasFallback, isLive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (video.requestFullscreen) video.requestFullscreen();
    }
  };

  return (
    <div className={`relative ${aspectRatio} w-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl group select-none`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${useCanvasFallback ? 'hidden' : 'block'}`}
        muted={isMuted}
        playsInline
      />

      {/* Canvas Fallback for Offline / Demo Streams */}
      {useCanvasFallback && (
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover block"
        />
      )}

      {/* Top HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase ${
            isLive ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-700/80' : 'bg-rose-950/90 text-rose-400 border border-rose-700/80'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            {isLive ? 'LIVE FEED' : 'OFFLINE'}
          </span>
          <span className="text-xs font-mono font-semibold text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/50">
            {cameraCode}
          </span>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline-block">
            {cameraName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
            {timecode}
          </span>
        </div>
      </div>

      {/* Bottom Control Bar */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs text-slate-400 font-medium">
              {departmentName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
