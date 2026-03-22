import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="character-select" />
      <Stack.Screen name="language-select" />
      <Stack.Screen name="home" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="parent-dashboard" />
      <Stack.Screen name="word-explorer" />
      <Stack.Screen name="daily-session" />
    </Stack>
  );
}
