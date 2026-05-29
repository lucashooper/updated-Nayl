import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

const { width, height } = Dimensions.get('window');

interface NailBitingConsequencesScreenProps {
  userName: string;
  onComplete: () => void;
}

const NailBitingConsequencesScreen: React.FC<NailBitingConsequencesScreenProps> = ({ 
  userName, 
  onComplete 
}) => {
  // Starfield data - subtle blue/purple gradient stars
  const starfieldData = useMemo(() => [
    { id: 1, top: '15%', left: '20%', size: 'large', opacity: 0.4 },
    { id: 2, top: '25%', right: '30%', size: 'small', opacity: 0.3 },
    { id: 3, top: '40%', left: '10%', size: 'medium', opacity: 0.5 },
    { id: 4, top: '60%', right: '15%', size: 'large', opacity: 0.4 },
    { id: 5, top: '75%', left: '40%', size: 'small', opacity: 0.3 },
    { id: 6, top: '85%', right: '25%', size: 'medium', opacity: 0.4 },
    { id: 7, top: '35%', left: '70%', size: 'small', opacity: 0.3 },
    { id: 8, top: '50%', right: '60%', size: 'large', opacity: 0.5 },
    { id: 9, top: '20%', left: '50%', size: 'medium', opacity: 0.4 },
    { id: 10, top: '70%', left: '80%', size: 'small', opacity: 0.3 },
    { id: 11, top: '10%', left: '15%', size: 'large', opacity: 0.4 },
    { id: 12, top: '25%', right: '20%', size: 'small', opacity: 0.3 },
    { id: 13, top: '45%', left: '25%', size: 'medium', opacity: 0.5 },
    { id: 14, top: '65%', right: '30%', size: 'large', opacity: 0.4 },
    { id: 15, top: '80%', left: '35%', size: 'small', opacity: 0.3 },
    { id: 16, top: '30%', left: '80%', size: 'medium', opacity: 0.4 },
    { id: 17, top: '55%', right: '70%', size: 'large', opacity: 0.5 },
    { id: 18, top: '15%', right: '40%', size: 'small', opacity: 0.3 },
    { id: 19, top: '75%', right: '10%', size: 'medium', opacity: 0.4 },
    { id: 20, top: '40%', left: '60%', size: 'large', opacity: 0.5 },
    { id: 21, top: '20%', left: '25%', size: 'medium', opacity: 0.4 },
    { id: 22, top: '35%', right: '35%', size: 'small', opacity: 0.3 },
    { id: 23, top: '50%', left: '15%', size: 'large', opacity: 0.5 },
    { id: 24, top: '70%', right: '25%', size: 'medium', opacity: 0.4 },
    { id: 25, top: '85%', left: '45%', size: 'small', opacity: 0.3 },
    { id: 26, top: '25%', left: '75%', size: 'large', opacity: 0.5 },
    { id: 27, top: '60%', right: '60%', size: 'medium', opacity: 0.4 },
    { id: 28, top: '10%', right: '15%', size: 'small', opacity: 0.3 },
    { id: 29, top: '45%', left: '85%', size: 'large', opacity: 0.5 },
    { id: 30, top: '90%', right: '45%', size: 'medium', opacity: 0.4 },
    { id: 31, top: '18%', left: '30%', size: 'large', opacity: 0.5 },
    { id: 32, top: '32%', right: '40%', size: 'small', opacity: 0.3 },
    { id: 33, top: '48%', left: '20%', size: 'medium', opacity: 0.4 },
    { id: 34, top: '68%', right: '30%', size: 'large', opacity: 0.5 },
    { id: 35, top: '78%', left: '50%', size: 'small', opacity: 0.3 },
    { id: 36, top: '22%', left: '70%', size: 'medium', opacity: 0.4 },
    { id: 37, top: '58%', right: '70%', size: 'large', opacity: 0.5 },
    { id: 38, top: '12%', right: '25%', size: 'small', opacity: 0.3 },
    { id: 39, top: '42%', left: '80%', size: 'medium', opacity: 0.4 },
    { id: 40, top: '88%', right: '20%', size: 'large', opacity: 0.5 },
    { id: 41, top: '5%', left: '45%', size: 'small', opacity: 0.3 },
    { id: 42, top: '55%', right: '10%', size: 'medium', opacity: 0.4 },
    { id: 43, top: '95%', left: '35%', size: 'large', opacity: 0.5 },
    { id: 44, top: '15%', right: '55%', size: 'small', opacity: 0.3 },
    { id: 45, top: '65%', left: '90%', size: 'medium', opacity: 0.4 },
    { id: 46, top: '25%', left: '5%', size: 'large', opacity: 0.5 },
    { id: 47, top: '75%', right: '80%', size: 'small', opacity: 0.3 },
    { id: 48, top: '35%', left: '95%', size: 'medium', opacity: 0.4 },
    { id: 49, top: '85%', right: '5%', size: 'large', opacity: 0.5 },
    { id: 50, top: '45%', left: '65%', size: 'small', opacity: 0.3 },
  ], []);

  // Function to convert star data to styles
  const getStarStyle = (star: any) => {
    const baseStyle: any = {
      position: 'absolute' as const,
      opacity: star.opacity,
      backgroundColor: 'rgba(147, 51, 234, 0.8)', // Blue/purple background
      shadowColor: 'rgba(147, 51, 234, 0.6)', // Blue/purple shadow
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 2,
    };

    // Add positioning
    if (star.top) baseStyle.top = star.top;
    if (star.left) baseStyle.left = star.left;
    if (star.right) baseStyle.right = star.right;

    // Add size based on star.size
    switch (star.size) {
      case 'small':
        return {
          ...baseStyle,
          width: 1,
          height: 1,
          borderRadius: 0.5,
        };
      case 'medium':
        return {
          ...baseStyle,
          width: 1.5,
          height: 1.5,
          borderRadius: 0.75,
        };
      case 'large':
        return {
          ...baseStyle,
          width: 2,
          height: 2,
          borderRadius: 1,
        };
      default:
        return {
          ...baseStyle,
          width: 1.5,
          height: 1.5,
          borderRadius: 0.75,
        };
    }
  };

  // Animation values for enhanced sequential entrance
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-30);
  
  const contextTitleOpacity = useSharedValue(0);
  const contextTitleTranslateY = useSharedValue(-20);
  
  const numberOpacity = useSharedValue(0);
  const numberTranslateY = useSharedValue(30);
  const numberScale = useSharedValue(0.8);
  
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  
  const impact1Opacity = useSharedValue(0);
  const impact1TranslateY = useSharedValue(40);
  
  const impact2Opacity = useSharedValue(0);
  const impact2TranslateY = useSharedValue(40);
  
  const impact3Opacity = useSharedValue(0);
  const impact3TranslateY = useSharedValue(40);
  
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);
  
  const nailIconOpacity = useSharedValue(0);
  const nailIconTranslateY = useSharedValue(60);

  // Number counting animation
  const [displayNumber, setDisplayNumber] = useState(0);
  const finalNumber = 10950;

  useEffect(() => {
    // Start the enhanced animation sequence
    const startAnimations = () => {
      // 1. Main title animation (500ms, no delay)
      titleOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      titleTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

      // 2. Number animation (200ms delay, then 500ms duration)
      setTimeout(() => {
        numberOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        numberTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
        numberScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        
        // Start counting animation
        startNumberCounting();
      }, 200);

      // 3. Context title animation (after number counting completes)
      setTimeout(() => {
        contextTitleOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        contextTitleTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
      }, 1900); // 200ms delay + 1500ms counting

      // 4. Subtitle animation (after context title)
      setTimeout(() => {
        subtitleOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        subtitleTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
      }, 2400); // 1900ms + 500ms

      // 5. Staggered list animations
      setTimeout(() => {
        impact1Opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        impact1TranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 2900); // 2400ms + 500ms

      setTimeout(() => {
        impact2Opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        impact2TranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 3200); // 2900ms + 300ms

      setTimeout(() => {
        impact3Opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        impact3TranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 3500); // 3200ms + 300ms

      // 6. Final elements (button and icon)
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        buttonTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
        
        nailIconOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        nailIconTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 4100); // 3500ms + 600ms
    };

    // Start animations after a brief delay
    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, []);

  const startNumberCounting = () => {
    const duration = 1500; // 1.5 seconds
    const steps = 60; // 60 steps for smooth counting
    const increment = finalNumber / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const countInterval = setInterval(() => {
      currentStep++;
      const newValue = Math.min(Math.floor(currentStep * increment), finalNumber);
      setDisplayNumber(newValue);
      
      if (currentStep >= steps) {
        clearInterval(countInterval);
        setDisplayNumber(finalNumber);
      }
    }, stepDuration);
  };

  // Starfield is now static with subtle blue/purple gradient stars

  const handleContinue = () => {
    hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
    onComplete();
  };

  // Enhanced animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const contextTitleStyle = useAnimatedStyle(() => ({
    opacity: contextTitleOpacity.value,
    transform: [{ translateY: contextTitleTranslateY.value }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
    transform: [
      { translateY: numberTranslateY.value },
      { scale: numberScale.value }
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const impact1Style = useAnimatedStyle(() => ({
    opacity: impact1Opacity.value,
    transform: [{ translateY: impact1TranslateY.value }],
  }));

  const impact2Style = useAnimatedStyle(() => ({
    opacity: impact2Opacity.value,
    transform: [{ translateY: impact2TranslateY.value }],
  }));

  const impact3Style = useAnimatedStyle(() => ({
    opacity: impact3Opacity.value,
    transform: [{ translateY: impact3TranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const nailIconStyle = useAnimatedStyle(() => ({
    opacity: nailIconOpacity.value,
    transform: [{ translateY: nailIconTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Dark Starry Background */}
      <LinearGradient
        colors={['#000000', '#050505', '#0A0A0A', '#0F0F0F']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Premium Starfield Background */}
      {starfieldData.map((star, index) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            getStarStyle(star),
          ]}
        />
      ))}

      {/* Center Content */}
      <View style={styles.content}>
        {/* Main Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          This year you'll spend
        </Animated.Text>

        {/* Large Statistic with Counting Animation */}
        <Animated.View style={[styles.statisticContainer, numberStyle]}>
          <View style={styles.numberRow}>
            <Text style={styles.statisticNumber}>{displayNumber.toLocaleString()}</Text>
            <Text style={styles.statisticUnit}>mins</Text>
          </View>
        </Animated.View>

        {/* Context Title - now below the number */}
        <Animated.Text style={[styles.contextTitle, contextTitleStyle]}>
          Biting your nails
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          if you don't change anything. (182 hours)
        </Animated.Text>

        {/* Impact Points with Enhanced Content */}
        <View style={styles.impactsContainer}>
          <Animated.View style={[styles.impactItem, impact1Style]}>
            <Text style={styles.impactEmoji}>🦷</Text>
            <Text style={styles.impactText}>
              That's enough time to transfer germs from your fingers to your mouth over 50,000 times.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.impactItem, impact2Style]}>
            <Text style={styles.impactEmoji}>🎸</Text>
            <Text style={styles.impactText}>
              With that time, you could learn the basics of playing the guitar or piano.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.impactItem, impact3Style]}>
            <Text style={styles.impactEmoji}>🤝</Text>
            <Text style={styles.impactText}>
              Imagine spending that time with confident, healthy hands in every social situation.
            </Text>
          </Animated.View>
        </View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={styles.continueButtonText}>View my dependency score</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Nail Icon at Bottom with Animation */}
      <Animated.View style={[styles.nailIconContainer, nailIconStyle]}>
        <Image
          source={require('../../assets/cosmic-nail-nobg.webp')}
          style={styles.nailIcon}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    // Star styles are now handled by getStarStyle function
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  contextTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
    lineHeight: 34,
  },
  statisticContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statisticNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -2,
    textShadowColor: 'rgba(220, 38, 38, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statisticUnit: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
    marginLeft: 8,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  impactsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  impactEmoji: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  impactText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    width: width * 0.85,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  nailIconContainer: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  nailIcon: {
    width: '100%',
    height: '100%',
    maxWidth: width * 0.6,
    opacity: 0.8,
  },
});

export default NailBitingConsequencesScreen;
