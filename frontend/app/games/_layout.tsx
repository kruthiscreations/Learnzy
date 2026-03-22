import { Stack } from 'expo-router';

export default function GamesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="flashcards" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="crossword" />
      <Stack.Screen name="dictation" />
      <Stack.Screen name="interactive-learning" />
      <Stack.Screen name="phonics" />
      <Stack.Screen name="word-matching" />
      <Stack.Screen name="grammar-quests" />
      <Stack.Screen name="story-chain" />
      <Stack.Screen name="sentence-builder" />
      <Stack.Screen name="manners" />
      <Stack.Screen name="reading-fluency" />
      <Stack.Screen name="simon-says-grammar" />
      <Stack.Screen name="spot-the-mistake" />
      <Stack.Screen name="writing-workshop" />
    </Stack>
  );
}
