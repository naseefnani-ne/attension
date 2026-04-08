import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

import { strategyEngine } from '@/src/services/strategyEngine';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];

interface BubblePopProps {
  level: number;
  onComplete: (score: number) => void;
}

export default function BubblePop({ level, onComplete }: BubblePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Level difficulty scaling
  const targetScore = 5 + level * 2;
  const bubbleSpeed = Math.max(0.4, 1.5 - level * 0.03); // Faster spawn at higher levels
  const bubbleSizeRange = [Math.max(20, 60 - level), Math.max(30, 80 - level)];

  const spawnBubble = useCallback(() => {
    if (score >= targetScore || isGameOver) return;

    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * (bubbleSizeRange[1] - bubbleSizeRange[0]) + bubbleSizeRange[0],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setBubbles((prev) => [...prev, newBubble]);
  }, [score, targetScore, isGameOver, bubbleSizeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bubbles.length < Math.min(15, 5 + Math.floor(level / 2)) && !isGameOver) {
        spawnBubble();
      }
    }, 1000 * bubbleSpeed);
    return () => clearInterval(interval);
  }, [bubbles.length, spawnBubble, level, bubbleSpeed, isGameOver]);

  const popBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    const newScore = score + 1;
    setScore(newScore);
    strategyEngine.logActivity('bubble_pop');
    
    if (newScore % 5 === 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: COLORS,
      });
    }

    if (newScore >= targetScore) {
      setIsGameOver(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
      setTimeout(() => onComplete(newScore), 2000);
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-white/30 rounded-3xl overflow-hidden border border-calm-soft cursor-crosshair">
      <div className="absolute top-4 left-6 z-10">
        <h3 className="font-serif text-2xl italic text-calm-accent">Level {level}: Bubble Pop</h3>
        <p className="text-sm text-calm-ink/60">Pop {targetScore} bubbles to win!</p>
      </div>
      
      <div className="absolute top-4 right-6 z-10 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="font-mono font-medium">{score} / {targetScore}</span>
        </div>
      </div>

      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ scale: 1.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => popBubble(bubble.id)}
            className="absolute rounded-full shadow-lg border-2 border-white/50"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              backgroundColor: bubble.color,
              boxShadow: `0 0 20px ${bubble.color}44`,
            }}
          />
        ))}
      </AnimatePresence>

      {isGameOver && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm z-20"
        >
          <h2 className="text-4xl font-serif font-bold text-calm-accent mb-2">Level Complete!</h2>
          <p className="text-calm-ink/60 italic">You're doing amazing!</p>
        </motion.div>
      )}
    </div>
  );
}
