import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-platform-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

export interface IdentificationResult {
  name: string;
  category: string;
  confidence: number;
  description: string;
  hardness: string;
  luster: string;
  rarity: string;
  interestingFacts: string[];
}

let model: tf.LayersModel | null = null;
let labels: string[] = [];

// Données enrichies pour chaque type de roche/minéral
const specimenData: Record<string, Omit<IdentificationResult, 'name' | 'confidence'>> = {
  'Basalt': {
    category: 'Roche',
    description: 'Roche volcanique sombre et dense, formée par le refroidissement rapide de la lave basaltique. Très commune dans les régions volcaniques.',
    hardness: '6-7',
    luster: 'Mat à vitreux',
    rarity: 'Très commune',
    interestingFacts: [
      'Compose la majeure partie du fond océanique',
      'Peut contenir des bulles de gaz (vésicules)',
      'Utilisé dans la construction depuis l\'Antiquité'
    ]
  },
  'Clay': {
    category: 'Roche',
    description: 'Roche sédimentaire fine composée principalement de minéraux argileux. Se forme par l\'altération de roches préexistantes.',
    hardness: '1-2',
    luster: 'Terreux',
    rarity: 'Très commune',
    interestingFacts: [
      'Devient plastique quand elle est humide',
      'Utilisée en poterie depuis des millénaires',
      'Peut contenir des fossiles bien préservés'
    ]
  },
  'Conglomerate': {
    category: 'Roche',
    description: 'Roche sédimentaire composée de fragments arrondis (galets) cimentés ensemble. Témoigne d\'anciens environnements de rivière ou de plage.',
    hardness: '4-6',
    luster: 'Variable',
    rarity: 'Commune',
    interestingFacts: [
      'Les galets indiquent un transport par l\'eau',
      'Peut contenir des galets de roches très anciennes',
      'Utilisée comme pierre ornementale'
    ]
  },
  'Diatomite': {
    category: 'Roche',
    description: 'Roche sédimentaire siliceuse formée par l\'accumulation de diatomées fossiles. Très poreuse et légère.',
    hardness: '1-2',
    luster: 'Terreux',
    rarity: 'Peu commune',
    interestingFacts: [
      'Composée de squelettes d\'algues microscopiques',
      'Utilisée comme filtre et isolant',
      'Peut absorber jusqu\'à 4 fois son poids en liquide'
    ]
  },
  'Shale': {
    category: 'Roche',
    description: 'Roche sédimentaire fine formée par la compaction d\'argile et de limon. Se débite en feuillets parallèles.',
    hardness: '2-3',
    luster: 'Mat',
    rarity: 'Très commune',
    interestingFacts: [
      'Roche sédimentaire la plus abondante',
      'Peut contenir du pétrole et du gaz naturel',
      'Souvent riche en fossiles'
    ]
  },
  'Shale-(Mudstone)': {
    category: 'Roche',
    description: 'Variété de schiste argileux plus massive, formée dans des environnements calmes comme les lacs ou les mers profondes.',
    hardness: '2-3',
    luster: 'Mat',
    rarity: 'Commune',
    interestingFacts: [
      'Se forme dans des eaux calmes et profondes',
      'Peut préserver des détails fins de fossiles',
      'Source importante d\'hydrocarbures'
    ]
  },
  'Siliceous': {
    category: 'Roche',
    description: 'Roche riche en silice, souvent d\'origine biologique ou chimique. Très dure et résistante à l\'érosion.',
    hardness: '6-7',
    luster: 'Vitreux',
    rarity: 'Commune',
    interestingFacts: [
      'Peut se former par précipitation chimique',
      'Résiste très bien à l\'altération',
      'Utilisée pour fabriquer des outils préhistoriques'
    ]
  },
  'Siliceous-sinter': {
    category: 'Roche',
    description: 'Dépôt siliceux formé par précipitation autour de sources chaudes. Structure souvent poreuse et stratifiée.',
    hardness: '6-7',
    luster: 'Vitreux à porcelané',
    rarity: 'Peu commune',
    interestingFacts: [
      'Se forme autour des geysers et sources chaudes',
      'Peut préserver des micro-organismes anciens',
      'Indique une activité géothermale passée'
    ]
  },
  'chert': {
    category: 'Roche',
    description: 'Roche sédimentaire siliceuse très dure, souvent de couleur grise à noire. Cassure conchoïdale caractéristique.',
    hardness: '7',
    luster: 'Vitreux à cireux',
    rarity: 'Commune',
    interestingFacts: [
      'Utilisé pour fabriquer des outils tranchants',
      'Peut contenir des fossiles silicifiés',
      'Produit des étincelles avec l\'acier'
    ]
  },
  'granite': {
    category: 'Roche',
    description: 'Roche magmatique plutonique composée de quartz, feldspath et mica. Texture grenue caractéristique.',
    hardness: '6-7',
    luster: 'Vitreux',
    rarity: 'Très commune',
    interestingFacts: [
      'Roche la plus abondante de la croûte continentale',
      'Se forme par refroidissement lent du magma',
      'Utilisé en construction et sculpture'
    ]
  },
  'gypsum': {
    category: 'Minéral',
    description: 'Minéral évaporitique très tendre, composé de sulfate de calcium hydraté. Souvent blanc ou incolore.',
    hardness: '2',
    luster: 'Vitreux à nacré',
    rarity: 'Commune',
    interestingFacts: [
      'Si tendre qu\'il se raye à l\'ongle',
      'Utilisé pour fabriquer le plâtre',
      'Peut former des cristaux géants'
    ]
  },
  'olivine': {
    category: 'Minéral',
    description: 'Minéral silicaté de couleur verte, composant majeur du manteau terrestre. Souvent altéré en surface.',
    hardness: '6.5-7',
    luster: 'Vitreux',
    rarity: 'Commune',
    interestingFacts: [
      'Minéral le plus abondant du manteau terrestre',
      'La variété gemme s\'appelle péridot',
      'Présent dans les météorites'
    ]
  },
  'olivine-basalt': {
    category: 'Roche',
    description: 'Basalte riche en olivine, donnant une couleur plus verte à la roche. Typique des volcans océaniques.',
    hardness: '6-7',
    luster: 'Vitreux',
    rarity: 'Commune',
    interestingFacts: [
      'Typique des îles volcaniques comme Hawaï',
      'L\'olivine peut former des plages vertes',
      'Indique un magma peu évolué'
    ]
  },
  'sandstone': {
    category: 'Roche',
    description: 'Roche sédimentaire composée de grains de sable cimentés. Texture granuleuse visible à l\'œil nu.',
    hardness: '4-7',
    luster: 'Mat à vitreux',
    rarity: 'Très commune',
    interestingFacts: [
      'Peut préserver des traces fossiles',
      'Utilisée en construction depuis l\'Antiquité',
      'La couleur dépend de la composition du ciment'
    ]
  },
  'slate': {
    category: 'Roche',
    description: 'Roche métamorphique formée par transformation de schistes argileux. Se débite en plaques fines et planes.',
    hardness: '3-4',
    luster: 'Mat à soyeux',
    rarity: 'Commune',
    interestingFacts: [
      'Utilisée traditionnellement pour les toitures',
      'Se forme par métamorphisme de faible degré',
      'Peut conserver des fossiles déformés'
    ]
  }
};

