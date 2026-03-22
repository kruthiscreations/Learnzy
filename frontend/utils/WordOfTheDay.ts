// Word of the Day — one word per day, cycling through the list
// Each entry has full learning data: meaning, sentence, synonym, antonym, telugu

export interface DailyWord {
  word: string;
  telugu: string;
  meaning: string;
  sentence: string;
  sentenceOfDay: string;
  synonym?: string;
  antonym?: string;
  emoji: string;
  category: string;
}

export const DAILY_WORDS: Record<string, DailyWord[]> = {
  'lkg-1st': [
    { word: 'Happy', telugu: 'సంతోషం', meaning: 'Feeling very good and pleased', sentence: 'I am happy today.', sentenceOfDay: 'The happy child smiled at everyone.', synonym: 'Joyful', antonym: 'Sad', emoji: '😊', category: 'feelings' },
    { word: 'Big', telugu: 'పెద్ద', meaning: 'Large in size', sentence: 'The elephant is big.', sentenceOfDay: 'A big red ball rolled down the hill.', synonym: 'Large', antonym: 'Small', emoji: '🐘', category: 'size' },
    { word: 'Run', telugu: 'పరిగెత్తు', meaning: 'To move quickly on your feet', sentence: 'I can run fast.', sentenceOfDay: 'The children run and play in the park.', synonym: 'Sprint', antonym: 'Walk', emoji: '🏃', category: 'action' },
    { word: 'Red', telugu: 'ఎరుపు', meaning: 'A bright colour like a tomato', sentence: 'The apple is red.', sentenceOfDay: 'She wore a beautiful red dress to the party.', synonym: 'Scarlet', antonym: 'Blue', emoji: '🍎', category: 'colour' },
    { word: 'Jump', telugu: 'దూకు', meaning: 'To push yourself up into the air', sentence: 'Frogs can jump high.', sentenceOfDay: 'The little frog loves to jump over puddles.', synonym: 'Leap', antonym: 'Sit', emoji: '🐸', category: 'action' },
    { word: 'Sweet', telugu: 'తీపి', meaning: 'Tasting like sugar or honey', sentence: 'Mangoes are sweet.', sentenceOfDay: 'Grandmother made a sweet halwa for us.', synonym: 'Sugary', antonym: 'Sour', emoji: '🍭', category: 'taste' },
    { word: 'Soft', telugu: 'మృదువు', meaning: 'Smooth and gentle to touch', sentence: 'The kitten is soft.', sentenceOfDay: 'I love the soft feel of my blanket.', synonym: 'Gentle', antonym: 'Hard', emoji: '🐱', category: 'texture' },
  ],
  '2nd-3rd': [
    { word: 'Brave', telugu: 'ధైర్యవంతుడు', meaning: 'Not afraid to face danger or difficulty', sentence: 'The brave soldier helped others.', sentenceOfDay: 'It takes a brave heart to tell the truth.', synonym: 'Courageous', antonym: 'Cowardly', emoji: '🦁', category: 'character' },
    { word: 'Gentle', telugu: 'సౌమ్యమైన', meaning: 'Calm, kind and careful', sentence: 'She is gentle with animals.', sentenceOfDay: 'The gentle teacher helped the nervous student.', synonym: 'Soft', antonym: 'Rough', emoji: '🕊️', category: 'character' },
    { word: 'Curious', telugu: 'ఆసక్తిగల', meaning: 'Wanting to learn or know about things', sentence: 'The curious boy asked many questions.', sentenceOfDay: 'A curious mind is the best tool for learning.', synonym: 'Inquisitive', antonym: 'Uninterested', emoji: '🔍', category: 'character' },
    { word: 'Enormous', telugu: 'అతి పెద్ద', meaning: 'Very, very large in size', sentence: 'The enormous tree gave shade to all.', sentenceOfDay: 'An enormous wave crashed onto the shore.', synonym: 'Huge', antonym: 'Tiny', emoji: '🌊', category: 'size' },
    { word: 'Sparkle', telugu: 'మెరవడం', meaning: 'To shine with many small flashes of light', sentence: 'Stars sparkle at night.', sentenceOfDay: 'Her eyes sparkle when she talks about books.', synonym: 'Glitter', antonym: 'Dull', emoji: '✨', category: 'appearance' },
    { word: 'Adventure', telugu: 'సాహసం', meaning: 'An exciting or unusual experience', sentence: 'Hiking in the hills was a great adventure.', sentenceOfDay: 'Every new book is a wonderful adventure.', synonym: 'Journey', antonym: 'Routine', emoji: '🏔️', category: 'experience' },
    { word: 'Respect', telugu: 'గౌరవం', meaning: 'Treating someone with care and kindness', sentence: 'We must respect our elders.', sentenceOfDay: 'Respect for others shows your own good character.', synonym: 'Honour', antonym: 'Disrespect', emoji: '🙏', category: 'value' },
  ],
  '4th-5th': [
    { word: 'Determined', telugu: 'పట్టుదల గల', meaning: 'Firmly decided to do something, no matter what', sentence: 'She was determined to win the race.', sentenceOfDay: 'A determined student never gives up on a problem.', synonym: 'Persistent', antonym: 'Hesitant', emoji: '💪', category: 'character' },
    { word: 'Transparent', telugu: 'పారదర్శక', meaning: 'Clear enough to be seen through; honest', sentence: 'Glass is transparent.', sentenceOfDay: 'A good leader is always transparent with their team.', synonym: 'Clear', antonym: 'Opaque', emoji: '🔮', category: 'quality' },
    { word: 'Collaborate', telugu: 'సహకరించు', meaning: 'To work together with others on a task', sentence: 'The students collaborate on projects.', sentenceOfDay: 'Scientists collaborate across the world to solve big problems.', synonym: 'Cooperate', antonym: 'Compete', emoji: '🤝', category: 'action' },
    { word: 'Eloquent', telugu: 'వాగ్మి', meaning: 'Speaking or writing fluently and expressively', sentence: 'The eloquent speaker moved the crowd.', sentenceOfDay: 'An eloquent essay uses precise words and clear ideas.', synonym: 'Articulate', antonym: 'Mumbling', emoji: '🎤', category: 'communication' },
    { word: 'Persevere', telugu: 'నిరంతరం ప్రయత్నించు', meaning: 'To keep going despite difficulties', sentence: 'She persevered through hard times.', sentenceOfDay: 'Those who persevere always find a way forward.', synonym: 'Persist', antonym: 'Quit', emoji: '🏅', category: 'character' },
    { word: 'Empathy', telugu: 'సానుభూతి', meaning: 'The ability to understand how others feel', sentence: 'Empathy makes you a better friend.', sentenceOfDay: 'Empathy means stepping into someone else\'s shoes.', synonym: 'Compassion', antonym: 'Indifference', emoji: '❤️', category: 'value' },
    { word: 'Influence', telugu: 'ప్రభావం', meaning: 'The power to affect how someone thinks or acts', sentence: 'Good teachers influence many lives.', sentenceOfDay: 'Books have a profound influence on our thinking.', synonym: 'Impact', antonym: 'Ineffectiveness', emoji: '💡', category: 'concept' },
  ],
  '5th-adv': [
    { word: 'Resilient', telugu: 'తిరిగి నిలబడే శక్తి', meaning: 'Able to recover quickly from difficulties', sentence: 'Resilient people bounce back from failure.', sentenceOfDay: 'A resilient community rebuilds itself after every setback.', synonym: 'Tough', antonym: 'Fragile', emoji: '🌱', category: 'character' },
    { word: 'Articulate', telugu: 'స్పష్టంగా మాట్లాడే', meaning: 'Able to express ideas clearly and effectively', sentence: 'An articulate speaker is easy to understand.', sentenceOfDay: 'Writing daily in a journal helps you become more articulate.', synonym: 'Eloquent', antonym: 'Incoherent', emoji: '🗣️', category: 'communication' },
    { word: 'Integrity', telugu: 'నిజాయితీ', meaning: 'The quality of being honest and having strong morals', sentence: 'She showed integrity by returning the lost wallet.', sentenceOfDay: 'Integrity means doing the right thing even when no one is watching.', synonym: 'Honesty', antonym: 'Corruption', emoji: '⚖️', category: 'value' },
    { word: 'Pragmatic', telugu: 'ఆచరణాత్మక', meaning: 'Dealing with problems in a practical, realistic way', sentence: 'A pragmatic leader finds solutions quickly.', sentenceOfDay: 'A pragmatic approach means focusing on what actually works.', synonym: 'Practical', antonym: 'Idealistic', emoji: '🔧', category: 'character' },
    { word: 'Eloquence', telugu: 'వాక్పటిమ', meaning: 'The ability to speak or write fluently and persuasively', sentence: 'Her eloquence impressed the judges.', sentenceOfDay: 'Eloquence comes from reading widely and practising daily.', synonym: 'Fluency', antonym: 'Inarticulateness', emoji: '📜', category: 'communication' },
    { word: 'Tenacious', telugu: 'పట్టువిడవని', meaning: 'Not giving up easily; holding firmly to something', sentence: 'The tenacious student studied until he understood.', sentenceOfDay: 'Tenacious effort over time beats sudden bursts of energy.', synonym: 'Persistent', antonym: 'Yielding', emoji: '🏹', category: 'character' },
    { word: 'Nuance', telugu: 'సూక్ష్మ భేదం', meaning: 'A subtle difference in meaning, expression or sound', sentence: 'Great writers understand the nuance of each word.', sentenceOfDay: 'Understanding nuance helps you communicate with precision.', synonym: 'Subtlety', antonym: 'Bluntness', emoji: '🎨', category: 'language' },
  ],
};

/**
 * Get today's word for a given level.
 * Uses the day-of-year to cycle through the word list, so a new word appears every day.
 */
export const getTodaysWord = (level: string): DailyWord => {
  const words = DAILY_WORDS[level] || DAILY_WORDS['lkg-1st'];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return words[dayOfYear % words.length];
};
