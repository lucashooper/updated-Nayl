import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import MilestoneCheckmark from './MilestoneCheckmark';

const { width, height } = Dimensions.get('window');

interface KeyMilestonesScreenProps {
  onContinue: () => void;
}

const KeyMilestonesScreen: React.FC<KeyMilestonesScreenProps> = ({ onContinue }) => {
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
  
  const graphOpacity = useSharedValue(0);
  const graphTranslateY = useSharedValue(30);
  
  const lineProgress = useSharedValue(0);
  
  const milestone1Opacity = useSharedValue(0);
  const milestone1Scale = useSharedValue(0);
  
  const milestone2Opacity = useSharedValue(0);
  const milestone2Scale = useSharedValue(0);
  
  const milestone3Opacity = useSharedValue(0);
  const milestone3Scale = useSharedValue(0);
  
  const listOpacity = useSharedValue(0);
  const listTranslateY = useSharedValue(30);
  
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  // Graph dimensions and data
  const graphWidth = width * 0.8;
  const graphHeight = 200;
  const graphPadding = 40;
  
  // Define the improvement curve points
  const curvePoints = [
    { x: 0, y: graphHeight - graphPadding }, // Start at bottom
    { x: graphWidth * 0.2, y: graphHeight - graphPadding - 60 }, // Early improvement
    { x: graphWidth * 0.4, y: graphHeight - graphPadding - 100 }, // 30 days
    { x: graphWidth * 0.6, y: graphHeight - graphPadding - 120 }, // Continued progress
    { x: graphWidth * 0.8, y: graphHeight - graphPadding - 140 }, // 90 days
    { x: graphWidth, y: graphHeight - graphPadding - 150 }, // Final improvement
  ];

  // Create SVG path for the improvement curve
  const createCurvePath = () => {
    if (curvePoints.length < 2) return '';
    
    let path = `M ${curvePoints[0].x} ${curvePoints[0].y}`;
    
    for (let i = 1; i < curvePoints.length; i++) {
      const prev = curvePoints[i - 1];
      const curr = curvePoints[i];
      
      // Create smooth curve using quadratic bezier
      const controlX = prev.x + (curr.x - prev.x) * 0.5;
      const controlY = prev.y;
      
      path += ` Q ${controlX} ${controlY} ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  // Get animated path based on progress
  const getAnimatedPath = () => {
    // Remove shared value access during render to fix Reanimated warning
    return createCurvePath();
  };

  useEffect(() => {
    // Start the animation sequence
    const startAnimations = () => {
      // 1. Title animation (500ms, no delay)
      titleOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      titleTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

      // 2. Graph container animation (300ms delay)
      setTimeout(() => {
        graphOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        graphTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
        
        // Start line drawing animation
        lineProgress.value = withTiming(1, { 
          duration: 2000, 
          easing: Easing.out(Easing.cubic) 
        });
      }, 300);

      // 3. Milestone markers animation (as line progresses)
      setTimeout(() => {
        // First milestone (7 days) - appears when line reaches ~20%
        milestone1Opacity.value = withSpring(1, { damping: 15, stiffness: 100 });
        milestone1Scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      }, 800);

      setTimeout(() => {
        // Second milestone (30 days) - appears when line reaches ~40%
        milestone2Opacity.value = withSpring(1, { damping: 15, stiffness: 100 });
        milestone2Scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      }, 1200);

      setTimeout(() => {
        // Third milestone (90 days) - appears when line reaches ~80%
        milestone3Opacity.value = withSpring(1, { damping: 15, stiffness: 100 });
        milestone3Scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      }, 1800);

      // Add subtle pulse animation to milestone markers
      setTimeout(() => {
        milestone1Scale.value = withSpring(1.05, { damping: 15, stiffness: 100 });
        setTimeout(() => {
          milestone1Scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        }, 200);
      }, 1000);

      setTimeout(() => {
        milestone2Scale.value = withSpring(1.05, { damping: 15, stiffness: 100 });
        setTimeout(() => {
          milestone2Scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        }, 200);
      }, 1400);

      setTimeout(() => {
        milestone3Scale.value = withSpring(1.05, { damping: 15, stiffness: 100 });
        setTimeout(() => {
          milestone3Scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        }, 200);
      }, 2000);

      // 4. List animation (after line completes)
      setTimeout(() => {
        listOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        listTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 2200);

      // 5. Button animation (after list)
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        buttonTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 2800);
    };

    // Start animations after a brief delay
    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, []);

  // Starfield is now static with subtle blue/purple gradient stars

  const handleContinue = () => {
    hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
    onContinue();
  };

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const graphStyle = useAnimatedStyle(() => ({
    opacity: graphOpacity.value,
    transform: [{ translateY: graphTranslateY.value }],
  }));

  const listStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    transform: [{ translateY: listTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const milestone1Style = useAnimatedStyle(() => ({
    opacity: milestone1Opacity.value,
    transform: [{ scale: milestone1Scale.value }],
  }));

  const milestone2Style = useAnimatedStyle(() => ({
    opacity: milestone2Opacity.value,
    transform: [{ scale: milestone2Scale.value }],
  }));

  const milestone3Style = useAnimatedStyle(() => ({
    opacity: milestone3Opacity.value,
    transform: [{ scale: milestone3Scale.value }],
  }));

  // Animated path style that doesn't access shared values during render
  const animatedPathStyle = useAnimatedStyle(() => {
    const progress = lineProgress.value;
    if (progress <= 0) return { opacity: 0 };
    
    return { opacity: 0.9 };
  });

  return (
    <View style={styles.container}>
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
       <View style={styles.content}>
         {/* Main Heading */}
         <Animated.View style={[styles.headingContainer, titleStyle]}>
           <Text style={styles.heading}>Your journey to healthier nails</Text>
         </Animated.View>

         {/* Animated Graph */}
        <Animated.View style={[styles.graphContainer, graphStyle]}>
          <Svg width={graphWidth} height={graphHeight} style={styles.graph}>
            {/* Enhanced Grid lines */}
            <G stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1">
              {/* Horizontal grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <Path
                  key={`h-grid-${i}`}
                  d={`M 0 ${graphHeight - graphPadding - (i * 30)} L ${graphWidth} ${graphHeight - graphPadding - (i * 30)}`}
                />
              ))}
              {/* Vertical grid lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Path
                  key={`v-grid-${i}`}
                  d={`M ${(graphWidth / 5) * i} ${graphHeight - graphPadding} L ${(graphWidth / 5) * i} ${graphHeight - graphPadding - 120}`}
                />
              ))}
            </G>
            
            {/* Enhanced Improvement curve with premium styling */}
            {/* Glow effect */}
            <Path
              d={createCurvePath()}
              stroke="#3B82F6"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            {/* Main curve */}
            <Path
              d={createCurvePath()}
              stroke="#3B82F6"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={1}
            />
            
            {/* Enhanced Milestone markers with premium styling - labels removed for cleaner chart */}
            <Animated.View style={[styles.milestoneContainer, milestone1Style]}>
              <View style={[styles.milestoneMarker, { left: graphWidth * 0.2 - 16, top: graphHeight - graphPadding - 60 - 16 }]}>
                <MilestoneCheckmark color="#F97316" size={32} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.milestoneContainer, milestone2Style]}>
              <View style={[styles.milestoneMarker, { left: graphWidth * 0.4 - 16, top: graphHeight - graphPadding - 100 - 16 }]}>
                <MilestoneCheckmark color="#10B981" size={32} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.milestoneContainer, milestone3Style]}>
              <View style={[styles.milestoneMarker, { left: graphWidth * 0.8 - 16, top: graphHeight - graphPadding - 140 - 16 }]}>
                <MilestoneCheckmark color="#3B82F6" size={32} />
              </View>
            </Animated.View>
          </Svg>
        </Animated.View>

        {/* Milestones List */}
        <Animated.View style={[styles.milestonesList, listStyle]}>
          <Text style={styles.listTitle}>The key milestones are</Text>
          
          <View style={styles.milestoneItem}>
            <View style={styles.milestoneCheckmarkWrapper}>
              <MilestoneCheckmark color="#F97316" size={32} />
            </View>
            <Text style={styles.milestoneText}>
              Noticeably healthier nails and skin within the first 1-2 weeks.
            </Text>
          </View>

          <View style={styles.milestoneItem}>
            <View style={styles.milestoneCheckmarkWrapper}>
              <MilestoneCheckmark color="#10B981" size={32} />
            </View>
            <Text style={styles.milestoneText}>
              Significant reduction in anxiety and stress-related habits after 30 days.
            </Text>
          </View>

          <View style={styles.milestoneItem}>
            <View style={styles.milestoneCheckmarkWrapper}>
              <MilestoneCheckmark color="#3B82F6" size={32} />
            </View>
            <Text style={styles.milestoneText}>
              Increased confidence in social and professional situations within 90 days.
            </Text>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB', '#1D4ED8']}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    paddingTop: 60, // Reduced since we removed the headline
    paddingBottom: 40, // Add bottom padding to ensure button is fully visible
  },
  headingContainer: {
    marginBottom: 40,
    maxWidth: width * 0.9,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700', // Softer weight
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38, // Improved line spacing
    letterSpacing: 0.3,
    paddingHorizontal: 16,
  },
  graphContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  graph: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  milestoneContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  milestoneMarker: {
    position: 'absolute',
    zIndex: 10,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  milestoneLabel: {
    position: 'absolute',
    top: 35, // Increased from 20 to 35 to prevent overlap with chart ticks
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    width: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  milestonesList: {
    width: '100%',
    marginBottom: 40, // Reduced from 60 to 40 for better spacing with button
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600', // Softer weight for hierarchy
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.3,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  milestoneCheckmarkWrapper: {
    marginRight: 16,
    marginTop: 2,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  milestoneText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500', // Lighter weight
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, // Add bottom margin to ensure button is not cut off
  },
  continueButton: {
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
  continueButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
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

export default KeyMilestonesScreen;
