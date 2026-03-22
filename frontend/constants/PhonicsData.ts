// Comprehensive Phonics Module Data
// Aligned with CBSE curriculum for ages 3-8 (Pre-primary to Class 2)

export interface PhonicsWord {
  word: string;
  phonemes: string[];
  syllables: string[];
  audioHint: string;
  image?: string;
  hindiTranslation?: string;
  teluguTranslation?: string;
}

export interface PhonicsActivity {
  id: string;
  type: 'matching' | 'blending' | 'sorting' | 'voice' | 'drag-drop' | 'tracing' | 'song';
  title: string;
  titleHindi?: string;
  titleTelugu?: string;
  instructions: string;
  data: any;
  points: number;
  timeLimit?: number;
}

export interface PhonicsLesson {
  id: string;
  title: string;
  titleHindi?: string;
  titleTelugu?: string;
  description: string;
  duration: number; // minutes
  activities: PhonicsActivity[];
  words: PhonicsWord[];
  song?: { title: string; lyrics: string; audioUrl?: string };
}

export interface PhonicsLevel {
  id: number;
  name: string;
  nameHindi: string;
  nameTelugu: string;
  ageRange: string;
  description: string;
  color: string;
  icon: string;
  lessons: PhonicsLesson[];
  unlockRequirement: number; // mastery % needed to unlock next
  totalStars: number;
  badge: { name: string; icon: string; description: string };
}

// ==================== LEVEL 0: ALPHABET FOUNDATIONS (Ages 3-4) ====================
export const PHONICS_LEVEL_0: PhonicsLevel = {
  id: 0,
  name: "Alphabet Foundations",
  nameHindi: "वर्णमाला की नींव",
  nameTelugu: "అక్షరమాల పునాది",
  ageRange: "3-4 years",
  description: "Pre-phonics: Letter recognition, rhymes, syllable awareness",
  color: "#FF6B9D",
  icon: "🎒",
  unlockRequirement: 0, // Auto-starts
  totalStars: 100,
  badge: { name: "ABC Explorer", icon: "🌟", description: "Mastered alphabet foundations!" },
  lessons: [
    {
      id: "L0_01",
      title: "Meet the Alphabet",
      titleHindi: "वर्णमाला से मिलो",
      titleTelugu: "అక్షరమాలను కలవండి",
      description: "Learn A-Z with fun songs and pictures",
      duration: 15,
      activities: [
        {
          id: "L0_01_A1",
          type: "song",
          title: "ABC Song",
          instructions: "Sing along with the alphabet song!",
          data: {
            lyrics: "A B C D E F G, H I J K L M N O P, Q R S T U V, W X Y and Z. Now I know my ABCs, next time won't you sing with me!",
            audioUrl: "abc_song.mp3"
          },
          points: 10
        },
        {
          id: "L0_01_A2",
          type: "matching",
          title: "Letter Hunt",
          instructions: "Find the matching uppercase and lowercase letters",
          data: {
            pairs: [
              { upper: "A", lower: "a", image: "apple", word: "Apple" },
              { upper: "B", lower: "b", image: "ball", word: "Ball" },
              { upper: "C", lower: "c", image: "cat", word: "Cat" },
              { upper: "D", lower: "d", image: "dog", word: "Dog" },
              { upper: "E", lower: "e", image: "elephant", word: "Elephant" }
            ]
          },
          points: 20
        },
        {
          id: "L0_01_A3",
          type: "tracing",
          title: "Trace the Letters",
          instructions: "Trace each letter with your finger",
          data: {
            letters: ["A", "B", "C", "D", "E"]
          },
          points: 15
        }
      ],
      words: [
        { word: "Apple", phonemes: ["a", "p", "l"], syllables: ["Ap", "ple"], audioHint: "/ˈæp.əl/", hindiTranslation: "सेब", teluguTranslation: "ఆపిల్" },
        { word: "Ball", phonemes: ["b", "ɔː", "l"], syllables: ["Ball"], audioHint: "/bɔːl/", hindiTranslation: "गेंद", teluguTranslation: "బంతి" },
        { word: "Cat", phonemes: ["k", "æ", "t"], syllables: ["Cat"], audioHint: "/kæt/", hindiTranslation: "बिल्ली", teluguTranslation: "పిల్లి" },
        { word: "Dog", phonemes: ["d", "ɒ", "ɡ"], syllables: ["Dog"], audioHint: "/dɒɡ/", hindiTranslation: "कुत्ता", teluguTranslation: "కుక్క" },
        { word: "Elephant", phonemes: ["e", "l", "ə", "f", "ə", "n", "t"], syllables: ["El", "e", "phant"], audioHint: "/ˈel.ɪ.fənt/", hindiTranslation: "हाथी", teluguTranslation: "ఏనుగు" }
      ],
      song: {
        title: "ABC Song",
        lyrics: "A B C D E F G, H I J K L M N O P..."
      }
    },
    {
      id: "L0_02",
      title: "Rhyme Time",
      titleHindi: "तुकबंदी का समय",
      titleTelugu: "ప్రాస సమయం",
      description: "Discover words that sound the same at the end",
      duration: 15,
      activities: [
        {
          id: "L0_02_A1",
          type: "matching",
          title: "Rhyme Match",
          instructions: "Match words that rhyme (sound the same at the end)",
          data: {
            pairs: [
              { word1: "cat", word2: "hat", rhyme: "-at" },
              { word1: "dog", word2: "frog", rhyme: "-og" },
              { word1: "sun", word2: "fun", rhyme: "-un" },
              { word1: "bed", word2: "red", rhyme: "-ed" },
              { word1: "top", word2: "hop", rhyme: "-op" }
            ]
          },
          points: 25
        },
        {
          id: "L0_02_A2",
          type: "voice",
          title: "Say the Rhyme",
          instructions: "Say the rhyming word out loud!",
          data: {
            prompts: [
              { given: "cat", options: ["hat", "dog", "sun"], correct: "hat" },
              { given: "moon", options: ["spoon", "cat", "red"], correct: "spoon" }
            ]
          },
          points: 20
        }
      ],
      words: [
        { word: "Cat", phonemes: ["k", "æ", "t"], syllables: ["Cat"], audioHint: "/kæt/", hindiTranslation: "बिल्ली", teluguTranslation: "పిల్లి" },
        { word: "Hat", phonemes: ["h", "æ", "t"], syllables: ["Hat"], audioHint: "/hæt/", hindiTranslation: "टोपी", teluguTranslation: "టోపీ" },
        { word: "Bat", phonemes: ["b", "æ", "t"], syllables: ["Bat"], audioHint: "/bæt/", hindiTranslation: "चमगादड़", teluguTranslation: "గబ్బిలం" },
        { word: "Mat", phonemes: ["m", "æ", "t"], syllables: ["Mat"], audioHint: "/mæt/", hindiTranslation: "चटाई", teluguTranslation: "చాప" },
        { word: "Rat", phonemes: ["r", "æ", "t"], syllables: ["Rat"], audioHint: "/ræt/", hindiTranslation: "चूहा", teluguTranslation: "ఎలుక" }
      ]
    },
    {
      id: "L0_03",
      title: "Syllable Clap",
      titleHindi: "अक्षर ताली",
      titleTelugu: "అక్షర చప్పట్లు",
      description: "Clap the syllables in words",
      duration: 15,
      activities: [
        {
          id: "L0_03_A1",
          type: "matching",
          title: "Clap Counter",
          instructions: "Count how many claps (syllables) are in each word",
          data: {
            words: [
              { word: "Cat", syllables: 1, claps: "👏" },
              { word: "Tiger", syllables: 2, claps: "👏👏" },
              { word: "Elephant", syllables: 3, claps: "👏👏👏" },
              { word: "Butterfly", syllables: 3, claps: "👏👏👏" },
              { word: "Hippopotamus", syllables: 5, claps: "👏👏👏👏👏" }
            ]
          },
          points: 30
        }
      ],
      words: [
        { word: "Tiger", phonemes: ["t", "aɪ", "ɡ", "ər"], syllables: ["Ti", "ger"], audioHint: "/ˈtaɪ.ɡər/", hindiTranslation: "बाघ", teluguTranslation: "పులి" },
        { word: "Butterfly", phonemes: ["b", "ʌ", "t", "ər", "f", "l", "aɪ"], syllables: ["But", "ter", "fly"], audioHint: "/ˈbʌt.ər.flaɪ/", hindiTranslation: "तितली", teluguTranslation: "సీతాకోకచిలుక" },
        { word: "Banana", phonemes: ["b", "ə", "n", "æ", "n", "ə"], syllables: ["Ba", "na", "na"], audioHint: "/bəˈnæn.ə/", hindiTranslation: "केला", teluguTranslation: "అరటిపండు" }
      ]
    },
    {
      id: "L0_04",
      title: "First Sound Fun",
      titleHindi: "पहली आवाज़",
      titleTelugu: "మొదటి శబ్దం",
      description: "Identify the first sound in words",
      duration: 15,
      activities: [
        {
          id: "L0_04_A1",
          type: "sorting",
          title: "Sound Sort",
          instructions: "Sort words by their first sound",
          data: {
            sounds: [
              { sound: "/b/", words: ["Ball", "Bat", "Bed", "Book", "Bus"] },
              { sound: "/k/", words: ["Cat", "Car", "Cup", "Cake", "Cow"] },
              { sound: "/d/", words: ["Dog", "Duck", "Door", "Doll", "Drum"] }
            ]
          },
          points: 25
        }
      ],
      words: [
        { word: "Ball", phonemes: ["b", "ɔː", "l"], syllables: ["Ball"], audioHint: "/bɔːl/", hindiTranslation: "गेंद", teluguTranslation: "బంతి" },
        { word: "Cup", phonemes: ["k", "ʌ", "p"], syllables: ["Cup"], audioHint: "/kʌp/", hindiTranslation: "कप", teluguTranslation: "కప్పు" },
        { word: "Duck", phonemes: ["d", "ʌ", "k"], syllables: ["Duck"], audioHint: "/dʌk/", hindiTranslation: "बतख", teluguTranslation: "బాతు" }
      ]
    },
    {
      id: "L0_05",
      title: "My Name Letters",
      titleHindi: "मेरे नाम के अक्षर",
      titleTelugu: "నా పేరు అక్షరాలు",
      description: "Find and trace letters in your name",
      duration: 15,
      activities: [
        {
          id: "L0_05_A1",
          type: "tracing",
          title: "Name Tracing",
          instructions: "Trace the letters in your name",
          data: {
            dynamic: true,
            useUserName: true
          },
          points: 30
        }
      ],
      words: []
    }
  ]
};

