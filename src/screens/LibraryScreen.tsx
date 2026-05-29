import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { body, caption } from '../constants/typography';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { useTheme, useThemeGuaranteed } from '../context/ThemeContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useMeditation } from '../context/MeditationContext';

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

type LibraryStackParamList = {
  LibraryMain: undefined;
  Achievements: undefined;
  RelaxationSound: { soundType: string };
  Learning: undefined;
  Articles: undefined;
  ArticleDetail: { articleId: string };
  Meditation: undefined;
};

interface LibraryScreenProps {
  navigation?: NavigationProp<LibraryStackParamList>;
}

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<LibraryStackParamList>>();
  const { colors } = useThemeGuaranteed();
  const { isMeditationActive } = useMeditation();
  const insets = useSafeAreaInsets();
  
  // Animation values for button press effects
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const handleButtonPress = (callback: () => void) => {
    // Scale down animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Execute the callback
    callback();
  };

  // Star positions for randomized animation
  const [starPositions, setStarPositions] = useState(() => 
    Array.from({ length: 50 }, () => ({
      x: Math.random() * width * 2,
      y: Math.random() * height,
      opacity: Math.random() * 0.8 + 0.1,
      speed: Math.random() * 0.15 + 0.03,
      directionX: (Math.random() - 0.5) * 1.5,
      directionY: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.2 + 0.5,
    }))
  );

  // Animate starfield
  useEffect(() => {
    const starfieldInterval = setInterval(() => {
      setStarPositions(prevPositions => 
        prevPositions.map(star => {
          const newX = star.x + (star.directionX * star.speed);
          const newY = star.y + (star.directionY * star.speed);
          
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
    }, 20);

    return () => clearInterval(starfieldInterval);
  }, []);

  // Navigation handler with error handling
  const handleRelaxationNavigation = (soundType: string) => {
    try {
      console.log('🔍 Navigation debug info:');
      console.log('- Current navigation object:', navigation);
      console.log('- Attempting to navigate to RelaxationSound with type:', soundType);
      
      // Try the navigation
      navigation.navigate('RelaxationSound', { soundType });
      
      console.log('✅ Navigation call completed successfully');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      console.error('🚨 Navigation failed. This suggests a deeper navigation setup issue.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
      {/* Premium Background with Gradient */}
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.backgroundContainer}
      >
        {/* Subtle starfield effect */}
        {starPositions.map((star, index) => (
          <Animated.View
            key={index}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                opacity: star.opacity,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
              },
            ]}
          />
        ))}
      </LinearGradient>

      {/* Mountain Scene Background Image */}
      <View style={styles.mountainContainer}>
        <Image
          source={require('../../assets/mountain-scene-background.webp')}
          style={styles.mountainImage}
          resizeMode="cover"
          fadeDuration={0}
        />
        {/* Gradient overlay for smooth transition */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.mountainOverlay}
        />
      </View>

      {/* Header - ABSOLUTE POSITIONING to prevent jolting */}
      <View style={[styles.header, { top: insets.top + 20 }]}>
        <Text style={[styles.screenTitle, { color: colors.primaryText }]}>Library</Text>
        <TouchableOpacity style={styles.websiteButton}>
          <Text style={[styles.websiteText, { color: colors.primaryText }]}>Website</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Content - ABSOLUTE POSITIONING to prevent jolting */}
      <ScrollView 
        style={[styles.content, { top: insets.top + 320 }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Four Main Buttons - Premium Glassmorphic Design */}
        <View style={styles.categoriesContainer}>
          {/* Articles Button */}
          <TouchableOpacity 
            style={styles.categoryButton} 
            onPress={() => handleButtonPress(() => navigation.navigate('Articles'))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(220, 38, 38, 0.85)',
                'rgba(185, 28, 28, 0.9)',
                'rgba(153, 27, 27, 0.95)',
              ]}
              locations={[0, 0.5, 1]}
              style={styles.categoryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Glassmorphic overlay */}
              <View style={styles.glassOverlay} />
              
              {/* Top highlight for depth */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0)']}
                style={styles.topHighlight}
              />
              
              {/* Bottom shadow for depth */}
              <View style={styles.bottomShadow} />
              
              <View style={styles.categoryButtonContent}>
                <Text style={styles.categoryLabel}>Articles</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Leaderboard Button */}
          <TouchableOpacity 
            style={styles.categoryButton} 
            onPress={() => handleButtonPress(() => navigation.navigate('Achievements'))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(59, 130, 246, 0.85)',
                'rgba(37, 99, 235, 0.9)',
                'rgba(29, 78, 216, 0.95)',
              ]}
              locations={[0, 0.5, 1]}
              style={styles.categoryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Glassmorphic overlay */}
              <View style={styles.glassOverlay} />
              
              {/* Top highlight for depth */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0)']}
                style={styles.topHighlight}
              />
              
              {/* Bottom shadow for depth */}
              <View style={styles.bottomShadow} />
              
              <View style={styles.categoryButtonContent}>
                <Text style={styles.categoryLabel}>Leaderboard</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Learn Button */}
          <TouchableOpacity 
            style={styles.categoryButton} 
            onPress={() => handleButtonPress(() => navigation.navigate('Learning'))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(16, 185, 129, 0.85)',
                'rgba(5, 150, 105, 0.9)',
                'rgba(4, 120, 87, 0.95)',
              ]}
              locations={[0, 0.5, 1]}
              style={styles.categoryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Glassmorphic overlay */}
              <View style={styles.glassOverlay} />
              
              {/* Top highlight for depth */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0)']}
                style={styles.topHighlight}
              />
              
              {/* Bottom shadow for depth */}
              <View style={styles.bottomShadow} />
              
              <View style={styles.categoryButtonContent}>
                <Text style={styles.categoryLabel}>Learn</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Wellness Button */}
          <TouchableOpacity 
            style={styles.categoryButton} 
            onPress={() => handleButtonPress(() => navigation.navigate('Meditation'))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(245, 158, 11, 0.85)',
                'rgba(217, 119, 6, 0.9)',
                'rgba(180, 83, 9, 0.95)',
              ]}
              locations={[0, 0.5, 1]}
              style={styles.categoryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Glassmorphic overlay */}
              <View style={styles.glassOverlay} />
              
              {/* Top highlight for depth */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0)']}
                style={styles.topHighlight}
              />
              
              {/* Bottom shadow for depth */}
              <View style={styles.bottomShadow} />
              
              <View style={styles.categoryButtonContent}>
                <Text style={styles.categoryLabel}>Wellness</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Content Cards */}
        <View style={styles.contentCardsContainer}>
          {/* Content cards removed - The Science of Habit Formation and Mindfulness Techniques */}
        </View>

        {/* Relaxation Noises Section */}
        <View style={styles.relaxationSection}>
          <Text style={styles.sectionTitle}>Relaxation Noises</Text>
          <Text style={styles.sectionSubtitle}>Helping your heart-rate regulate when urges surge.</Text>
          
          <View style={styles.relaxationGrid}>
            <TouchableOpacity style={styles.relaxationItem} onPress={() => handleRelaxationNavigation('rain')}>
              <View style={styles.relaxationIconContainer}>
                <Image 
                  source={require('../../assets/library-sound-icons/rain-icon.webp')} 
                  style={styles.relaxationIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.relaxationLabel}>Rain</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.relaxationItem} onPress={() => handleRelaxationNavigation('sea')}>
              <View style={styles.relaxationIconContainer}>
                <Image 
                  source={require('../../assets/library-sound-icons/new-sea-icon.webp')} 
                  style={styles.relaxationIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.relaxationLabel}>Ocean Waves</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.relaxationItem} onPress={() => handleRelaxationNavigation('campfire')}>
              <View style={styles.relaxationIconContainer}>
                <Image 
                  source={require('../../assets/library-sound-icons/new-campfire-icon.webp')} 
                  style={styles.relaxationIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.relaxationLabel}>Campfire</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.relaxationItem} onPress={() => handleRelaxationNavigation('white-noise')}>
              <View style={styles.relaxationIconContainer}>
                <Image 
                  source={require('../../assets/library-sound-icons/white-noise-icon.webp')} 
                  style={styles.relaxationIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.relaxationLabel}>White Noise</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard Section */}
        <View style={styles.leaderboardSection}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <Text style={styles.leaderboardRank}>You are #207</Text>
          </View>
          
          <View style={styles.leaderboardList}>
            <View style={styles.leaderboardItem}>
              <View style={styles.rankContainer}>
                <Ionicons name="medal" size={24} color="#FFD700" />
                <Text style={styles.leaderboardName}>Vincent</Text>
              </View>
              <View style={[styles.rankBadge, styles.goldBadge]}>
                <Text style={styles.rankBadgeText}>339 days</Text>
              </View>
            </View>

            <View style={styles.leaderboardItem}>
              <View style={styles.rankContainer}>
                <Ionicons name="medal" size={24} color="#C0C0C0" />
                <Text style={styles.leaderboardName}>Oscar</Text>
              </View>
              <View style={[styles.rankBadge, styles.silverBadge]}>
                <Text style={styles.rankBadgeText}>269 days</Text>
              </View>
            </View>

            <View style={styles.leaderboardItem}>
              <View style={styles.rankContainer}>
                <Ionicons name="medal" size={24} color="#CD7F32" />
                <Text style={styles.leaderboardName}>Owen</Text>
              </View>
              <View style={[styles.rankBadge, styles.bronzeBadge]}>
                <Text style={styles.rankBadgeText}>256 days</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // Background should be behind everything
  },
  star: {
    position: 'absolute',
    backgroundColor: COLORS.primaryText,
    zIndex: 1, // Stars above background
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    zIndex: 20, // Header above everything
  },
  screenTitle: {
    ...TYPOGRAPHY.headingLarge,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...SHADOWS.button,
  },
  websiteText: {
    ...body,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  mountainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300, // Match exactly with mountainImage height
    zIndex: 5, // Above background and stars, below header
  },
  mountainImage: {
    width: '100%',
    height: 300, // Fixed height to prevent jolting
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  mountainOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 6, // Above the mountain image
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
  },
  contentContainer: {
    paddingBottom: SPACING.xxl, // Add padding at the bottom for the last section
  },

  contentCardsContainer: {
    marginBottom: SPACING.xl,
  },
  contentCard: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondaryAccent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  contentCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  contentCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentCardMeta: {
    flex: 1,
  },
  contentCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryText,
    marginBottom: SPACING.xs,
  },
  contentCardSubtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: SPACING.sm,
  },
  contentCardDescription: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  contentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentCardReadTime: {
    fontSize: 12,
    color: COLORS.mutedText,
  },
  contentCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentCardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryAccent,
    marginRight: SPACING.xs,
  },
  relaxationSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.primaryText,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    ...body,
    color: COLORS.secondaryText,
    marginBottom: SPACING.lg,
  },
  relaxationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  relaxationItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  relaxationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  relaxationIcon: {
    width: '100%',
    height: '100%',
  },
  relaxationLabel: {
    ...body,
    color: COLORS.primaryText,
    textAlign: 'center',
  },
  leaderboardSection: {
    marginBottom: SPACING.xxl,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  leaderboardRank: {
    ...body,
    color: COLORS.primaryAccent,
    fontWeight: '600',
  },
  leaderboardList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardName: {
    ...body,
    color: COLORS.primaryText,
    marginLeft: SPACING.sm,
  },
  rankBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.md,
  },
  goldBadge: {
    backgroundColor: '#FFD700',
  },
  silverBadge: {
    backgroundColor: '#C0C0C0',
  },
  bronzeBadge: {
    backgroundColor: '#CD7F32',
  },
  rankBadgeText: {
    ...caption,
    color: '#000000',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  categoryButton: {
    width: '48%',
    marginBottom: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    // Enhanced shadow for premium depth
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  // Glassmorphic frosted glass effect
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  // Top highlight for 3D depth
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 2,
  },
  // Bottom shadow for inset effect
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 2,
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
});

export default LibraryScreen;
