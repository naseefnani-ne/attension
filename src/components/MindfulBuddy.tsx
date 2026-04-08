import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, RefreshCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';

import { strategyEngine } from '@/src/services/strategyEngine';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function MindfulBuddy() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi there! I'm your Mindful Buddy. How are you feeling today? We can talk, or I can suggest a quick calming activity!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are a gentle, supportive "Mindful Buddy" for kids with ADHD or hyperactivity. 
          Your goal is to help them calm down, focus, or navigate big emotions. 
          Keep your responses:
          1. Short and scannable (ADHD-friendly).
          2. Encouraging and non-judgmental.
          3. Practical: Suggest simple breathing (e.g., "Box breathing"), sensory checks (5-4-3-2-1), or quick movements.
          4. Use emojis to make it friendly.
          Avoid long paragraphs. Use bullet points if needed.`,
        }
      });

      const modelText = response.text || "I'm here for you! Let's try a deep breath together.";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      // Analyze mood after a few messages
      if (messages.length > 2) {
        strategyEngine.analyzeMoodFromChat(messages.concat({ role: 'user', text: userMessage }).map(m => m.text));
      }
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Oops, my circuits got a bit tangled! Let's try again or just take a deep breath together. 🌿" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl border border-calm-soft overflow-hidden">
      <div className="p-6 border-bottom border-calm-soft bg-calm-soft/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-calm-accent flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold">Mindful Buddy</h3>
            <p className="text-xs text-calm-ink/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Always here to listen
            </p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'model', text: "Fresh start! How can I help you feel calm right now?" }])}
          className="p-2 hover:bg-calm-soft rounded-full transition-colors"
          title="Reset conversation"
        >
          <RefreshCcw className="w-5 h-5 text-calm-accent" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full",
                m.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-calm-accent text-white rounded-tr-none" 
                  : "bg-calm-soft/50 text-calm-ink rounded-tl-none border border-calm-soft"
              )}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-calm-soft/50 p-4 rounded-2xl rounded-tl-none border border-calm-soft flex gap-1">
              <span className="w-1.5 h-1.5 bg-calm-accent/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-calm-accent/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-calm-accent/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-calm-soft/10 border-t border-calm-soft">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell me how you feel..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-calm-soft rounded-full focus:outline-none focus:ring-2 focus:ring-calm-accent/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-calm-accent text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
