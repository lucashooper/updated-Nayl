import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PagerView from 'react-native-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import OnboardingWelcome from './OnboardingWelcome';
import PersonalizingScreen from './PersonalizingScreen';
import NailBitingConsequencesScreen from './NailBitingConsequencesScreen';
import DependencyScoreScreen from './DependencyScoreScreen';
import KeyMilestonesScreen from './KeyMilestonesScreen';
import CommitmentScreen from './CommitmentScreen';
import PersonalizedPlanScreen from './PersonalizedPlanScreen';
import NaylProUpgradeScreen from './NaylProUpgradeScreen';

const { width, height } = Dimensions.get('window');

interface OnboardingQuizProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete, onSkip }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUpgradeScreen, setShowUpgradeScreen] = useState(false);
  
  const progressAnim = useSharedValue(0);
  const pagerRef = useRef<PagerView>(null);

  // Animation values for motivations question
  const motivationsCircleScale = useSharedValue(1);
  const motivationsTickOpacity = useSharedValue(0);

  // Starfield data - populated with subtle stars for all pages
  const starfieldData = {
    welcome: [
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
    ],
    info: [
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
    ],
    quizIntro: [
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
    ],
    questions: [
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
    ],
  };

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

  // Calculate user's dependency score based on quiz answers
  const calculateUserScore = useMemo(() => {
    let score = 0;
    
    // Question 1: Gender (not scored)
    // Question 2: Motivations (not scored)
    // Question 3: When started (not scored)
    // Question 4: Has it increased (not scored)
    
    // Question 5: Frequency (multiple times per day = high score)
    if (quizAnswers['5'] === '5a') score += 40; // Multiple times per day
    else if (quizAnswers['5'] === '5b') score += 30; // Once or twice per day
    else if (quizAnswers['5'] === '5c') score += 20; // A few times per week
    else if (quizAnswers['5'] === '5d') score += 10; // Rarely
    
    // Question 6: Triggers (stress/anxiety = higher score)
    if (quizAnswers['6'] === '6a') score += 25; // Stress or anxiety
    else if (quizAnswers['6'] === '6b') score += 20; // Boredom
    else if (quizAnswers['6'] === '6c') score += 15; // Perfectionism
    else if (quizAnswers['6'] === '6d') score += 10; // Social situations
    
    // Question 7: Duration of trying to stop (longer = higher score)
    if (quizAnswers['7'] === '7a') score += 15; // First attempt
    else if (quizAnswers['7'] === '7b') score += 20; // Few times before
    else if (quizAnswers['7'] === '7c') score += 25; // Months
    else if (quizAnswers['7'] === '7d') score += 30; // Over a year
    
    // Question 8: Motivation (health focus = higher score)
    if (quizAnswers['8'] === '8a') score += 10; // Better looking nails
    else if (quizAnswers['8'] === '8b') score += 15; // Health and hygiene
    else if (quizAnswers['8'] === '8c') score += 20; // Self-discipline
    else if (quizAnswers['8'] === '8d') score += 25; // Setting example
    
    return Math.min(score, 100); // Cap at 100%
  }, [quizAnswers]);

  // Animation values for info page
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-20);
  const statisticOpacity = useSharedValue(0);
  const statisticTranslateY = useSharedValue(20);
  const impact1Opacity = useSharedValue(0);
  const impact1TranslateY = useSharedValue(20);
  const impact2Opacity = useSharedValue(0);
  const impact2TranslateY = useSharedValue(20);
  const impact3Opacity = useSharedValue(0);
  const impact3TranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(20);
  const skipOpacity = useSharedValue(0);
  const skipTranslateY = useSharedValue(20);

  // Quiz questions
  const quizQuestions = [
    {
      id: '1',
      question: 'What\'s your gender?',
      subtitle: 'This helps us personalize your experience',
      options: [
        { id: '1a', text: 'Male' },
        { id: '1b', text: 'Female' },
        { id: '1c', text: 'Non Binary' },
      ],
    },
    {
      id: '2',
      question: 'What are your motivations for quitting nail-biting?',
      subtitle: 'Understanding your why helps us keep you motivated',
      options: [
        { id: '2a', text: 'Reclaim control of my life' },
        { id: '2b', text: 'Increase confidence' },
        { id: '2c', text: 'Improve mental clarity' },
        { id: '2d', text: 'Improve mental strength' },
        { id: '2e', text: 'Save time' },
        { id: '2f', text: 'Other' },
      ],
    },
    {
      id: '3',
      question: 'When did you start biting your nails?',
      subtitle: 'This helps us understand your habit timeline',
      options: [
        { id: '3a', text: 'Before 13' },
        { id: '3b', text: '14 - 17' },
        { id: '3c', text: '18 - 24' },
        { id: '3d', text: '25 - 30' },
        { id: '3e', text: '30 - 40' },
        { id: '3f', text: '40+' },
      ],
    },
    {
      id: '4',
      question: 'Has the amount you bite your nails increased over time?',
      subtitle: 'Understanding progression helps us create the right plan',
      options: [
        { id: '4a', text: 'Yes' },
        { id: '4b', text: 'No' },
      ],
    },
    {
      id: '5',
      question: 'How often do you find yourself biting your nails?',
      subtitle: 'Be honest - this helps us personalize your experience',
      options: [
        { id: '5a', text: 'Multiple times per day' },
        { id: '5b', text: 'Once or twice per day' },
        { id: '5c', text: 'A few times per week' },
        { id: '5d', text: 'Rarely, but I want to stop completely' },
      ],
    },
    {
      id: '6',
      question: 'What triggers your nail biting most often?',
      subtitle: 'Understanding triggers is key to breaking the habit',
      options: [
        { id: '6a', text: 'Stress or anxiety' },
        { id: '6b', text: 'Boredom or idle time' },
        { id: '6c', text: 'Perfectionism or nail imperfections' },
        { id: '6d', text: 'Social situations or nervousness' },
      ],
    },
    {
      id: '7',
      question: 'How long have you been trying to stop?',
      subtitle: 'Your journey matters to us',
      options: [
        { id: '7a', text: 'This is my first serious attempt' },
        { id: '7b', text: 'I\'ve tried a few times before' },
        { id: '7c', text: 'I\'ve been working on it for months' },
        { id: '7d', text: 'I\'ve been trying for over a year' },
      ],
    },
    {
      id: '8',
      question: 'What would motivate you most to quit?',
      subtitle: 'We\'ll use this to keep you inspired',
      options: [
        { id: '8a', text: 'Better looking nails and hands' },
        { id: '8b', text: 'Improved health and hygiene' },
        { id: '8c', text: 'Building self-discipline and confidence' },
        { id: '8d', text: 'Setting a good example for others' },
      ],
    },
  ];

  // Total number of onboarding screens
  const totalScreens = 4 + quizQuestions.length + 8; // Welcome, Info, Quiz Intro, Quiz Questions (now 8), Name Input, Personalizing, Consequences, Dependency Score, Key Milestones, Commitment, Personalized Plan, Nayl Pro Upgrade

  // Update progress when current page changes
  useEffect(() => {
    let progress;
    if (showUpgradeScreen) {
      // When upgrade screen is shown, show 100% progress
      progress = 100;
    } else if (currentPage >= 12) {
      // After Personalizing screen (index 12), hide progress bar by setting to 0
      progress = 0;
    } else {
      // Normal progress calculation up to Personalizing screen
      // Personalizing screen (index 12) should show 100% progress
      const screensForProgress = 13; // Welcome, Info, Quiz Intro, Quiz Questions (8), Name Input, Personalizing
      progress = ((currentPage + 1) / screensForProgress) * 100;
    }
    
    progressAnim.value = withTiming(progress, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentPage, totalScreens, showUpgradeScreen]);

  // Handle visibility changes for embedded components
  useEffect(() => {
    // Force re-render of welcome page when it becomes visible again
    if (currentPage === 0) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        // This will trigger a re-render of the welcome page
      }, 100);
    }
    
  }, [currentPage]);

  // Navigation functions
  const goToNext = () => {
    if (currentPage < totalScreens - 1) {
      const nextPage = currentPage + 1;
      setIsTransitioning(true);
      // Remove the delay that was causing the black gap
      pagerRef.current?.setPage(nextPage);
      setCurrentPage(nextPage);
      // Reset transition state after a brief moment to allow smooth animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }
  };

  const goToPage = (pageIndex: number) => {
    setIsTransitioning(true);
    // Remove the delay that was causing the black gap
    pagerRef.current?.setPage(pageIndex);
    setCurrentPage(pageIndex);
    // Reset transition state after a brief moment to allow smooth animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
  };

  const handleWelcomeStart = () => {
    hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
    goToNext(); // Go to info page
  };

  const handleWelcomeSkip = () => {
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
    onSkip();
  };

  const handleSkipToPlan = () => {
    hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
    goToPage(17); // Skip directly to Personalized Plan Screen
  };

  const handleQuizAnswer = (questionId: string, answerId: string) => {
    hapticService.trigger(HapticType.SELECTION, HapticIntensity.SUBTLE);
    
    if (questionId === '2') {
      // Handle multiple selections for motivations question
      setQuizAnswers(prev => {
        const currentAnswers = prev[questionId];
        let answersArray: string[] = [];
        
        if (Array.isArray(currentAnswers)) {
          answersArray = currentAnswers;
        } else if (typeof currentAnswers === 'string') {
          answersArray = [currentAnswers];
        }
        
        const isAlreadySelected = answersArray.includes(answerId);
        
        if (isAlreadySelected) {
          // Remove if already selected
          return { 
            ...prev, 
            [questionId]: answersArray.filter((id: string) => id !== answerId)
          };
        } else {
          // Add to selections
          return { 
            ...prev, 
            [questionId]: [...answersArray, answerId]
          };
        }
      });
      
      // Animate motivations question selection
      motivationsCircleScale.value = withSpring(1.1, { damping: 15, stiffness: 200 });
      motivationsTickOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      // Single selection for other questions
      setQuizAnswers(prev => ({ ...prev, [questionId]: answerId }));
      
      // Auto-advance to next question after a brief delay for other questions
      setTimeout(() => {
        const currentQuestionIndex = quizQuestions.findIndex(q => q.id === questionId);
        if (currentQuestionIndex < quizQuestions.length - 1) {
          goToNext();
        } else {
          // Last question, go to next page normally (which will be the name input page)
          goToNext();
        }
      }, 300);
    }
  };

  const handleSkip = () => {
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
    onSkip();
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleNavigateToProUpgrade = () => {
    setShowUpgradeScreen(true);
    // Navigate to the next page (Nayl Pro Upgrade Screen)
    goToPage(18);
  };

  const handleUnlockPro = () => {
    // NaylProUpgradeScreen manages the purchase flow internally.
    // This callback is invoked only after a successful purchase or restore.
    onComplete();
  };

  const onPageSelected = (e: any) => {
    const newPage = e.nativeEvent.position;
    setCurrentPage(newPage);
    // Reset transition state when page change is complete
    setIsTransitioning(false);
  };

  // Progress bar animated style
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value}%`,
    };
  });

  // Info page animated styles - only access shared values in useAnimatedStyle
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const statisticAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statisticOpacity.value,
    transform: [{ translateY: statisticTranslateY.value }],
  }));

  const impact1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: impact1Opacity.value,
    transform: [{ translateY: impact1TranslateY.value }],
  }));

  const impact2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: impact2Opacity.value,
    transform: [{ translateY: impact2TranslateY.value }],
  }));

  const impact3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: impact3Opacity.value,
    transform: [{ translateY: impact3TranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const skipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skipOpacity.value,
    transform: [{ translateY: skipTranslateY.value }],
  }));

  // Motivations question animated styles
  const motivationsCircleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: motivationsCircleScale.value }],
  }));

  const motivationsTickAnimatedStyle = useAnimatedStyle(() => ({
    opacity: motivationsTickOpacity.value,
  }));

  // Trigger info page animations when it becomes visible
  useEffect(() => {
    if (currentPage === 1) { // Info page
      titleOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      titleTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      
      setTimeout(() => {
        statisticOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        statisticTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      }, 200);
      
      setTimeout(() => {
        impact1Opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        impact1TranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      }, 400);
      
      setTimeout(() => {
        impact2Opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        impact2TranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      }, 600);
      
      setTimeout(() => {
        impact3Opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        impact3TranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      }, 800);
      
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        buttonTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      }, 1000);
      
      setTimeout(() => {
        skipOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        skipTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      }, 1200);
    }
  }, [currentPage]);

  return (
    <View style={styles.container}>
      {/* Floating Progress Bar - No Separate Background */}
      {currentPage < 12 && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                progressBarStyle
              ]} 
            />
          </View>
        </View>
      )}

      {/* Main PagerView for All Onboarding Screens */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={onPageSelected}
        scrollEnabled={!isTransitioning}
        pageMargin={0}
        overdrag={false}
        overScrollMode="never"
      >
        {/* Welcome Screen */}
        <View key="welcome" style={styles.page}>
          <LinearGradient
            colors={['#000000', '#050505', '#0A0A0A', '#0F0F0F']}
            style={styles.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Premium Starfield Background */}
          <View style={styles.starfield}>
            {starfieldData.welcome.map((star, i) => (
              <View
                key={i}
                style={[
                  styles.star,
                  getStarStyle(star),
                ]}
              />
            ))}
          </View>
          
          <View style={styles.welcomeContainer}>
            <OnboardingWelcome 
              key="welcome-visible"
              onStart={handleWelcomeStart}
              onLogin={handleWelcomeSkip}
              onSkipToPlan={handleSkipToPlan}
              isEmbedded={true}
              isVisible={currentPage === 0}
            />
          </View>
        </View>

        {/* Info Page */}
        <View key="info" style={styles.page}>
          <View style={styles.container}>
            <LinearGradient
              colors={['#000000', '#050505', '#0A0A0A', '#0F0F0F']}
              style={styles.background}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Premium Starfield Background */}
            <View style={styles.starfield}>
              {starfieldData.info.map((star, i) => (
                <View
                  key={i}
                  style={[
                    styles.star,
                    getStarStyle(star),
                  ]}
                />
              ))}
            </View>

            <View style={styles.content}>
              {/* Main Title */}
              <Animated.Text 
                style={[styles.infoPageTitle, titleAnimatedStyle]}
              >
                The hidden costs of nail biting
              </Animated.Text>
               
              {/* Key Statistic */}
              <Animated.View 
                style={[styles.statisticContainer, statisticAnimatedStyle]}
              >
                <Text style={styles.statisticNumber}>1 in 3</Text>
                <Text style={styles.statisticText}>
                  people struggle with nail biting, affecting their health and confidence
                </Text>
              </Animated.View>

              {/* Impact Points */}
              <View style={styles.impactSection}>
                <Animated.View style={[styles.impactItem, impact1AnimatedStyle]}>
                  <View style={styles.impactIcon}>
                    <Text style={styles.impactIconText}>🦷</Text>
                  </View>
                  <Text style={styles.impactText}>
                    Dental damage and jaw problems from constant pressure
                  </Text>
                </Animated.View>

                <Animated.View style={[styles.impactItem, impact2AnimatedStyle]}>
                  <View style={styles.impactIcon}>
                    <Text style={styles.impactIconText}>🦠</Text>
                  </View>
                  <Text style={styles.impactText}>
                    Risk of infections and bacteria transfer to mouth
                  </Text>
                </Animated.View>

                <Animated.View style={[styles.impactItem, impact3AnimatedStyle]}>
                  <View style={styles.impactIcon}>
                    <Text style={styles.impactIconText}>😔</Text>
                  </View>
                  <Text style={styles.impactText}>
                    Social anxiety and embarrassment about hand appearance
                  </Text>
                </Animated.View>
              </View>

              {/* Call to Action Button */}
              <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
                <TouchableOpacity 
                  style={styles.infoPageButton} 
                  onPress={() => {
                    hapticService.trigger(HapticType.SUCCESS, HapticIntensity.PROMINENT);
                    goToNext();
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#7C3AED', '#EC4899']}
                    style={styles.infoPageButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.infoPageButtonText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Skip Link */}
                <TouchableOpacity 
                  style={styles.infoPageSkipLink} 
                  onPress={() => {
                    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
                    goToNext();
                  }}
                >
                  <Text style={styles.infoPageSkipText}>
                    Skip this information
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Quiz Intro Screen */}
        <View key="quizIntro" style={styles.page}>
          <View style={styles.container}>
            <LinearGradient
              colors={['#000000', '#050505', '#0A0A0A', '#0F0F0F']}
              style={styles.background}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Premium Starfield Background */}
            <View style={styles.starfield}>
              {starfieldData.quizIntro.map((star, i) => (
                <View
                  key={i}
                  style={[
                    styles.star,
                    getStarStyle(star),
                  ]}
                />
              ))}
            </View>

            <View style={styles.content}>
              {/* Main Title */}
                              <Text style={styles.quizIntroTitle}>
                  Let's understand your nail biting habits
                </Text>

              {/* Privacy/Security Note */}
              <View style={styles.privacyContainer}>
                <Text style={styles.privacyIcon}>🔒</Text>
                <Text style={styles.privacyText}>
                  Your data is encrypted and will never be shared
                </Text>
              </View>

              {/* Central Animation */}
              <View style={styles.animationContainer}>
                <LottieView
                  source={require('../../assets/onboarding-icons/Notepad.lottie')}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
              </View>

              {/* Call to Action Button */}
              <TouchableOpacity 
                style={styles.quizIntroButton} 
                onPress={() => {
                  hapticService.trigger(HapticType.SUCCESS, HapticIntensity.PROMINENT);
                  goToNext();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7C3AED', '#1E40AF']}
                  style={styles.quizIntroButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.quizIntroButtonText}>Start Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quiz Questions */}
        {quizQuestions.map((question, index) => (
          <View key={`question-${question.id}`} style={styles.page}>
            <LinearGradient
              colors={['#000000', '#050505', '#0A0A0A', '#0F0F0F']}
              style={styles.background}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Subtle Starfield Background */}
            <View style={styles.starfield}>
              {starfieldData.questions.map((star, i) => (
                <View
                  key={i}
                  style={[
                    styles.star,
                    getStarStyle(star),
                  ]}
                />
              ))}
            </View>
             
            <View style={styles.content}>
              {/* Question Section */}
              <View style={styles.questionSection}>
                <Text style={styles.question}>
                  {question.question}
                </Text>
              </View>

              {/* Answer Options */}
              <View style={styles.answersSection}>
                {question.options.map((option: any) => {
                  const isMotivationsQuestion = question.id === '2';
                  const isSelected = isMotivationsQuestion 
                    ? quizAnswers[question.id] && quizAnswers[question.id].includes(option.id)
                    : quizAnswers[question.id] === option.id;
                  
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.answerPill,
                        isMotivationsQuestion && styles.motivationsPill
                      ]}
                      onPress={() => handleQuizAnswer(question.id, option.id)}
                      activeOpacity={0.8}
                    >
                                             {isMotivationsQuestion ? (
                         // Sophisticated motivations pill design
                         <>
                           {isSelected && (
                             <LinearGradient
                               colors={['#3B82F6', '#1E40AF']}
                               style={styles.motivationsPillGradient}
                               start={{ x: 0, y: 0 }}
                               end={{ x: 0, y: 1 }}
                             />
                           )}
                           <View style={styles.motivationsPillContent}>
                             {/* Left circle with tick animation */}
                             <Animated.View style={[
                               styles.motivationsCircle,
                               isSelected && styles.motivationsCircleSelected,
                               motivationsCircleAnimatedStyle
                             ]}>
                               {isSelected && (
                                 <Animated.Text 
                                   style={[
                                     styles.motivationsTick,
                                     motivationsTickAnimatedStyle
                                   ]}
                                 >
                                   ✓
                                 </Animated.Text>
                                 )}
                             </Animated.View>
                             
                             {/* Text content */}
                             <Text style={[
                               styles.motivationsText,
                               isSelected && styles.motivationsTextSelected
                             ]} numberOfLines={2}>
                               {option.text}
                             </Text>
                           </View>
                         </>
                       ) : (
                        // Regular pill design for other questions
                        <>
                          <LinearGradient
                            colors={['#3B82F6', '#1E40AF']}
                            style={styles.pillGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                          />
                          
                          <View style={styles.pillContent}>
                            <Text style={styles.answerText} numberOfLines={2}>
                              {option.text}
                            </Text>
                          </View>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Continue Button for Motivations Question */}
              {question.id === '2' && quizAnswers['2'] && Array.isArray(quizAnswers['2']) && quizAnswers['2'].length > 0 && (
                <View style={styles.motivationsContinueContainer}>
                  <TouchableOpacity
                    style={styles.motivationsContinueButton}
                    onPress={() => {
                      hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
                      goToNext();
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#1E40AF']}
                      style={styles.motivationsContinueGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    >
                      <Text style={styles.motivationsContinueText}>Continue</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* Skip Button - Hide for motivations question when answers are selected */}
              {!(question.id === '2' && quizAnswers['2'] && Array.isArray(quizAnswers['2']) && quizAnswers['2'].length > 0) && (
                <View style={styles.skipButtonContainer}>
                  <TouchableOpacity 
                    style={styles.skipButton} 
                    onPress={handleSkip}
                  >
                    <Text style={styles.skipText}>Skip test</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Name Input Page */}
        <View key="nameInput" style={styles.page}>
          <LinearGradient
            colors={['#000000', '#050505', '#0A0A0A', '#0F0F0F']}
            style={styles.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Premium Starfield Background */}
          <View style={styles.starfield}>
            {starfieldData.welcome.map((star, i) => (
              <View
                key={i}
                style={[
                  styles.star,
                  getStarStyle(star),
                ]}
              />
            ))}
          </View>
          
          <View style={styles.content}>
            {/* Question Section */}
            <View style={[styles.questionSection, { marginBottom: 40 }]}>
              <Text style={styles.question}>
                Finally, what's your name?
              </Text>
            </View>

            {/* Name Input Field */}
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoFocus={true}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (userName.trim()) {
                    goToNext();
                  }
                }}
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                userName.trim() ? styles.continueButtonActive : styles.continueButtonInactive
              ]}
              onPress={() => {
                if (userName.trim()) {
                  goToNext();
                }
              }}
              disabled={!userName.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={userName.trim() ? ['#7C3AED', '#EC4899'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[
                  styles.continueButtonText,
                  userName.trim() ? styles.continueButtonTextActive : styles.continueButtonTextInactive
                ]}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalizing Screen */}
        <View key="personalizing" style={styles.page}>
          {currentPage === 12 ? (
            <PersonalizingScreen
              userName={userName}
              onComplete={goToNext}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Consequences Screen */}
        <View key="consequences" style={styles.page}>
          {currentPage === 13 ? (
            <NailBitingConsequencesScreen
              userName={userName}
              onComplete={goToNext}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Dependency Score Screen */}
        <View key="dependencyScore" style={styles.page}>
          {currentPage === 14 ? (
            <DependencyScoreScreen
              userScore={calculateUserScore}
              averageScore={25}
              onContinue={goToNext}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Key Milestones Screen */}
        <View key="keyMilestones" style={styles.page}>
          {currentPage === 15 ? (
            <KeyMilestonesScreen
              onContinue={goToNext}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Commitment Screen */}
        <View key="commitment" style={styles.page}>
          {currentPage === 16 ? (
            <CommitmentScreen
              onComplete={goToNext}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Personalized Plan Screen */}
        <View key="personalizedPlan" style={styles.page}>
          {currentPage === 17 ? (
            <PersonalizedPlanScreen
              userName={userName}
              onStartJourney={handleComplete}
              onNavigateToProUpgrade={handleNavigateToProUpgrade}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Nayl Pro Upgrade Screen */}
        <View key="naylProUpgrade" style={styles.page}>
          {currentPage === 18 ? (
            <NaylProUpgradeScreen
              onUnlockPro={handleUnlockPro}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Loading...</Text>
            </View>
          )}
        </View>
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 60, // Status bar height
    left: 24,
    right: 24,
    zIndex: 1000, // High z-index to float above content
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3, // Slightly thicker for better visibility
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Slightly more visible
    borderRadius: 2,
    overflow: 'hidden',
    // Add subtle shadow for depth
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  pager: {
    flex: 1,
    marginTop: 0, // No margin needed since progress bar is floating
    backgroundColor: '#000000', // Ensure consistent background
  },
  page: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 0, // Reduced from 0 to 0 (already at 0) to keep content high
    backgroundColor: '#000000', // Ensure consistent background
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 80, // Increased to account for floating progress bar
    paddingBottom: 40,
    zIndex: 10, // Ensure content is above stars
  },
  questionSection: {
    alignItems: 'center',
    marginBottom: 20, // Increased from 16 to 20 to find better balance
    paddingTop: 0, // Reduced from 20 to 0 to move questions higher
    zIndex: 10, // Ensure questions are above stars
  },
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12, // Reduced from 16 to 12 to bring subtitle closer
    lineHeight: 36,
    letterSpacing: 0.5,
    zIndex: 10, // Ensure question text is above stars
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
    marginBottom: 8, // Added margin bottom to bring answer pills closer
    zIndex: 10, // Ensure subtitle text is above stars
  },
  answersSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, // Increased from 16 to 20 to find better balance
    gap: 16, // Increased gap for better spacing between pills
    zIndex: 10, // Ensure answer section is above stars
  },
  answerPill: {
    width: '100%',
    marginBottom: 10, // Increased from 6 to 10 to find better balance
    minHeight: 58, // Increased from 56 to 58 to match increased padding
    position: 'relative',
    zIndex: 10, // Ensure answer pills are above stars
  },
  pillGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28, // Increased from 27 to 28 to match new height
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // More subtle border
    // Remove backgroundColor since we're using LinearGradient
    // Add subtle shadow effects for premium look
    shadowColor: '#3B82F6', // Updated to match new blue theme
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4, // Android shadow
    zIndex: 10, // Ensure gradient is above stars
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the text horizontally
    width: '100%',
    paddingVertical: 15, // Increased from 14 to 15 to match new height
    paddingHorizontal: 24, // Reduced from 32 to 24
    zIndex: 10, // Ensure pill content is above stars
  },
  numberCircle: {
    width: 30, // Increased from 28 to 30 for better proportion
    height: 30, // Increased from 28 to 30 for better proportion
    borderRadius: 15, // Increased from 14 to 15 for better proportion
    backgroundColor: 'rgba(0, 179, 255, 0.3)', // Updated to match new premium theme
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)', // Updated border to match new theme
    zIndex: 10, // Ensure number circle is above stars
  },
  numberText: {
    fontSize: 15, // Increased from 14 to 15 for better proportion
    fontWeight: '600',
    color: '#FFFFFF',
    zIndex: 10, // Ensure number text is above stars
  },
  answerText: {
    fontSize: 19, // Increased from 18 to 19 for better proportion
    fontWeight: '700', // Increased from 600 to 700 for better contrast
    color: '#FFFFFF', // Pure white for maximum contrast against premium blue
    textAlign: 'center', // Center the text
    lineHeight: 23, // Increased from 22 to 23 for better proportion
    textShadowColor: 'rgba(0, 0, 0, 0.6)', // Enhanced shadow for better text readability
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2, // Increased shadow radius for subtle glow effect
    zIndex: 10, // Ensure answer text is above stars
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    zIndex: 10, // Ensure skip button is above stars
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    zIndex: 10, // Ensure skip text is above stars
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 40, // Adjust as needed
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10, // Ensure it's above stars
  },
  finalContent: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    flex: 1,
    zIndex: 10, // Ensure final content is above stars
  },
  finalHeader: {
    alignItems: 'center',
    marginBottom: 32, // Reduced from 48 to 32 to move content higher
    paddingTop: 0, // Reduced from 10 to 0
    zIndex: 10, // Ensure final header is above stars
  },
  finalTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 10, // Ensure final title is above stars
  },
  finalTitleHighlight: {
    color: '#C1FF72',
    zIndex: 10, // Ensure final title highlight is above stars
  },
  finalSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
    maxWidth: width * 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10, // Ensure final subtitle is above stars
  },
  featuresSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32, // Reduced from 48 to 32 to move content higher
    gap: 24,
    zIndex: 10, // Ensure features section is above stars
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10, // Ensure feature items are above stars
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    zIndex: 10, // Ensure feature icon container is above stars
  },
  featureIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    zIndex: 10, // Ensure feature icon is above stars
  },
  featureText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'left',
    lineHeight: 24,
    zIndex: 10, // Ensure feature text is above stars
  },
  paymentAssurance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32, // Reduced from 48 to 32 to move content higher
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10, // Ensure payment assurance is above stars
  },
  checkmarkContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C1FF72',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    zIndex: 10, // Ensure checkmark container is above stars
  },
  checkmark: {
    fontSize: 24,
    color: '#000000',
    zIndex: 10, // Ensure checkmark is above stars
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10, // Ensure payment text is above stars
  },
  startButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 10, // Ensure start button is above stars
  },
  startButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure start button gradient is above stars
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
    zIndex: 10, // Ensure start button text is above stars
  },
  pricingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 24,
    zIndex: 10, // Ensure pricing text is above stars
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Higher than background but lower than content
    overflow: 'hidden',
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
    width: 1.5, // Much smaller for subtlety
    height: 1.5, // Much smaller for subtlety
    backgroundColor: 'rgba(147, 51, 234, 0.8)', // Blue/purple gradient instead of white
    borderRadius: 0.75, // Smaller radius
    opacity: 0.4, // Much more subtle
    transform: [{ scale: 1 }], // Keep at 1
    shadowColor: 'rgba(147, 51, 234, 0.6)', // Blue/purple shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, // Much more subtle
    shadowRadius: 1, // Minimal shadow
    elevation: 2, // Reduced elevation
    zIndex: 1, // Ensure stars are above background but below content
  },
  infoPageTitle: {
    fontSize: 36, // Increased for more impact
    fontWeight: '800', // Bolder for premium feel
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24, // Reduced spacing
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 44, // Better line height for readability
    zIndex: 10, // Ensure title is above stars
  },
  statisticContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // More subtle background
    borderRadius: 20, // Larger radius for premium feel
    paddingVertical: 20, // Reduced padding
    paddingHorizontal: 28, // Reduced horizontal padding
    marginBottom: 40, // Reduced spacing
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // More subtle border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10, // Ensure statistic container is above stars
  },
  statisticNumber: {
    fontSize: 56, // Larger for more impact
    fontWeight: '900', // Boldest for maximum impact
    color: '#DC2626', // Premium red color for impact
    textAlign: 'center',
    marginBottom: 12, // More spacing
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0,  height: 2 },
    textShadowRadius: 4,
    letterSpacing: -1, // Tighter letter spacing for numbers
    zIndex: 10, // Ensure statistic number is above stars
  },
  statisticText: {
    fontSize: 16, // Reduced from 18 to create better visual hierarchy
    color: '#AAAAAA', // Changed to subtle light grey for better contrast
    textAlign: 'center',
    lineHeight: 22, // Adjusted line height to match smaller font size
    zIndex: 10, // Ensure statistic text is above stars
  },
  impactSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32, // Reduced spacing
    gap: 20, // Reduced gap between items
    zIndex: 10, // Ensure impact section is above stars
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18, // Slightly reduced gap
    width: '100%',
    paddingVertical: 16, // Reduced padding
    paddingHorizontal: 24, // Reduced horizontal padding
    backgroundColor: 'rgba(45, 45, 55, 0.5)', // Semi-transparent dark background for glassmorphism
    borderRadius: 16, // Larger radius
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle edge highlight
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10, // Ensure impact items are above stars
  },
  impactIcon: {
    width: 56, // Larger icons
    height: 56, // Larger icons
    borderRadius: 28, // Larger radius
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // More subtle background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Subtle border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10, // Ensure impact icons are above stars
  },
  impactIconText: {
    fontSize: 28, // Larger emojis
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10, // Ensure impact icon text is above stars
  },
  impactText: {
    fontSize: 19, // Slightly larger
    color: 'rgba(255, 255, 255, 0.95)', // More opaque for better readability
    flex: 1,
    textAlign: 'left',
    lineHeight: 26, // Better line height
    fontWeight: '500', // Medium weight for better readability
    letterSpacing: 0.2, // Slight letter spacing
    zIndex: 10, // Ensure impact text is above stars
  },
  infoPageButton: {
    width: width * 0.9, // Wider button with margins
    height: 64, // Slightly taller
    borderRadius: 32, // Larger radius
    overflow: 'hidden',
    marginBottom: 16, // Reduced spacing to bring skip link closer
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    alignSelf: 'center', // Center the button
    zIndex: 10, // Ensure info page button is above stars
  },
  infoPageButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure button gradient is above stars
  },
  infoPageButtonText: {
    fontSize: 22, // Larger text
    fontWeight: '800', // Bolder
    color: '#FFFFFF', // White text for better contrast with gradient
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10, // Ensure button text is above stars
  },
  infoPageSkipLink: {
    paddingVertical: 16,
    zIndex: 10, // Ensure skip link is above stars
  },
  infoPageSkipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#AAAAAA', // Changed to light grey to make it more subtle
    // Removed textDecorationLine: 'underline' to make it plain text
    zIndex: 10, // Ensure skip text is above stars
  },
  // Quiz Intro Page Styles
  quizIntroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: 0.5,
    zIndex: 10, // Ensure quiz intro title is above stars
  },
  quizIntroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    maxWidth: width * 0.85,
    fontWeight: '500',
    zIndex: 10, // Ensure quiz intro subtitle is above stars
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
    zIndex: 10, // Ensure privacy container is above stars
  },
  privacyIcon: {
    fontSize: 20,
    color: '#F59E0B', // Golden color for the lock
    zIndex: 10, // Ensure privacy icon is above stars
  },
  privacyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    zIndex: 10, // Ensure privacy text is above stars
  },
  animationContainer: {
    width: width * 0.8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10, // Ensure animation container is above stars
  },

  quizIntroButton: {
    width: width * 0.85,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    alignSelf: 'center',
    zIndex: 10, // Ensure quiz intro button is above stars
  },
  quizIntroButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure quiz intro button gradient is above stars
  },
  quizIntroButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10, // Ensure quiz intro button text is above stars
  },

  staticImageText: {
    fontSize: 120,
    color: '#FFFFFF',
    zIndex: 10, // Ensure static image text is above stars
  },
  lottieAnimation: {
    width: 280, // Increased from 200 for bigger impact
    height: 280, // Increased from 200 for bigger impact
    zIndex: 10, // Ensure lottie animation is above stars
  },
  nameInputContainer: {
    width: '100%',
    marginBottom: 32,
    marginTop: 20,
    zIndex: 10, // Ensure name input container is above stars
  },
  nameInput: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10, // Ensure name input is above stars
  },
  continueButton: {
    width: width * 0.85,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#C1FF72',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    alignSelf: 'center',
    marginTop: 20,
    zIndex: 10, // Ensure continue button is above stars
  },
  continueButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure continue button gradient is above stars
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10, // Ensure continue button text is above stars
  },
            continueButtonActive: {
      shadowColor: '#EC4899',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
      zIndex: 10, // Ensure active button state is above stars
    },
  continueButtonInactive: {
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    zIndex: 10, // Ensure inactive button state is above stars
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
    zIndex: 10, // Ensure active button text is above stars
  },
  continueButtonTextInactive: {
    color: 'rgba(255, 255, 255, 0.6)',
    zIndex: 10, // Ensure inactive button text is above stars
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 100, // Adjust as needed to center content
    zIndex: 10, // Ensure placeholder text is above stars
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    zIndex: 10, // Ensure button container is above stars
  },
  welcomeContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure welcome container is above stars
  },
     placeholderContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#000000', // Ensure consistent background
     zIndex: 10, // Ensure placeholder container is above stars
   },

       // Sophisticated motivations pill styles
    motivationsPill: {
      backgroundColor: 'rgba(30, 58, 138, 0.3)', // Darker blue/subtle color
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.3)', // Subtle blue border
      borderRadius: 28,
      shadowColor: 'rgba(30, 58, 138, 0.4)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      zIndex: 10,
      minHeight: 58, // Match the height of regular pills
      justifyContent: 'center', // Center content vertically
      position: 'relative', // For gradient positioning
      overflow: 'hidden', // For gradient clipping
    },
    motivationsPillGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 28,
      zIndex: 1, // Below the content
    },

       
               motivationsPillContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingVertical: 15,
      paddingHorizontal: 24,
      gap: 16,
      zIndex: 10,
      minHeight: 58, // Ensure consistent height
      justifyContent: 'flex-start', // Align content to the left
      position: 'relative', // For proper layering
    },
   motivationsCircle: {
     width: 32,
     height: 32,
     borderRadius: 16,
     backgroundColor: 'rgba(255, 255, 255, 0.1)',
     borderWidth: 2,
     borderColor: 'rgba(255, 255, 255, 0.3)',
     justifyContent: 'center',
     alignItems: 'center',
     flexShrink: 0,
     zIndex: 10,
   },
   motivationsCircleSelected: {
     backgroundColor: 'rgba(255, 255, 255, 0.95)',
     borderColor: 'rgba(255, 255, 255, 1)',
     transform: [{ scale: 1.1 }], // Subtle scale effect for the circle
     shadowColor: 'rgba(255, 255, 255, 0.4)',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.6,
     shadowRadius: 4,
     elevation: 3,
   },
   motivationsTick: {
     fontSize: 18,
     fontWeight: '700',
     color: '#1E40AF', // Dark blue for contrast against white circle
     textAlign: 'center',
     zIndex: 10,
   },
   motivationsText: {
     fontSize: 19,
     fontWeight: '600',
     color: 'rgba(255, 255, 255, 0.9)',
     flex: 1,
     textAlign: 'left',
     lineHeight: 23,
     zIndex: 10,
   },
    motivationsTextSelected: {
      color: '#FFFFFF',
      fontWeight: '700',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    // Continue button styles for motivations question
    motivationsContinueContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 20,
      zIndex: 10,
    },
    motivationsContinueButton: {
      width: width * 0.85,
      height: 60,
      borderRadius: 30,
      overflow: 'hidden',
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
      zIndex: 10,
    },
    motivationsContinueGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    motivationsContinueText: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      zIndex: 10,
    },


 });

export default OnboardingQuiz;
