import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

const { width, height } = Dimensions.get('window');

interface OnboardingWelcomeProps {
  onStart: () => void;
  onLogin: () => void;
  onSkipToPlan?: () => void; // New prop for skipping to plan
  isEmbedded?: boolean;
  isVisible?: boolean;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onStart, onLogin, onSkipToPlan, isEmbedded = false, isVisible = true }) => {
  // Debug logging for star visibility
  React.useEffect(() => {
    console.log('OnboardingWelcome: Component mounted, stars should be visible');
    console.log('isEmbedded:', isEmbedded);
    console.log('isVisible:', isVisible);
    console.log('Stars container style:', styles.starsContainer);
    console.log('Base star style:', styles.star);
    console.log('Sample star1 style:', styles.star1);
  }, [isEmbedded, isVisible]);

  // Animation values for staggered loading sequence
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-30);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);
  const nailOpacity = useSharedValue(0);
  const nailScale = useSharedValue(0.95);
  const nailTranslateY = useSharedValue(100);

  // Exit animation values for smooth transition
  const exitOpacity = useSharedValue(1);
  const exitTranslateX = useSharedValue(0);
  const isExiting = useSharedValue(false);

  // Button press animation
  const buttonScale = useSharedValue(1);

  // Start animations when component mounts or becomes visible
  useEffect(() => {
    if (isVisible) {
      // Reset animation values
      titleOpacity.value = 0;
      titleTranslateY.value = -30;
      taglineOpacity.value = 0;
      taglineTranslateY.value = 20;
      buttonsOpacity.value = 0;
      buttonsTranslateY.value = 20;
      nailOpacity.value = 0;
      nailScale.value = 0.95;
      nailTranslateY.value = 100;

      // Start animations with delays
      nailOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      nailScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      nailTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });

      titleOpacity.value = withDelay(400, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
      titleTranslateY.value = withDelay(400, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));

      taglineOpacity.value = withDelay(600, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
      taglineTranslateY.value = withDelay(600, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));

      buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
      buttonsTranslateY.value = withDelay(800, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    }
  }, [isVisible]);

  const handleStart = () => {
    hapticService.trigger(HapticType.ACHIEVEMENT, HapticIntensity.PROMINENT);
    
    if (!isEmbedded) {
      isExiting.value = true;
      exitOpacity.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
      exitTranslateX.value = withTiming(-width, { duration: 400, easing: Easing.out(Easing.cubic) });
      
      setTimeout(() => {
        onStart();
      }, 400);
    } else {
      onStart();
    }
  };

  const handleStartPressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100, easing: Easing.out(Easing.cubic) });
  };

  const handleStartPressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) });
  };

  const handleLogin = () => {
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
    onLogin();
  };

  const handleLoginPressIn = () => {
    buttonScale.value = withTiming(0.98, { duration: 100, easing: Easing.out(Easing.cubic) });
  };

  const handleLoginPressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) });
  };

  // Simple animated styles - just like the working second page
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const nailAnimatedStyle = useAnimatedStyle(() => ({
    opacity: nailOpacity.value,
    transform: [{ scale: nailScale.value }, { translateY: nailTranslateY.value }],
  }));

  const exitAnimatedStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
    transform: [{ translateX: exitTranslateX.value }],
  }));

  const buttonPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <Animated.View style={[
      styles.container, 
      isEmbedded && styles.containerEmbedded,
      exitAnimatedStyle
    ]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
              {/* Subtle Floating Stars - Only in bottom half to avoid distracting from text */}
        <View 
          style={styles.starsContainer}
          onLayout={() => console.log('Stars container layout completed')}
        >
          <View style={[styles.star, styles.star4]} />
          <View style={[styles.star, styles.star5]} />
          <View style={[styles.star, styles.star6]} />
          <View style={[styles.star, styles.star10]} />
          <View style={[styles.star, styles.star12]} />
          <View style={[styles.star, styles.star16]} />
          <View style={[styles.star, styles.star17]} />
          <View style={[styles.star, styles.star18]} />
          <View style={[styles.star, styles.star22]} />
          <View style={[styles.star, styles.star23]} />
          <View style={[styles.star, styles.star25]} />
          <View style={[styles.star, styles.star26]} />
          <View style={[styles.star, styles.star27]} />
          <View style={[styles.star, styles.star33]} />
          <View style={[styles.star, styles.star34]} />
          <View style={[styles.star, styles.star35]} />
          <View style={[styles.star, styles.star36]} />
          <View style={[styles.star, styles.star41]} />
          <View style={[styles.star, styles.star42]} />
          <View style={[styles.star, styles.star43]} />
          <View style={[styles.star, styles.star44]} />
          <View style={[styles.star, styles.star45]} />
          <View style={[styles.star, styles.star50]} />
        </View>
      
      {/* Temporary Skip Button for Testing */}
      {onSkipToPlan && (
        <TouchableOpacity 
          style={styles.tempSkipButton} 
          onPress={onSkipToPlan}
          activeOpacity={0.7}
        >
          <Text style={styles.tempSkipButtonText}>⚡ Skip to Plan</Text>
        </TouchableOpacity>
      )}
      
      {/* Main Content Section */}
      <View style={styles.contentSection}>
        {/* App Title */}
        <Animated.Text style={[
          styles.appTitle, 
          titleAnimatedStyle
        ]}>Nayl</Animated.Text>
        
        {/* Tagline */}
        <Animated.Text style={[
          styles.tagline, 
          taglineAnimatedStyle
        ]}>Save your nails and{"\n"}reclaim control with Nayl.</Animated.Text>
        
        {/* Start Journey Button */}
        <Animated.View style={buttonsAnimatedStyle}>
          <Animated.View style={buttonPressStyle}>
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={handleStart}
              onPressIn={handleStartPressIn}
              onPressOut={handleStartPressOut}
              activeOpacity={1}
            >
              <LinearGradient
                colors={['#6D28D9', '#DB2777']} // Slightly softer saturation
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Begin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        
        {/* Login Link */}
        <Animated.View style={buttonsAnimatedStyle}>
          <Animated.View style={buttonPressStyle}>
            <TouchableOpacity 
              onPress={handleLogin}
              onPressIn={handleLoginPressIn}
              onPressOut={handleLoginPressOut}
              activeOpacity={1}
            >
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
      
      {/* Bottom Image Section */}
      <View style={styles.imageSection}>
        <Animated.Image
          source={require('../../assets/cosmic-nail-nobg.webp')}
          style={[
            styles.bottomImage, 
            nailAnimatedStyle
          ]}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Dark background
  },
  containerEmbedded: {
    backgroundColor: 'transparent', // Remove background when embedded in PagerView
  },
  
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80, // More breathing room
    zIndex: 10,
  },
  
  appTitle: {
    fontSize: 64,
    fontWeight: '600', // Semibold for calm confidence
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 72,
    letterSpacing: 2, // Refined letter spacing for premium brand feel
    zIndex: 10,
  },
  
  tagline: {
    fontSize: 17,
    fontWeight: '400', // Light weight for elegance
    color: 'rgba(255, 255, 255, 0.75)', // Reduced opacity for hierarchy
    textAlign: 'center',
    marginBottom: 64, // Increased spacing for floating feel
    lineHeight: 26,
    letterSpacing: 0.3,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  
  startButton: {
    width: width * 0.85,
    height: 64, // Increased vertical padding for luxury
    borderRadius: 32,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, // Softer shadow
    shadowRadius: 20,
    elevation: 8,
  },
  
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
  
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    zIndex: 10,
  },
  
  loginLink: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
    letterSpacing: 0.2,
    zIndex: 10,
  },
  
  imageSection: {
    height: height * 0.35, // Slightly smaller to bring closer to content
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20, // Bring nail closer to content
    paddingBottom: 40,
    zIndex: 10,
  },
  
  bottomImage: {
    width: '100%',
    height: '100%',
    maxWidth: width * 0.8,
  },
  
  // Premium Starfield Styles
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  
  // Star size variations for depth
  starSmall: {
    width: 1,
    height: 1,
    borderRadius: 0.5,
    opacity: 0.3,
  },
  starMedium: {
    width: 2,
    height: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
  starLarge: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.7,
  },
  star: {
    position: 'absolute',
    width: 1.5, // Very small for subtlety
    height: 1.5, // Very small for subtlety
    borderRadius: 0.75, // Smaller radius
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, // Very subtle
    shadowRadius: 1, // Minimal shadow
  },
  star1: {
    top: '15%',
    left: '20%',
    opacity: 0.4, // Much more subtle
    backgroundColor: 'rgba(147, 51, 234, 0.8)', // More transparent
    shadowColor: '#9333EA',
    width: 1.5, // Slightly smaller for depth
    height: 1.5,
    borderRadius: 0.75,
  },
  star2: {
    top: '25%',
    right: '30%',
    opacity: 0.6, // More subtle
    backgroundColor: 'rgba(59, 130, 246, 0.7)', // More transparent
    shadowColor: '#3B82F6',
    width: 2.5, // Slightly larger for depth
    height: 2.5,
    borderRadius: 1.25,
  },
  star3: {
    top: '40%',
    left: '10%',
    opacity: 0.3, // Very subtle
    backgroundColor: 'rgba(139, 92, 246, 0.6)', // More transparent
    shadowColor: '#8B5CF6',
    width: 1, // Smallest for depth
    height: 1,
    borderRadius: 0.5,
  },
  star4: {
    top: '60%',
    right: '15%',
    opacity: 0.5, // Subtle
    backgroundColor: 'rgba(96, 165, 250, 0.7)', // More transparent
    shadowColor: '#60A5FA',
    width: 2, // Medium for depth
    height: 2,
    borderRadius: 1,
  },
  star5: {
    top: '75%',
    left: '40%',
    opacity: 0.7, // Slightly more visible
    backgroundColor: 'rgba(168, 85, 247, 0.8)', // More transparent
    shadowColor: '#A855F7',
    width: 3, // Larger for depth
    height: 3,
    borderRadius: 1.5,
  },
  star6: {
    top: '85%',
    right: '25%',
    opacity: 0.4, // Subtle
    backgroundColor: 'rgba(59, 130, 246, 0.6)', // More transparent
    shadowColor: '#3B82F6',
    width: 1.5, // Small for depth
    height: 1.5,
    borderRadius: 0.75,
  },
  star7: {
    top: '35%',
    left: '70%',
    opacity: 0.5, // Subtle
    backgroundColor: 'rgba(147, 51, 234, 0.7)', // More transparent
    shadowColor: '#9333EA',
    width: 2.5, // Medium for depth
    height: 2.5,
    borderRadius: 1.25,
  },
  star8: {
    top: '50%',
    right: '60%',
    opacity: 0.3, // Very subtle
    backgroundColor: 'rgba(139, 92, 246, 0.5)', // More transparent
    shadowColor: '#8B5CF6',
    width: 1, // Smallest for depth
    height: 1,
    borderRadius: 0.5,
  },
  star9: {
    top: '20%',
    left: '50%',
    opacity: 0.6, // Subtle
    backgroundColor: 'rgba(96, 165, 250, 0.7)', // More transparent
    shadowColor: '#60A5FA',
    width: 3, // Larger for depth
    height: 3,
    borderRadius: 1.5,
  },
  star10: {
    top: '70%',
    left: '80%',
    opacity: 0.4, // Subtle
    backgroundColor: 'rgba(168, 85, 247, 0.6)', // More transparent
    shadowColor: '#A855F7',
    width: 2, // Medium for depth
    height: 2,
    borderRadius: 1,
  },
  star11: {
    top: '30%',
    left: '85%',
    opacity: 0.5, // Subtle
    backgroundColor: 'rgba(59, 130, 246, 0.7)', // More transparent
    shadowColor: '#3B82F6',
    width: 2, // Medium for depth
    height: 2,
    borderRadius: 1,
  },
  star12: {
    top: '80%',
    left: '25%',
    opacity: 0.3, // Very subtle
    backgroundColor: 'rgba(147, 51, 234, 0.5)', // More transparent
    shadowColor: '#9333EA',
    width: 1, // Smallest for depth
    height: 1,
    borderRadius: 0.5,
  },
  star13: {
    top: '10%',
    left: '10%',
    opacity: 0.6, // Subtle
    backgroundColor: 'rgba(139, 92, 246, 0.7)', // More transparent
    shadowColor: '#8B5CF6',
    width: 3, // Larger for depth
    height: 3,
    borderRadius: 1.5,
  },
  star14: {
    top: '20%',
    right: '20%',
    opacity: 0.4, // Subtle
    backgroundColor: 'rgba(96, 165, 250, 0.6)', // More transparent
    shadowColor: '#60A5FA',
    width: 1.5, // Small for depth
    height: 1.5,
    borderRadius: 0.75,
  },
  star15: {
    top: '40%',
    left: '30%',
    opacity: 0.5, // Subtle
    backgroundColor: 'rgba(168, 85, 247, 0.7)', // More transparent
    shadowColor: '#A855F7',
    width: 2.5, // Medium-large for depth
    height: 2.5,
    borderRadius: 1.25,
  },
  star16: {
    top: '60%',
    right: '30%',
    opacity: 0.3, // Very subtle
    backgroundColor: 'rgba(147, 51, 234, 0.5)', // More transparent
    shadowColor: '#9333EA',
    width: 2, // Medium for depth
    height: 2,
    borderRadius: 1,
  },
  star17: {
    top: '80%',
    left: '40%',
    opacity: 0.5, // Subtle
    backgroundColor: 'rgba(59, 130, 246, 0.7)', // More transparent
    shadowColor: '#3B82F6',
    width: 3, // Larger for depth
    height: 3,
    borderRadius: 1.5,
  },
  star18: {
    top: '90%',
    right: '40%',
    opacity: 0.4, // Subtle
    backgroundColor: 'rgba(139, 92, 246, 0.6)', // More transparent
    shadowColor: '#8B5CF6',
    width: 1.5, // Small for depth
    height: 1.5,
    borderRadius: 0.75,
  },
  star19: {
    top: '5%',
    left: '60%',
    opacity: 0.6, // Subtle
    backgroundColor: 'rgba(147, 51, 234, 0.7)', // More transparent
    shadowColor: '#9333EA',
    width: 2.5, // Medium-large for depth
    height: 2.5,
    borderRadius: 1.25,
  },
  star20: {
    top: '15%',
    right: '10%',
    opacity: 0.3, // Very subtle
    backgroundColor: 'rgba(59, 130, 246, 0.5)', // More transparent
    shadowColor: '#3B82F6',
    width: 1, // Smallest for depth
    height: 1,
    borderRadius: 0.5,
  },
  star21: {
    top: '25%',
    left: '80%',
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star22: {
    top: '45%',
    right: '5%',
    opacity: 0.8,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star23: {
    top: '55%',
    left: '90%',
    opacity: 0.9,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star24: {
    top: '65%',
    right: '45%',
    opacity: 0.7,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star25: {
    top: '75%',
    left: '5%',
    opacity: 0.8,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star26: {
    top: '85%',
    right: '70%',
    opacity: 0.9,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star27: {
    top: '95%',
    left: '70%',
    opacity: 0.7,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star28: {
    top: '8%',
    left: '40%',
    opacity: 0.8,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star29: {
    top: '18%',
    right: '50%',
    opacity: 0.9,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star30: {
    top: '28%',
    left: '15%',
    opacity: 0.7,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star31: {
    top: '38%',
    right: '80%',
    opacity: 0.8,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star32: {
    top: '48%',
    left: '75%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star33: {
    top: '58%',
    right: '15%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star34: {
    top: '68%',
    left: '55%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star35: {
    top: '78%',
    right: '90%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star36: {
    top: '88%',
    left: '25%',
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star37: {
    top: '12%',
    left: '85%',
    opacity: 0.8,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star38: {
    top: '22%',
    right: '25%',
    opacity: 0.9,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star39: {
    top: '32%',
    left: '45%',
    opacity: 0.7,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star40: {
    top: '42%',
    right: '60%',
    opacity: 0.8,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star41: {
    top: '52%',
    left: '20%',
    opacity: 0.9,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star42: {
    top: '62%',
    right: '75%',
    opacity: 0.7,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star43: {
    top: '72%',
    left: '65%',
    opacity: 0.8,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star44: {
    top: '82%',
    right: '35%',
    opacity: 0.9,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star45: {
    top: '92%',
    left: '35%',
    opacity: 0.7,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star46: {
    top: '7%',
    left: '30%',
    opacity: 0.8,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star47: {
    top: '17%',
    right: '40%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star48: {
    top: '27%',
    left: '95%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star49: {
    top: '37%',
    right: '20%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star50: {
    top: '47%',
    left: '5%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },

  tempSkipButton: {
    position: 'absolute',
    top: 80, // Position below status bar
    right: 20, // Position on the right side
    backgroundColor: 'rgba(236, 72, 153, 0.9)', // Semi-transparent pink
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    zIndex: 1000, // High z-index to be above other elements
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  tempSkipButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default OnboardingWelcome;
