import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* appScreen.tsx will be automatically used for this route */}
      <Stack.Screen name="appScreen" options={{ headerShown: false }} />
    </Stack>
  );
}