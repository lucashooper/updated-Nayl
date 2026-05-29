import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useStreak } from '../context/StreakContext';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { PerformanceMeasureView } from '@shopify/react-native-performance';
import AnimatedDigit from '../components/AnimatedDigit';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import AnimationService, { AnimationType } from '../services/animationService';
import PsychologicalFeedbackService, { FeedbackType, PsychologicalIntensity } from '../services/psychologicalFeedbackService';
import PanicModal from '../components/PanicModal';
import ResetModal from '../components/ResetModal';
import TipsModal from '../components/TipsModal';
import ColorPickerModal from '../components/ColorPickerModal';
import ProgressRing from '../components/ProgressRing';
import SwirlingOrb from '../components/SwirlingOrb';
import CircularActionButton from '../components/CircularActionButton';
import StreakOverlay from '../components/StreakOverlay';
import { usePanicModal } from '../context/PanicModalContext';
import { useTipsModal } from '../context/TipsModalContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import triggerService from '../services/triggerService';
import sessionService from '../services/sessionService';
import { typography, body, bodySmall, caption, buttonText, timerText, timerLabel } from '../constants/typography';
import ProfileHeader from '../components/ProfileHeader';
import { UserDashboard } from '../lib/supabase';


const { width, height } = Dimensions.get('window');



// Spacing constants (4-point grid system)
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};







interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const starfieldAnimation = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const claimablePulse = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  
  // Streak state from context
  const { elapsedSeconds, refreshStreakData, setElapsedSecondsDirectly } = useStreak();
  
  // Gamification state
  const [isDayCompleteAndUnclaimed, setIsDayCompleteAndUnclaimed] = useState(false);
  const [lastCompletedDay, setLastCompletedDay] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<boolean[]>(Array(7).fill(false));
  
  // NEW: Dashboard data state for performance optimization
  const [dashboardData, setDashboardData] = useState<UserDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Panic modal state from context
  const { isPanicModalVisible, setIsPanicModalVisible } = usePanicModal();
  
  // Tips modal state from context
  const { isTipsModalVisible, setIsTipsModalVisible } = useTipsModal();
  
  // Theme context
  const { colors } = useTheme();
  
  // Enhanced safety check for theme colors
  if (!colors || 
      typeof colors !== 'object' || 
      !colors.primaryBackground || 
      !colors.primaryText ||
      !colors.backgroundGradient) {
    console.warn('⚠️ HomeScreen: Theme colors not ready, using fallback');
    // Return a minimal loading state
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading home...</Text>
      </View>
    );
  }
  
  // Streak overlay state
  const [isStreakOverlayVisible, setIsStreakOverlayVisible] = useState(false);
  
  // Reset modal state
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  // Color picker modal state
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetAnimationSeconds, setResetAnimationSeconds] = useState(0);
  
  // Star positions for randomized animation
  const [starPositions, setStarPositions] = useState(() =>
    Array.from({ length: 60 }, () => ({
      x: Math.random() * width * 2,
      y: Math.random() * height,
      opacity: Math.random() * 0.6 + 0.15, // Slightly more visible: 0.15 to 0.75
      speed: Math.random() * 0.15 + 0.03,
      directionX: (Math.random() - 0.5) * 1.5,
      directionY: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.5 + 0.6, // Slightly larger stars for better visibility
    }))
  );

  // NEW: Load dashboard data using the optimized SessionService
  const loadDashboardData = useCallback(async () => {
    try {
      // LIGHTNING FAST: Show data instantly from memory
      const localDashboard = await sessionService.getLocalDashboard();
      setDashboardData(localDashboard);
      setConsecutiveDays(localDashboard.consecutive_days);
      // NEW LOGIC: Weekly check-ins now represent successful days (no nail-biting episodes)
      // Instead of just days logged in, this shows actual progress toward the goal
      const weeklyArray = Array(7).fill(false).map((_, index) => index < localDashboard.successful_days_this_week);
      setWeeklyCheckIns(weeklyArray);
      setIsInitialized(true);
      setIsLoading(false);
      
      // Background sync (non-blocking, user doesn't wait)
      setTimeout(async () => {
        try {
          const data = await sessionService.getDashboardData();
          if (data) {
            setDashboardData(data);
            setConsecutiveDays(data.consecutive_days);
            // NEW LOGIC: Weekly check-ins now represent successful days (no nail-biting episodes)
            const weeklyArray = Array(7).fill(false).map((_, index) => index < data.successful_days_this_week);
            setWeeklyCheckIns(weeklyArray);
          }
        } catch (dbError) {
          console.warn('Background sync failed, using local data:', dbError);
        }
      }, 50); // Minimal delay to not block UI
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Start session and mark check-in in background (non-blocking)
    sessionService.startSession().catch(error => {
      console.warn('Failed to start session:', error);
    });
    
    sessionService.markTodayCheckedIn().catch(error => {
      console.warn('Failed to mark today checked in:', error);
    });

    // NEW: Check if today should be marked as successful (no episodes)
    // This ensures the weekly check-ins reflect actual successful days
    const checkTodaySuccess = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        // Check if there were any episodes today
        const triggerHistory = await triggerService.getTriggerHistory();
        const todayTriggers = triggerHistory.filter(entry => 
          entry.timestamp.startsWith(today)
        );
        
        // If no episodes today, mark as successful
        if (todayTriggers.length === 0) {
          await sessionService.markTodayAsSuccessful();
        }
      } catch (error) {
        console.warn('Failed to check today\'s success:', error);
      }
    };
    
    checkTodaySuccess();

    // Load dashboard data immediately
    loadDashboardData();
  }, [loadDashboardData]);

  // NEW: Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refresh dashboard data when screen is focused
      if (isInitialized) {
        loadDashboardData();
      }
    }, [loadDashboardData, isInitialized])
  );

  // NEW: Manually mark today as successful and refresh weekly check-ins
  const markTodayAsSuccessful = async () => {
    try {
      await sessionService.markTodayAsSuccessful();
      // Refresh the dashboard data to update weekly check-ins
      await loadDashboardData();
      // Provide feedback to user
      hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
    } catch (error) {
      console.error('Failed to mark today as successful:', error);
      hapticService.trigger(HapticType.ERROR, HapticIntensity.NORMAL);
    }
  };

  // Format timer display - only show relevant units
  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}day${days > 1 ? 's' : ''} ${hours}hr ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}hr ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Format time for QUITTR-style display (days prominently, detailed time secondary)
  const formatTimeQuittrStyle = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return {
        primary: `${days} day${days > 1 ? 's' : ''}`,
        secondary: `${hours}hr ${minutes}m ${seconds}s`
      };
    } else if (hours > 0) {
      return {
        primary: `${hours}hr ${minutes}m ${seconds}s`,
        secondary: null
      };
    } else if (minutes > 0) {
      return {
        primary: `${minutes}m ${seconds}s`,
        secondary: null
      };
    } else {
      return {
        primary: `${seconds}s`,
        secondary: null
      };
    }
  };

  // Helpers for animated digit timer
  const splitTwoDigits = (value: number): [number, number] => [Math.floor(value / 10), value % 10];
  const splitDigits = (value: number): number[] => String(Math.max(0, value)).split('').map((d) => parseInt(d, 10));
  const getHms = (totalSeconds: number) => {
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  // Calculate progress percentage for current day (resets every 24 hours)
  const calculateProgress = (totalSeconds: number) => {
    const secondsIn24Hours = 24 * 60 * 60; // 24 hours in seconds
    const currentDaySeconds = totalSeconds % secondsIn24Hours; // Get seconds within current day
    const progress = (currentDaySeconds / secondsIn24Hours) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  // Calculate current day number (starts from Day 1)
  const calculateCurrentDay = (totalSeconds: number) => {
    const secondsIn24Hours = 24 * 60 * 60; // 24 hours in seconds
    const currentDay = Math.floor(totalSeconds / secondsIn24Hours) + 1; // +1 because we start from Day 1
    return currentDay;
  };

  // Calculate brain rewiring percentage (100% = 60 days)
  const calculateBrainRewiringPercentage = (totalSeconds: number) => {
    return sessionService.calculateBrainRewiringPercentage(totalSeconds);
  };

  // Optimized star animation function
  const updateStarPositions = useCallback(() => {
    setStarPositions(prevPositions => 
      prevPositions.map(star => {
        // Calculate new position with random direction
        const newX = star.x + (star.directionX * star.speed);
        const newY = star.y + (star.directionY * star.speed);
        
        // Wrap stars around screen boundaries
        let wrappedX = newX;
        let wrappedY = newY;
        
        if (newX < -50) wrappedX = width + 50;
        if (newX > width + 50) wrappedX = -50;
        if (newY < -50) wrappedY = height + 50;
        if (newY > height + 50) wrappedY = -50;
        
        return {
          ...star,
          x: wrappedX,
          y: wrappedY,
        };
      })
    );
  }, [width, height]);

  // Animations
  useEffect(() => {
    // Randomized starfield animation - optimized for performance
    const starfieldInterval = setInterval(updateStarPositions, 50); // Reduced from 20ms to 50ms for better performance

    // Breathing animation for orb
    const animateOrb = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: 1.05,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(orbScale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateOrb();

    return () => {
      clearInterval(starfieldInterval);
    };
  }, [updateStarPositions]);

  // Pulsing animation for claimable state
  useEffect(() => {
    if (isDayCompleteAndUnclaimed) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(claimablePulse, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(claimablePulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    } else {
      claimablePulse.setValue(1);
    }
  }, [isDayCompleteAndUnclaimed, claimablePulse]);

  // Goal completion feedback - check when elapsedSeconds changes
  const celebratedMilestones = React.useRef(new Set<string>());
  
  useEffect(() => {
    if (!isInitialized) return;
    
    // Only trigger haptics at specific milestone moments, not every second
    // Use refs to track which milestones we've already celebrated
    
    // Check for 1 hour milestone (only once)
    if (elapsedSeconds >= 3600 && !celebratedMilestones.current.has('1hour')) {
      celebratedMilestones.current.add('1hour');
      PsychologicalFeedbackService.provideAchievementFeedback(calculateProgress(elapsedSeconds), '1hour');
    }
    
    // Check for 1 day milestone (only once)
    if (elapsedSeconds >= 86400 && !celebratedMilestones.current.has('1day')) {
      celebratedMilestones.current.add('1day');
      PsychologicalFeedbackService.provideAchievementFeedback(calculateProgress(elapsedSeconds), '1day');
    }
    
    // Check for 1 week milestone (only once)
    if (elapsedSeconds >= 604800 && !celebratedMilestones.current.has('1week')) {
      celebratedMilestones.current.add('1week');
      PsychologicalFeedbackService.provideAchievementFeedback(calculateProgress(elapsedSeconds), '1week');
    }
    
    // Update database every 30 seconds to avoid too many requests
    if (elapsedSeconds % 30 === 0) {
      sessionService.updateSession(elapsedSeconds).catch(console.error);
    }
  }, [elapsedSeconds, isInitialized]);

  // Gamification: Check for 24-hour completion and set claimable state
  useEffect(() => {
    if (!isInitialized) return;
    
    const currentDay = calculateCurrentDay(elapsedSeconds);
    const currentDaySeconds = elapsedSeconds % (24 * 60 * 60);
    
    // Check if we've completed a full 24-hour period
    if (currentDaySeconds >= 24 * 60 * 60 && currentDay > lastCompletedDay) {
      // Automatically save the day as completed
      sessionService.markTodayCheckedIn().catch(console.error);
      
      // Set the claimable state
      setIsDayCompleteAndUnclaimed(true);
      setLastCompletedDay(currentDay);
      
      console.log('🎉 Day completed! Ready for claim.');
    }
    
    // Debug: For testing, enable claimable state after 10 seconds
    if (elapsedSeconds >= 10 && !isDayCompleteAndUnclaimed && lastCompletedDay === 0) {
      console.log('🧪 TEST MODE: Enabling claimable state for testing');
      setIsDayCompleteAndUnclaimed(true);
      setLastCompletedDay(1);
    }
  }, [elapsedSeconds, isInitialized, lastCompletedDay, isDayCompleteAndUnclaimed]);

  const currentDaySeconds = elapsedSeconds % (24 * 60 * 60); // Get seconds within current day
  const formattedTime = formatTime(elapsedSeconds); // Show total elapsed time instead of just current day
  const quittrStyleTime = formatTimeQuittrStyle(elapsedSeconds); // QUITTR-style formatting
  const currentDay = calculateCurrentDay(elapsedSeconds);

  // Reset function with psychological feedback
  const handleReset = async () => {
    await PsychologicalFeedbackService.provideFeedback({
      type: FeedbackType.RESET,
      intensity: PsychologicalIntensity.STRONG,
      context: 'reset_initiation',
      timeElapsed: elapsedSeconds,
    });
    setIsResetModalVisible(true);
  };

  const handleResetConfirm = async (trigger: string) => {
    try {
      // Store the trigger data using the service
      await triggerService.saveTrigger(trigger);
      
      // Single subtle haptic feedback
      hapticService.trigger(HapticType.MEDIUM_TAP, HapticIntensity.NORMAL);
      
      // Immediately reset UI to zero for instant feedback
      setElapsedSecondsDirectly(0);
      setIsResetting(false);
      setResetAnimationSeconds(0);
      setIsResetModalVisible(false);
      
      // Reset the session in the database in background
      await sessionService.resetSession(trigger);
      
      // Reload dashboard to reflect the reset
      await loadDashboardData();
    } catch (error) {
      console.error('Error resetting session:', error);
      // Still reset locally even if database fails
      setElapsedSecondsDirectly(0);
      setIsResetting(false);
      setResetAnimationSeconds(0);
      setIsResetModalVisible(false);
    }
  };

  // Panic button handler - shows overlay with enhanced vibration
  const handlePanicButton = async () => {
    try {
      // Dramatic panic button sequence with premium haptic patterns
      await hapticService.triggerPattern({
        type: HapticType.HEAVY_TAP,
        intensity: HapticIntensity.PROMINENT,
        repeat: 3,
        interval: 100,
      });
      
      setIsPanicModalVisible(true);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  const handleMeditate = () => {
    navigation.navigate('Meditation');
  };

  const handleTips = async () => {
    await PsychologicalFeedbackService.provideFeedback({
      type: FeedbackType.INFORMATION,
      intensity: PsychologicalIntensity.MODERATE,
      context: 'tips_access',
    });
    setIsTipsModalVisible(true);
  };

  const handleStreakOverlay = async () => {
    try {
      await hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
      setIsStreakOverlayVisible(true);
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  };

  const handleEditStreak = async () => {
    try {
      await hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
      navigation.navigate('EditStreak');
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  };

  // Handle claiming the completed day
  const handleClaimDay = async () => {
    if (!isDayCompleteAndUnclaimed) return;
    
    try {
      // Enhanced haptic feedback - multiple pulses for powerful feel
      await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.PROMINENT);
      
      // Additional haptic pulse for extra satisfaction
      setTimeout(async () => {
        await hapticService.trigger(HapticType.ACHIEVEMENT, HapticIntensity.PROMINENT);
      }, 100);
      
      // Reset the claimable state
      setIsDayCompleteAndUnclaimed(false);
      
      console.log('⚡ Day claimed!');
    } catch (error) {
      console.error('Error claiming day:', error);
    }
  };

  // Handle progress circle press for color picker
  const handleProgressCirclePress = () => {
    setIsColorPickerVisible(true);
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
  };


  return (
    <PerformanceMeasureView screenName="HomeScreen">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
        {/* Premium Background with Gradient */}
        <LinearGradient
          colors={colors.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.55, 1]}
          style={styles.backgroundContainer}
        >
          {/* Subtle starfield effect */}
          <View style={styles.starfield}>
            {starPositions.map((star, index) => (
              <View
                key={index}
                style={[
                  styles.star,
                  {
                    left: star.x,
                    top: star.y,
                    opacity: star.opacity, // Use full opacity for maximum visibility
                    width: star.size,
                    height: star.size,
                    borderRadius: star.size / 2,
                  }
                ]}
              />
            ))}
          </View>
        </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Test Onboarding Buttons - Remove these later */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: SPACING.md, marginTop: 20 }}>
          <TouchableOpacity 
            style={{
              backgroundColor: '#8A2BE2',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 12,
            }}
            onPress={() => navigation.navigate('OnboardingTest')}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🧪 Test Slide
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              backgroundColor: '#3B82F6',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 12,
            }}
            onPress={() => navigation.navigate('OnboardingFlow')}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
              🎯 Full Flow
            </Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
                          <ProfileHeader size="medium" navigation={navigation} showName={true} />
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.streakContainer}
              onPress={handleStreakOverlay}
              activeOpacity={0.7}
            >
              <Image 
                source={require('../../assets/new-flame-icon.webp')} 
                style={styles.flameIcon}
                resizeMode="contain"
              />
              <Text style={styles.streakText}>{consecutiveDays}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                // Navigate to Library tab, then to Achievements screen
                navigation.navigate('Library', {
                  screen: 'Achievements'
                });
              }}
              activeOpacity={0.7}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image 
                source={require('../../assets/trophy-icon.webp')} 
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Streak Tracker */}
        <View style={styles.weeklyTrackerContainer}>
          <View style={styles.weeklyTracker}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
              const isToday = index === new Date().getDay();
              const isPastDay = index < new Date().getDay();
              const isCompleted = weeklyCheckIns[index];
              
              return (
                <View key={`day-${index}`} style={styles.dayContainer}>
                  <View style={[
                    styles.dayCircle,
                    isToday && styles.todayCircle,
                    isCompleted && styles.completedCircle,
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color={COLORS.primaryAccent} />
                    ) : isPastDay && !isCompleted ? (
                      <Ionicons name="close" size={10} color="rgba(255, 255, 255, 0.6)" />
                    ) : isToday ? (
                      <View style={styles.todayIndicator} />
                    ) : null}
                  </View>
                  <Text style={[
                    styles.dayLabel,
                    isToday && styles.todayLabel
                  ]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>



        {/* Premium Circular Progress Indicator */}
        <TouchableOpacity 
          style={styles.orbContainer} 
          onPress={handleClaimDay}
          activeOpacity={isDayCompleteAndUnclaimed ? 0.8 : 1}
          disabled={!isDayCompleteAndUnclaimed}
        >
          <Animated.View style={[
            styles.orbGlowContainer, 
            { 
              transform: [
                { scale: isDayCompleteAndUnclaimed ? claimablePulse : orbScale }
              ] 
            },
            isDayCompleteAndUnclaimed && styles.claimableOrbGlow
          ]}>
            <View style={styles.orbWrapper}>
              <SwirlingOrb size={180}>
                <ProgressRing 
                  progress={isDayCompleteAndUnclaimed ? 100 : calculateProgress(elapsedSeconds)}
                  size={180}
                  strokeWidth={10}
                  color={isDayCompleteAndUnclaimed ? '#FFFFFF' : COLORS.primaryAccent}
                  backgroundColor={isDayCompleteAndUnclaimed ? "rgba(255, 255, 255, 0.3)" : "rgba(193, 255, 114, 0.2)"}
                  onPress={isDayCompleteAndUnclaimed ? undefined : handleProgressCirclePress}
                />
              </SwirlingOrb>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Claimable Indicator */}
        {isDayCompleteAndUnclaimed && (
          <Animated.View 
            style={[
              styles.claimableIndicatorContainer,
              {
                transform: [{ scale: claimablePulse }]
              }
            ]}
          >
            <Text style={styles.claimableIndicatorText}>
              🎉 Tap to claim your day!
            </Text>
          </Animated.View>
        )}

        {/* Descriptive Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>You've been nail-biting free for:</Text>
        </View>

        {/* Prominent Timer Component - QUITTR Style */}
        <TouchableOpacity 
          style={styles.prominentTimerContainer}
          onPress={handleStreakOverlay}
          activeOpacity={0.7}
        >
          <Text style={styles.prominentTimerText}>{quittrStyleTime.primary}</Text>
          
          {/* Secondary time display for days (QUITTR style) */}
          {quittrStyleTime.secondary && (
            <View style={styles.secondaryTimeContainer}>
              <View style={styles.secondaryTimeRow}>
                {quittrStyleTime.secondary.split('').map((ch, idx) => (
                  /\d/.test(ch) ? (
                    <AnimatedDigit key={`sd-${idx}`} digit={parseInt(ch, 10)} style={styles.secondaryTimeText} durationMs={140} slideDistance={12} />
                  ) : (
                    <Text key={`st-${idx}`} style={styles.secondaryTimeText}>{ch}</Text>
                  )
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <CircularActionButton
            icon="create-outline"
            label="Streak"
            onPress={handleEditStreak}
            size="small"
          />
          <CircularActionButton
            icon="bulb-outline"
            label="Tips"
            onPress={handleTips}
            size="small"
          />
          <CircularActionButton
            icon="heart-outline"
            label="Meditate"
            onPress={handleMeditate}
            size="small"
          />
          <CircularActionButton
            icon="refresh-outline"
            label="Reset"
            onPress={handleReset}
            size="small"
          />
        </View>

        {/* Spacer for dramatic separation */}
        <View style={styles.actionSpacer} />

        {/* Brain Rewiring Button - Premium Dark Blue Gradient */}
        <TouchableOpacity 
          style={[styles.brainRewiringButton, { marginTop: 32 }]} 
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgb(22, 27, 56)', 'rgb(14, 19, 41)']}
            style={styles.brainRewiringButtonGradient}
          >
            <View style={styles.brainRewiringButtonContent}>
              <Text style={styles.brainRewiringButtonText}>
                Brain Rewiring
              </Text>
              <View style={styles.brainRewiringProgressContainer}>
                <View style={styles.brainRewiringProgressBackground}>
                  <LinearGradient
                    colors={['#00D4FF', '#0099FF', '#0066FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.brainRewiringProgressFill, 
                      { width: `${calculateBrainRewiringPercentage(elapsedSeconds)}%` }
                    ]} 
                  >
                    {/* Inner glow effect */}
                    <View style={styles.brainRewiringProgressGlow} />
                  </LinearGradient>
                </View>
                <Text style={styles.brainRewiringPercentageText}>
                  {Math.round(calculateBrainRewiringPercentage(elapsedSeconds))}%
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Panic Button - Full Width Outside ScrollView */}
      <TouchableOpacity 
        style={[styles.panicButton, { bottom: -44 + insets.bottom }]} 
        onPress={handlePanicButton}
      >
        <LinearGradient
          colors={['#F05555', '#E02E2E', '#B61818']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.panicButtonGradient}
        >
          {/* Top highlight */}
          <LinearGradient
            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.panicButtonTopHighlight}
          />

          {/* Bottom inner vignette */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.panicButtonBottomVignette}
          />

          {/* Diagonal sheen */}
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.panicButtonSheen}
          />

          {/* Inner hairline */}
          <View style={styles.panicButtonInnerBorder} />
          
          <View style={styles.panicButtonContent}>
            <View style={styles.panicButtonIconContainer}>
              <Ionicons name="alert-circle" size={18} color={COLORS.primaryText} />
            </View>
            <Text style={styles.panicButtonText}>Panic Button</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation Tab Bar - Removed since we're using React Navigation */}
      
      {/* Panic Modal Overlay */}
      <PanicModal />
      
      {/* Reset Modal Overlay */}
              <ResetModal
          visible={isResetModalVisible}
          onClose={() => setIsResetModalVisible(false)}
          onReset={handleResetConfirm}
        />
      
      {/* Tips Modal Overlay */}
      <TipsModal
        visible={isTipsModalVisible}
        onClose={() => setIsTipsModalVisible(false)}
      />

      {/* Color Picker Modal Overlay */}
      <ColorPickerModal
        isVisible={isColorPickerVisible}
        onClose={() => setIsColorPickerVisible(false)}
      />

      {/* Streak Overlay */}
      <StreakOverlay
        visible={isStreakOverlayVisible}
        onClose={() => setIsStreakOverlayVisible(false)}
        consecutiveDays={consecutiveDays}
        elapsedSeconds={elapsedSeconds}
      />
    </SafeAreaView>
    </PerformanceMeasureView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020408', // Will be overridden dynamically
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // White stars with high opacity
    shadowColor: 'rgba(255, 255, 255, 0.7)', // Matching white shadow color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  streakText: {
    ...body,
    color: COLORS.primaryText,
    marginLeft: SPACING.xs,
  },
  flameIcon: {
    width: 24,
    height: 24,
  },
  leafIcon: {
    width: 32,
    height: 32,
    marginLeft: SPACING.sm,
  },
  headerIcon: {
    marginLeft: SPACING.sm,
  },
  weeklyTrackerContainer: {
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  weeklyTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed from space-around for tighter spacing
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md, // Add horizontal padding for better edge spacing
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 28, // Slightly smaller for tighter look
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5, // Consistent border thickness
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Slightly more visible background
  },
  todayCircle: {
    borderColor: COLORS.primaryAccent,
    borderWidth: 1.5, // Same thickness as others for consistent visual weight
  },
  completedCircle: {
    borderColor: COLORS.primaryAccent,
    borderWidth: 1.5,
    backgroundColor: 'rgba(193, 255, 114, 0.15)',
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  missedCircle: {
    // Same as default - no special background
  },
  todayIndicator: {
    width: 4, // Smaller dot for subtlety
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryAccent,
  },
  dayLabel: {
    ...bodySmall,
    color: COLORS.secondaryText,
    fontWeight: '500',
    fontSize: 11, // Slightly smaller for tighter look
  },
  todayLabel: {
    color: COLORS.primaryAccent,
    fontWeight: '600',
  },
  orbContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
    position: 'relative',
  },
  orbGlowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 90, // Reduced from 112
    ...SHADOWS.orbGlow,
  },
  claimableOrbGlow: {
    // Celestial white glow for claimable state
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
    elevation: 40,
    // Additional premium glow effects
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  claimableIndicatorContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  claimableIndicatorText: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    // Premium glow effect
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },

  orbWrapper: {
    borderRadius: 90, // Reduced from 112
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    ...TYPOGRAPHY.heroText,
    color: COLORS.primaryText,
    textAlign: 'center',
    fontSize: 42, // Slightly reduced from heroText default
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.4)', // Much more subtle shadow
    textShadowOffset: { width: 0, height: 1 }, // Minimal offset
    textShadowRadius: 2, // Smaller radius for subtlety
    // Add subtle outline effect
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, // Much more subtle glow
    shadowRadius: 4, // Smaller glow radius
    elevation: 2, // Reduced elevation
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  descriptionText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.mutedText,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },
  prominentTimerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md, // Reduced from SPACING.lg to move action buttons up
  },
  prominentTimerText: {
    ...TYPOGRAPHY.timerText,
    color: COLORS.primaryText,
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 42,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  animatedTimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timerUnitRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  timerUnitSpacer: {
    width: 12,
  },
  timerUnitSuffix: {
    marginLeft: 6,
    marginBottom: 6,
    color: COLORS.primaryText,
    opacity: 0.9,
    fontWeight: '700',
  },
  secondaryTimeContainer: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(20, 26, 48, 0.75)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  secondaryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTimeText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primaryText,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  resetTimerText: {
    color: '#FF4444',
    textShadowColor: 'rgba(255, 68, 68, 0.6)',
    shadowColor: '#FF4444',
    shadowOpacity: 0.8,
  },
  resetAura: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },

  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg, // Back to larger spacing for better balance
  },
  timerLabel: {
    ...body,
    color: COLORS.secondaryText,
    marginBottom: SPACING.sm, // Reduced from SPACING.md
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerUnit: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm , // Increased from SPACING.xs for better spacing
  },
  timerNumber: {
    ...TYPOGRAPHY.timerText,
    color: COLORS.primaryText,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    // Add subtle glow effect
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  timerUnitLabel: {
    ...caption,
    color: COLORS.secondaryText,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  actionSpacer: {
    height: SPACING.md, // Back to medium spacing for better balance
  },
  brainRewiringButton: {
    marginBottom: SPACING.xxxl + SPACING.md, // Even more space to push panic button down
  },
  brainRewiringButtonGradient: {
    borderRadius: 16,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  brainRewiringButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brainRewiringButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryText,
    flex: 0,
    marginLeft: -SPACING.sm,
    marginRight: SPACING.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  brainRewiringProgressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
  },
  brainRewiringProgressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    width: 120,
    marginRight: SPACING.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  brainRewiringProgressFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: 'transparent',
  },
  brainRewiringProgressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  brainRewiringPercentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryText,
    marginLeft: SPACING.sm,
    // Reduced glare/glow effect - cleaner text appearance
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  panicButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 0,
    width: width, // Use the actual screen width
  },
  panicButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.xl, // More rounded for premium feel
    width: width * 0.8, // Slightly wider for better proportion
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.deep,
  },
  panicButtonTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderRadius: SPACING.xl,
  },
  panicButtonBottomVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    borderRadius: SPACING.xl,
  },
  panicButtonSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: SPACING.xl,
    transform: [{ rotate: '8deg' }],
  },
  panicButtonInnerBorder: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: SPACING.xl - 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  panicButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  panicButtonIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Original light background
    borderRadius: 14,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  panicButtonText: {
    ...buttonText,
    color: COLORS.primaryText,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomSpacing: {
    height: SPACING.lg, // Reduced from SPACING.xl
  },
});

export default HomeScreen; 