export const initializeModel = async (): Promise<void> => {
  try {
    console.log('Initialisation du modèle TensorFlow.js...');
    
    // Initialiser la plateforme TensorFlow.js pour React Native
    await tf.ready();
    
    // Charger les labels
    await loadLabels();
    
    // Charger le modèle depuis les assets
    const modelUrl = bundleResourceIO(
      require('../models/tfjs_model/model.json'),
      [
        require('../models/tfjs_model/group1-shard1of3.bin'),
        require('../models/tfjs_model/group1-shard2of3.bin'),
        require('../models/tfjs_model/group1-shard3of3.bin')
      ]
    );
    
    model = await tf.loadLayersModel(modelUrl);
    console.log('Modèle chargé avec succès');
    console.log('Forme d\'entrée:', model.inputs[0].shape);
    console.log('Nombre de classes:', labels.length);
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du modèle:', error);
    throw error;
  }
};

const loadLabels = async (): Promise<void> => {
  try {
    const asset = Asset.fromModule(require('../models/labels.txt'));
    await asset.downloadAsync();
    const content = await FileSystem.readAsStringAsync(asset.localUri!);
    labels = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('Labels chargés:', labels.length);
  } catch (error) {
    console.error('Erreur lors du chargement des labels:', error);
    throw error;
  }
};

const preprocessImage = async (imageUri: string): Promise<tf.Tensor> => {
  try {
    // Lire l'image comme base64
    const response = await fetch(imageUri);
    const imageData = await response.arrayBuffer();
    
    // Décoder l'image
    const imageTensor = tf.node.decodeImage(new Uint8Array(imageData), 3);
    
    // Redimensionner à la taille attendue par le modèle (224x224 généralement)
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
    
    // Normaliser les pixels (0-255 -> 0-1)
    const normalized = resized.div(255.0);
    
    // Ajouter une dimension batch
    const batched = normalized.expandDims(0);
    
    // Nettoyer les tenseurs intermédiaires
    imageTensor.dispose();
    resized.dispose();
    normalized.dispose();
    
    return batched;
  } catch (error) {
    console.error('Erreur lors du préprocessing de l\'image:', error);
    throw error;
  }
};

export const identifySpecimen = async (imageUri: string): Promise<IdentificationResult> => {
  try {
    if (!model) {
      throw new Error('Le modèle n\'est pas initialisé');
    }
    
    if (labels.length === 0) {
      throw new Error('Les labels ne sont pas chargés');
    }
    
    console.log('Préprocessing de l\'image...');
    const preprocessedImage = await preprocessImage(imageUri);
    
    console.log('Prédiction en cours...');
    const predictions = model.predict(preprocessedImage) as tf.Tensor;
    const predictionData = await predictions.data();
    
    // Trouver la classe avec la plus haute probabilité
    let maxIndex = 0;
    let maxConfidence = predictionData[0];
    
    for (let i = 1; i < predictionData.length; i++) {
      if (predictionData[i] > maxConfidence) {
        maxConfidence = predictionData[i];
        maxIndex = i;
      }
    }
    
    const predictedLabel = labels[maxIndex];
    const confidence = maxConfidence;
    
    console.log(`Prédiction: ${predictedLabel} (${(confidence * 100).toFixed(1)}%)`);
    
    // Nettoyer les tenseurs
    preprocessedImage.dispose();
    predictions.dispose();
    
    // Récupérer les données enrichies ou utiliser des valeurs par défaut
    const enrichedData = specimenData[predictedLabel] || {
      category: 'Inconnu',
      description: 'Spécimen non identifié dans notre base de données.',
      hardness: 'Inconnue',
      luster: 'Inconnu',
      rarity: 'Inconnue',
      interestingFacts: ['Spécimen nécessitant une analyse plus approfondie.']
    };
    
    return {
      name: predictedLabel,
      confidence: confidence,
      ...enrichedData
    };
    
  } catch (error) {
    console.error('Erreur lors de l\'identification:', error);
    throw error;
  }
};

export const getModelInfo = (): { isLoaded: boolean; labelsCount: number } => {
  return {
    isLoaded: model !== null,
    labelsCount: labels.length
  };
};