// ==================== LEVEL 1: EARLY PHONICS (Ages 4-6) ====================
export const PHONICS_LEVEL_1: PhonicsLevel = {
  id: 1,
  name: "Early Phonics & Basic Code",
  nameHindi: "शुरुआती फोनिक्स",
  nameTelugu: "ప్రారంభ ఫోనిక్స్",
  ageRange: "4-6 years",
  description: "Letter-sound correspondence, short vowels, CVC words",
  color: "#60A5FA",
  icon: "📖",
  unlockRequirement: 80,
  totalStars: 150,
  badge: { name: "Sound Seeker", icon: "🔤", description: "Mastered letter sounds!" },
  lessons: [
    {
      id: "L1_01",
      title: "Consonant Sounds",
      titleHindi: "व्यंजन ध्वनि",
      titleTelugu: "హల్లు శబ్దాలు",
      description: "Learn the sounds of consonant letters",
      duration: 15,
      activities: [
        {
          id: "L1_01_A1",
          type: "voice",
          title: "Say the Sound",
          instructions: "Say the sound each letter makes",
          data: {
            letters: [
              { letter: "B", sound: "/b/", example: "Ball", image: "ball" },
              { letter: "C", sound: "/k/", example: "Cat", image: "cat" },
              { letter: "D", sound: "/d/", example: "Dog", image: "dog" },
              { letter: "F", sound: "/f/", example: "Fish", image: "fish" },
              { letter: "G", sound: "/g/", example: "Goat", image: "goat" },
              { letter: "H", sound: "/h/", example: "Hat", image: "hat" },
              { letter: "J", sound: "/dʒ/", example: "Jam", image: "jam" },
              { letter: "K", sound: "/k/", example: "Kite", image: "kite" },
              { letter: "L", sound: "/l/", example: "Lion", image: "lion" },
              { letter: "M", sound: "/m/", example: "Moon", image: "moon" },
              { letter: "N", sound: "/n/", example: "Nest", image: "nest" },
              { letter: "P", sound: "/p/", example: "Pen", image: "pen" },
              { letter: "R", sound: "/r/", example: "Rain", image: "rain" },
              { letter: "S", sound: "/s/", example: "Sun", image: "sun" },
              { letter: "T", sound: "/t/", example: "Tree", image: "tree" },
              { letter: "V", sound: "/v/", example: "Van", image: "van" },
              { letter: "W", sound: "/w/", example: "Water", image: "water" },
              { letter: "Y", sound: "/j/", example: "Yellow", image: "yellow" },
              { letter: "Z", sound: "/z/", example: "Zebra", image: "zebra" }
            ]
          },
          points: 30
        }
      ],
      words: [
        { word: "Ball", phonemes: ["b", "ɔː", "l"], syllables: ["Ball"], audioHint: "/bɔːl/" },
        { word: "Cat", phonemes: ["k", "æ", "t"], syllables: ["Cat"], audioHint: "/kæt/" },
        { word: "Dog", phonemes: ["d", "ɒ", "ɡ"], syllables: ["Dog"], audioHint: "/dɒɡ/" },
        { word: "Fish", phonemes: ["f", "ɪ", "ʃ"], syllables: ["Fish"], audioHint: "/fɪʃ/" },
        { word: "Sun", phonemes: ["s", "ʌ", "n"], syllables: ["Sun"], audioHint: "/sʌn/" }
      ]
    },
    {
      id: "L1_02",
      title: "Short Vowel Sounds",
      titleHindi: "छोटी स्वर ध्वनि",
      titleTelugu: "చిన్న అచ్చు శబ్దాలు",
      description: "Learn short a, e, i, o, u sounds",
      duration: 15,
      activities: [
        {
          id: "L1_02_A1",
          type: "voice",
          title: "Vowel Voices",
          instructions: "Say the short vowel sound",
          data: {
            vowels: [
              { letter: "A", sound: "/æ/", examples: ["Apple", "Ant", "Axe"], keyword: "Apple" },
              { letter: "E", sound: "/e/", examples: ["Egg", "Elbow", "End"], keyword: "Egg" },
              { letter: "I", sound: "/ɪ/", examples: ["Igloo", "Ink", "Insect"], keyword: "Igloo" },
              { letter: "O", sound: "/ɒ/", examples: ["Octopus", "Orange", "Ox"], keyword: "Octopus" },
              { letter: "U", sound: "/ʌ/", examples: ["Umbrella", "Up", "Under"], keyword: "Umbrella" }
            ]
          },
          points: 25
        },
        {
          id: "L1_02_A2",
          type: "sorting",
          title: "Vowel Sort",
          instructions: "Sort words by their vowel sound",
          data: {
            categories: [
              { vowel: "a", sound: "/æ/", words: ["cat", "hat", "bat", "map", "cap"] },
              { vowel: "e", sound: "/e/", words: ["bed", "red", "pen", "hen", "ten"] },
              { vowel: "i", sound: "/ɪ/", words: ["pig", "big", "dig", "sit", "hit"] },
              { vowel: "o", sound: "/ɒ/", words: ["dog", "log", "fog", "hot", "pot"] },
              { vowel: "u", sound: "/ʌ/", words: ["cup", "bug", "hug", "sun", "fun"] }
            ]
          },
          points: 30
        }
      ],
      words: [
        { word: "Cat", phonemes: ["k", "æ", "t"], syllables: ["Cat"], audioHint: "/kæt/" },
        { word: "Bed", phonemes: ["b", "e", "d"], syllables: ["Bed"], audioHint: "/bed/" },
        { word: "Pig", phonemes: ["p", "ɪ", "ɡ"], syllables: ["Pig"], audioHint: "/pɪɡ/" },
        { word: "Dog", phonemes: ["d", "ɒ", "ɡ"], syllables: ["Dog"], audioHint: "/dɒɡ/" },
        { word: "Cup", phonemes: ["k", "ʌ", "p"], syllables: ["Cup"], audioHint: "/kʌp/" }
      ]
    },
    {
      id: "L1_03",
      title: "CVC Word Builder",
      titleHindi: "CVC शब्द निर्माता",
      titleTelugu: "CVC పద నిర్మాత",
      description: "Build Consonant-Vowel-Consonant words",
      duration: 15,
      activities: [
        {
          id: "L1_03_A1",
          type: "drag-drop",
          title: "Build CVC Words",
          instructions: "Drag letters to build the word you hear",
          data: {
            words: [
              { word: "cat", letters: ["c", "a", "t"], image: "cat" },
              { word: "dog", letters: ["d", "o", "g"], image: "dog" },
              { word: "sun", letters: ["s", "u", "n"], image: "sun" },
              { word: "hat", letters: ["h", "a", "t"], image: "hat" },
              { word: "pen", letters: ["p", "e", "n"], image: "pen" },
              { word: "pig", letters: ["p", "i", "g"], image: "pig" },
              { word: "cup", letters: ["c", "u", "p"], image: "cup" },
              { word: "bed", letters: ["b", "e", "d"], image: "bed" },
              { word: "pot", letters: ["p", "o", "t"], image: "pot" },
              { word: "bug", letters: ["b", "u", "g"], image: "bug" }
            ]
          },
          points: 40
        },
        {
          id: "L1_03_A2",
          type: "blending",
          title: "Blend Race",
          instructions: "Blend the sounds together to read the word",
          data: {
            words: [
              { segments: ["c", "a", "t"], word: "cat" },
              { segments: ["d", "o", "g"], word: "dog" },
              { segments: ["s", "u", "n"], word: "sun" },
              { segments: ["m", "a", "p"], word: "map" },
              { segments: ["r", "u", "n"], word: "run" }
            ]
          },
          points: 35
        }
      ],
      words: [
        { word: "Cat", phonemes: ["k", "æ", "t"], syllables: ["Cat"], audioHint: "/kæt/" },
        { word: "Dog", phonemes: ["d", "ɒ", "ɡ"], syllables: ["Dog"], audioHint: "/dɒɡ/" },
        { word: "Sun", phonemes: ["s", "ʌ", "n"], syllables: ["Sun"], audioHint: "/sʌn/" },
        { word: "Map", phonemes: ["m", "æ", "p"], syllables: ["Map"], audioHint: "/mæp/" },
        { word: "Run", phonemes: ["r", "ʌ", "n"], syllables: ["Run"], audioHint: "/rʌn/" }
      ]
    },
    {
      id: "L1_04",
      title: "Initial Sound Isolation",
      titleHindi: "पहली ध्वनि पहचान",
      titleTelugu: "మొదటి శబ్దం గుర్తింపు",
      description: "Identify the first sound in CVC words",
      duration: 15,
      activities: [
        {
          id: "L1_04_A1",
          type: "voice",
          title: "What's the First Sound?",
          instructions: "Say the first sound you hear",
          data: {
            words: [
              { word: "cat", firstSound: "/k/", options: ["/k/", "/æ/", "/t/"] },
              { word: "dog", firstSound: "/d/", options: ["/d/", "/ɒ/", "/ɡ/"] },
              { word: "sun", firstSound: "/s/", options: ["/s/", "/ʌ/", "/n/"] },
              { word: "map", firstSound: "/m/", options: ["/m/", "/æ/", "/p/"] },
              { word: "hat", firstSound: "/h/", options: ["/h/", "/æ/", "/t/"] }
            ]
          },
          points: 30
        }
      ],
      words: []
    },
    {
      id: "L1_05",
      title: "CVC Word Families",
      titleHindi: "CVC शब्द परिवार",
      titleTelugu: "CVC పద కుటుంబాలు",
      description: "Learn word families: -at, -an, -ig, -op, -ug",
      duration: 15,
      activities: [
        {
          id: "L1_05_A1",
          type: "matching",
          title: "Word Family House",
          instructions: "Put words in the correct family house",
          data: {
            families: [
              { ending: "-at", words: ["cat", "bat", "hat", "mat", "rat", "sat", "fat", "pat"] },
              { ending: "-an", words: ["can", "fan", "man", "pan", "ran", "tan", "van", "ban"] },
              { ending: "-ig", words: ["big", "dig", "fig", "pig", "wig", "jig", "rig"] },
              { ending: "-op", words: ["hop", "mop", "pop", "top", "cop", "shop", "stop"] },
              { ending: "-ug", words: ["bug", "hug", "jug", "mug", "rug", "tug", "dug"] }
            ]
          },
          points: 40
        }
      ],
      words: []
    }
  ]
};

