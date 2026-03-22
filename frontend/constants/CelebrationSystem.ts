// Mistake Celebration & Encouragement System
// Based on growth mindset research - celebrates effort, not just correctness

export interface CelebrationConfig {
  type: 'correct' | 'almost' | 'try_again' | 'great_effort';
  animation: string;
  sound?: string;
  message: string;
  emoji: string;
}

// Celebration messages for different scenarios
export const MISTAKE_CELEBRATIONS: CelebrationConfig[] = [
  // When child gets it wrong but tried
  {
    type: 'great_effort',
    animation: 'bounce',
    message: "WOW! You tried so hard! That's what REAL learners do!",
    emoji: '💪'
  },
  {
    type: 'great_effort',
    animation: 'pulse',
    message: "High five for trying! Mistakes help our brains grow stronger!",
    emoji: '🙌'
  },
  {
    type: 'great_effort',
    animation: 'tada',
    message: "You're SO brave for trying! Let's figure this out together!",
    emoji: '🌟'
  },
  {
    type: 'great_effort',
    animation: 'swing',
    message: "Oopsie! But guess what? Even I make mistakes! Let's try again!",
    emoji: '🤗'
  },
  {
    type: 'great_effort',
    animation: 'jello',
    message: "That was a GREAT try! Your brain is getting stronger!",
    emoji: '🧠'
  },
];

export const ALMOST_CORRECT_MESSAGES: CelebrationConfig[] = [
  {
    type: 'almost',
    animation: 'bounce',
    message: "SO CLOSE! You're almost there! One more try?",
    emoji: '🔥'
  },
  {
    type: 'almost',
    animation: 'pulse',
    message: "Ooh! That was really good! Just a tiny bit more!",
    emoji: '✨'
  },
  {
    type: 'almost',
    animation: 'tada',
    message: "WOW! You nearly got it! Let's try one more time together!",
    emoji: '🎯'
  },
];

export const CORRECT_CELEBRATIONS: CelebrationConfig[] = [
  {
    type: 'correct',
    animation: 'tada',
    message: "AMAZING! WE did it TOGETHER!",
    emoji: '🎉'
  },
  {
    type: 'correct',
    animation: 'bounce',
    message: "WOOHOO! High five, learning buddy!",
    emoji: '🙌'
  },
  {
    type: 'correct',
    animation: 'rubberBand',
    message: "INCREDIBLE! You're a SUPERSTAR!",
    emoji: '⭐'
  },
  {
    type: 'correct',
    animation: 'swing',
    message: "YES YES YES! That's absolutely RIGHT!",
    emoji: '🏆'
  },
  {
    type: 'correct',
    animation: 'flash',
    message: "BOOM! You NAILED it!",
    emoji: '💥'
  },
];

// Get random celebration based on result
export function getCelebration(isCorrect: boolean, isAlmost: boolean = false): CelebrationConfig {
  if (isCorrect) {
    return CORRECT_CELEBRATIONS[Math.floor(Math.random() * CORRECT_CELEBRATIONS.length)];
  }
  if (isAlmost) {
    return ALMOST_CORRECT_MESSAGES[Math.floor(Math.random() * ALMOST_CORRECT_MESSAGES.length)];
  }
  return MISTAKE_CELEBRATIONS[Math.floor(Math.random() * MISTAKE_CELEBRATIONS.length)];
}

// Sidekick Expression States (Rive-style state machine)
export type SidekickState = 
  | 'idle'
  | 'thinking'
  | 'speaking'
  | 'listening'
  | 'celebrating'
  | 'confused'
  | 'surprised'
  | 'encouraging'
  | 'highfive';

export interface SidekickExpression {
  state: SidekickState;
  animation: string;
  duration: number;
  face: 'neutral' | 'happy' | 'thinking' | 'surprised' | 'sparkle' | 'wink';
  gesture?: string;
}

// State machine for sidekick expressions
export const SIDEKICK_EXPRESSIONS: Record<SidekickState, SidekickExpression> = {
  idle: {
    state: 'idle',
    animation: 'pulse',
    duration: 2000,
    face: 'neutral',
    gesture: 'wave'
  },
  thinking: {
    state: 'thinking',
    animation: 'swing',
    duration: 1500,
    face: 'thinking',
    gesture: 'scratch_head'
  },
  speaking: {
    state: 'speaking',
    animation: 'bounce',
    duration: 500,
    face: 'happy',
    gesture: 'talk'
  },
  listening: {
    state: 'listening',
    animation: 'pulse',
    duration: 1000,
    face: 'neutral',
    gesture: 'ear_cup'
  },
  celebrating: {
    state: 'celebrating',
    animation: 'tada',
    duration: 2000,
    face: 'sparkle',
    gesture: 'jump'
  },
  confused: {
    state: 'confused',
    animation: 'wobble',
    duration: 1000,
    face: 'thinking',
    gesture: 'shrug'
  },
  surprised: {
    state: 'surprised',
    animation: 'flash',
    duration: 800,
    face: 'surprised',
    gesture: 'gasp'
  },
  encouraging: {
    state: 'encouraging',
    animation: 'heartBeat',
    duration: 1500,
    face: 'happy',
    gesture: 'thumbs_up'
  },
  highfive: {
    state: 'highfive',
    animation: 'rubberBand',
    duration: 1000,
    face: 'sparkle',
    gesture: 'high_five'
  }
};

// Determine sidekick state from message content
export function getSidekickStateFromMessage(message: string): SidekickState {
  const lower = message.toLowerCase();
  
  if (lower.includes('yay') || lower.includes('correct') || lower.includes('amazing') || lower.includes('great job')) {
    return 'celebrating';
  }
  if (lower.includes('hmm') || lower.includes('think') || lower.includes('let me')) {
    return 'thinking';
  }
  if (lower.includes('oops') || lower.includes('not sure') || lower.includes('mistake')) {
    return 'confused';
  }
  if (lower.includes('wow') || lower.includes('whoa') || lower.includes('!')) {
    return 'surprised';
  }
  if (lower.includes('try') || lower.includes('you can') || lower.includes('believe')) {
    return 'encouraging';
  }
  if (lower.includes('high five') || lower.includes('🙌') || lower.includes('together')) {
    return 'highfive';
  }
  if (lower.includes('?')) {
    return 'listening';
  }
  
  return 'speaking';
}

// Growth mindset phrases for different scenarios
export const GROWTH_MINDSET_PHRASES = {
  beforeAttempt: [
    "Let's try this together!",
    "I believe in you!",
    "Ready? Let's do this!",
    "You've got this, buddy!",
  ],
  afterMistake: [
    "Mistakes are how our brains grow!",
    "Every try makes you stronger!",
    "That's exactly how learning works!",
    "Even scientists make mistakes!",
  ],
  afterSuccess: [
    "Your hard work paid off!",
    "See what happens when you try?",
    "You practiced and got better!",
    "That's the power of trying!",
  ],
  encouragement: [
    "I'm learning WITH you!",
    "We're a great team!",
    "Together we can do anything!",
    "You teach me new things too!",
  ],
};

export function getGrowthMindsetPhrase(scenario: keyof typeof GROWTH_MINDSET_PHRASES): string {
  const phrases = GROWTH_MINDSET_PHRASES[scenario];
  return phrases[Math.floor(Math.random() * phrases.length)];
}
