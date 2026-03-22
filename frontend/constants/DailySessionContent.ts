// Daily Session Content - 15 Minute Structured Learning

// Phonics Content - Letter Sounds and Songs
export const PHONICS_CONTENT = {
  alphabetSong: {
    title: 'ABC Song',
    lyrics: `A B C D E F G,
H I J K L M N O P,
Q R S T U V,
W X Y and Z.
Now I know my ABCs,
Next time won't you sing with me!`,
    audioPrompt: 'A B C D E F G, H I J K L M N O P, Q R S T U V, W X Y and Z. Now I know my A B Cs, Next time won\'t you sing with me!',
  },
  letterSounds: [
    { letter: 'A', sound: 'ah', word: 'Apple', emoji: '🍎' },
    { letter: 'B', sound: 'buh', word: 'Ball', emoji: '⚽' },
    { letter: 'C', sound: 'kuh', word: 'Cat', emoji: '🐱' },
    { letter: 'D', sound: 'duh', word: 'Dog', emoji: '🐶' },
    { letter: 'E', sound: 'eh', word: 'Elephant', emoji: '🐘' },
    { letter: 'F', sound: 'fuh', word: 'Fish', emoji: '🐟' },
    { letter: 'G', sound: 'guh', word: 'Grapes', emoji: '🍇' },
    { letter: 'H', sound: 'huh', word: 'Hat', emoji: '🎩' },
    { letter: 'I', sound: 'ih', word: 'Ice cream', emoji: '🍦' },
    { letter: 'J', sound: 'juh', word: 'Juice', emoji: '🧃' },
    { letter: 'K', sound: 'kuh', word: 'Kite', emoji: '🪁' },
    { letter: 'L', sound: 'luh', word: 'Lion', emoji: '🦁' },
    { letter: 'M', sound: 'muh', word: 'Moon', emoji: '🌙' },
    { letter: 'N', sound: 'nuh', word: 'Nest', emoji: '🪺' },
    { letter: 'O', sound: 'oh', word: 'Orange', emoji: '🍊' },
    { letter: 'P', sound: 'puh', word: 'Penguin', emoji: '🐧' },
    { letter: 'Q', sound: 'kwuh', word: 'Queen', emoji: '👸' },
    { letter: 'R', sound: 'ruh', word: 'Rabbit', emoji: '🐰' },
    { letter: 'S', sound: 'sss', word: 'Sun', emoji: '☀️' },
    { letter: 'T', sound: 'tuh', word: 'Tree', emoji: '🌳' },
    { letter: 'U', sound: 'uh', word: 'Umbrella', emoji: '☂️' },
    { letter: 'V', sound: 'vuh', word: 'Van', emoji: '🚐' },
    { letter: 'W', sound: 'wuh', word: 'Water', emoji: '💧' },
    { letter: 'X', sound: 'ks', word: 'X-ray', emoji: '🩻' },
    { letter: 'Y', sound: 'yuh', word: 'Yellow', emoji: '💛' },
    { letter: 'Z', sound: 'zuh', word: 'Zebra', emoji: '🦓' },
  ],
  rhymingPairs: [
    { word1: 'Cat', word2: 'Hat', emoji1: '🐱', emoji2: '🎩' },
    { word1: 'Dog', word2: 'Frog', emoji1: '🐶', emoji2: '🐸' },
    { word1: 'Sun', word2: 'Fun', emoji1: '☀️', emoji2: '🎉' },
    { word1: 'Ball', word2: 'Tall', emoji1: '⚽', emoji2: '📏' },
    { word1: 'Star', word2: 'Car', emoji1: '⭐', emoji2: '🚗' },
    { word1: 'Bee', word2: 'Tree', emoji1: '🐝', emoji2: '🌳' },
    { word1: 'Moon', word2: 'Spoon', emoji1: '🌙', emoji2: '🥄' },
    { word1: 'Fish', word2: 'Dish', emoji1: '🐟', emoji2: '🍽️' },
    { word1: 'Ring', word2: 'Sing', emoji1: '💍', emoji2: '🎤' },
    { word1: 'Book', word2: 'Cook', emoji1: '📚', emoji2: '👨‍🍳' },
  ],
};

// Stories with Fill-in-the-Blank
export const STORIES = [
  {
    id: 'hungry_cat',
    title: 'The Hungry Cat',
    pages: [
      {
        text: 'Once upon a time, there was a little ___.',
        blank: 'cat',
        options: ['cat', 'dog', 'bird'],
        image: '🐱',
      },
      {
        text: 'The cat was very ___.',
        blank: 'hungry',
        options: ['hungry', 'sleepy', 'happy'],
        image: '😋',
      },
      {
        text: 'The cat wanted some ___.',
        blank: 'milk',
        options: ['milk', 'water', 'juice'],
        image: '🥛',
      },
      {
        text: 'The cat drank the milk and felt ___.',
        blank: 'happy',
        options: ['happy', 'sad', 'angry'],
        image: '😊',
      },
      {
        text: 'The end!',
        blank: null,
        options: [],
        image: '🎉',
      },
    ],
  },
  {
    id: 'sunny_day',
    title: 'A Sunny Day',
    pages: [
      {
        text: 'Today the ___ is shining bright.',
        blank: 'sun',
        options: ['sun', 'moon', 'star'],
        image: '☀️',
      },
      {
        text: 'I want to play in the ___.',
        blank: 'park',
        options: ['park', 'house', 'school'],
        image: '🏞️',
      },
      {
        text: 'I see a big ___ tree.',
        blank: 'green',
        options: ['green', 'red', 'blue'],
        image: '🌳',
      },
      {
        text: 'I play with my ___.',
        blank: 'ball',
        options: ['ball', 'book', 'bag'],
        image: '⚽',
      },
      {
        text: 'What a fun day!',
        blank: null,
        options: [],
        image: '🎊',
      },
    ],
  },
  {
    id: 'bedtime',
    title: 'Bedtime Story',
    pages: [
      {
        text: 'It is ___ time.',
        blank: 'night',
        options: ['night', 'day', 'morning'],
        image: '🌙',
      },
      {
        text: 'I brush my ___.',
        blank: 'teeth',
        options: ['teeth', 'hair', 'shoes'],
        image: '🪥',
      },
      {
        text: 'I put on my ___.',
        blank: 'pajamas',
        options: ['pajamas', 'shoes', 'hat'],
        image: '👕',
      },
      {
        text: 'Mommy reads me a ___.',
        blank: 'book',
        options: ['book', 'song', 'game'],
        image: '📖',
      },
      {
        text: 'Good night! Sweet ___!',
        blank: 'dreams',
        options: ['dreams', 'food', 'toys'],
        image: '💤',
      },
    ],
  },
];

