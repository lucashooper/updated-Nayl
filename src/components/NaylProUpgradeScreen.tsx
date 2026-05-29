import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
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
import iapService from '../services/iapService';
import { PurchasesPackage } from 'react-native-purchases';

// Replace these URLs with your actual hosted pages
const PRIVACY_POLICY_URL = 'https://nayl.app/privacy';
const TERMS_URL = 'https://nayl.app/terms';

const { width, height } = Dimensions.get('window');

interface NaylProUpgradeScreenProps {
  onUnlockPro: () => void;
}

type PlanId = 'weekly' | 'monthly' | 'yearly';

const PLAN_LABELS: Record<PlanId, { title: string; duration: string }> = {
  weekly: { title: 'Weekly', duration: '1 week' },
  monthly: { title: 'Monthly', duration: '1 month' },
  yearly: { title: 'Yearly', duration: '1 year' },
};

const NaylProUpgradeScreen: React.FC<NaylProUpgradeScreenProps> = ({
  onUnlockPro,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('weekly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [packages, setPackages] = useState<Record<string, PurchasesPackage>>({});

  // Fetch available packages from RevenueCat on mount
  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offering = await iapService.getOfferings();
        if (offering?.availablePackages) {
          const pkgMap: Record<string, PurchasesPackage> = {};
          for (const pkg of offering.availablePackages) {
            const id = pkg.packageType.toLowerCase();
            pkgMap[id] = pkg;
          }
          setPackages(pkgMap);
        }
      } catch {
        // Offerings may fail in development; the purchase will gracefully error too
      }
    };
    loadOfferings();
  }, []);

  const getPriceString = (planId: PlanId): string => {
    const pkg = packages[planId];
    if (pkg) return pkg.product.priceString;
    const fallbacks: Record<PlanId, string> = {
      weekly: '£2.99/week',
      monthly: '£8.99/month',
      yearly: '£33.99/year',
    };
    return fallbacks[planId];
  };

  // Animation values for entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(40);

  // Start animations on mount
  useEffect(() => {
    const startAnimations = () => {
      // Header animation (immediate)
      headerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

      // Icon animation (300ms delay)
      setTimeout(() => {
        iconOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        iconScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      }, 300);

      // Button animation (600ms delay)
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        buttonTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 600);
    };

    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const handleUnlockPro = async () => {
    try {
      setIsPurchasing(true);
      await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);

      const pkg = packages[selectedPlan];
      if (!pkg) {
        Alert.alert(
          'Unavailable',
          'Subscription products are not available right now. Please try again later.',
        );
        setIsPurchasing(false);
        return;
      }

      const result = await iapService.purchasePackage(pkg);

      if (result.userCancelled) {
        setIsPurchasing(false);
        return;
      }

      if (result.success) {
        onUnlockPro();
      } else {
        Alert.alert(
          'Purchase Failed',
          'Your purchase could not be completed. Please try again.',
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'An unexpected error occurred.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsRestoring(true);
      const result = await iapService.restorePurchases();
      if (result.success) {
        await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
        Alert.alert('Restored!', 'Your Nayl Pro subscription has been restored.', [
          { text: 'Continue', onPress: onUnlockPro },
        ]);
      } else {
        Alert.alert('No Subscription Found', 'We could not find an active subscription to restore.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Could not restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Subtle Floating Stars (same as PersonalizedPlanScreen) */}
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

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header Section */}
        <Animated.View style={[styles.headerSection, headerStyle]}>
          <Text style={styles.mainHeadline}>
            Unlock Nayl Pro
          </Text>
          <Text style={styles.subHeadline}>
            Invest in yourself
          </Text>
        </Animated.View>

        {/* App Icon Section - Moved higher up */}
        <Animated.View style={[styles.iconSection, iconStyle]}>
          <View style={styles.iconGlowContainer}>
            <Image
              source={require('../../assets/onboarding-icons/Nayl-cooler-logo.webp')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.iconSubtext}>
            Premium tools for lasting change
          </Text>
        </Animated.View>

        {/* Premium Features Showcase */}
        <Animated.View style={[styles.featuresSection, buttonStyle]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresScrollContainer}
          >
            <View style={styles.featureCard}>
              <View style={styles.featureCardHeader}>
                <Text style={styles.featureCardIcon}>🚨</Text>
                <Text style={styles.featureCardTitle}>Panic Button</Text>
              </View>
              <Text style={styles.featureCardDescription}>
                Instant support when tempted
              </Text>
              <View style={styles.featureCardStatus}>
                <Text style={styles.featureCardStatusText}>UNLOCKED</Text>
                <Text style={styles.featureCardStatusIcon}>🔓</Text>
              </View>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureCardHeader}>
                <Text style={styles.featureCardIcon}>🏆</Text>
                <Text style={styles.featureCardTitle}>Achievement System</Text>
              </View>
              <Text style={styles.featureCardDescription}>
                Celebrate milestones with badges
              </Text>
              <View style={styles.featureCardStatus}>
                <Text style={styles.featureCardStatusText}>UNLOCKED</Text>
                <Text style={styles.featureCardStatusIcon}>🔓</Text>
              </View>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureCardHeader}>
                <Text style={styles.featureCardIcon}>📊</Text>
                <Text style={styles.featureCardTitle}>Progress Analytics</Text>
              </View>
              <Text style={styles.featureCardDescription}>
                Visual insights into your progress
              </Text>
              <View style={styles.featureCardStatus}>
                <Text style={styles.featureCardStatusText}>UNLOCKED</Text>
                <Text style={styles.featureCardStatusIcon}>🔓</Text>
              </View>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureCardHeader}>
                <Text style={styles.featureCardIcon}>🧘</Text>
                <Text style={styles.featureCardTitle}>Meditation Library</Text>
              </View>
              <Text style={styles.featureCardDescription}>
                Guided sessions for stress relief
              </Text>
              <View style={styles.featureCardStatus}>
                <Text style={styles.featureCardStatusText}>UNLOCKED</Text>
                <Text style={styles.featureCardStatusIcon}>🔓</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Purchase Options Section */}
        <Animated.View style={[styles.purchaseSection, buttonStyle]}>
          <View style={styles.purchaseOverlay}>
            <View style={styles.purchaseOptionsContainer}>
              {/* Weekly Option */}
              <TouchableOpacity
                style={[styles.purchaseOption, selectedPlan === 'weekly' && styles.purchaseOptionSelected]}
                onPress={() => setSelectedPlan('weekly')}
                activeOpacity={0.8}
              >
                <View style={styles.popularTag}>
                  <Text style={styles.popularTagText}>most popular</Text>
                </View>
                <Text style={styles.purchaseOptionTitle}>Weekly</Text>
                <Text style={styles.purchaseOptionPrice}>{getPriceString('weekly')}</Text>
              </TouchableOpacity>

              {/* Yearly Option */}
              <TouchableOpacity
                style={[styles.purchaseOption, styles.purchaseOptionHighlighted, selectedPlan === 'yearly' && styles.purchaseOptionSelected]}
                onPress={() => setSelectedPlan('yearly')}
                activeOpacity={0.8}
              >
                <Text style={styles.purchaseOptionTitle}>Yearly</Text>
                <Text style={styles.purchaseOptionPrice}>{getPriceString('yearly')}</Text>
                <Text style={styles.purchaseOptionSavings}>Best value</Text>
              </TouchableOpacity>

              {/* Monthly Option */}
              <TouchableOpacity
                style={[styles.purchaseOption, selectedPlan === 'monthly' && styles.purchaseOptionSelected]}
                onPress={() => setSelectedPlan('monthly')}
                activeOpacity={0.8}
              >
                <Text style={styles.purchaseOptionTitle}>Monthly</Text>
                <Text style={styles.purchaseOptionPrice}>{getPriceString('monthly')}</Text>
              </TouchableOpacity>
            </View>

            {/* Unlock Button */}
            <TouchableOpacity
              style={[styles.unlockButton, isPurchasing && styles.unlockButtonDisabled]}
              onPress={handleUnlockPro}
              activeOpacity={0.8}
              disabled={isPurchasing}
            >
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Start rewiring now</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Auto-renewal disclosure (required by Guideline 3.1.2) */}
            <Text style={styles.subscriptionDisclosure}>
              {`Nayl Pro – ${PLAN_LABELS[selectedPlan].title} Plan\n`}
              {`Subscription length: ${PLAN_LABELS[selectedPlan].duration}. `}
              {'Payment will be charged to your Apple ID account at confirmation of purchase. '
              + 'Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. '
              + 'Account will be charged for renewal within 24 hours prior to the end of the current period. '
              + 'Manage or cancel your subscription in your Apple ID Account Settings.'}
            </Text>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={handleRestorePurchases}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator color="#94A3B8" size="small" />
                ) : (
                  <Text style={styles.footerLink}>Restore Purchase</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
                <Text style={styles.footerLink}>Terms & Conditions</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 10,
  },
  headerSection: {
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  mainHeadline: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 0.5,
    marginBottom: 12,
    zIndex: 10,
  },
  subHeadline: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.3,
    zIndex: 10,
  },
  iconSection: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: 0,
    paddingHorizontal: 24,
  },
  iconGlowContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
    marginBottom: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
  },
  iconSubtext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
  purchaseSection: {
    zIndex: 10,
    width: '100%',
  },
  purchaseOverlay: {
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 20,
    width: width,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 12,
  },
  unlockButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 12,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
  purchaseOptionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 4,
  },
  purchaseOption: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 70,
    minWidth: 80,
  },
  purchaseOptionHighlighted: {
    borderColor: '#7C3AED',
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  purchaseOptionSelected: {
    borderColor: '#8B5CF6',
    borderWidth: 3,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  popularTag: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    position: 'absolute',
    top: -6,
    left: 6,
    marginBottom: 0,
    minWidth: 60,
  },
  popularTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    lineHeight: 10,
    textAlign: 'center',
  },
  purchaseOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 6,
  },
  purchaseOptionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 1,
    textAlign: 'center',
  },
  purchaseOptionSelected: {
    borderColor: '#A855F7',
    borderWidth: 2,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  purchaseOptionSavings: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A855F7',
    textAlign: 'center',
    marginTop: 2,
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  subscriptionDisclosure: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
    gap: 2,
  },
  footerLink: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  footerDot: {
    marginHorizontal: 4,
    color: '#94A3B8',
    fontSize: 13,
  },
  featuresSection: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  featuresScrollContainer: {
    paddingHorizontal: 8,
  },
  featureCard: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 160,
    marginRight: 16,
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureCardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureCardDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureCardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  featureCardStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  featureCardStatusIcon: {
    fontSize: 14,
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
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star2: {
    top: '25%',
    right: '30%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star3: {
    top: '40%',
    left: '10%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star4: {
    top: '60%',
    right: '15%',
    opacity: 0.4,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    shadowColor: 'rgba(96, 165, 250, 0.6)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star5: {
    top: '75%',
    left: '40%',
    opacity: 0.3,
    backgroundColor: 'rgba(168, 85, 247, 0.6)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star6: {
    top: '85%',
    right: '25%',
    opacity: 0.4,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    shadowColor: 'rgba(59, 130, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star7: {
    top: '35%',
    left: '70%',
    opacity: 0.3,
    backgroundColor: 'rgba(147, 51, 234, 0.6)',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star8: {
    top: '50%',
    right: '60%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star9: {
    top: '20%',
    left: '50%',
    opacity: 0.4,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    shadowColor: 'rgba(96, 165, 250, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star10: {
    top: '70%',
    left: '80%',
    opacity: 0.3,
    backgroundColor: 'rgba(168, 85, 247, 0.6)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star11: {
    top: '30%',
    left: '85%',
    opacity: 0.4,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    shadowColor: 'rgba(59, 130, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star12: {
    top: '80%',
    left: '25%',
    opacity: 0.3,
    backgroundColor: 'rgba(147, 51, 234, 0.6)',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star13: {
    top: '10%',
    left: '10%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star14: {
    top: '20%',
    right: '20%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star15: {
    top: '40%',
    left: '30%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star16: {
    top: '60%',
    right: '30%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star17: {
    top: '80%',
    left: '40%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star18: {
    top: '90%',
    right: '40%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star19: {
    top: '5%',
    left: '60%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star20: {
    top: '15%',
    right: '10%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star21: {
    top: '25%',
    left: '80%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star22: {
    top: '45%',
    right: '5%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star23: {
    top: '55%',
    left: '90%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star24: {
    top: '65%',
    right: '45%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star25: {
    top: '75%',
    left: '5%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star26: {
    top: '85%',
    right: '70%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star27: {
    top: '95%',
    left: '70%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star28: {
    top: '8%',
    left: '40%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star29: {
    top: '18%',
    right: '50%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star30: {
    top: '28%',
    left: '15%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star31: {
    top: '38%',
    right: '80%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star32: {
    top: '48%',
    left: '75%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star33: {
    top: '58%',
    right: '15%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star34: {
    top: '68%',
    left: '55%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star35: {
    top: '78%',
    right: '90%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star36: {
    top: '88%',
    left: '25%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star37: {
    top: '12%',
    left: '85%',
    opacity: 0.4,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    shadowColor: 'rgba(96, 165, 250, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star38: {
    top: '22%',
    right: '25%',
    opacity: 0.3,
    backgroundColor: 'rgba(168, 85, 247, 0.6)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star39: {
    top: '32%',
    left: '45%',
    opacity: 0.5,
    backgroundColor: 'rgba(147, 51, 234, 0.7)',
    shadowColor: 'rgba(147, 51, 234, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star40: {
    top: '42%',
    right: '60%',
    opacity: 0.4,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    shadowColor: 'rgba(59, 130, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star41: {
    top: '52%',
    left: '20%',
    opacity: 0.3,
    backgroundColor: 'rgba(139, 92, 246, 0.6)',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star42: {
    top: '62%',
    right: '75%',
    opacity: 0.5,
    backgroundColor: 'rgba(96, 165, 250, 0.7)',
    shadowColor: 'rgba(96, 165, 250, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star43: {
    top: '72%',
    left: '65%',
    opacity: 0.4,
    backgroundColor: 'rgba(168, 85, 247, 0.8)',
    shadowColor: 'rgba(168, 85, 247, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star44: {
    top: '82%',
    right: '35%',
    opacity: 0.3,
    backgroundColor: 'rgba(147, 51, 234, 0.6)',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star45: {
    top: '92%',
    left: '35%',
    opacity: 0.5,
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star46: {
    top: '7%',
    left: '30%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star47: {
    top: '17%',
    right: '40%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star48: {
    top: '27%',
    left: '95%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star49: {
    top: '37%',
    right: '20%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star50: {
    top: '47%',
    left: '5%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
});

export default NaylProUpgradeScreen;
