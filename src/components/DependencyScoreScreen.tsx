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
  Easing,
} from 'react-native-reanimated';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

const { width, height } = Dimensions.get('window');

interface DependencyScoreScreenProps {
  userScore: number; // User's dependency score (0-100)
  averageScore: number; // Average dependency score (0-100)
  onContinue: () => void;
}

const DependencyScoreScreen: React.FC<DependencyScoreScreenProps> = ({ 
  userScore, 
  averageScore, 
  onContinue 
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

  // Animation values for sequential entrance
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-30);
  
  const chartOpacity = useSharedValue(0);
  const chartTranslateY = useSharedValue(30);
  
  const disclaimerOpacity = useSharedValue(0);
  const disclaimerTranslateY = useSharedValue(20);
  
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  // Bar height animations
  const userBarHeight = useSharedValue(0);
  const averageBarHeight = useSharedValue(0);

  // Determine headline text based on user score vs average
  const getHeadlineText = () => {
    if (userScore > averageScore) {
      return `Your nail-biting frequency is higher than the average person.`;
    } else {
      return `Congratulations! You're already on the right track.`;
    }
  };

  // Get sub-headline for low scores
  const getSubHeadlineText = () => {
    if (userScore <= averageScore) {
      return `Your nail-biting frequency is lower than average. Nayl can help you build on this strong foundation and quit for good.`;
    }
    return null;
  };

  // Highlight the key word in the headline
  const renderHeadline = () => {
    const text = getHeadlineText();
    const words = text.split(' ');
    
    return (
      <Text style={styles.headline}>
        {words.map((word, index) => {
          if (word.toLowerCase().includes('higher') || word.toLowerCase().includes('lower') || word.toLowerCase().includes('average')) {
            return (
              <Text key={index} style={styles.highlightedWord}>
                {word}{' '}
              </Text>
            );
          }
          return word + ' ';
        })}
      </Text>
    );
  };

  // Determine bar colors based on score comparison
  const getUserBarColor = () => {
    return userScore > averageScore ? '#DC2626' : '#10B981'; // Red for high, green for low
  };

  const getUserBarShadowColor = () => {
    return userScore > averageScore ? '#DC2626' : '#10B981'; // Red for high, green for low
  };

  useEffect(() => {
    // Start the animation sequence
    const startAnimations = () => {
      // 1. Title animation (500ms, no delay)
      titleOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      titleTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

      // 2. Chart animation (300ms delay)
      setTimeout(() => {
        chartOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        chartTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
        
        // Animate bars growing from 0 to final height
        userBarHeight.value = withSpring(userScore, { 
          damping: 15, 
          stiffness: 100,
          mass: 0.8
        });
        
        averageBarHeight.value = withSpring(averageScore, { 
          damping: 15, 
          stiffness: 100,
          mass: 0.8
        });
      }, 300);

      // 3. Disclaimer animation (800ms delay)
      setTimeout(() => {
        disclaimerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        disclaimerTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
      }, 800);

      // 4. Button animation (1000ms delay)
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        buttonTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 1000);
    };

    // Start animations after a brief delay
    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, [userScore, averageScore]);

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

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ translateY: chartTranslateY.value }],
  }));

  const disclaimerStyle = useAnimatedStyle(() => ({
    opacity: disclaimerOpacity.value,
    transform: [{ translateY: disclaimerTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  // Bar height animated styles
  const userBarStyle = useAnimatedStyle(() => ({
    height: `${userBarHeight.value}%`,
  }));

  const averageBarStyle = useAnimatedStyle(() => ({
    height: `${averageBarHeight.value}%`,
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
        {/* Dynamic Headline */}
        <Animated.View style={[styles.headlineContainer, titleStyle]}>
          {renderHeadline()}
          
          {/* Conditional Sub-headline for Low Scores */}
          {getSubHeadlineText() && (
            <Animated.Text style={[styles.subHeadline, titleStyle]}>
              {getSubHeadlineText()}
            </Animated.Text>
          )}
        </Animated.View>

        {/* Bar Chart */}
        <Animated.View style={[styles.chartContainer, chartStyle]}>
          <View style={styles.chart}>
            {/* You Bar */}
            <View style={styles.barColumn}>
              <Text style={styles.percentageLabel}>{userScore}%</Text>
              <View style={styles.barContainer}>
                <Animated.View 
                  style={[
                    styles.bar, 
                    styles.userBar, 
                    userBarStyle,
                    {
                      backgroundColor: getUserBarColor(),
                      shadowColor: getUserBarShadowColor(),
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>You</Text>
            </View>

            {/* Average Bar */}
            <View style={styles.barColumn}>
              <Text style={styles.percentageLabel}>{averageScore}%</Text>
              <View style={styles.barContainer}>
                <Animated.View style={[styles.bar, styles.averageBar, averageBarStyle]} />
              </View>
              <Text style={styles.barLabel}>Average</Text>
            </View>
          </View>

          {/* Disclaimer */}
          <Animated.Text style={[styles.disclaimer, disclaimerStyle]}>
            This result is for informational purposes only and does not constitute a medical diagnosis.
          </Animated.Text>
        </Animated.View>

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
              <Text style={styles.continueButtonText}>What it means</Text>
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
    paddingTop: 60,
  },
  headlineContainer: {
    marginBottom: 60,
    maxWidth: width * 0.9,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  highlightedWord: {
    color: '#DC2626',
  },
  subHeadline: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    maxWidth: width * 0.9,
    letterSpacing: 0.2,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    marginBottom: 40,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  percentageLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  barContainer: {
    width: 60,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  userBar: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  averageBar: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  barLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: width * 0.8,
    fontStyle: 'italic',
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
});

export default DependencyScoreScreen;