// Fine Motor Activities
export const FINE_MOTOR_ACTIVITIES = [
  {
    id: 'letter_tracing',
    name: 'Letter Tracing',
    icon: '✏️',
    description: 'Trace letters with your finger!',
    color: '#FF6B9D',
    letters: ['A', 'B', 'C', 'D', 'E'],
  },
  {
    id: 'magnet_fishing',
    name: 'Magnet Fishing',
    icon: '🎣',
    description: 'Catch letters and say words!',
    color: '#3B82F6',
    items: [
      { letter: 'A', word: 'Apple' },
      { letter: 'B', word: 'Ball' },
      { letter: 'C', word: 'Cat' },
      { letter: 'D', word: 'Dog' },
      { letter: 'E', word: 'Egg' },
    ],
  },
  {
    id: 'sticker_path',
    name: 'Sticker Path',
    icon: '⭐',
    description: 'Place stickers on the path!',
    color: '#F59E0B',
  },
  {
    id: 'connect_dots',
    name: 'Connect the Dots',
    icon: '🔵',
    description: 'Connect dots to make shapes!',
    color: '#10B981',
  },
];

// Parent Tips
export const PARENT_TIPS = [
  {
    id: 'speech_modeling',
    title: 'Model Correct Speech',
    tip: "If your child says 'tu' for 'soup', respond with 'Yes, that's soup!' without directly correcting them. This encourages learning without shame.",
    icon: '💬',
    importance: 'high',
  },
  {
    id: 'screen_time',
    title: 'Screen Time Reminder',
    tip: 'Limit total screen time to under one hour per day for young children. Take breaks every 15 minutes.',
    icon: '⏰',
    importance: 'high',
  },
  {
    id: 'daily_routine',
    title: 'Make it a Routine',
    tip: 'Set a fixed time each day for learning. Consistency helps children retain information better.',
    icon: '📅',
    importance: 'medium',
  },
  {
    id: 'real_world',
    title: 'Connect to Real World',
    tip: 'Point out colors, shapes, and objects during daily activities. "Look! The ball is round like a circle!"',
    icon: '🌍',
    importance: 'medium',
  },
  {
    id: 'praise',
    title: 'Celebrate Small Wins',
    tip: 'Every new word learned is a victory! Celebrate with claps, hugs, and encouraging words.',
    icon: '🎉',
    importance: 'medium',
  },
  {
    id: 'patience',
    title: 'Be Patient',
    tip: 'Every child learns at their own pace. If they struggle, take a break and try again later.',
    icon: '❤️',
    importance: 'high',
  },
];

// Daily Session Structure
export const DAILY_SESSION_STRUCTURE = {
  totalDuration: 15,
  sections: [
    {
      id: 'phonics',
      name: 'Phonics Corner',
      duration: 3,
      icon: '🎵',
      color: '#EC4899',
      description: 'Sing ABC, learn letter sounds!',
    },
    {
      id: 'core_skills',
      name: 'Learn & Practice',
      duration: 5,
      icon: '📚',
      color: '#3B82F6',
      description: 'Colors, shapes, body parts!',
    },
    {
      id: 'fine_motor',
      name: 'Fun Activities',
      duration: 4,
      icon: '✏️',
      color: '#10B981',
      description: 'Tracing, fishing, stickers!',
    },
    {
      id: 'story_time',
      name: 'Story Time',
      duration: 3,
      icon: '📖',
      color: '#F59E0B',
      description: 'Read stories together!',
    },
  ],
};

// Age-specific Core Skills Focus
export const CORE_SKILLS_BY_AGE = {
  age2: {
    focus: 'Body parts, everyday objects, and family',
    technique: 'Total Immersion',
    description: 'Describe actions as you do them',
    examples: [
      'Mummy is putting the clothes in the drawer',
      'Look! This is your hand. Wave your hand!',
      'The ball is round. Can you roll the ball?',
    ],
  },
  age3: {
    focus: '5-6 word sentences and questions',
    technique: 'Open-ended Questions',
    description: 'Encourage longer responses',
    examples: [
      'What would you like for breakfast?',
      'Tell me about your favorite toy',
      'What color is the sky today?',
    ],
  },
  age4: {
    focus: 'Following directions and retelling',
    technique: 'Logical Steps',
    description: 'Multi-step instructions',
    examples: [
      'First put on your socks, then put on your shoes',
      'Can you tell me what happened in the story?',
      'What do you think will happen next?',
    ],
  },
};
