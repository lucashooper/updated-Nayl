import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useThemeGuaranteed } from '../context/ThemeContext';
import { useMeditation } from '../context/MeditationContext';
import { COLORS } from '../constants/theme';
import { buttonText } from '../constants/typography';

const { width, height } = Dimensions.get('window');

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

type SoundType = 'campfire' | 'rain' | 'sea' | 'white-noise';

interface RelaxationSoundScreenProps {
  route: {
    params: {
      soundType: SoundType;
    };
  };
  navigation: any;
}

const audioFiles = {
  campfire: require('../../assets/relaxation-sounds/campfire-sounds-short.mp3'),
  rain: require('../../assets/relaxation-sounds/short-rain-sounds.mp3'),
  sea: require('../../assets/relaxation-sounds/ocean-waves.mp3'),
  'white-noise': require('../../assets/relaxation-sounds/white-noise.mp3'),
};

const backgroundImages = {
  campfire: require('../../assets/relaxation-sounds/campfire-image.jpg'),
  rain: require('../../assets/relaxation-sounds/rain-image.jpg'),
  sea: require('../../assets/relaxation-sounds/rain-image.jpg'),
  'white-noise': require('../../assets/relaxation-sounds/rain-image.jpg'),
};

const titles = {
  campfire: 'Campfire',
  rain: 'Rain',
  sea: 'Ocean Waves',
  'white-noise': 'White Noise',
};

const icons = {
  campfire: require('../../assets/library-sound-icons/new-campfire-icon.webp'),
  rain: require('../../assets/library-sound-icons/rain-icon.webp'),
  sea: require('../../assets/library-sound-icons/new-sea-icon.webp'),
  'white-noise': require('../../assets/library-sound-icons/white-noise-icon.webp'),
};

const RelaxationSoundScreen: React.FC<RelaxationSoundScreenProps> = ({ route, navigation }) => {
  useThemeGuaranteed();
  const { setIsMeditationActive } = useMeditation();
  const { soundType } = route.params;
  const soundRef = useRef<Audio.Sound | null>(null);
  const isStoppingRef = useRef(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const stopAndUnload = useCallback(async () => {
    const currentSound = soundRef.current;
    if (!currentSound) return;

    soundRef.current = null;
    try {
      await currentSound.stopAsync();
    } catch {
      // Already stopped
    }
    try {
      await currentSound.unloadAsync();
    } catch {
      // Already unloaded
    }
  }, []);

  const stopAudio = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    await stopAndUnload();
    setIsMeditationActive(false);
    navigation.goBack();
  }, [navigation, setIsMeditationActive, stopAndUnload]);

  useEffect(() => {
    setIsMeditationActive(true);

    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const audioFile = audioFiles[soundType];
        if (!audioFile) return;

        const { sound: audioSound } = await Audio.Sound.createAsync(
          audioFile,
          { shouldPlay: true, isLooping: true },
        );

        if (isStoppingRef.current) {
          await audioSound.unloadAsync();
          return;
        }

        soundRef.current = audioSound;

        audioSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.positionMillis !== undefined) {
            setElapsedTime(status.positionMillis);
          }
        });
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    loadAudio();

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopAndUnload();
      setIsMeditationActive(false);
    });

    return () => {
      unsubscribe();
      stopAndUnload();
      setIsMeditationActive(false);
    };
  }, [navigation, setIsMeditationActive, soundType, stopAndUnload]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Image
        source={backgroundImages[soundType] || backgroundImages.campfire}
        style={styles.backgroundImage}
        resizeMode="cover"
        fadeDuration={0}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={stopAudio}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.backButtonGradient}
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.primaryText} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.audioInfo}>
          <View style={styles.audioIconContainer}>
            <Image
              source={icons[soundType] || icons.campfire}
              style={styles.audioIcon}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
          <Text style={styles.audioTitle}>
            {titles[soundType] || titles.campfire}
          </Text>
          <Text style={styles.elapsedTime}>
            {formatTime(elapsedTime)} elapsed time
          </Text>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <TouchableOpacity style={styles.stopButton} onPress={stopAudio}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.stopButtonGradient}
          >
            <Text style={styles.stopButtonText}>Stop Listening</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingBottom: SPACING.md,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'transparent',
  },
  audioInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    backgroundColor: 'transparent',
  },
  audioIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  audioIcon: {
    width: '100%',
    height: '100%',
  },
  audioTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryText,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  elapsedTime: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.primaryText,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  stopButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    ...buttonText,
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RelaxationSoundScreen;
