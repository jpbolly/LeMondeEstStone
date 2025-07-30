import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera as CameraIcon, FlipHorizontal, Zap, ZapOff } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [torch, setTorch] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!mediaPermission?.granted) {
      requestMediaPermission();
    }
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Chargement des permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Nous avons besoin de votre permission pour utiliser la caméra
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Accorder la permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo) {
          setCapturedImage(photo.uri);
          
          // Sauvegarder dans la galerie
          if (mediaPermission?.granted) {
            await MediaLibrary.saveToLibraryAsync(photo.uri);
          }

          // Naviguer vers l'écran d'identification avec l'image
          router.push({
            pathname: '/identify',
            params: { imageUri: photo.uri }
          });
        }
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTorch = () => {
    setTorch(current => !current);
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={torch}
      >
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleTorch}>
              {torch ? (
                <Zap size={24} color="#fff" />
              ) : (
                <ZapOff size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.focusArea}>
            <View style={styles.focusFrame} />
            <Text style={styles.instructionText}>
              Centrez la pierre, gemme ou fossile dans le cadre
            </Text>
          </View>

          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <FlipHorizontal size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner}>
                <CameraIcon size={32} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 50,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 12,
  },
  focusArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusFrame: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 15,
  },
  captureButton: {
    backgroundColor: '#22c55e',
    borderRadius: 40,
    padding: 4,
  },
  captureButtonInner: {
    backgroundColor: '#16a34a',
    borderRadius: 36,
    padding: 16,
  },
  placeholder: {
    width: 54,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});