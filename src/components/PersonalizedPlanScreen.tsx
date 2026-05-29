import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

const { width, height } = Dimensions.get('window');

interface PersonalizedPlanScreenProps {
  userName?: string;
  onStartJourney: () => void;
  onNavigateToProUpgrade: () => void;
}

const PersonalizedPlanScreen: React.FC<PersonalizedPlanScreenProps> = ({
  userName = 'Friend',
  onStartJourney,
  onNavigateToProUpgrade,
}) => {
  // Animation values for entrance animations (all visible immediately)
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  
  const benefit1Opacity = useSharedValue(0);
  const benefit1TranslateY = useSharedValue(40);
  
  const benefit2Opacity = useSharedValue(0);
  const benefit2TranslateY = useSharedValue(40);
  
  const benefit3Opacity = useSharedValue(0);
  const benefit3TranslateY = useSharedValue(40);
  
  const testimonialOpacity = useSharedValue(0);
  const testimonialTranslateY = useSharedValue(40);
  
  const discountOpacity = useSharedValue(0);
  const discountTranslateY = useSharedValue(40);
  
  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(40);

  // Calculate target date (90 days from now)
  const getTargetDate = () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 90);
    return targetDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Start all animations immediately on mount
  useEffect(() => {
    const startAnimations = () => {
      // Header animation (immediate)
      headerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

      // Top animation (200ms delay)
      setTimeout(() => {
        benefit1Opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        benefit1TranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 200);

      // Benefit 1 animation (500ms delay)
      setTimeout(() => {
        benefit2Opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        benefit2TranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 500);

      // Benefit 2 animation (800ms delay)
      setTimeout(() => {
        benefit3Opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        benefit3TranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 800);

      // Testimonial animation (1100ms delay)
      setTimeout(() => {
        testimonialOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        testimonialTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 1100);

      // Discount animation (1250ms delay)
      setTimeout(() => {
        discountOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        discountTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 1250);

      // CTA animation (1400ms delay)
      setTimeout(() => {
        ctaOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        ctaTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 1400);
    };

    // Start animations after a brief delay
    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const benefit1Style = useAnimatedStyle(() => ({
    opacity: benefit1Opacity.value,
    transform: [{ translateY: benefit1TranslateY.value }],
  }));

  const benefit2Style = useAnimatedStyle(() => ({
    opacity: benefit2Opacity.value,
    transform: [{ translateY: benefit2TranslateY.value }],
  }));

  const benefit3Style = useAnimatedStyle(() => ({
    opacity: benefit3Opacity.value,
    transform: [{ translateY: benefit3TranslateY.value }],
  }));

  const testimonialStyle = useAnimatedStyle(() => ({
    opacity: testimonialOpacity.value,
    transform: [{ translateY: testimonialTranslateY.value }],
  }));

  const discountStyle = useAnimatedStyle(() => ({
    opacity: discountOpacity.value,
    transform: [{ translateY: discountTranslateY.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  const handleStartJourney = async () => {
    try {
      await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
      onNavigateToProUpgrade();
    } catch (error) {
      console.warn('Haptic feedback error:', error);
      onNavigateToProUpgrade();
    }
  };

  return (
    <View style={styles.container}>
      {/* Subtle Floating Stars (like main app) */}
      <View style={styles.starsContainer}>
        <View style={[styles.star, styles.star1]} />
        <View style={[styles.star, styles.star2]} />
        <View style={[styles.star, styles.star3]} />
        <View style={[styles.star, styles.star4]} />
        <View style={[styles.star, styles.star5]} />
        <View style={[styles.star, styles.star6]} />
        <View style={[styles.star, styles.star7]} />
        <View style={[styles.star, styles.star8]} />
        <View style={[styles.star, styles.star9]} />
        <View style={[styles.star, styles.star10]} />
        <View style={[styles.star, styles.star11]} />
        <View style={[styles.star, styles.star12]} />
        <View style={[styles.star, styles.star13]} />
        <View style={[styles.star, styles.star14]} />
        <View style={[styles.star, styles.star15]} />
        <View style={[styles.star, styles.star16]} />
        <View style={[styles.star, styles.star17]} />
        <View style={[styles.star, styles.star18]} />
        <View style={[styles.star, styles.star19]} />
        <View style={[styles.star, styles.star20]} />
        <View style={[styles.star, styles.star21]} />
        <View style={[styles.star, styles.star22]} />
        <View style={[styles.star, styles.star23]} />
        <View style={[styles.star, styles.star24]} />
        <View style={[styles.star, styles.star25]} />
        <View style={[styles.star, styles.star26]} />
        <View style={[styles.star, styles.star27]} />
        <View style={[styles.star, styles.star28]} />
        <View style={[styles.star, styles.star29]} />
        <View style={[styles.star, styles.star30]} />
        <View style={[styles.star, styles.star31]} />
        <View style={[styles.star, styles.star32]} />
        <View style={[styles.star, styles.star33]} />
        <View style={[styles.star, styles.star34]} />
        <View style={[styles.star, styles.star35]} />
        <View style={[styles.star, styles.star36]} />
        <View style={[styles.star, styles.star37]} />
        <View style={[styles.star, styles.star38]} />
        <View style={[styles.star, styles.star39]} />
        <View style={[styles.star, styles.star40]} />
        <View style={[styles.star, styles.star41]} />
        <View style={[styles.star, styles.star42]} />
        <View style={[styles.star, styles.star43]} />
        <View style={[styles.star, styles.star44]} />
        <View style={[styles.star, styles.star45]} />
        <View style={[styles.star, styles.star46]} />
        <View style={[styles.star, styles.star47]} />
        <View style={[styles.star, styles.star48]} />
        <View style={[styles.star, styles.star49]} />
        <View style={[styles.star, styles.star50]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View style={[styles.headerSection, headerStyle]}>
          <Text style={styles.personalizedHeadline}>
            Become the best version of yourself with Nayl
          </Text>
          <Text style={styles.targetDateSubheadline}>
            Stronger. Healthier. Happier.
          </Text>
          <Text style={styles.targetDateText}>
            You're on track to quit nail-biting by: {getTargetDate()}
          </Text>
        </Animated.View>

        {/* Recovery Benefit Pills */}
        <Animated.View style={[styles.recoveryBenefitPillsSection, benefit1Style]}>
          <View style={styles.recoveryBenefitPillsContainer}>
            {/* Top Row - 2 pills */}
            <View style={styles.recoveryBenefitPillsRow}>
              <View style={[styles.recoveryBenefitPill, styles.recoveryPillTeal]}>
                <Text style={styles.recoveryPillIcon}>💎</Text>
                <Text style={styles.recoveryPillText}>Self-Respect</Text>
              </View>
              <View style={[styles.recoveryBenefitPill, styles.recoveryPillRed]}>
                <Text style={styles.recoveryPillIcon}>❤️</Text>
                <Text style={styles.recoveryPillText}>Better Health</Text>
              </View>
            </View>
            {/* Middle Row - 3 pills (shortest text) */}
            <View style={styles.recoveryBenefitPillsRowMiddle}>
              <View style={[styles.recoveryBenefitPill, styles.recoveryBenefitPillMiddle, styles.recoveryPillPurple]}>
                <Text style={styles.recoveryPillIcon}>🧠</Text>
                <Text style={styles.recoveryPillText}>Better Focus</Text>
              </View>
              <View style={[styles.recoveryBenefitPill, styles.recoveryBenefitPillMiddle, styles.recoveryPillGold]}>
                <Text style={styles.recoveryPillIcon}>⚡</Text>
                <Text style={styles.recoveryPillText}>More Energy</Text>
              </View>
              <View style={[styles.recoveryBenefitPill, styles.recoveryBenefitPillMiddle, styles.recoveryPillBlue]}>
                <Text style={styles.recoveryPillIcon}>✨</Text>
                <Text style={styles.recoveryPillText}>Mental Clarity</Text>
              </View>
            </View>
            {/* Bottom Row - 2 wide pills for longer text */}
            <View style={styles.recoveryBenefitPillsRow}>
              <View style={[styles.recoveryBenefitPill, styles.recoveryBenefitPillWide, styles.recoveryPillGreen]}>
                <Text style={styles.recoveryPillIcon}>💪</Text>
                <Text style={styles.recoveryPillText}>Increased Willpower</Text>
              </View>
              <View style={[styles.recoveryBenefitPill, styles.recoveryBenefitPillWide, styles.recoveryPillPurple]}>
                <Text style={styles.recoveryPillIcon}>🌟</Text>
                <Text style={styles.recoveryPillText}>Higher Confidence</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Benefit Section 1: Conquer yourself */}
        <Animated.View style={[styles.benefitSection, benefit1Style]}>
          <Text style={styles.benefitTitle}>1. Conquer yourself</Text>
          
          <View style={styles.iconContainer}>
            <LottieView
              source={require('../../assets/onboarding-icons/Rocket-Man.lottie')}
              autoPlay
              loop
              style={styles.iconImage}
              speed={1}
            />
          </View>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>🔒</Text>
              </View>
              <Text style={styles.benefitText}>Build unbreakable self-control</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>🧠</Text>
              </View>
              <Text style={styles.benefitText}>Become more aware of your triggers</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>⚡</Text>
              </View>
              <Text style={styles.benefitText}>Rewire your brain to prefer healthier habits</Text>
            </View>
          </View>
        </Animated.View>

        {/* Benefit Section 2: Rebuild & Restore */}
        <Animated.View style={[styles.benefitSection, benefit2Style]}>
          <Text style={styles.benefitTitle}>2. Restore your health</Text>
          
          <View style={styles.iconContainer}>
            <LottieView
              source={require('../../assets/onboarding-icons/Heart.lottie')}
              autoPlay
              loop
              style={styles.iconImage}
              speed={1}
            />
          </View>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>💚</Text>
              </View>
              <Text style={styles.benefitText}>Allow nails and skin to heal and recover</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>🦷</Text>
              </View>
              <Text style={styles.benefitText}>Prevent damage to your teeth and gums</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>🛡️</Text>
              </View>
              <Text style={styles.benefitText}>Reduce your risk of infections</Text>
            </View>
          </View>
        </Animated.View>

        {/* Nayl Features Showcase */}
        <Animated.View style={[styles.featuresSection, benefit2Style]}>
          <Text style={styles.featuresTitle}>Your Nayl Toolkit</Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🚨</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Panic Button</Text>
                <Text style={styles.featureDescription}>Instantly access support when you feel tempted</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🏆</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Achievements</Text>
                <Text style={styles.featureDescription}>Unlock badges as you reach milestones</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📊</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Progress Tracking</Text>
                <Text style={styles.featureDescription}>Visual progress bars and streak counters</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🧘</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Meditation & Sounds</Text>
                <Text style={styles.featureDescription}>Relaxation tools to manage triggers</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Benefit Section 3: Build Confidence */}
        <Animated.View style={[styles.benefitSection, benefit3Style]}>
          <Text style={styles.benefitTitle}>3. Build unshakeable confidence</Text>
          
          <View style={styles.iconContainer}>
            <LottieView
              source={require('../../assets/onboarding-icons/Champion.lottie')}
              autoPlay
              loop
              style={styles.iconImage}
              speed={1}
            />
          </View>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>👑</Text>
              </View>
              <Text style={styles.benefitText}>Feel proud of your hands and appearance</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>🚀</Text>
              </View>
              <Text style={styles.benefitText}>Overcome a habit that held you back</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletIcon}>💎</Text>
              </View>
              <Text style={styles.benefitText}>Prove to yourself that you can change</Text>
            </View>
          </View>
        </Animated.View>

        {/* Premium Rating Section */}
        <Animated.View style={[styles.ratingSection, testimonialStyle]}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
          </View>
        </Animated.View>

        {/* Floating Testimonial Quote */}
        <Animated.View style={[styles.testimonialSection, testimonialStyle]}>
          <Text style={styles.testimonialText}>
            "I've been biting my nails for 20 years and thought I'd never stop. Nayl's tools and community helped me finally quit for good."
          </Text>
          <Text style={styles.testimonialAuthor}>- Jessica P. (28F)</Text>
        </Animated.View>

        {/* Special Discount Section */}
        <Animated.View style={[styles.discountSection, discountStyle]}>
          <View style={styles.discountCard}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={styles.discountGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.discountTitle}>Special Discount!</Text>
              <Text style={styles.discountText}>Get 80% off Nayl Pro</Text>
              <TouchableOpacity style={styles.claimNowButton} activeOpacity={0.8}>
                <Text style={styles.claimNowButtonText}>Claim Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Final Call-to-Action */}
        <Animated.View style={[styles.ctaSection, ctaStyle]}>
          <TouchableOpacity
            style={styles.startJourneyButton}
            onPress={handleStartJourney}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Start rewiring</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 60,
    backgroundColor: 'transparent',
    width: '100%',
    minHeight: '100%',
    zIndex: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  personalizedHeadline: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: 0.3,
    marginBottom: 20,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  targetDateSubheadline: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.2,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
  targetDateText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.1,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    zIndex: 10,
  },
  benefitSection: {
    marginBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  benefitTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: 0.3,
    marginBottom: 40,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  iconContainer: {
    width: 200,
    height: 200,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  iconPlaceholder: {
    fontSize: 120,
    textAlign: 'center',
  },
  benefitsList: {
    width: '100%',
    maxWidth: 320,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  bulletPoint: {
    width: 32,
    height: 32,
    marginRight: 16,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletIcon: {
    fontSize: 20,
    marginTop: 4,
  },
  benefitText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#F1F5F9',
    lineHeight: 26,
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    zIndex: 10,
  },
  featuresSection: {
    marginBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 0.3,
    marginBottom: 36,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E2E8F0',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  testimonialSection: {
    marginBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  testimonialTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.4,
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
  testimonialCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  testimonialText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 28,
    letterSpacing: 0.1,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    zIndex: 10,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 0.2,
    zIndex: 10,
  },
  ratingSection: {
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  ratingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingStars: {
    fontSize: 24,
    letterSpacing: 2,
  },
  discountSection: {
    marginBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  discountCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  discountGradient: {
    padding: 20,
    alignItems: 'center',
  },
  discountTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  discountText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.1,
  },
  claimNowButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  claimNowButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  startJourneyButton: {
    width: width * 0.85,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
    zIndex: 10,
  },
  bottomSpacing: {
    height: 40,
  },
  recoveryBenefitPillsSection: {
    marginBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  recoveryBenefitPillsContainer: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  recoveryBenefitPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  recoveryBenefitPillsRowMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '120%',
    marginLeft: '-10%',
    marginBottom: 20,
  },
  recoveryBenefitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  recoveryBenefitPillMiddle: {
    width: '30%',
    marginHorizontal: '2%',
  },
  recoveryBenefitPillWide: {
    width: '48%',
    marginBottom: 0,
  },
  recoveryPillBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  recoveryPillPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  recoveryPillGold: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  recoveryPillGreen: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  recoveryPillTeal: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  recoveryPillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  recoveryPillIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  recoveryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    lineHeight: 12,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    zIndex: 10,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    width: 1.5, // Much smaller for subtlety
    height: 1.5, // Much smaller for subtlety
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
    opacity: 0.7,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star7: {
    top: '35%',
    left: '70%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star8: {
    top: '50%',
    right: '60%',
    opacity: 0.6,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star9: {
    top: '20%',
    left: '50%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star10: {
    top: '70%',
    left: '80%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star11: {
    top: '30%',
    left: '85%',
    opacity: 0.8,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star12: {
    top: '80%',
    left: '25%',
    opacity: 0.6,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star13: {
    top: '10%',
    left: '10%',
    opacity: 0.8,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star14: {
    top: '20%',
    right: '20%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star15: {
    top: '40%',
    left: '30%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star16: {
    top: '60%',
    right: '30%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star17: {
    top: '80%',
    left: '40%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star18: {
    top: '90%',
    right: '40%',
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star19: {
    top: '5%',
    left: '60%',
    opacity: 0.8,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star20: {
    top: '15%',
    right: '10%',
    opacity: 0.9,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
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
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star47: {
    top: '17%',
    right: '40%',
    opacity: 0.9,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
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
});

export default PersonalizedPlanScreen;