// ==================== LEVEL 2: INTERMEDIATE PHONICS (Ages 6-7) ====================
export const PHONICS_LEVEL_2: PhonicsLevel = {
  id: 2,
  name: "Intermediate Phonics",
  nameHindi: "मध्यवर्ती फोनिक्स",
  nameTelugu: "మధ్యస్థ ఫోనిక్స్",
  ageRange: "6-7 years",
  description: "Digraphs, blends, Magic E, common endings",
  color: "#10B981",
  icon: "🔮",
  unlockRequirement: 80,
  totalStars: 200,
  badge: { name: "Blend Master", icon: "✨", description: "Mastered digraphs and blends!" },
  lessons: [
    {
      id: "L2_01",
      title: "Digraphs: sh, ch, th",
      titleHindi: "द्विग्राफ: श, च, थ",
      titleTelugu: "డైగ్రాఫ్స్: sh, ch, th",
      description: "Two letters making one sound",
      duration: 15,
      activities: [
        {
          id: "L2_01_A1",
          type: "voice",
          title: "Digraph Sounds",
          instructions: "Say the digraph sound",
          data: {
            digraphs: [
              { digraph: "sh", sound: "/ʃ/", words: ["ship", "shop", "fish", "dish", "shell"] },
              { digraph: "ch", sound: "/tʃ/", words: ["chip", "chat", "chin", "chop", "much"] },
              { digraph: "th", sound: "/θ/", words: ["thin", "thick", "bath", "math", "path"] }
            ]
          },
          points: 30
        },
        {
          id: "L2_01_A2",
          type: "sorting",
          title: "Digraph Sort",
          instructions: "Sort words by their digraph",
          data: {
            categories: [
              { digraph: "sh", words: ["ship", "shell", "fish", "wish", "brush"] },
              { digraph: "ch", words: ["chip", "chick", "lunch", "much", "rich"] },
              { digraph: "th", words: ["thin", "think", "bath", "math", "with"] }
            ]
          },
          points: 35
        }
      ],
      words: [
        { word: "Ship", phonemes: ["ʃ", "ɪ", "p"], syllables: ["Ship"], audioHint: "/ʃɪp/" },
        { word: "Chip", phonemes: ["tʃ", "ɪ", "p"], syllables: ["Chip"], audioHint: "/tʃɪp/" },
        { word: "Thin", phonemes: ["θ", "ɪ", "n"], syllables: ["Thin"], audioHint: "/θɪn/" }
      ]
    },
    {
      id: "L2_02",
      title: "More Digraphs: ph, wh",
      titleHindi: "और द्विग्राफ: ph, wh",
      titleTelugu: "మరిన్ని డైగ్రాఫ్స్: ph, wh",
      description: "Learn ph says /f/ and wh says /w/",
      duration: 15,
      activities: [
        {
          id: "L2_02_A1",
          type: "matching",
          title: "Ph and Wh Match",
          instructions: "Match words with their digraph",
          data: {
            digraphs: [
              { digraph: "ph", sound: "/f/", words: ["phone", "photo", "dolphin", "elephant", "alphabet"] },
              { digraph: "wh", sound: "/w/", words: ["whale", "what", "when", "where", "white"] }
            ]
          },
          points: 30
        }
      ],
      words: [
        { word: "Phone", phonemes: ["f", "oʊ", "n"], syllables: ["Phone"], audioHint: "/foʊn/" },
        { word: "Whale", phonemes: ["w", "eɪ", "l"], syllables: ["Whale"], audioHint: "/weɪl/" }
      ]
    },
    {
      id: "L2_03",
      title: "Consonant Blends",
      titleHindi: "व्यंजन मिश्रण",
      titleTelugu: "హల్లు మిశ్రమాలు",
      description: "Two consonants blended together: bl, cl, fl, gl, pl, sl",
      duration: 15,
      activities: [
        {
          id: "L2_03_A1",
          type: "blending",
          title: "Blend Ladder",
          instructions: "Climb the ladder by blending sounds",
          data: {
            blends: [
              { blend: "bl", words: ["blue", "black", "block", "blow", "blink"] },
              { blend: "cl", words: ["clap", "clock", "clip", "class", "cloud"] },
              { blend: "fl", words: ["flag", "flat", "flip", "flower", "fly"] },
              { blend: "gl", words: ["glad", "glass", "glue", "glow", "globe"] },
              { blend: "pl", words: ["play", "plan", "plant", "plate", "plum"] },
              { blend: "sl", words: ["slide", "slip", "slow", "sleep", "slim"] }
            ]
          },
          points: 40
        }
      ],
      words: [
        { word: "Blue", phonemes: ["b", "l", "uː"], syllables: ["Blue"], audioHint: "/bluː/" },
        { word: "Clap", phonemes: ["k", "l", "æ", "p"], syllables: ["Clap"], audioHint: "/klæp/" },
        { word: "Flag", phonemes: ["f", "l", "æ", "ɡ"], syllables: ["Flag"], audioHint: "/flæɡ/" }
      ]
    },
    {
      id: "L2_04",
      title: "More Blends: st, tr, br, gr, dr",
      titleHindi: "और मिश्रण",
      titleTelugu: "మరిన్ని మిశ్రమాలు",
      description: "More consonant blends to master",
      duration: 15,
      activities: [
        {
          id: "L2_04_A1",
          type: "drag-drop",
          title: "Blend Builder",
          instructions: "Build words with blends",
          data: {
            blends: [
              { blend: "st", words: ["star", "stop", "step", "stone", "stick"] },
              { blend: "tr", words: ["tree", "trip", "truck", "trap", "train"] },
              { blend: "br", words: ["brown", "brick", "brush", "bread", "bring"] },
              { blend: "gr", words: ["green", "grass", "grape", "grow", "gray"] },
              { blend: "dr", words: ["drum", "drop", "draw", "drink", "dress"] }
            ]
          },
          points: 40
        }
      ],
      words: []
    },
    {
      id: "L2_05",
      title: "Magic E (VCe)",
      titleHindi: "जादुई E",
      titleTelugu: "మ్యాజిక్ E",
      description: "Silent E makes the vowel say its name",
      duration: 15,
      activities: [
        {
          id: "L2_05_A1",
          type: "matching",
          title: "E-Jump Game",
          instructions: "See how Magic E changes words!",
          data: {
            transformations: [
              { short: "can", long: "cane", vowelChange: "a → ā" },
              { short: "cap", long: "cape", vowelChange: "a → ā" },
              { short: "bit", long: "bite", vowelChange: "i → ī" },
              { short: "kit", long: "kite", vowelChange: "i → ī" },
              { short: "hop", long: "hope", vowelChange: "o → ō" },
              { short: "not", long: "note", vowelChange: "o → ō" },
              { short: "cut", long: "cute", vowelChange: "u → ū" },
              { short: "cub", long: "cube", vowelChange: "u → ū" }
            ]
          },
          points: 45
        }
      ],
      words: [
        { word: "Cane", phonemes: ["k", "eɪ", "n"], syllables: ["Cane"], audioHint: "/keɪn/" },
        { word: "Kite", phonemes: ["k", "aɪ", "t"], syllables: ["Kite"], audioHint: "/kaɪt/" },
        { word: "Hope", phonemes: ["h", "oʊ", "p"], syllables: ["Hope"], audioHint: "/hoʊp/" },
        { word: "Cute", phonemes: ["k", "juː", "t"], syllables: ["Cute"], audioHint: "/kjuːt/" }
      ]
    },
    {
      id: "L2_06",
      title: "Word Endings: -s, -ing, -ed",
      titleHindi: "शब्द अंत",
      titleTelugu: "పద ముగింపులు",
      description: "Learn common word endings",
      duration: 15,
      activities: [
        {
          id: "L2_06_A1",
          type: "matching",
          title: "Suffix Tag",
          instructions: "Add the correct ending to each word",
          data: {
            endings: [
              { base: "jump", forms: ["jumps", "jumping", "jumped"] },
              { base: "play", forms: ["plays", "playing", "played"] },
              { base: "walk", forms: ["walks", "walking", "walked"] },
              { base: "help", forms: ["helps", "helping", "helped"] },
              { base: "look", forms: ["looks", "looking", "looked"] }
            ]
          },
          points: 35
        }
      ],
      words: []
    }
  ]
};

