// app/index.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const openCamera = () => {
    router.push('/camera');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue dans Le Monde Est Stone 🌍</Text>
      <TouchableOpacity onPress={openCamera} style={styles.button}>
        <Text style={styles.buttonText}>📷 Prendre une photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#22c55e', padding: 16, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
