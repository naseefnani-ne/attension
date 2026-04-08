/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Gamepad2, 
  MessageCircleHeart, 
  Timer, 
  Sparkles, 
  Info,
  Menu,
  X,
  Heart,
  Brain,
  Zap,
  ChevronRight
} from 'lucide-react';
import BubblePop from './components/games/BubblePop';
import ZenGarden from './components/games/ZenGarden';
import MindfulBuddy from './components/MindfulBuddy';
import FocusTimer from './components/FocusTimer';
import LevelSelector from './components/LevelSelector';
import { cn } from './lib/utils';
import { strategyEngine } from './services/strategyEngine';

type Tab = 'play' | 'calm' | 'buddy' | 'focus';

const AFFIRMATIONS = [
  "You have a unique brain that sees the world in amazing ways. Today is your day to shine.",
  "Your energy is a superpower. Let's use it to create something wonderful today!",
  "It's okay to take a break. Your mind is like a garden; sometimes it just needs a little rest.",
  "You are creative, curious, and capable of big things. Keep being amazing!",
  "Every small step counts. You are making progress every single day.",
  "Your focus is like a muscle. It gets stronger every time you practice!"
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('play');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Level System State
  const [bubbleLevel, setBubbleLevel] = useState(1);
  const [unlockedBubbleLevel, setUnlockedBubbleLevel] = useState(() => {
    const saved = localStorage.getItem('unlocked_bubble_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  const handleBubbleComplete = (score: number) => {
    if (bubbleLevel === unlockedBubbleLevel && unlockedBubbleLevel < 35) {
      const nextLevel = unlockedBubbleLevel + 1;
      setUnlockedBubbleLevel(nextLevel);
      localStorage.setItem('unlocked_bubble_level', nextLevel.toString());
    }
  };

  useEffect(() => {
    // Initial recommendations
    setRecommendations(strategyEngine.getRecommendations());

    // Refresh recommendations periodically or on tab change
    const interval = setInterval(() => {
      setRecommendations(strategyEngine.getRecommendations());
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    // Rotate quotes every 2 minutes (120,000 ms)
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'play', label: 'Play Zone', icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'calm', label: 'Calm Down', icon: Wind, color: 'text-teal-500', bg: 'bg-teal-50' },
    { id: 'buddy', label: 'Mindful Buddy', icon: MessageCircleHeart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'focus', label: 'Focus Quest', icon: Timer, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-calm-bg text-calm-ink selection:bg-calm-accent selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-calm-soft px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-calm-accent rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-calm-accent">
                AT<span className="line-through decoration-rose-500/50">TENSION</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold opacity-40">ADHD Calm & Focus</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === tab.id 
                    ? `${tab.bg} ${tab.color} shadow-sm` 
                    : "hover:bg-calm-soft/50 opacity-60 hover:opacity-100"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <button 
            className="md:hidden p-2 hover:bg-calm-soft rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-calm-bg pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as Tab);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl text-lg font-medium transition-all",
                    activeTab === tab.id ? `${tab.bg} ${tab.color}` : "bg-white/50"
                  )}
                >
                  <tab.icon className="w-6 h-6" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'play' && (
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-4xl font-semibold">Play Zone</h2>
                        <div className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Sensory Fun</div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-serif text-xl italic text-calm-accent">Select Level</h3>
                        <LevelSelector 
                          currentLevel={bubbleLevel}
                          unlockedLevel={unlockedBubbleLevel}
                          onSelectLevel={setBubbleLevel}
                        />
                      </div>

                      <BubblePop 
                        level={bubbleLevel} 
                        onComplete={handleBubbleComplete} 
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-3xl font-semibold">Zen Garden</h3>
                        <div className="bg-amber-100 text-amber-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Creative Calm</div>
                      </div>
                      <ZenGarden />
                    </div>
                  </div>
                )}

                {activeTab === 'calm' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-4xl font-semibold">Calm Down</h2>
                      <div className="bg-teal-100 text-teal-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Breathing</div>
                    </div>
                    <div className="bg-white p-12 rounded-3xl shadow-xl border border-calm-soft flex flex-col items-center justify-center gap-12 min-h-[500px]">
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-48 h-48 rounded-full bg-teal-100/50 border-4 border-teal-200 flex items-center justify-center relative"
                        onAnimationIteration={() => strategyEngine.logActivity('breathing')}
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-teal-300"
                        />
                        <span className="text-teal-700 font-serif italic text-xl z-10">Breathe</span>
                      </motion.div>
                      <div className="text-center space-y-2">
                        <p className="text-calm-ink/60 font-medium">Follow the circle to find your rhythm</p>
                        <p className="text-sm text-calm-ink/40">Inhale as it grows, exhale as it shrinks</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'buddy' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-4xl font-semibold">Mindful Buddy</h2>
                      <div className="bg-rose-100 text-rose-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">AI Support</div>
                    </div>
                    <MindfulBuddy />
                  </div>
                )}

                {activeTab === 'focus' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-4xl font-semibold">Focus Quest</h2>
                      <div className="bg-amber-100 text-amber-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Productivity</div>
                    </div>
                    <FocusTimer />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Sidebar / Stats */}
          <div className="lg:col-span-4 space-y-8">
            {/* Personalized Recommendations */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-calm-soft space-y-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif text-xl font-semibold">Recommended for You</h3>
              </div>
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(rec.id as Tab)}
                      className="w-full text-left p-4 bg-calm-soft/20 rounded-2xl border border-calm-soft/50 hover:bg-calm-soft/40 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-calm-accent">{rec.title}</h4>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-calm-ink/60">{rec.reason}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-calm-ink/40 italic">Start exploring to get personalized tips!</p>
                )}
              </div>
            </div>

            {/* Daily Affirmation */}
            <div className="bg-calm-accent p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
              <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-10 group-hover:rotate-12 transition-transform" />
              <div>
                <h3 className="font-serif text-xl italic mb-4 opacity-80">Daily Sparkle</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={quoteIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-2xl font-medium leading-tight"
                  >
                    "{AFFIRMATIONS[quoteIndex]}"
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm opacity-60">
                <Heart className="w-4 h-4 fill-current" />
                Keep being you
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-calm-soft space-y-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-calm-accent" />
                <h3 className="font-serif text-xl font-semibold">ADHD Superpowers</h3>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Hyperfocus', desc: 'When you find something you love, you can do it better than anyone!' },
                  { title: 'Creativity', desc: 'Your brain makes connections others might miss.' },
                  { title: 'Energy', desc: 'You have the spark to get things started!' }
                ].map((tip, i) => (
                  <div key={i} className="p-4 bg-calm-soft/20 rounded-2xl border border-calm-soft/50">
                    <h4 className="font-bold text-sm text-calm-accent mb-1">{tip.title}</h4>
                    <p className="text-xs text-calm-ink/60">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-12 border-t border-calm-soft mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-serif italic">AT<span className="line-through decoration-rose-500/50">TENSION</span></span>
          </div>
          <p className="text-xs">Designed with ❤️ for unique minds</p>
          <div className="flex gap-6 text-xs font-medium uppercase tracking-widest">
            <a href="#" className="hover:text-calm-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-calm-accent transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
