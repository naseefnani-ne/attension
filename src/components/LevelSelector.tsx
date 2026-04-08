import React from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle2, Play } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LevelSelectorProps {
  currentLevel: number;
  unlockedLevel: number;
  onSelectLevel: (level: number) => void;
  totalLevels?: number;
}

export default function LevelSelector({ 
  currentLevel, 
  unlockedLevel, 
  onSelectLevel, 
  totalLevels = 35 
}: LevelSelectorProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3 p-6 bg-white/50 rounded-3xl border border-calm-soft">
      {Array.from({ length: totalLevels }).map((_, i) => {
        const levelNum = i + 1;
        const isUnlocked = levelNum <= unlockedLevel;
        const isCurrent = levelNum === currentLevel;
        const isCompleted = levelNum < unlockedLevel;

        return (
          <motion.button
            key={levelNum}
            whileHover={isUnlocked ? { scale: 1.1 } : {}}
            whileTap={isUnlocked ? { scale: 0.9 } : {}}
            onClick={() => isUnlocked && onSelectLevel(levelNum)}
            className={cn(
              "relative aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all",
              isCurrent && "ring-4 ring-calm-accent ring-offset-2",
              isUnlocked 
                ? "bg-white text-calm-accent shadow-sm hover:shadow-md border border-calm-soft" 
                : "bg-calm-soft/30 text-calm-ink/20 cursor-not-allowed"
            )}
          >
            {levelNum}
            {!isUnlocked && (
              <Lock className="absolute -top-1 -right-1 w-4 h-4 text-calm-ink/30 bg-white rounded-full p-0.5" />
            )}
            {isCompleted && (
              <CheckCircle2 className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full p-0.5" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