// ==================== LEVEL 3: ADVANCED PHONICS (Ages 7-8) ====================
export const PHONICS_LEVEL_3: PhonicsLevel = {
  id: 3,
  name: "Advanced Phonics",
  nameHindi: "उन्नत फोनिक्स",
  nameTelugu: "అధునాతన ఫోనిక్స్",
  ageRange: "7-8 years",
  description: "Vowel teams, diphthongs, r-controlled vowels, syllables",
  color: "#8B5CF6",
  icon: "🎓",
  unlockRequirement: 80,
  totalStars: 250,
  badge: { name: "Vowel Victor", icon: "👑", description: "Mastered vowel patterns!" },
  lessons: [
    {
      id: "L3_01",
      title: "Vowel Teams: ee, ea",
      titleHindi: "स्वर टीम: ee, ea",
      titleTelugu: "అచ్చు జట్లు: ee, ea",
      description: "Two vowels working together",
      duration: 15,
      activities: [
        {
          id: "L3_01_A1",
          type: "sorting",
          title: "Team Vowel Sort",
          instructions: "Sort words by their vowel team",
          data: {
            teams: [
              { team: "ee", sound: "/iː/", words: ["bee", "see", "tree", "green", "feet", "sleep", "week"] },
              { team: "ea", sound: "/iː/", words: ["sea", "tea", "read", "meat", "beat", "clean", "dream"] }
            ]
          },
          points: 35
        }
      ],
      words: [
        { word: "Tree", phonemes: ["t", "r", "iː"], syllables: ["Tree"], audioHint: "/triː/" },
        { word: "Sea", phonemes: ["s", "iː"], syllables: ["Sea"], audioHint: "/siː/" }
      ]
    },
    {
      id: "L3_02",
      title: "Vowel Teams: ai, oa",
      titleHindi: "स्वर टीम: ai, oa",
      titleTelugu: "అచ్చు జట్లు: ai, oa",
      description: "More vowel team patterns",
      duration: 15,
      activities: [
        {
          id: "L3_02_A1",
          type: "matching",
          title: "Vowel Team Match",
          instructions: "Match words with their vowel team",
          data: {
            teams: [
              { team: "ai", sound: "/eɪ/", words: ["rain", "train", "paint", "tail", "mail", "sail", "wait"] },
              { team: "oa", sound: "/oʊ/", words: ["boat", "coat", "goat", "soap", "road", "toad", "load"] }
            ]
          },
          points: 35
        }
      ],
      words: [
        { word: "Rain", phonemes: ["r", "eɪ", "n"], syllables: ["Rain"], audioHint: "/reɪn/" },
        { word: "Boat", phonemes: ["b", "oʊ", "t"], syllables: ["Boat"], audioHint: "/boʊt/" }
      ]
    },
    {
      id: "L3_03",
      title: "Diphthongs: oy, oi",
      titleHindi: "स्वरयुग्म: oy, oi",
      titleTelugu: "డిఫ్తాంగ్స్: oy, oi",
      description: "Gliding vowel sounds",
      duration: 15,
      activities: [
        {
          id: "L3_03_A1",
          type: "voice",
          title: "Diphthong Slide",
          instructions: "Say the sliding vowel sound",
          data: {
            diphthongs: [
              { spelling: "oy", sound: "/ɔɪ/", words: ["boy", "toy", "joy", "enjoy", "royal"] },
              { spelling: "oi", sound: "/ɔɪ/", words: ["coin", "join", "oil", "boil", "point"] }
            ]
          },
          points: 35
        }
      ],
      words: [
        { word: "Boy", phonemes: ["b", "ɔɪ"], syllables: ["Boy"], audioHint: "/bɔɪ/" },
        { word: "Coin", phonemes: ["k", "ɔɪ", "n"], syllables: ["Coin"], audioHint: "/kɔɪn/" }
      ]
    },
    {
      id: "L3_04",
      title: "Diphthongs: ou, ow",
      titleHindi: "स्वरयुग्म: ou, ow",
      titleTelugu: "డిఫ్తాంగ్స్: ou, ow",
      description: "The 'ouch' sound",
      duration: 15,
      activities: [
        {
          id: "L3_04_A1",
          type: "sorting",
          title: "OU/OW Sort",
          instructions: "Sort words by their spelling",
          data: {
            patterns: [
              { spelling: "ou", sound: "/aʊ/", words: ["house", "mouse", "cloud", "shout", "loud", "found"] },
              { spelling: "ow", sound: "/aʊ/", words: ["cow", "now", "how", "brown", "down", "town"] }
            ]
          },
          points: 35
        }
      ],
      words: [
        { word: "House", phonemes: ["h", "aʊ", "s"], syllables: ["House"], audioHint: "/haʊs/" },
        { word: "Cow", phonemes: ["k", "aʊ"], syllables: ["Cow"], audioHint: "/kaʊ/" }
      ]
    },
    {
      id: "L3_05",
      title: "R-Controlled Vowels: ar, or",
      titleHindi: "R-नियंत्रित स्वर",
      titleTelugu: "R-నియంత్రిత అచ్చులు",
      description: "R changes the vowel sound - the Bossy R!",
      duration: 15,
      activities: [
        {
          id: "L3_05_A1",
          type: "matching",
          title: "Bossy R Match",
          instructions: "Match words with bossy R patterns",
          data: {
            patterns: [
              { pattern: "ar", sound: "/ɑːr/", words: ["car", "star", "farm", "park", "dark", "card", "art"] },
              { pattern: "or", sound: "/ɔːr/", words: ["for", "corn", "horn", "storm", "short", "sport", "more"] }
            ]
          },
          points: 40
        }
      ],
      words: [
        { word: "Star", phonemes: ["s", "t", "ɑːr"], syllables: ["Star"], audioHint: "/stɑːr/" },
        { word: "Corn", phonemes: ["k", "ɔːr", "n"], syllables: ["Corn"], audioHint: "/kɔːrn/" }
      ]
    },
    {
      id: "L3_06",
      title: "R-Controlled: er, ir, ur",
      titleHindi: "R-नियंत्रित: er, ir, ur",
      titleTelugu: "R-నియంత్రిత: er, ir, ur",
      description: "These all make the same sound!",
      duration: 15,
      activities: [
        {
          id: "L3_06_A1",
          type: "sorting",
          title: "Same Sound Sort",
          instructions: "Sort by spelling - they all sound the same!",
          data: {
            patterns: [
              { pattern: "er", sound: "/ɜːr/", words: ["her", "fern", "term", "verb", "perch"] },
              { pattern: "ir", sound: "/ɜːr/", words: ["bird", "girl", "first", "shirt", "third"] },
              { pattern: "ur", sound: "/ɜːr/", words: ["burn", "turn", "fur", "hurt", "nurse"] }
            ]
          },
          points: 40
        }
      ],
      words: []
    },
    {
      id: "L3_07",
      title: "Syllable Patterns",
      titleHindi: "अक्षर पैटर्न",
      titleTelugu: "అక్షర నమూనాలు",
      description: "Open and closed syllables",
      duration: 15,
      activities: [
        {
          id: "L3_07_A1",
          type: "matching",
          title: "Syllable Chop",
          instructions: "Divide words into syllables",
          data: {
            words: [
              { word: "rabbit", syllables: ["rab", "bit"], pattern: "closed-closed" },
              { word: "pilot", syllables: ["pi", "lot"], pattern: "open-closed" },
              { word: "tiger", syllables: ["ti", "ger"], pattern: "open-closed" },
              { word: "basket", syllables: ["bas", "ket"], pattern: "closed-closed" },
              { word: "open", syllables: ["o", "pen"], pattern: "open-closed" }
            ]
          },
          points: 45
        }
      ],
      words: []
    }
  ]
};

