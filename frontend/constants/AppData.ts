// ─── Characters: 4 AI Buddies ────────────────────────────────────────────────
// Canonical names everywhere: Cuty (cat), Candy (dog), Bunny (rabbit), Jumbo (elephant)
export const CHARACTERS = {
  cat: {
    id: 'cat',
    name: 'Cuty',
    emoji: '🐱',
    color: '#FF6B9D',
    gradientColors: ['#FF6B9D', '#FF9AC1'] as [string, string],
    personality: 'Playful & Curious',
    description: 'A mischievous kitty who loves to explore!',
    voice: 'nova',
    ttsSpeed: 1.05,
    catchPhrases: [
      "Meow! Let's figure this out together!",
      "Oops! Even I make mistakes — let's try again!",
      "I'm not sure, but we can discover it together!",
      "Purr-fect! You did it! 🌟",
    ],
  },
  dog: {
    id: 'dog',
    name: 'Candy',
    emoji: '🐶',
    color: '#FFB84D',
    gradientColors: ['#FFB84D', '#FFCF7A'] as [string, string],
    personality: 'Loyal & Enthusiastic',
    description: 'Your cheerful friend who celebrates every success!',
    voice: 'alloy',
    ttsSpeed: 1.1,
    catchPhrases: [
      "Woof! Let's learn this together, buddy!",
      "Even I get confused sometimes — let's try again!",
      "You're teaching ME new things! Amazing!",
      "WOOHOO! We make such a great team! 🐾",
    ],
  },
  rabbit: {
    id: 'rabbit',
    name: 'Bunny',
    emoji: '🐰',
    color: '#A78BFA',
    gradientColors: ['#A78BFA', '#C4B5FD'] as [string, string],
    personality: 'Quick & Energetic',
    description: 'A bouncy bunny full of fun facts!',
    voice: 'shimmer',
    ttsSpeed: 1.08,
    catchPhrases: [
      "Hop hop! Let's discover this together!",
      "Ooh, I don't know this one either — let's find out!",
      "Wait, let me think... *wiggles ears* 🐰",
      "YAY! We learned something new together!",
    ],
  },
  elephant: {
    id: 'elephant',
    name: 'Jumbo',
    emoji: '🐘',
    color: '#60A5FA',
    gradientColors: ['#60A5FA', '#93C5FD'] as [string, string],
    personality: 'Wise & Patient',
    description: 'A gentle guide who helps you think deeper!',
    voice: 'onyx',
    ttsSpeed: 0.95,
    catchPhrases: [
      "Hmm, great question! Let me think with you...",
      "Even big elephants forget things! Let's learn together!",
      "You know what? I think YOU might know the answer!",
      "Wonderful! We figured it out as a team! 🐘",
    ],
  },
};

export type CharacterId = keyof typeof CHARACTERS;

// ─── Class Groups: LKG → 5th Standard ───────────────────────────────────────
export const CLASS_GROUPS = [
  { id: 'lkg',    label: 'LKG',     fullName: 'Lower Kindergarten', ageRange: '3–4 yrs', color: '#FF6B9D', emoji: '🌱' },
  { id: 'ukg',    label: 'UKG',     fullName: 'Upper Kindergarten', ageRange: '4–5 yrs', color: '#FF8C42', emoji: '🌷' },
  { id: 'class1', label: 'Class 1', fullName: '1st Standard',        ageRange: '5–6 yrs', color: '#FFB84D', emoji: '⭐' },
  { id: 'class2', label: 'Class 2', fullName: '2nd Standard',        ageRange: '6–7 yrs', color: '#A0C35A', emoji: '🌟' },
  { id: 'class3', label: 'Class 3', fullName: '3rd Standard',        ageRange: '7–8 yrs', color: '#34D399', emoji: '🚀' },
  { id: 'class4', label: 'Class 4', fullName: '4th Standard',        ageRange: '8–9 yrs', color: '#60A5FA', emoji: '💡' },
  { id: 'class5', label: 'Class 5', fullName: '5th Standard',        ageRange: '9–10 yrs', color: '#A78BFA', emoji: '🏆' },
];

export type ClassId = typeof CLASS_GROUPS[number]['id'];

export function classToLevel(classId: string): string {
  if (['lkg', 'ukg', 'class1'].includes(classId)) return 'lkg-1st';
  if (['class2', 'class3'].includes(classId)) return '2nd-3rd';
  return '4th-5th';
}

// ─── Legacy LEVELS (word API) ─────────────────────────────────────────────────
export const LEVELS = [
  { id: 'lkg-1st', name: 'LKG - 1st Std', ageRange: '4-6 years', color: '#FF6B9D', totalWords: 404 },
  { id: '2nd-3rd', name: '2nd - 3rd Std', ageRange: '7-8 years', color: '#60A5FA', totalWords: 346 },
  { id: '4th-5th', name: '4th - 5th Std', ageRange: '9-10 years', color: '#10B981', totalWords: 367 },
];

// ─── 6 Learning Modules ───────────────────────────────────────────────────────
export const MODULES = [
  { id: 'vocabulary',    label: 'Vocabulary',   emoji: '📖', color: '#FF6B9D', gradient: ['#FF6B9D','#FF9AC1'] as [string,string], route: '/word-explorer',          desc: 'Learn new words every day' },
  { id: 'phonics',       label: 'Phonics',       emoji: '🔤', color: '#FF8C42', gradient: ['#FF8C42','#FFAD75'] as [string,string], route: '/phonics',                desc: 'Master sounds & letters' },
  { id: 'writing',       label: 'Writing',       emoji: '✍️', color: '#10B981', gradient: ['#10B981','#34D399'] as [string,string], route: '/games/writing-workshop', desc: 'Build sentences & stories' },
  { id: 'grammar',       label: 'Grammar',       emoji: '📝', color: '#F59E0B', gradient: ['#F59E0B','#FBBF24'] as [string,string], route: '/games/grammar-quests',   desc: 'Rules made fun!' },
  { id: 'conversation',  label: 'Conversation',  emoji: '🗣️', color: '#60A5FA', gradient: ['#60A5FA','#93C5FD'] as [string,string], route: '/chat/',                   desc: 'Talk with your AI buddy' },
  { id: 'games',         label: 'Game Zone',     emoji: '🎮', color: '#A78BFA', gradient: ['#A78BFA','#C4B5FD'] as [string,string], route: '/games',                  desc: 'Learn while you play!' },
  { id: 'inquisitive',   label: 'Inquisitive',   emoji: '🧠', color: '#4F46E5', gradient: ['#4F46E5','#6366F1'] as [string,string], route: '/inquisitive',             desc: 'Maths tricks + daily brain exercises!' },
];

export const COLORS = {
  primary: '#6366F1',
  secondary: '#A78BFA',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  text: { primary: '#1F2937', secondary: '#6B7280', light: '#9CA3AF' },
};
