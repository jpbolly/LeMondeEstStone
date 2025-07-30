import AsyncStorage from '@react-native-async-storage/async-storage';
import { IdentificationResult } from './mlService';

export interface StoredIdentification extends IdentificationResult {
  id: string;
  timestamp: number;
  imageUri: string;
}

const COLLECTION_KEY = 'specimen_collection';

export const saveToCollection = async (
  identification: IdentificationResult,
  imageUri: string = ''
): Promise<void> => {
  try {
    const newIdentification: StoredIdentification = {
      ...identification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUri,
    };

    const existingCollection = await getCollection();
    const updatedCollection = [newIdentification, ...existingCollection];

    await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(updatedCollection));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    throw error;
  }
};

export const getCollection = async (): Promise<StoredIdentification[]> => {
  try {
    const collectionJson = await AsyncStorage.getItem(COLLECTION_KEY);
    if (collectionJson) {
      return JSON.parse(collectionJson);
    }
    return [];
  } catch (error) {
    console.error('Erreur lors du chargement de la collection:', error);
    return [];
  }
};

export const deleteIdentification = async (id: string): Promise<void> => {
  try {
    const existingCollection = await getCollection();
    const updatedCollection = existingCollection.filter(item => item.id !== id);
    await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(updatedCollection));
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
};

export const clearCollection = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(COLLECTION_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression de la collection:', error);
    throw error;
  }
};

export const getStatistics = async (): Promise<{
  total: number;
  byCategory: Record<string, number>;
  averageConfidence: number;
}> => {
  try {
    const collection = await getCollection();
    
    const byCategory = collection.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageConfidence = collection.length > 0 
      ? collection.reduce((sum, item) => sum + item.confidence, 0) / collection.length
      : 0;

    return {
      total: collection.length,
      byCategory,
      averageConfidence,
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      total: 0,
      byCategory: {},
      averageConfidence: 0,
    };
  }
};

// Maintenir la compatibilité avec l'ancien nom pour l'historique
export const getIdentificationHistory = getCollection;
export const saveIdentification = saveToCollection;