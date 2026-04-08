import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Play, Pause, RotateCcw, Timer, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isActive, setIsActive] = useState(false);
  const [initialTime] = useState(300);
  
  const controls = useAnimation();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = (timeLeft / initialTime) * 100;

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl border border-calm-soft flex flex-col items-center gap-8">
      <div className="text-center">
        <h3 className="font-serif text-2xl font-semibold text-calm-accent">Focus Quest</h3>
        <p className="text-sm text-calm-ink/60 italic">Can you stay focused until the sand runs out?</p>
      </div>

      <div className="relative w-48 h-64 flex flex-col items-center justify-between py-4 bg-calm-soft/20 rounded-full border-4 border-calm-soft overflow-hidden">
        {/* Top Half */}
        <div className="relative w-32 h-24 bg-calm-soft/30 rounded-t-full overflow-hidden">
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-yellow-200/60"
            animate={{ height: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        
        {/* Middle Neck */}
        <div className="w-4 h-4 bg-calm-soft z-10" />

        {/* Bottom Half */}
        <div className="relative w-32 h-24 bg-calm-soft/30 rounded-b-full overflow-hidden">
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-yellow-200/60"
            animate={{ height: `${100 - progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl font-mono font-bold text-calm-accent drop-shadow-sm">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="flex items-center gap-2 px-6 py-3 bg-calm-accent text-white rounded-full hover:scale-105 transition-transform shadow-md"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 bg-calm-soft text-calm-accent rounded-full hover:bg-calm-soft/80 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {timeLeft === 0 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 text-green-600 font-medium"
        >
          <CheckCircle2 className="w-5 h-5" />
          Quest Complete! You did it!
        </motion.div>
      )}
    </div>
  );
}
