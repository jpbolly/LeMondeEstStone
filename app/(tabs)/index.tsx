import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Camera, ArrowRight, Gem } from 'lucide-react-native';
import { initializeModel } from '@/services/mlService';
import { getStatistics } from '@/services/storageService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [stats, setStats] = React.useState({ total: 0, byCategory: {} });

  useEffect(() => {
    // Initialiser le modèle ML au démarrage
    initializeModel();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statistics = await getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.heroSection}>
          <Text style={styles.title}>GéoScope</Text>
          <Text style={styles.subtitle}>
            Identifiez instantanément vos pierres, gemmes et fossiles
          </Text>
          
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => router.push('/(tabs)/camera')}
          >
            <Camera size={24} color="#fff" />
            <Text style={styles.mainButtonText}>Commencer l'identification</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: 'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg?auto=compress&cs=tinysrgb&w=800' }}
          style={styles.heroImage}
        />
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Ma Collection</Text>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Gem size={24} color="#22c55e" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Spécimens identifiés</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.collectionButton}
            onPress={() => router.push('/(tabs)/collection')}
          >
            <Text style={styles.collectionButtonText}>Voir ma collection</Text>
            <ArrowRight size={16} color="#22c55e" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Photographiez</Text>
              <Text style={styles.stepDescription}>
                Prenez une photo claire de votre spécimen
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Analysez</Text>
              <Text style={styles.stepDescription}>
                Notre IA locale analyse l'image instantanément
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Collectionnez</Text>
              <Text style={styles.stepDescription}>
                Ajoutez le spécimen à votre collection personnelle
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  mainButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  collectionButtonText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  stepsContainer: {
    marginTop: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});