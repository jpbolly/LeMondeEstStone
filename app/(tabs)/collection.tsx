import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Gem, Mountain, Cross as Fossil, Star, Award, Target } from 'lucide-react-native';
import { getCollection, getStatistics } from '@/services/storageService';

export default function CollectionScreen() {
  const [collection, setCollection] = useState([]);
  const [stats, setStats] = useState({ total: 0, byCategory: {} });
  const [selectedTab, setSelectedTab] = useState<'collection' | 'achievements'>('collection');

  useEffect(() => {
    loadCollection();
    loadStats();
  }, []);

  const loadCollection = async () => {
    try {
      const collectionData = await getCollection();
      setCollection(collectionData);
    } catch (error) {
      console.error('Erreur lors du chargement de la collection:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Minéral': return Gem;
      case 'Gemme': return Star;
      case 'Roche': return Mountain;
      case 'Fossile': return Fossil;
      default: return Gem;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Minéral': return '#3b82f6';
      case 'Gemme': return '#ec4899';
      case 'Roche': return '#8b5cf6';
      case 'Fossile': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const collections = [
    {
      id: 'minerals',
      title: 'Minéraux',
      icon: Gem,
      color: '#3b82f6',
      count: stats.byCategory['Minéral'] || 0,
    },
    {
      id: 'gems',
      title: 'Gemmes',
      icon: Star,
      color: '#ec4899',
      count: stats.byCategory['Gemme'] || 0,
    },
    {
      id: 'rocks',
      title: 'Roches',
      icon: Mountain,
      color: '#8b5cf6',
      count: stats.byCategory['Roche'] || 0,
    },
    {
      id: 'fossils',
      title: 'Fossiles',
      icon: Fossil,
      color: '#f59e0b',
      count: stats.byCategory['Fossile'] || 0,
    }
  ];

const achievements = [
  { id: 1, title: 'Premier spécimen', description: 'Identifiez votre premier échantillon', unlocked: true },
  { id: 2, title: 'Collectionneur', description: 'Identifiez 10 spécimens différents', unlocked: true },
  { id: 3, title: 'Expert en minéraux', description: 'Identifiez 20 minéraux', unlocked: false },
  { id: 4, title: 'Chasseur de gemmes', description: 'Trouvez 5 gemmes rares', unlocked: false },
];

  const renderCollectionCard = (collection: typeof collections[0]) => {
    const IconComponent = collection.icon;
    const specimens = collection.filter(item => item.category === collection.title.slice(0, -1));

    return (
      <View key={collection.id} style={styles.collectionCard}>
        <View style={styles.collectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: collection.color }]}>
            <IconComponent size={24} color="#fff" />
          </View>
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionTitle}>{collection.title}</Text>
            <Text style={styles.collectionCount}>
              {collection.count} spécimen{collection.count !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {specimens.length > 0 && (
          <View style={styles.specimens}>
            {specimens.slice(0, 3).map((specimen, index) => (
              <View key={index} style={styles.specimenItem}>
                <Image source={{ uri: specimen.imageUri }} style={styles.specimenImage} />
                <Text style={styles.specimenName}>{specimen.name}</Text>
              </View>
            ))}
            {specimens.length > 3 && (
              <View style={styles.moreSpecimens}>
                <Text style={styles.moreText}>
                  +{specimens.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderCollectionList = () => {
    if (collection.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Gem size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Collection vide</Text>
          <Text style={styles.emptyText}>
            Utilisez la caméra pour identifier et ajouter vos premiers spécimens
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.collectionsContainer}>
        {collections.map(renderCollectionCard)}
        
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Ajouts récents</Text>
          {collection.slice(0, 5).map((item, index) => (
            <View key={item.id} style={styles.recentItem}>
              <Image source={{ uri: item.imageUri }} style={styles.recentImage} />
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{item.name}</Text>
                <Text style={styles.recentCategory}>{item.category}</Text>
              </View>
              <View style={[styles.recentBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                <Text style={styles.recentBadgeText}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAchievements = () => (
    <View style={styles.achievementsContainer}>
      {achievements.map((achievement) => (
        <View 
          key={achievement.id} 
          style={[
            styles.achievementCard,
            { opacity: achievement.unlocked ? 1 : 0.6 }
          ]}
        >
          <View style={[
            styles.achievementIcon,
            { backgroundColor: achievement.unlocked ? '#22c55e' : '#9ca3af' }
          ]}>
            <Award size={20} color="#fff" />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
          </View>
          {achievement.unlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedText}>Débloqué</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ma Collection</Text>
        <Text style={styles.subtitle}>
          {stats.total} spécimen{stats.total !== 1 ? 's' : ''} identifié{stats.total !== 1 ? 's' : ''}
        </Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'collection' && styles.activeTab]}
            onPress={() => setSelectedTab('collection')}
          >
            <Text style={[styles.tabText, selectedTab === 'collection' && styles.activeTabText]}>
              Collection
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
            onPress={() => setSelectedTab('achievements')}
          >
            <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
              Succès
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'collection' ? (
          renderCollectionList()
        ) : (
          renderAchievements()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  collectionsContainer: {
    padding: 16,
  },
  collectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  collectionCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  specimens: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specimenItem: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  specimenImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  specimenName: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  moreSpecimens: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  recentSection: {
    marginTop: 8,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  recentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  recentCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  recentBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  achievementsContainer: {
    padding: 16,
  },
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  unlockedBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unlockedText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },
});