// ==================== LEVEL 4: HARD LEVEL - ADVANCED WORD STUDY (Ages 7-8) ====================
export const PHONICS_LEVEL_4: PhonicsLevel = {
  id: 4,
  name: "Advanced Word Study",
  nameHindi: "उन्नत शब्द अध्ययन",
  nameTelugu: "అధునాతన పద అధ్యయనం",
  ageRange: "7-8 years",
  description: "Morphology, syllable types, academic vocabulary",
  color: "#EC4899",
  icon: "🏆",
  unlockRequirement: 80,
  totalStars: 300,
  badge: { name: "Word Wizard", icon: "🧙", description: "Mastered advanced word patterns!" },
  lessons: [
    {
      id: "L4_01",
      title: "Roots and Prefixes",
      titleHindi: "मूल और उपसर्ग",
      titleTelugu: "మూలాలు మరియు ఉపసర్గలు",
      description: "Understanding word parts: un-, re-, pre-, dis-",
      duration: 15,
      activities: [
        {
          id: "L4_01_A1",
          type: "matching",
          title: "Prefix Power",
          instructions: "Match prefixes to their meanings",
          data: {
            prefixes: [
              { prefix: "un-", meaning: "not", examples: ["unhappy", "unsafe", "unkind", "unfair", "unlock"] },
              { prefix: "re-", meaning: "again", examples: ["redo", "rewrite", "replay", "rebuild", "return"] },
              { prefix: "pre-", meaning: "before", examples: ["preview", "prepay", "preschool", "prefix", "preheat"] },
              { prefix: "dis-", meaning: "not/opposite", examples: ["disagree", "dislike", "disappear", "dishonest", "disconnect"] },
              { prefix: "mis-", meaning: "wrong", examples: ["mistake", "misread", "misspell", "misplace", "misunderstand"] }
            ]
          },
          points: 45
        }
      ],
      words: [
        { word: "Unhappy", phonemes: ["ʌn", "hæ", "pi"], syllables: ["Un", "hap", "py"], audioHint: "/ʌnˈhæpi/" },
        { word: "Redo", phonemes: ["riː", "duː"], syllables: ["Re", "do"], audioHint: "/riːˈduː/" },
        { word: "Preview", phonemes: ["priː", "vjuː"], syllables: ["Pre", "view"], audioHint: "/ˈpriːvjuː/" }
      ]
    },
    {
      id: "L4_02",
      title: "Suffixes: -tion, -able, -ful, -less",
      titleHindi: "प्रत्यय",
      titleTelugu: "ప్రత్యయాలు",
      description: "Common word endings that change meaning",
      duration: 15,
      activities: [
        {
          id: "L4_02_A1",
          type: "drag-drop",
          title: "Suffix Builder",
          instructions: "Add suffixes to make new words",
          data: {
            suffixes: [
              { suffix: "-tion", meaning: "action/state", examples: ["action", "nation", "creation", "addition", "subtraction"] },
              { suffix: "-able", meaning: "can be done", examples: ["readable", "washable", "breakable", "lovable", "comfortable"] },
              { suffix: "-ful", meaning: "full of", examples: ["helpful", "beautiful", "wonderful", "careful", "powerful"] },
              { suffix: "-less", meaning: "without", examples: ["helpless", "careless", "homeless", "fearless", "endless"] }
            ]
          },
          points: 45
        }
      ],
      words: []
    },
    {
      id: "L4_03",
      title: "Word Roots: tele-, photo-, graph-",
      titleHindi: "शब्द मूल",
      titleTelugu: "పద మూలాలు",
      description: "Greek and Latin roots",
      duration: 15,
      activities: [
        {
          id: "L4_03_A1",
          type: "matching",
          title: "Root Explorer",
          instructions: "Find words with the same root",
          data: {
            roots: [
              { root: "tele", meaning: "far/distant", examples: ["telephone", "television", "telescope", "telegram"] },
              { root: "photo", meaning: "light", examples: ["photograph", "photosynthesis", "photocopy", "photographer"] },
              { root: "graph", meaning: "write/draw", examples: ["photograph", "autograph", "paragraph", "biography"] },
              { root: "bio", meaning: "life", examples: ["biology", "biography", "biodegradable", "biome"] },
              { root: "geo", meaning: "earth", examples: ["geography", "geology", "geometry", "geothermal"] }
            ]
          },
          points: 50
        }
      ],
      words: [
        { word: "Telephone", phonemes: ["te", "lɪ", "foʊn"], syllables: ["Tel", "e", "phone"], audioHint: "/ˈtelɪfoʊn/" },
        { word: "Photograph", phonemes: ["foʊ", "tə", "ɡræf"], syllables: ["Pho", "to", "graph"], audioHint: "/ˈfoʊtəɡræf/" }
      ]
    },
    {
      id: "L4_04",
      title: "Six Syllable Types",
      titleHindi: "छह अक्षर प्रकार",
      titleTelugu: "ఆరు అక్షర రకాలు",
      description: "Master all syllable patterns",
      duration: 15,
      activities: [
        {
          id: "L4_04_A1",
          type: "sorting",
          title: "Syllable Type Sorter",
          instructions: "Sort syllables by their type",
          data: {
            types: [
              { type: "Closed", description: "Ends in consonant, short vowel", examples: ["cat", "bed", "lunch", "picnic"] },
              { type: "Open", description: "Ends in vowel, long vowel", examples: ["me", "go", "baby", "tiger"] },
              { type: "VCe", description: "Vowel-Consonant-e, long vowel", examples: ["cake", "home", "include", "compete"] },
              { type: "Vowel Team", description: "Two vowels together", examples: ["rain", "boat", "green", "explain"] },
              { type: "R-controlled", description: "Vowel followed by r", examples: ["car", "bird", "perfect", "corner"] },
              { type: "Consonant-le", description: "Consonant + le", examples: ["table", "little", "bubble", "candle"] }
            ]
          },
          points: 55
        }
      ],
      words: []
    },
    {
      id: "L4_05",
      title: "Multisyllabic Words",
      titleHindi: "बहु-अक्षर शब्द",
      titleTelugu: "బహుళ-అక్షర పదాలు",
      description: "Breaking down big words",
      duration: 15,
      activities: [
        {
          id: "L4_05_A1",
          type: "drag-drop",
          title: "Word Surgeon",
          instructions: "Break words into morphemes (meaningful parts)",
          data: {
            words: [
              { word: "uncomfortable", parts: ["un", "comfort", "able"], meaning: "not comfortable" },
              { word: "photosynthesis", parts: ["photo", "syn", "thesis"], meaning: "making with light" },
              { word: "transportation", parts: ["trans", "port", "ation"], meaning: "carrying across" },
              { word: "biodegradable", parts: ["bio", "de", "grad", "able"], meaning: "able to break down naturally" },
              { word: "international", parts: ["inter", "nation", "al"], meaning: "between nations" }
            ]
          },
          points: 60
        }
      ],
      words: [
        { word: "Photosynthesis", phonemes: ["foʊ", "toʊ", "sɪn", "θə", "sɪs"], syllables: ["Pho", "to", "syn", "the", "sis"], audioHint: "/ˌfoʊtoʊˈsɪnθəsɪs/" },
        { word: "Transportation", phonemes: ["træns", "pɔːr", "teɪ", "ʃən"], syllables: ["Trans", "por", "ta", "tion"], audioHint: "/ˌtrænspɔːrˈteɪʃən/" }
      ]
    },
    {
      id: "L4_06",
      title: "Academic Vocabulary",
      titleHindi: "शैक्षणिक शब्दावली",
      titleTelugu: "విద్యా పదజాలం",
      description: "Subject-specific words for school",
      duration: 15,
      activities: [
        {
          id: "L4_06_A1",
          type: "matching",
          title: "Academic Quest",
          instructions: "Match academic words to their subjects",
          data: {
            subjects: [
              { subject: "Math", words: ["denominator", "numerator", "equation", "multiplication", "fraction", "perimeter", "circumference"] },
              { subject: "Science", words: ["hypothesis", "experiment", "observation", "conclusion", "organism", "ecosystem", "photosynthesis"] },
              { subject: "English", words: ["paragraph", "punctuation", "vocabulary", "synonym", "antonym", "comprehension", "grammar"] },
              { subject: "Social Studies", words: ["civilization", "democracy", "government", "industrial", "revolution", "geography", "continent"] }
            ]
          },
          points: 55
        }
      ],
      words: []
    },
    {
      id: "L4_07",
      title: "Irregular Patterns",
      titleHindi: "अनियमित पैटर्न",
      titleTelugu: "క్రమరహిత నమూనాలు",
      description: "Soft c/g, FLSZ rule, silent letters",
      duration: 15,
      activities: [
        {
          id: "L4_07_A1",
          type: "sorting",
          title: "Tricky Patterns",
          instructions: "Learn the rules for tricky spellings",
          data: {
            patterns: [
              { pattern: "Soft C", rule: "C says /s/ before e, i, y", examples: ["cent", "city", "cycle", "ceiling", "circus"] },
              { pattern: "Soft G", rule: "G says /j/ before e, i, y", examples: ["gem", "giant", "gym", "giraffe", "gentle"] },
              { pattern: "FLSZ Rule", rule: "Double f, l, s, z after short vowel", examples: ["staff", "ball", "miss", "buzz", "cliff"] },
              { pattern: "Silent Letters", rule: "Some letters are not pronounced", examples: ["knight", "write", "lamb", "island", "honest"] }
            ]
          },
          points: 50
        }
      ],
      words: []
    }
  ]
};

