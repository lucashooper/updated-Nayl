import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  PanResponder,
  BackHandler,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import ProfessionalSignaturePad from './ProfessionalSignaturePad';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

const { width, height } = Dimensions.get('window');

interface CommitmentScreenProps {
  onComplete: () => void;
}

const CommitmentScreen: React.FC<CommitmentScreenProps> = ({ onComplete }) => {
  const [hasSignature, setHasSignature] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const buttonScale = useSharedValue(1);
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

  // Animation values for sequential entrance
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-30);
  
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(-20);
  
  const listOpacity = useSharedValue(0);
  const listTranslateY = useSharedValue(30);
  
  const signatureOpacity = useSharedValue(0);
  const signatureTranslateY = useSharedValue(30);
  
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  const signatureRef = useRef<any>(null);

  // Ultra-aggressive gesture blocking with higher threshold
  const gestureBlockingPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Block ANY movement that could be interpreted as navigation
        if (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2) {
          return true; // Block the gesture
        }
        return true;
      },
      onPanResponderRelease: () => true,
      onPanResponderTerminate: () => true,
      onPanResponderReject: () => true,
    })
  ).current;

  // Block back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevent back navigation
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Start the animation sequence
    const startAnimations = () => {
      // 1. Title animation (500ms, no delay)
      titleOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      titleTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

      // 2. Subtitle animation (300ms delay)
      setTimeout(() => {
        subtitleOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        subtitleTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
      }, 300);

      // 3. List animation (600ms delay)
      setTimeout(() => {
        listOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        listTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 600);

      // 4. Signature pad animation (900ms delay)
      setTimeout(() => {
        signatureOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        signatureTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 900);

      // 5. Button animation (1200ms delay)
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        buttonTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 1200);
    };

    // Start animations after a brief delay
    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, []);

   // Starfield is now static with subtle blue/purple gradient stars

   

    // Debug effect to log state changes
    useEffect(() => {
      // Button state tracking (silent)
    }, [isButtonActive, hasSignature]);

      const handleSignatureChange = (hasSignature: boolean) => {
      setHasSignature(hasSignature);
      // Also activate button when signature is detected
      if (hasSignature && !isButtonActive) {
        setIsButtonActive(true);
      }
    };

  const handleSigningStart = () => {
    setIsSigning(true);
    setIsButtonActive(true);
    // Add subtle pulse animation
    buttonScale.value = withSpring(1.02, { damping: 15, stiffness: 100 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, 200);
  };

  const handleSigningEnd = () => {
    setIsSigning(false);
    // Keep button active permanently after signing ends
    // Don't deactivate the button - let it stay active
  };

  const handleClearSignature = () => {
    if (signatureRef.current?.clearSignature) {
      signatureRef.current.clearSignature();
    }
    setHasSignature(false);
    setIsSigning(false);
    hapticService.trigger(HapticType.SELECTION, HapticIntensity.SUBTLE);
  };

        const handleCommit = () => {
    if (!hasSignature && !isButtonActive) {
      Alert.alert('Signature Required', 'Please sign your commitment before continuing.');
      return;
    }

   hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
   
   // Complete immediately without showing popup
   onComplete();
 };

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const listStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    transform: [{ translateY: listTranslateY.value }],
  }));

  const signatureStyle = useAnimatedStyle(() => ({
    opacity: signatureOpacity.value,
    transform: [{ translateY: signatureTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const commitments = [
    "Prioritizing my health and confidence.",
    "Being mindful of my triggers.",
    "Letting go of my old habits.",
    "Becoming the person I want to be.",
  ];

  return (
    // Full-screen modal overlay to completely block navigation
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      {/* Complete gesture lock - prevents ALL navigation */}
      <View 
        style={styles.completeGestureLock}
        {...gestureBlockingPanResponder.panHandlers}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        pointerEvents="box-none"
        collapsable={false}
      >
        <View 
          style={styles.container}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          pointerEvents="box-none"
          collapsable={false}
        >
          {/* Dark Starry Background */}
          <LinearGradient
            colors={['#000000', '#050505', '#0A0A0A', '#0F0F0F', '#1A1A2E']}
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
           <View 
             style={styles.content}
             onTouchStart={(e) => {
               e.stopPropagation();
               e.preventDefault();
             }}
             onTouchMove={(e) => {
               e.stopPropagation();
               e.preventDefault();
             }}
             onTouchEnd={(e) => {
               e.stopPropagation();
               e.preventDefault();
             }}
           >
            {/* Main Headline */}
            <Animated.View style={[styles.headlineContainer, titleStyle]}>
              <Text style={styles.headline}>
                Let's commit.
              </Text>
            </Animated.View>

            {/* Sub-headline */}
            <Animated.View style={[styles.subheadlineContainer, subtitleStyle]}>
              <Text style={styles.subheadline}>
                From this day onwards, I commit to:
              </Text>
            </Animated.View>

            {/* Commitments List */}
            <Animated.View style={[styles.commitmentsList, listStyle]}>
              {commitments.map((commitment, index) => (
                <View key={index} style={styles.commitmentItem}>
                  <View style={styles.commitmentCheckmarkWrapper}>
                    <View style={[styles.commitmentCheckmark, { backgroundColor: '#3B82F6' }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  </View>
                  <Text style={styles.commitmentText}>
                    {commitment}
                  </Text>
                </View>
              ))}
            </Animated.View>

                                     {/* Signature Pad */}
              <Animated.View 
                style={[styles.signatureContainer, signatureStyle]}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
              <Text style={styles.signatureLabel}>Sign your commitment:</Text>
              <Text style={styles.signatureInstruction}>
                {isSigning ? 'Signing...' : 'Draw your signature below'}
              </Text>
              
                         <View 
                style={styles.signaturePad}
              >
                <View 
                  style={styles.signaturePadWrapper} 
                  pointerEvents="box-none"
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchMove={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <ProfessionalSignaturePad
                    ref={signatureRef}
                    style={[
                      styles.signatureCanvas,
                      isSigning && styles.signatureCanvasActive
                    ]}
                    onSignatureChange={handleSignatureChange}
                    onBegin={handleSigningStart}
                    onEnd={handleSigningEnd}
                    strokeWidth={3}
                    strokeColor="#3B82F6"
                    backgroundColor="rgba(255, 255, 255, 0.05)"
                  />
                </View>
               
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSignature}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.signatureNote}>
                Your signature is not recorded
              </Text>
            </Animated.View>

            {/* Commit Button */}
            <Animated.View style={[styles.buttonContainer, buttonStyle]}>
              <Animated.View style={animatedButtonStyle}>
                             <TouchableOpacity
                   style={[
                     styles.commitButton,
                     !hasSignature && !isButtonActive && styles.commitButtonDisabled,
                     isButtonActive && styles.commitButtonSigning
                   ]}
                   onPress={handleCommit}
                   activeOpacity={0.8}
                   disabled={false}
                 >
                             <LinearGradient
                   colors={
                     isButtonActive || hasSignature
                       ? ['#3B82F6', '#2563EB', '#1D4ED8'] 
                       : ['#6B7280', '#4B5563']
                   }
                   style={styles.commitButtonGradient}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 0, y: 1 }}
                 >
                  <Text style={styles.commitButtonText}>I commit to myself</Text>
                </LinearGradient>
              </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  completeGestureLock: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    zIndex: 999,
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
  headlineContainer: {
    marginBottom: 20,
    maxWidth: width * 0.9,
  },
  headline: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subheadlineContainer: {
    marginBottom: 40,
    maxWidth: width * 0.9,
  },
  subheadline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0,0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  commitmentsList: {
    width: '100%',
    marginBottom: 40,
  },
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  commitmentCheckmarkWrapper: {
    marginRight: 16,
    marginTop: 2,
  },
  commitmentCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  commitmentText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  signatureContainer: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
    // Prevent gesture conflicts
    zIndex: 9999,
  },
  signatureLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  signatureInstruction: {
    fontSize: 14,
    fontWeight: '400',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  signaturePad: {
    width: width * 0.85,
    height: 140, // Increased height for better signing experience
    marginBottom: 12,
    position: 'relative',
    // Prevent gesture conflicts
    zIndex: 1000,
  },
  signaturePadWrapper: {
    flex: 1,
    // Additional gesture isolation
    zIndex: 1001,
  },
  signatureCanvas: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signatureCanvasActive: {
    borderColor: '#60A5FA',
    shadowColor: '#60A5FA',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signatureNote: {
    fontSize: 14,
    fontWeight: '400',
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  commitButton: {
    width: width * 0.85,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  commitButtonDisabled: {
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  commitButtonSigning: {
    shadowColor: '#3B82F6',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
    transform: [{ scale: 1.02 }],
  },
  commitButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commitButtonText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CommitmentScreen;
