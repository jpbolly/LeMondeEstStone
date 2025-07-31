import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Sparkles, Info, BookOpen, Star, ArrowLeft, Plus, Check } from 'lucide-react-native';
import { identifySpecimen, IdentificationResult } from '@/services/mlService';
import { saveToCollection } from '@/services/storageService';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';


export default function IdentifyScreen() {

  const { imageUri } = useLocalSearchParams();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [addedToCollection, setAddedToCollection] = useState(false);
  const loadLabels = async (): Promise<string[]> => {
  const asset = Asset.fromModule(require('../assets/models/labels.txt'));
  await asset.downloadAsync();
  const content = await FileSystem.readAsStringAsync(asset.localUri!);
  return content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

};

  useEffect(() => {
    if (imageUri && typeof imageUri === 'string') {
      analyzeImage(imageUri);
    }
  }, [imageUri]);

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const identification = await identifySpecimen(uri);
      setResult(identification);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'analyser l\'image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!result || !imageUri) return;
    
    setIsAddingToCollection(true);
    try {
      await saveToCollection(result, imageUri as string);
      setAddedToCollection(true);
      Alert.alert('Succès', 'Spécimen ajouté à votre collection !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter à la collection');
    } finally {
      setIsAddingToCollection(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderConfidenceBar = (confidence: number) => {
    const width = confidence * 100;
    const color = confidence > 0.8 ? '#22c55e' : confidence > 0.6 ? '#f59e0b' : '#ef4444';
    
    return (
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceBar}>
          <View style={[styles.confidenceFill, { width: `${width}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>
      </View>
    );
  };

  const renderSpecimenInfo = (specimen: IdentificationResult) => {
    return (
      <View style={styles.infoCard}>
        <View style={styles.headerRow}>
          <Text style={styles.specimenName}>{specimen.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{specimen.category}</Text>
          </View>
        </View>
        
        {renderConfidenceBar(specimen.confidence)}
        
        <Text style={styles.description}>{specimen.description}</Text>
        
        <View style={styles.propertiesSection}>
          <View style={styles.propertyRow}>
            <Info size={16} color="#6b7280" />
            <Text style={styles.propertyLabel}>Dureté :</Text>
            <Text style={styles.propertyValue}>{specimen.hardness}</Text>
          </View>
          
          <View style={styles.propertyRow}>
            <Sparkles size={16} color="#6b7280" />
            <Text style={styles.propertyLabel}>Éclat :</Text>
            <Text style={styles.propertyValue}>{specimen.luster}</Text>
          </View>
          
          <View style={styles.propertyRow}>
            <Star size={16} color="#6b7280" />
            <Text style={styles.propertyLabel}>Rareté :</Text>
            <Text style={styles.propertyValue}>{specimen.rarity}</Text>
          </View>
        </View>
        
        {specimen.interestingFacts && specimen.interestingFacts.length > 0 && (
          <View style={styles.factsSection}>
            <View style={styles.factsHeader}>
              <BookOpen size={20} color="#22c55e" />
              <Text style={styles.factsTitle}>Faits intéressants</Text>
            </View>
            {specimen.interestingFacts.map((fact, index) => (
              <Text key={index} style={styles.factText}>• {fact}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (isAnalyzing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Analyse de l'échantillon en cours...</Text>
        <Text style={styles.loadingSubtext}>
          Notre IA examine les caractéristiques de votre spécimen
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identification</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri as string }} style={styles.image} />
          </View>
        )}
        
        {result && renderSpecimenInfo(result)}
      </ScrollView>

      {result && (
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleGoBack}
          >
            <Text style={styles.secondaryButtonText}>Nouvelle photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              addedToCollection && styles.successButton
            ]}
            onPress={handleAddToCollection}
            disabled={isAddingToCollection || addedToCollection}
          >
            {isAddingToCollection ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : addedToCollection ? (
              <>
                <Check size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Ajouté</Text>
              </>
            ) : (
              <>
                <Plus size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Ajouter à la collection</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  specimenName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 20,
  },
  propertiesSection: {
    marginBottom: 20,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  propertyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  factsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  factsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  factText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButton: {
    backgroundColor: '#16a34a',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});