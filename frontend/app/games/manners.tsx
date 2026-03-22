import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../../store/appStore';

interface MannersTopic {
  id: string;
  title: string;
  emoji: string;
  colors: [string, string];
  phrases: { english: string; telugu: string; when: string }[];
  scenarios: { situation: string; correct: string; incorrect: string; emoji: string }[];
  tip: string;
}

const MANNERS_TOPICS: MannersTopic[] = [
  {
    id: 'greetings',
    title: 'Greetings & Goodbyes',
    emoji: '👋',
    colors: ['#F59E0B', '#D97706'],
    phrases: [
      { english: 'Good morning!', telugu: 'శుభోదయం!', when: 'When you wake up or see someone in the morning' },
      { english: 'Hello! How are you?', telugu: 'నమస్కారం! మీరు ఎలా ఉన్నారు?', when: 'When meeting a friend or teacher' },
      { english: 'Good evening!', telugu: 'శుభ సాయంత్రం!', when: 'When you see someone in the evening' },
      { english: 'Goodbye! See you tomorrow!', telugu: 'వెళ్ళొస్తాను! రేపు కలుద్దాం!', when: 'When leaving school or a friend\'s house' },
      { english: 'Good night, mama!', telugu: 'శుభ రాత్రి, అమ్మా!', when: 'Before going to sleep' },
    ],
    scenarios: [
      { situation: 'You see your teacher in the morning', correct: 'Good morning, teacher! How are you?', incorrect: 'Hey! What\'s up?', emoji: '🧑‍🏫' },
      { situation: 'Your friend is leaving after playing', correct: 'Goodbye! See you tomorrow!', incorrect: 'Go away now.', emoji: '👦' },
    ],
    tip: 'Always smile when greeting people! A smile makes your words even warmer. 😊',
  },
  {
    id: 'please-thankyou',
    title: 'Please & Thank You',
    emoji: '🙏',
    colors: ['#10B981', '#059669'],
    phrases: [
      { english: 'Please pass the salt.', telugu: 'దయచేసి ఉప్పు ఇవ్వండి.', when: 'When asking for something at the table' },
      { english: 'Thank you so much!', telugu: 'చాలా ధన్యవాదాలు!', when: 'When someone helps you or gives you something' },
      { english: 'Can I have water, please?', telugu: 'దయచేసి నీళ్ళు ఇవ్వండి?', when: 'When you need something' },
      { english: 'Thank you for dinner!', telugu: 'రాత్రి భోజనానికి ధన్యవాదాలు!', when: 'After eating food someone cooked for you' },
      { english: 'No thank you, I\'m full.', telugu: 'వద్దు ధన్యవాదాలు, నా పొట్ట నిండింది.', when: 'When you don\'t want more food' },
    ],
    scenarios: [
      { situation: 'Teacher gives you a gold star', correct: 'Thank you, teacher! I will try my best!', incorrect: 'Whatever. I already knew that.', emoji: '⭐' },
      { situation: 'You want to borrow a pencil', correct: 'May I please borrow your pencil?', incorrect: 'Give me your pencil!', emoji: '✏️' },
    ],
    tip: '"Please" and "Thank you" are magic words! They open doors and warm hearts. 🗝️',
  },
  {
    id: 'sorry',
    title: 'Saying Sorry',
    emoji: '🤗',
    colors: ['#8B5CF6', '#7C3AED'],
    phrases: [
      { english: 'I\'m sorry, I made a mistake.', telugu: 'క్షమించండి, నేను తప్పు చేశాను.', when: 'When you do something wrong' },
      { english: 'I\'m sorry for being late.', telugu: 'ఆలస్యం అయినందుకు క్షమించండి.', when: 'When you arrive late' },
      { english: 'I didn\'t mean to hurt you.', telugu: 'నేను నిన్ను నొప్పించాలని అనుకోలేదు.', when: 'When you accidentally hurt a friend' },
      { english: 'Can we be friends again?', telugu: 'మనం మళ్ళీ స్నేహితులం అవుదాం?', when: 'After a quarrel with a friend' },
      { english: 'It won\'t happen again.', telugu: 'ఇది మళ్ళీ జరగదు.', when: 'When promising not to repeat a mistake' },
    ],
    scenarios: [
      { situation: 'You accidentally knock over your friend\'s painting', correct: 'Oh no! I\'m so sorry! I didn\'t mean to do that.', incorrect: 'It\'s your fault for keeping it there.', emoji: '🎨' },
      { situation: 'You interrupted your teacher while speaking', correct: 'I\'m sorry for interrupting. Please continue.', incorrect: 'But I need to say something!', emoji: '🙋' },
    ],
    tip: 'A real apology has three parts: say sorry, explain what happened, and promise to do better! 💪',
  },
  {
    id: 'sharing',
    title: 'Sharing & Taking Turns',
    emoji: '🤝',
    colors: ['#3B82F6', '#2563EB'],
    phrases: [
      { english: 'Would you like to share my lunch?', telugu: 'నా భోజనం పంచుకుంటావా?', when: 'When you want to share food with a friend' },
      { english: 'It\'s your turn now!', telugu: 'ఇప్పుడు నీ వంతు!', when: 'During a game when switching turns' },
      { english: 'Can I join your game please?', telugu: 'దయచేసి నేను మీ ఆటలో చేరవచ్చా?', when: 'When you want to play with others' },
      { english: 'Let\'s take turns!', telugu: 'మనం వంతుల వారీగా ఆడుదాం!', when: 'When sharing a toy or swing' },
      { english: 'You can go first!', telugu: 'నువ్వు ముందు వెళ్ళు!', when: 'When being generous with a friend' },
    ],
    scenarios: [
      { situation: 'Two friends both want to use the swing', correct: 'Let\'s take turns! You go first, then me.', incorrect: 'It\'s MINE! Go away!', emoji: '🛝' },
      { situation: 'A new student has no lunch', correct: 'Would you like to share my tiffin? I have enough!', incorrect: 'Don\'t look at my food.', emoji: '🍱' },
    ],
    tip: 'When you share, you make someone happy AND you feel happy too! Double happiness! 🎊',
  },
  {
    id: 'table-manners',
    title: 'Table Manners',
    emoji: '🍽️',
    colors: ['#EF4444', '#DC2626'],
    phrases: [
      { english: 'May I be excused, please?', telugu: 'దయచేసి నేను వెళ్ళవచ్చా?', when: 'When you want to leave the table' },
      { english: 'This food is delicious!', telugu: 'ఈ భోజనం చాలా రుచిగా ఉంది!', when: 'After tasting something yummy' },
      { english: 'Please pass the rice.', telugu: 'దయచేసి అన్నం ఇవ్వండి.', when: 'When you need something at the table' },
      { english: 'I don\'t like this, but thank you.', telugu: 'నాకు ఇది నచ్చలేదు, కానీ ధన్యవాదాలు.', when: 'When food isn\'t your favourite but being polite' },
    ],
    scenarios: [
      { situation: 'You want to leave the table before others finish', correct: 'May I be excused please? I\'ve finished eating.', incorrect: 'I\'m done! Bye!', emoji: '🚶' },
      { situation: 'Your grandma cooked your favourite dish', correct: 'Grandma, this is so delicious! Thank you!', incorrect: 'Why did you put so much masala?', emoji: '👵' },
    ],
    tip: 'Good table manners show respect for the person who cooked for you! 🧑‍🍳',
  },
  {
    id: 'shop',
    title: 'Seller & Buyer',
    emoji: '🛒',
    colors: ['#0EA5E9', '#0284C7'],
    phrases: [
      { english: 'How much does this cost?', telugu: 'ఇది ఎంత?', when: 'When you want to know the price of something' },
      { english: 'May I have one kilo of tomatoes please?', telugu: 'దయచేసి ఒక కిలో టమాటాలు ఇవ్వండి?', when: 'When buying vegetables at a shop' },
      { english: 'Do you have this in another colour?', telugu: 'ఇది వేరే రంగులో ఉందా?', when: 'When shopping for clothes or items' },
      { english: 'Here is the money. Thank you!', telugu: 'ఇదిగో డబ్బు. ధన్యవాదాలు!', when: 'After completing a purchase' },
      { english: 'Could you please give me the change?', telugu: 'దయచేసి చిల్లర ఇవ్వగలరా?', when: 'When you need change after paying' },
      { english: 'This is too expensive. Is there a discount?', telugu: 'ఇది చాలా ఖరీదైనది. డిస్కౌంట్ ఉందా?', when: 'When negotiating price politely' },
    ],
    scenarios: [
      { situation: 'You are at a fruit shop and want to buy mangoes', correct: 'Excuse me, how much are the mangoes? May I have half a kilo please?', incorrect: 'Give me those mangoes! How much?', emoji: '🥭' },
      { situation: 'The shopkeeper gives you wrong change', correct: 'Excuse me, I gave you ₹100. The change should be ₹30, not ₹20.', incorrect: 'You cheated me! Give me my money!', emoji: '💰' },
      { situation: 'You are a shopkeeper and a customer asks the price', correct: 'Good morning! The apples are ₹80 per kilo. How many would you like?', incorrect: 'What do you want? Why are you asking?', emoji: '🍎' },
    ],
    tip: 'Always be polite when shopping — say "excuse me", "please" and "thank you"! 🛍️',
  },
  {
    id: 'interview',
    title: 'Interview & Class Participation',
    emoji: '🎤',
    colors: ['#8B5CF6', '#6D28D9'],
    phrases: [
      { english: 'Good morning! My name is ___. I am from ___.', telugu: 'శుభోదయం! నా పేరు ___. నేను ___ నుండి వచ్చాను.', when: 'When introducing yourself in class or an interview' },
      { english: 'I know the answer. May I speak?', telugu: 'నాకు సమాధానం తెలుసు. నేను చెప్పవచ్చా?', when: 'When you want to answer a question in class' },
      { english: 'I didn\'t understand. Could you please repeat that?', telugu: 'నాకు అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పగలరా?', when: 'When you need clarification from a teacher' },
      { english: 'My favourite subject is ___ because ___.', telugu: 'నా ఇష్టమైన సబ్జెక్ట్ ___ ఎందుకంటే ___.', when: 'When asked about your interests in an interview' },
      { english: 'Thank you for this opportunity.', telugu: 'ఈ అవకాశానికి ధన్యవాదాలు.', when: 'At the end of an interview or presentation' },
      { english: 'Please answer the question.', telugu: 'దయచేసి ప్రశ్నకు సమాధానం చెప్పండి.', when: 'Politely asking a classmate to respond' },
    ],
    scenarios: [
      { situation: 'The teacher asks "Who can tell me what a noun is?"', correct: 'Excuse me, teacher! I know the answer. A noun is the name of a person, place or thing.', incorrect: 'ME! ME! Pick me!', emoji: '✋' },
      { situation: 'An interviewer asks: Tell me about yourself', correct: 'Good morning. My name is Arjun. I am in Class 5. I love reading and science.', incorrect: 'I don\'t know what to say.', emoji: '👔' },
      { situation: 'You don\'t understand the teacher\'s question', correct: 'I\'m sorry, I didn\'t understand. Could you please explain again?', incorrect: 'Just keep quiet and hope they don\'t ask you.', emoji: '🤔' },
    ],
    tip: 'In interviews and class, speak clearly, make eye contact, and always say thank you! 🌟',
  },
];

