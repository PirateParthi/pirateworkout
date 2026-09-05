import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, X, Minimize2, Maximize2, Bell, Volume2, VolumeX } from 'lucide-react';

export const RestTimer = ({ initialSeconds = 60, onClose, autoStart = false }) => {
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  // Play beep sound using Web Audio API
  const playBeep = (freq = 880, type = 'sine', duration = 0.2) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  };

  const playFinishedChime = () => {
    if (!soundEnabled) return;
    playBeep(523.25, 'triangle', 0.15); // C5
    setTimeout(() => playBeep(659.25, 'triangle', 0.15), 150); // E5
    setTimeout(() => playBeep(783.99, 'triangle', 0.3), 300); // G5
    setTimeout(() => playBeep(1046.50, 'sine', 0.5), 500); // C6
  };

  // Timer interval effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsFinished(true);
            playFinishedChime();
            return 0;
          }
          // Short beep on final 3 seconds
          if (prev <= 4 && prev > 1) {
            playBeep(440, 'sine', 0.08);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, soundEnabled]);

  const handleStart = () => {
    if (timeLeft === 0) setTimeLeft(totalTime);
    setIsFinished(false);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(totalTime);
  };

  const addTime = (seconds) => {
    setTimeLeft((prev) => prev + seconds);
    setTotalTime((prev) => Math.max(prev, timeLeft + seconds));
  };

  const setPresetTime = (sec) => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalTime(sec);
    setTimeLeft(sec);
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const strokeDashoffset = 283 - (283 * (100 - progress)) / 100;

  // Render Minimized Floating Pill
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900/95 border border-cyan-500/40 p-3 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-md animate-bounce-short">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="font-mono text-lg font-bold text-cyan-300">{formatTime(timeLeft)}</span>
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400" />}
        </button>
        <button
          onClick={() => addTime(15)}
          className="px-2 py-1 rounded-lg bg-cyan-950/80 text-cyan-400 text-xs font-semibold hover:bg-cyan-900 border border-cyan-800"
        >
          +15s
        </button>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Render Full Modal / Overlay View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-sm rounded-3xl bg-slate-900 border ${isFinished ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-slate-800'} p-6 shadow-2xl shadow-cyan-500/10 text-center transition-all`}>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span className="p-1 rounded-md bg-cyan-950/80 border border-cyan-800/60">⏱️</span>
            <span>Rest Countdown</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize to Floating Widget"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="6"
            />
            {/* Dynamic Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={isFinished ? '#fbbf24' : '#06b6d4'}
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-4xl font-extrabold tracking-tight ${isFinished ? 'text-amber-300 animate-pulse' : 'text-slate-100'}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1">
              {isFinished ? '🔥 Time to Lift!' : isRunning ? 'Resting...' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[30, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => setPresetTime(sec)}
              className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                totalTime === sec
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <button
            onClick={handleReset}
            title="Reset Timer"
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex-1 py-3 px-6 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{timeLeft === 0 ? 'Restart' : 'Start Rest'}</span>
            </button>
          )}

          <button
            onClick={() => addTime(15)}
            title="Add 15 Seconds"
            className="py-3 px-4 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-400 font-semibold text-sm transition-colors"
          >
            +15s
          </button>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className="text-xs text-slate-400 hover:text-cyan-400 underline decoration-slate-600 transition-colors"
        >
          Keep timer running in background & minimize
        </button>
      </div>
    </div>
  );
};