// ==================== ALL LEVELS EXPORT ====================
export const PHONICS_LEVELS: PhonicsLevel[] = [
  PHONICS_LEVEL_0,
  PHONICS_LEVEL_1,
  PHONICS_LEVEL_2,
  PHONICS_LEVEL_3,
  PHONICS_LEVEL_4
];

// ==================== PHONICS QUIZ DATA ====================
export const PHONICS_QUIZZES = {
  level0: {
    title: "Alphabet Foundations Quiz",
    questions: [
      { q: "What letter comes after B?", options: ["A", "C", "D", "E"], correct: 1 },
      { q: "Which word rhymes with 'cat'?", options: ["dog", "hat", "cup", "sun"], correct: 1 },
      { q: "How many syllables in 'elephant'?", options: ["1", "2", "3", "4"], correct: 2 },
      { q: "What is the first letter of 'Apple'?", options: ["B", "A", "P", "L"], correct: 1 },
      { q: "Which words rhyme?", options: ["dog-cat", "sun-fun", "hat-cup", "bed-dog"], correct: 1 },
      { q: "What sound does 'M' make?", options: ["/m/", "/n/", "/b/", "/d/"], correct: 0 },
      { q: "How many claps for 'banana'?", options: ["1", "2", "3", "4"], correct: 2 },
      { q: "What letter starts 'Dog'?", options: ["B", "C", "D", "G"], correct: 2 },
      { q: "Which is an uppercase letter?", options: ["a", "b", "C", "d"], correct: 2 },
      { q: "What comes after X, Y...?", options: ["A", "B", "Z", "W"], correct: 2 }
    ],
    voicePrompts: [
      { prompt: "Say the alphabet from A to E", expected: ["a", "b", "c", "d", "e"] },
      { prompt: "Say a word that rhymes with 'cat'", expected: ["hat", "bat", "mat", "rat", "sat"] }
    ]
  },
  level1: {
    title: "Early Phonics Quiz",
    questions: [
      { q: "What sound does 'B' make?", options: ["/b/", "/d/", "/p/", "/g/"], correct: 0 },
      { q: "What is the short 'a' sound?", options: ["/eɪ/", "/æ/", "/ɑː/", "/ʌ/"], correct: 1 },
      { q: "What word has the short 'i' sound?", options: ["kite", "pig", "bike", "pie"], correct: 1 },
      { q: "Build: c + a + t = ?", options: ["cat", "bat", "hat", "mat"], correct: 0 },
      { q: "What is the first sound in 'sun'?", options: ["/s/", "/u/", "/n/", "/z/"], correct: 0 },
      { q: "Which word family: cat, hat, bat?", options: ["-an", "-at", "-ig", "-op"], correct: 1 },
      { q: "What sound does 'E' make (short)?", options: ["/iː/", "/e/", "/æ/", "/ɪ/"], correct: 1 },
      { q: "Build: d + o + g = ?", options: ["dig", "dog", "dug", "dag"], correct: 1 },
      { q: "Which has short 'u'?", options: ["cute", "cup", "cube", "use"], correct: 1 },
      { q: "What's the last sound in 'map'?", options: ["/m/", "/æ/", "/p/", "/n/"], correct: 2 }
    ]
  },
  level2: {
    title: "Intermediate Phonics Quiz",
    questions: [
      { q: "What sound does 'sh' make?", options: ["/s/", "/ʃ/", "/tʃ/", "/θ/"], correct: 1 },
      { q: "'ch' says...", options: ["/k/", "/ʃ/", "/tʃ/", "/s/"], correct: 2 },
      { q: "Which has 'th' digraph?", options: ["ship", "chip", "thin", "shop"], correct: 2 },
      { q: "'ph' sounds like...", options: ["/p/", "/f/", "/h/", "/ph/"], correct: 1 },
      { q: "What blend is in 'blue'?", options: ["bl", "br", "cl", "gl"], correct: 0 },
      { q: "Magic E makes the vowel...", options: ["short", "long", "silent", "loud"], correct: 1 },
      { q: "can → cane: what changed?", options: ["consonant", "vowel sound", "meaning only", "nothing"], correct: 1 },
      { q: "What's the blend in 'stop'?", options: ["st", "sp", "sl", "sk"], correct: 0 },
      { q: "Adding -ing to 'jump' = ?", options: ["jumps", "jumped", "jumping", "jumper"], correct: 2 },
      { q: "'wh' in 'whale' says...", options: ["/w/", "/h/", "/wh/", "/f/"], correct: 0 }
    ]
  },
  level3: {
    title: "Advanced Phonics Quiz",
    questions: [
      { q: "What sound does 'ee' make?", options: ["/e/", "/iː/", "/eɪ/", "/ɪ/"], correct: 1 },
      { q: "'ai' in 'rain' says...", options: ["/æ/", "/aɪ/", "/eɪ/", "/ɪ/"], correct: 2 },
      { q: "What's the diphthong in 'boy'?", options: ["/oʊ/", "/aʊ/", "/ɔɪ/", "/eɪ/"], correct: 2 },
      { q: "'ou' in 'house' says...", options: ["/uː/", "/oʊ/", "/aʊ/", "/ɔː/"], correct: 2 },
      { q: "'ar' is called...", options: ["vowel team", "r-controlled", "diphthong", "blend"], correct: 1 },
      { q: "er, ir, ur all say...", options: ["/ɜːr/", "/ɑːr/", "/ɔːr/", "/aɪr/"], correct: 0 },
      { q: "Closed syllable has...", options: ["long vowel", "short vowel", "silent vowel", "no vowel"], correct: 1 },
      { q: "'oa' in 'boat' says...", options: ["/ɒ/", "/oʊ/", "/uː/", "/aʊ/"], correct: 1 },
      { q: "How many syllables in 'tiger'?", options: ["1", "2", "3", "4"], correct: 1 },
      { q: "'ow' in 'cow' says...", options: ["/oʊ/", "/aʊ/", "/ɔː/", "/uː/"], correct: 1 }
    ]
  },
  level4: {
    title: "Advanced Word Study Quiz",
    questions: [
      { q: "'un-' means...", options: ["again", "not", "before", "after"], correct: 1 },
      { q: "'re-' means...", options: ["not", "before", "again", "without"], correct: 2 },
      { q: "'-able' means...", options: ["full of", "without", "can be", "state of"], correct: 2 },
      { q: "'tele-' means...", options: ["light", "far", "write", "life"], correct: 1 },
      { q: "'photo-' means...", options: ["far", "life", "light", "earth"], correct: 2 },
      { q: "Soft C is before...", options: ["a, o, u", "e, i, y", "consonants", "nothing"], correct: 1 },
      { q: "How many syllables in 'uncomfortable'?", options: ["3", "4", "5", "6"], correct: 2 },
      { q: "'-tion' is pronounced...", options: ["/tiɒn/", "/ʃən/", "/tʃən/", "/siən/"], correct: 1 },
      { q: "'bio-' means...", options: ["earth", "write", "life", "far"], correct: 2 },
      { q: "FLSZ rule: double after...", options: ["long vowel", "short vowel", "consonant", "digraph"], correct: 1 }
    ]
  }
};

