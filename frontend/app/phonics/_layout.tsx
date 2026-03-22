import { Stack } from 'expo-router';

export default function PhonicsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="parent-report" />
    </Stack>
  );
}
