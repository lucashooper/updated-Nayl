import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  Easing,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { Achievement } from '../context/AchievementContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import { ACHIEVEMENT_TYPOGRAPHY, ACHIEVEMENT_SPACING, ACHIEVEMENT_SHADOWS, ACHIEVEMENT_COLORS } from '../constants/achievementTypography';

const { width, height } = Dimensions.get('window');

interface AchievementOverlayProps {
  achievement: Achievement;
  isVisible: boolean;
  onHide: () => void;
}

const AchievementOverlay: React.FC<AchievementOverlayProps> = ({
  achievement,
  isVisible,
  onHide,
}) => {
  const themeResult = useTheme();
  const colors = themeResult?.colors;
  
  // Animation values - simplified for instant impact
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Enhanced confetti animation values with more particles and varied shapes
  const confettiAnimations = useRef(
    Array.from({ length: 35 }, (_, index) => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
      // Arcane-style particle colors - warm, radiant, exciting
      color: ACHIEVEMENT_COLORS.arcaneParticles[index % ACHIEVEMENT_COLORS.arcaneParticles.length],
      // Much more varied sizes for natural confetti feel
      size: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 4, 6, 8, 5, 7, 9, 3, 5, 7, 9, 4, 6, 8, 10, 3, 5, 7, 9, 4, 6, 8, 5, 7, 9, 6][index % 35],
      // More organic shapes that look like real confetti
      shape: ['circle', 'oval', 'teardrop', 'star', 'diamond', 'circle', 'oval', 'teardrop', 'star', 'diamond', 'circle', 'oval', 'teardrop', 'star', 'diamond', 'circle', 'oval', 'teardrop', 'star', 'diamond', 'circle', 'oval', 'teardrop', 'star', 'diamond', 'circle', 'oval', 'teardrop', 'star', 'diamond', 'circle', 'oval', 'teardrop', 'star', 'diamond'][index % 5],
      // Add subtle shadow intensity for depth
      shadowIntensity: [0.08, 0.12, 0.15, 0.1, 0.14, 0.11, 0.13, 0.09, 0.16, 0.12, 0.14, 0.1, 0.13, 0.11, 0.15, 0.09, 0.12, 0.14, 0.1, 0.13, 0.11, 0.15, 0.09, 0.12, 0.14, 0.1, 0.13, 0.11, 0.15, 0.09, 0.12, 0.14, 0.1, 0.13, 0.11][index % 35],
      // Add slight color variations for more natural look
      colorVariation: [0.95, 1.0, 0.9, 1.05, 0.98, 1.02, 0.93, 1.07, 0.96, 1.03, 0.94, 1.01, 0.97, 1.04, 0.92, 1.06, 0.95, 1.0, 0.9, 1.05, 0.98, 1.02, 0.93, 1.07, 0.96, 1.03, 0.94, 1.01, 0.97, 1.04, 0.92, 1.06, 0.95, 1.0, 0.9][index % 35],
    }))
  ).current;
  
  // Animation control refs
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimating = useRef(false);

  // Use useCallback to prevent Reanimated warnings
  const overlayStyle = useCallback(() => [
    styles.overlay,
    { opacity: backgroundOpacityAnim }
  ], [backgroundOpacityAnim]);

  const containerStyle = useCallback(() => [
    styles.overlayContainer,
    { opacity: opacityAnim }
  ], [opacityAnim]);

  const cardStyle = useCallback(() => [
    styles.achievementCard,
    { 
      opacity: opacityAnim,
      transform: [{ scale: scaleAnim }]
    }
  ], [opacityAnim, scaleAnim]);

  useEffect(() => {
    if (isVisible) {
      // Clear any existing timeouts
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
        confettiTimeoutRef.current = null;
      }
      
      // Stop any running animations
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      // Trigger haptic feedback for achievement unlock
      hapticService.trigger(HapticType.ACHIEVEMENT, HapticIntensity.PROMINENT);
      
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      backgroundOpacityAnim.setValue(0);
      
      // Fast, impactful entrance animation
      const sequence = Animated.parallel([
        // Background fade in
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Card scale and fade in together
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]);
      
      // Store reference and start animation
      animationRef.current = sequence;
      sequence.start(() => {
        // Trigger confetti burst with a subtle delay for premium feel
        confettiTimeoutRef.current = setTimeout(() => {
          triggerConfettiBurst();
        }, 150); // Reduced delay for better responsiveness
      });
      
    } else if (!isVisible) {
      // Exit animation - everything fades out together
      
      // Clear confetti timeout
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
        confettiTimeoutRef.current = null;
      }
      
      // Stop any running animations
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      const exitAnimation = Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);
      
      animationRef.current = exitAnimation;
      exitAnimation.start();
    }
  }, [isVisible, scaleAnim, opacityAnim, backgroundOpacityAnim]);
   
  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (animationRef.current) {
        animationRef.current.stop();
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  if (!colors || !isVisible) return null;

  const triggerConfettiBurst = () => {
    // Only trigger if overlay is still visible
    if (!isVisible) return;
    
    // Reset confetti positions
    confettiAnimations.forEach((confetti: any) => {
      confetti.translateX.setValue(0);
      confetti.translateY.setValue(0);
      confetti.scale.setValue(0);
      confetti.opacity.setValue(1);
      confetti.rotation.setValue(0);
    });

    // Create enhanced confetti burst animations with more power
    const confettiBurstAnimations = confettiAnimations.map((confetti: any, index: number) => {
      const angle = (index / confettiAnimations.length) * 2 * Math.PI;
      // More natural confetti-like distance variation
      const baseDistance = 80 + Math.random() * 60;
      const distance = baseDistance + (index % 4) * 15; // Group particles by distance
      const translateX = Math.cos(angle) * distance + (Math.random() - 0.5) * 20; // Add randomness
      const translateY = Math.sin(angle) * distance - 20 + (Math.random() - 0.5) * 30; // More natural spread
      
      // Vary animation timing for more organic confetti feel
      const baseDuration = 800 + Math.random() * 300;
      const scaleDuration = 300 + Math.random() * 200;
      
      // Add slight wobble for more natural movement
      const wobbleX = Math.sin(index * 0.5) * 10;
      const wobbleY = Math.cos(index * 0.3) * 8;
      
      return Animated.parallel([
        // Smoother, more natural scale animation
        Animated.spring(confetti.scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120, // Even smoother for confetti feel
          friction: 10, // More friction for natural movement
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }),
        // More natural confetti movement with slight wobble
        Animated.timing(confetti.translateX, {
          toValue: translateX + wobbleX,
          duration: baseDuration,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad), // More natural for confetti
        }),
        Animated.timing(confetti.translateY, {
          toValue: translateY + wobbleY,
          duration: baseDuration,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad), // More natural for confetti
        }),
        // More natural rotation with varied speeds
        Animated.timing(confetti.rotation, {
          toValue: (Math.random() * 4 - 2) * (Math.PI / 180), // Smaller rotation for natural feel
          duration: baseDuration + Math.random() * 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad), // Natural rotation deceleration
        }),
        // Smoother opacity transitions for confetti
        Animated.sequence([
          Animated.timing(confetti.opacity, {
            toValue: 0.85, // Slightly more transparent for confetti feel
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(confetti.opacity, {
            toValue: 0.85, // Hold at 85% opacity
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(confetti.opacity, {
            toValue: 0,
            duration: baseDuration - 350,
            useNativeDriver: true,
            easing: Easing.in(Easing.quad),
          }),
        ]),
      ]);
    });

    // Start all confetti animations
    Animated.parallel(confettiBurstAnimations).start();
  };

  const handleClose = () => {
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
    onHide();
  };

  return (
    <Animated.View style={overlayStyle()}>
      {/* Ultra-premium glassmorphic background with ARCANE-STYLE gradients */}
      <BlurView intensity={80} style={styles.blurBackground}>
        {/* Primary Arcane Gradient - Warm, radiant, dramatic with purple/blue tinges */}
        <LinearGradient
          colors={ACHIEVEMENT_COLORS.arcanePrimary}
          start={{ x: 0.5, y: 0 }}  // Center top
          end={{ x: 0.5, y: 1 }}    // Center bottom
          locations={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 1]}
          style={styles.gradientBackground}
        />
        
        {/* Secondary Arcane Gradient - Cooler, atmospheric with radiant blues */}
        <LinearGradient
          colors={ACHIEVEMENT_COLORS.arcaneSecondary}
          start={{ x: 0, y: 0.5 }}  // Left center
          end={{ x: 1, y: 0.5 }}    // Right center
          locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          style={styles.accentGradient}
        />
        
        {/* Atmospheric Arcane Gradient - Smoky, ethereal with purple/blue mist */}
        <LinearGradient
          colors={ACHIEVEMENT_COLORS.arcaneAtmospheric}
          start={{ x: 0.5, y: 0.3 }}  // Center upper
          end={{ x: 0.5, y: 0.7 }}    // Center lower
          locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          style={styles.atmosphericGradient}
        />
        
        {/* Enhanced Dynamic Light Beam Effect - Like Arcane's dramatic lighting with purple/blue tinges */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.6)',  // Bright center beam
            'rgba(255, 220, 255, 0.4)',  // Warm glow with purple tinge
            'rgba(220, 200, 255, 0.2)',  // Golden fade with blue tinge
            'transparent',                 // Fade out
          ]}
          start={{ x: 0.5, y: 0 }}       // Center top
          end={{ x: 0.5, y: 0.6 }}       // Center middle
          locations={[0, 0.3, 0.7, 1]}
          style={styles.lightBeamGradient}
        />
      </BlurView>

      <TouchableOpacity
        style={styles.overlayTouchable}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View style={containerStyle()}>
          {/* Premium achievement card with enhanced glassmorphism */}
          <Animated.View style={cardStyle()}>
            {/* Achievement icon - BOLD and CENTERED with ENHANCED ARCANE GLOW */}
            <View style={styles.achievementIconContainer}>
              {achievement.iconSource ? (
                <View style={styles.iconGlowContainer}>
                  <Image
                    source={achievement.iconSource}
                    style={styles.achievementIcon}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.emojiIconContainer}>
                  <Text style={styles.emojiIcon}>
                    {achievement.icon}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Achievement header with centered title/day count */}
            <View style={styles.achievementHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.achievementTitle}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDayCount}>
                  {achievement.maxProgress}/{achievement.maxProgress} days
                </Text>
              </View>
            </View>
            
            {/* Achievement description with premium typography */}
            <View style={styles.textContainer}>
              <Text style={[styles.achievementDescription, { color: colors.primaryText }]}>
                {achievement.description}
              </Text>
            </View>
            
            {/* Confetti particles with enhanced shadows */}
            {confettiAnimations.map((confetti: any, index: number) => {
              // Special styling for different shapes
              const shapeStyle = confetti.shape === 'star' ? {
                backgroundColor: 'transparent',
                borderLeftWidth: confetti.size / 2,
                borderRightWidth: confetti.size / 2,
                borderBottomWidth: confetti.size,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: confetti.color,
                width: 0,
                height: 0,
              } : confetti.shape === 'diamond' ? {
                backgroundColor: 'transparent',
                borderLeftWidth: confetti.size / 2,
                borderRightWidth: confetti.size / 2,
                borderTopWidth: confetti.size / 2,
                borderBottomWidth: confetti.size / 2,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: confetti.color,
                borderBottomColor: confetti.color,
                width: 0,
                height: 0,
              } : {};
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.confettiParticle,
                    {
                      transform: [
                        { translateX: confetti.translateX },
                        { translateY: confetti.translateY },
                        { scale: confetti.scale },
                        { rotate: confetti.rotation.interpolate({
                          inputRange: [-Math.PI/90, Math.PI/90],
                          outputRange: ['-2deg', '2deg']
                        }) }
                      ],
                      opacity: confetti.opacity,
                      backgroundColor: confetti.color,
                      width: confetti.size,
                      height: confetti.size,
                      // Handle different organic shapes
                      borderRadius: confetti.shape === 'circle' ? confetti.size / 2 : 
                                  confetti.shape === 'oval' ? confetti.size / 3 : 
                                  confetti.shape === 'teardrop' ? confetti.size / 4 : 
                                  confetti.shape === 'star' ? 0 : 
                                  confetti.shape === 'diamond' ? 0 : 2,
                      // Enhanced shadows for premium depth
                      shadowColor: confetti.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: confetti.shadowIntensity * 1.5,
                      shadowRadius: 3,
                      elevation: 3,
                    },
                    shapeStyle, // Apply special shape styling
                  ]}
                />
              );
            })}

            {/* Action buttons with enhanced styling */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#007AFF', '#0056CC', '#004499']}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>
                    Continue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  atmosphericGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lightBeamGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ACHIEVEMENT_SPACING.containerPadding,
    // Better horizontal spacing for overall balance
  },
  achievementCard: {
    width: width,
    height: height,
    backgroundColor: ACHIEVEMENT_COLORS.cardBackground,
    borderRadius: 32,
    paddingHorizontal: ACHIEVEMENT_SPACING.containerPadding,
    paddingTop: 24, // Reduced from default to bring header down
    paddingBottom: ACHIEVEMENT_SPACING.containerPadding,
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced glassmorphism with borders
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: ACHIEVEMENT_COLORS.primaryBorder,
    borderRightColor: ACHIEVEMENT_COLORS.primaryBorder,
    // Premium shadows for depth
    ...ACHIEVEMENT_SHADOWS.card,
    zIndex: 10,
  },
  achievementIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 15,
    marginVertical: ACHIEVEMENT_SPACING.iconMargin, // Reduced from sectionGap for tighter spacing
    // Better vertical spacing for visual balance
  },
  iconGlowContainer: {
    // Minimal container for achievement icons - completely transparent
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  emojiIconContainer: {
    // Minimal container for emoji icons - completely transparent
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  achievementIcon: {
    width: 200, // Increased from 180 for slightly bigger effect
    height: 200,
    backgroundColor: 'transparent',
    // NO circular styling - let the icon shine directly
    borderWidth: 0,
    borderRadius: 0,
    // No shadow - completely floating
    shadowOpacity: 0,
    elevation: 0,
    zIndex: 10,
  },
  emojiIcon: {
    fontSize: 160, // Increased from 140 for slightly bigger effect
    textAlign: 'center',
    lineHeight: 200, // Adjusted to match bigger container
    // Enhanced text shadow for emoji icons
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    fontWeight: '900',
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
  confettiParticle: {
    position: 'absolute',
    zIndex: 20,
    // Enhanced shadows for premium depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    // Enhanced border for better definition
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  achievementHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Center the main content
    marginBottom: ACHIEVEMENT_SPACING.titleMargin,
    // Better spacing and alignment for centered layout
    paddingHorizontal: ACHIEVEMENT_SPACING.textContainerPadding,
    gap: ACHIEVEMENT_SPACING.elementGap,
    // Better balance for centered title and trophy below
    position: 'relative', // For positioning of trophy
  },
  trophyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ACHIEVEMENT_SPACING.iconMargin,
    // Better spacing for visual hierarchy with new header layout
  },
  trophyIconWrapper: {
    // Enhanced wrapper for trophy icon with shadows
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  trophyIconTop: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: 'center',
    backgroundColor: ACHIEVEMENT_COLORS.textContainerBackground,
    borderRadius: 20,
    padding: ACHIEVEMENT_SPACING.textContainerPadding,
    marginHorizontal: ACHIEVEMENT_SPACING.textContainerPadding,
    marginVertical: ACHIEVEMENT_SPACING.descriptionMargin, // Reduced for tighter spacing
    // Enhanced glassmorphism with subtle borders
    borderWidth: 1,
    borderColor: ACHIEVEMENT_COLORS.textContainerBorder,
    // Subtle shadows for text container
    ...ACHIEVEMENT_SHADOWS.textContainer,
  },
  achievementTitle: {
    ...ACHIEVEMENT_TYPOGRAPHY.heroTitle,
    fontSize: 32, // Slightly larger for better hierarchy
    lineHeight: 36, // Adjusted line height to match larger font
    letterSpacing: 1.2, // Increased letter spacing for premium feel
    // Enhanced text shadows for depth
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    color: '#FFFFFF',
    fontWeight: '800', // Slightly bolder for premium feel
  },
  achievementDayCount: {
    ...ACHIEVEMENT_TYPOGRAPHY.subtitle,
    fontSize: 18, // Larger font for better readability
    lineHeight: 22, // Adjusted line height
    letterSpacing: 0.8, // Increased letter spacing for premium feel
    color: ACHIEVEMENT_COLORS.arcaneGlow.primary, // Highlight color for day count
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontWeight: '600', // Medium weight for good readability
    marginTop: 4, // Small spacing from title
  },
  achievementDescription: {
    ...ACHIEVEMENT_TYPOGRAPHY.subtitle,
    fontSize: 18, // Reduced from 22 for more subtle effect
    lineHeight: 26, // Adjusted line height to match smaller font
    letterSpacing: 0.2, // Reduced letter spacing for smaller text
    // Enhanced text shadows
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    color: '#F8FAFC',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ACHIEVEMENT_SPACING.buttonMargin,
    // Enhanced container styling with better spacing
    paddingHorizontal: ACHIEVEMENT_SPACING.textContainerPadding,
    // Better horizontal spacing for centered button
    paddingVertical: ACHIEVEMENT_SPACING.compactGap,
  },
  continueButton: {
    // Enhanced button styling with premium shadows
    ...ACHIEVEMENT_SHADOWS.button,
    borderRadius: 28,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 28,
    // Enhanced button styling
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    ...ACHIEVEMENT_TYPOGRAPHY.buttonText,
  },

  headerTrophyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Position trophy below the title
    marginTop: ACHIEVEMENT_SPACING.compactGap,
    // Fixed width to maintain consistent positioning
    width: 60,
  },
  headerTrophyGlowContainer: {
    // Simple container for trophy icon - no glow gradients
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTrophyIcon: {
    width: 40, // Reduced from 60 for more subtle effect
    height: 40,
    backgroundColor: 'transparent',
    // NO circular styling - let the trophy shine directly
    borderWidth: 0,
    borderRadius: 0,
    // Enhanced Arcane-style shadows for subtle purple/blue glow
    shadowColor: ACHIEVEMENT_COLORS.arcaneGlow.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // Center the title and day count perfectly
    textAlign: 'center',
  },
});

export default AchievementOverlay;