// ==================== BADGES AND REWARDS ====================
export const PHONICS_BADGES = [
  { id: "abc_explorer", name: "ABC Explorer", icon: "🌟", level: 0, requirement: "Complete Level 0" },
  { id: "sound_seeker", name: "Sound Seeker", icon: "🔤", level: 1, requirement: "Complete Level 1" },
  { id: "blend_master", name: "Blend Master", icon: "✨", level: 2, requirement: "Complete Level 2" },
  { id: "vowel_victor", name: "Vowel Victor", icon: "👑", level: 3, requirement: "Complete Level 3" },
  { id: "word_wizard", name: "Word Wizard", icon: "🧙", level: 4, requirement: "Complete Level 4" },
  { id: "perfect_score", name: "Perfect Score", icon: "💯", level: -1, requirement: "100% on any quiz" },
  { id: "streak_7", name: "Week Warrior", icon: "🔥", level: -1, requirement: "7-day practice streak" },
  { id: "streak_30", name: "Monthly Master", icon: "🏅", level: -1, requirement: "30-day practice streak" },
  { id: "speed_reader", name: "Speed Reader", icon: "⚡", level: -1, requirement: "Complete 10 lessons in one day" },
  { id: "voice_star", name: "Voice Star", icon: "🎤", level: -1, requirement: "Complete 50 voice activities" }
];

// Helper function to get level by ID
export function getPhonicsLevel(levelId: number): PhonicsLevel | undefined {
  return PHONICS_LEVELS.find(l => l.id === levelId);
}

// Helper function to get quiz by level
export function getPhonicsQuiz(levelId: number) {
  const key = `level${levelId}` as keyof typeof PHONICS_QUIZZES;
  return PHONICS_QUIZZES[key];
}
