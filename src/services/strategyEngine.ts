import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type Mood = 'energetic' | 'restless' | 'calm' | 'focused' | 'frustrated' | 'unknown';

export interface UserMetrics {
  bubblePopCount: number;
  zenGardenTime: number;
  focusQuestSuccess: number;
  focusQuestFails: number;
  breathingSessions: number;
  lastMood: Mood;
  interactionHistory: { timestamp: number; activity: string }[];
}

const DEFAULT_METRICS: UserMetrics = {
  bubblePopCount: 0,
  zenGardenTime: 0,
  focusQuestSuccess: 0,
  focusQuestFails: 0,
  breathingSessions: 0,
  lastMood: 'unknown',
  interactionHistory: [],
};

class StrategyEngine {
  private metrics: UserMetrics = { ...DEFAULT_METRICS };

  constructor() {
    this.loadMetrics();
  }

  private loadMetrics() {
    const saved = localStorage.getItem('mindful_quest_metrics');
    if (saved) {
      this.metrics = { ...DEFAULT_METRICS, ...JSON.parse(saved) };
    }
  }

  private saveMetrics() {
    localStorage.setItem('mindful_quest_metrics', JSON.stringify(this.metrics));
  }

  logActivity(activity: string, value: number = 1) {
    this.metrics.interactionHistory.push({ timestamp: Date.now(), activity });
    if (this.metrics.interactionHistory.length > 50) this.metrics.interactionHistory.shift();

    switch (activity) {
      case 'bubble_pop': this.metrics.bubblePopCount += value; break;
      case 'zen_garden': this.metrics.zenGardenTime += value; break;
      case 'focus_success': this.metrics.focusQuestSuccess += value; break;
      case 'focus_fail': this.metrics.focusQuestFails += value; break;
      case 'breathing': this.metrics.breathingSessions += value; break;
    }
    this.saveMetrics();
  }

  async analyzeMoodFromChat(chatHistory: string[]): Promise<Mood> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following chat history from a child with ADHD and determine their current mood. 
        Return ONLY one of these words: energetic, restless, calm, focused, frustrated.
        
        Chat: ${chatHistory.join('\n')}`,
      });
      const mood = response.text?.trim().toLowerCase() as Mood;
      if (['energetic', 'restless', 'calm', 'focused', 'frustrated'].includes(mood)) {
        this.metrics.lastMood = mood;
        this.saveMetrics();
        return mood;
      }
    } catch (e) {
      console.error('Mood analysis failed', e);
    }
    return 'unknown';
  }

  getRecommendations() {
    const recs = [];
    const { bubblePopCount, zenGardenTime, lastMood, focusQuestSuccess, focusQuestFails } = this.metrics;

    // Logic based on mood
    if (lastMood === 'frustrated' || lastMood === 'restless') {
      recs.push({
        id: 'calm',
        title: 'Deep Breathing',
        reason: 'You seem a bit restless. Let\'s find your rhythm.',
        priority: 1
      });
    }

    // Logic based on preferences
    if (bubblePopCount > 10 && zenGardenTime < 5) {
      recs.push({
        id: 'play',
        title: 'Bubble Pop',
        reason: 'You love popping bubbles! Ready for a new high score?',
        priority: 2
      });
    } else if (zenGardenTime > 10) {
      recs.push({
        id: 'play',
        title: 'Zen Garden',
        reason: 'You find the sand relaxing. Want to rake some patterns?',
        priority: 2
      });
    }

    // Logic based on focus performance
    if (focusQuestFails > focusQuestSuccess) {
      recs.push({
        id: 'focus',
        title: 'Short Focus Quest',
        reason: 'Let\'s try a quick 1-minute focus challenge!',
        priority: 3
      });
    } else {
      recs.push({
        id: 'focus',
        title: 'Focus Quest',
        reason: 'You\'re a focus master! Ready for a 5-minute quest?',
        priority: 3
      });
    }

    return recs.sort((a, b) => a.priority - b.priority).slice(0, 2);
  }

  getMetrics() {
    return this.metrics;
  }
}

export const strategyEngine = new StrategyEngine();
