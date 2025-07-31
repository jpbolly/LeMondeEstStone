import { Stack } from 'expo-router';
import { useEffect } from 'react';
import '@tensorflow/tfjs-react-native';

export default function RootLayout() {
  useEffect(() => {
    // Initialiser TensorFlow.js pour React Native
    require('@tensorflow/tfjs-react-native');
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="identify" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
}