type GameView = 'topics' | 'phrases' | 'scenario' | 'quiz';

export default function MannersScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [selectedTopic, setSelectedTopic] = useState<MannersTopic | null>(null);
  const [view, setView] = useState<GameView>('topics');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [scenarioChoice, setScenarioChoice] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [phrasesCompleted, setPhrasesCompleted] = useState<Record<string, boolean>>({});
  const [allTopicsDone, setAllTopicsDone] = useState(false);

  const openTopic = (topic: MannersTopic) => {
    setSelectedTopic(topic);
    setView('phrases');
    setScenarioIdx(0);
    setScenarioChoice(null);
  };

  const handleScenarioChoice = (choice: 'correct' | 'incorrect') => {
    if (scenarioChoice) return;
    setScenarioChoice(choice);
    if (choice === 'correct') setScore(s => s + 10);
  };

  const nextScenario = () => {
    if (!selectedTopic) return;
    const next = scenarioIdx + 1;
    if (next >= selectedTopic.scenarios.length) {
      // Topic done
      setPhrasesCompleted(prev => ({ ...prev, [selectedTopic.id]: true }));
      const completedTopics = Object.keys({ ...phrasesCompleted, [selectedTopic.id]: true }).length;
      if (completedTopics >= MANNERS_TOPICS.length) setAllTopicsDone(true);
      setView('topics');
      setSelectedTopic(null);
    } else {
      setScenarioIdx(next);
      setScenarioChoice(null);
    }
  };

  // All done screen
  if (allTopicsDone) {
    return (
      <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.completeContainer}>
        <Animatable.View animation="bounceIn" style={styles.completeCard}>
          <Text style={styles.completeEmoji}>🌟</Text>
          <Text style={styles.completeTitle}>Manners Star!</Text>
          <Text style={styles.completeSubtitle}>You've learned all the manners! Well done!</Text>
          <Text style={styles.completeScore}>Score: {score} ⭐</Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
            <Text style={styles.homeButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    );
  }

  // Topics list
  if (view === 'topics') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manners & Social English</Text>
          <Text style={styles.headerSubtitle}>Learn to speak with kindness! 🌸</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>✅ {Object.keys(phrasesCompleted).length}/{MANNERS_TOPICS.length}</Text>
            </View>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.topicsContent}>
          <Text style={styles.pickLabel}>Choose a manners topic:</Text>
          {MANNERS_TOPICS.map(topic => {
            const done = phrasesCompleted[topic.id];
            return (
              <TouchableOpacity key={topic.id} style={styles.topicCard} onPress={() => openTopic(topic)}>
                <LinearGradient colors={topic.colors} style={styles.topicGradient}>
                  <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicCount}>{topic.phrases.length} phrases • {topic.scenarios.length} role-plays</Text>
                  </View>
                  {done ? (
                    <Ionicons name="checkmark-circle" size={28} color="#fff" />
                  ) : (
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Phrases view
  if (view === 'phrases' && selectedTopic) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={selectedTopic.colors} style={styles.header}>
          <TouchableOpacity onPress={() => { setView('topics'); setSelectedTopic(null); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedTopic.emoji} {selectedTopic.title}</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.phrasesContent}>
          <Text style={styles.sectionTitle}>📝 Useful Phrases</Text>
          {selectedTopic.phrases.map((phrase, i) => (
            <Animatable.View key={i} animation="fadeInUp" delay={i * 100} style={styles.phraseCard}>
              <Text style={styles.phraseEnglish}>"{phrase.english}"</Text>
              <Text style={styles.phraseTelugu}>{phrase.telugu}</Text>
              <View style={styles.phraseWhen}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
                <Text style={styles.phraseWhenText}>{phrase.when}</Text>
              </View>
            </Animatable.View>
          ))}

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Tip for you:</Text>
            <Text style={styles.tipText}>{selectedTopic.tip}</Text>
          </View>

          <TouchableOpacity style={[styles.practiceButton, { backgroundColor: selectedTopic.colors[0] }]} onPress={() => setView('scenario')}>
            <Text style={styles.practiceButtonText}>Practice Role-Play 🎭</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Scenario role-play view
  if (view === 'scenario' && selectedTopic) {
    const scenario = selectedTopic.scenarios[scenarioIdx];
    return (
      <View style={styles.container}>
        <LinearGradient colors={selectedTopic.colors} style={styles.header}>
          <TouchableOpacity onPress={() => setView('phrases')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎭 Role-Play</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>{scenarioIdx + 1}/{selectedTopic.scenarios.length}</Text></View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scenarioContent}>
          <Animatable.View animation="fadeInDown" key={scenarioIdx} style={styles.situationCard}>
            <Text style={styles.situationEmoji}>{scenario.emoji}</Text>
            <Text style={styles.situationLabel}>SITUATION</Text>
            <Text style={styles.situationText}>{scenario.situation}</Text>
            <Text style={styles.choiceInstruction}>What would you say?</Text>
          </Animatable.View>

          <View style={styles.choices}>
            {(['correct', 'incorrect'] as const).sort(() => Math.random() - 0.5).map(type => {
              const text = type === 'correct' ? scenario.correct : scenario.incorrect;
              let choiceStyle = styles.choiceButton;
              if (scenarioChoice) {
                if (type === 'correct') choiceStyle = { ...styles.choiceButton, ...styles.choiceCorrect };
                else if (type === scenarioChoice && type === 'incorrect') choiceStyle = { ...styles.choiceButton, ...styles.choiceWrong };
              } else if (scenarioChoice === type) {
                choiceStyle = { ...styles.choiceButton, borderColor: selectedTopic.colors[0] };
              }
              return (
                <TouchableOpacity
                  key={type}
                  style={choiceStyle}
                  onPress={() => handleScenarioChoice(type)}
                  disabled={!!scenarioChoice}
                >
                  <Text style={styles.choiceText}>"{text}"</Text>
                  {scenarioChoice && type === 'correct' && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginTop: 8 }} />
                  )}
                  {scenarioChoice === 'incorrect' && type === 'incorrect' && (
                    <Ionicons name="close-circle" size={24} color="#EF4444" style={{ marginTop: 8 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {scenarioChoice && (
            <Animatable.View animation="bounceIn" style={[styles.feedbackBox, scenarioChoice === 'correct' ? styles.feedbackGreen : styles.feedbackRed]}>
              <Text style={styles.feedbackTitle}>
                {scenarioChoice === 'correct' ? '✅ Excellent!' : '❌ Not quite!'}
              </Text>
              <Text style={styles.feedbackMsg}>
                {scenarioChoice === 'correct'
                  ? 'That\'s the polite way to say it! You\'re a manners star! 🌟'
                  : `The polite response is: "${scenario.correct}"`}
              </Text>
              <TouchableOpacity style={[styles.nextScenarioButton, { backgroundColor: selectedTopic.colors[0] }]} onPress={nextScenario}>
                <Text style={styles.nextScenarioText}>
                  {scenarioIdx + 1 >= selectedTopic.scenarios.length ? 'Finish Topic 🎉' : 'Next Scenario →'}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 14 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  statText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  topicsContent: { padding: 20, gap: 14 },
  pickLabel: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  topicCard: { borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  topicGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  topicEmoji: { fontSize: 36 },
  topicTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  topicCount: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  phrasesContent: { padding: 20, gap: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  phraseCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  phraseEnglish: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', fontStyle: 'italic' },
  phraseTelugu: { fontSize: 18, color: '#6B7280' },
  phraseWhen: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  phraseWhenText: { fontSize: 13, color: '#6B7280', flex: 1, lineHeight: 18 },
  tipBox: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 18, gap: 6, borderWidth: 1, borderColor: '#FDE68A' },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
  tipText: { fontSize: 15, color: '#78350F', lineHeight: 22 },
  practiceButton: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  practiceButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  scenarioContent: { padding: 20, gap: 16 },
  situationCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  situationEmoji: { fontSize: 56 },
  situationLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  situationText: { fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center', lineHeight: 28 },
  choiceInstruction: { fontSize: 15, color: '#6B7280', fontStyle: 'italic' },
  choices: { gap: 12 },
  choiceButton: { backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, alignItems: 'center' },
  choiceCorrect: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  choiceWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  choiceText: { fontSize: 17, color: '#1F2937', textAlign: 'center', lineHeight: 24, fontStyle: 'italic' },
  feedbackBox: { borderRadius: 16, padding: 20, gap: 10 },
  feedbackGreen: { backgroundColor: '#ECFDF5' },
  feedbackRed: { backgroundColor: '#FEF2F2' },
  feedbackTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  feedbackMsg: { fontSize: 15, color: '#374151', lineHeight: 22 },
  nextScenarioButton: { borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  nextScenarioText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeCard: { backgroundColor: '#fff', borderRadius: 28, padding: 40, alignItems: 'center', width: '100%', gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  completeEmoji: { fontSize: 72 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: '#1F2937' },
  completeSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  completeScore: { fontSize: 22, fontWeight: '700', color: '#F59E0B' },
  homeButton: { marginTop: 8, backgroundColor: '#EC4899', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  homeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
