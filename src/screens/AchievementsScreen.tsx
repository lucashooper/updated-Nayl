import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAchievements } from '../context/AchievementContext';
import { TYPOGRAPHY } from '../constants/theme';
import { typography } from '../constants/typography';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import AchievementOverlay from '../components/AchievementOverlay';
import AchievementSkeleton from '../components/AchievementSkeleton';
import ScreenSkeleton from '../components/ScreenSkeleton';
import achievementService from '../services/achievementService';
import { DatabaseAchievement } from '../services/achievementService';

const { width, height } = Dimensions.get('window');

// Color constants
const COLORS = {
  primaryBackground: '#000000',
  secondaryBackground: '#0F172A',
  cardBackground: '#1F2937',
  primaryAccent: '#C1FF72',
  secondaryAccent: '#0A4F6B',
  destructiveAction: '#BA2222',
  primaryText: '#FFFFFF',
  secondaryText: '#A9A9A9',
  mutedText: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#0EA5E9',
  deepIndigo: '#1E1B4B',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  purple: '#8B5CF6',
  pink: '#EC4899',
  blue: '#3B82F6',
  green: '#10B981',
};

// Spacing constants
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

interface AchievementBadgeProps {
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  gradientColors: readonly [string, string, ...string[]];
  icon: keyof typeof Ionicons.glyphMap | 'custom' | string;
  iconSource?: any;
  isUnlocked: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps & { index: number }> = ({
  title,
  description,
  progress,
  maxProgress,
  gradientColors,
  icon,
  iconSource,
  isUnlocked,
  index,
}) => {
  const themeResult = useTheme();
  const colors = themeResult?.colors;
  
  if (!colors) return null;

  const styles = createStyles(colors);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // If achievement is locked, show a subtle hint
    if (!isUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.achievementBadge,
        isUnlocked && styles.achievementBadgeUnlocked
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.badgeContent}>
        <View style={styles.badgeIconContainer}>
          {isUnlocked ? (
            <>
              {iconSource ? (
                <Image 
                  source={iconSource} 
                  style={[
                    // Use larger icon style for small icons to match visual size
                    (title === 'Sprout' || title === 'The Oak') ? styles.customIconLarge : styles.customIcon
                  ]} 
                />
              ) : (
                // Handle emoji icons or any other icon type
                <View style={styles.customIcon}>
                  <Text style={styles.emojiIcon}>{icon}</Text>
                </View>
              )}

            </>
          ) : (
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={32} color="rgba(255, 255, 255, 0.4)" />
            </View>
          )}
        </View>
        
        <Text style={[
          styles.badgeTitle,
          isUnlocked && styles.badgeTitleUnlocked
        ]}>
          {title}
        </Text>
        
        <Text style={[
          styles.badgeProgress,
          isUnlocked && styles.badgeProgressUnlocked
        ]}>
          {isUnlocked ? `${progress}/${maxProgress} days` : `${maxProgress} days`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.primaryBackground,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  radialGradient: {
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    ...typography.displayMedium,
    color: themeColors.primaryText,
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: themeColors.primaryBackground,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    shadowColor: themeColors.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  progressContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle glow effect
    opacity: 0.5,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: themeColors.mutedText,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  contentContainer: {
    paddingBottom: SPACING.lg,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  achievementBadge: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    minHeight: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementBadgeUnlocked: {
    // No special styling for unlocked container - let the icon do the work
  },
  badgeContent: {
    alignItems: 'center',
    width: '100%',
  },
  badgeIconContainer: {
    marginBottom: SPACING.md,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    // Ensure all icons fill the exact same size container
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  emojiIcon: {
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 72,
  },
  // Larger icon style for small icons to match visual size of others
  customIconLarge: {
    width: 84, // Slightly larger for small icons to better match others
    height: 84,
    borderRadius: 44,
    resizeMode: 'cover',
    backgroundColor: 'transparent',
    // Center the larger icon within the 72x72 container
    position: 'absolute',
    top: -8, // Offset to center (88-72)/2 = 8
    left: -8,
  },
  // Larger container for small icons to match visual size of others

  lockIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Subtle gradient effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },


  badgeTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontSize: 13,
    color: COLORS.secondaryText,
    opacity: 0.8,
  },
  badgeTitleUnlocked: {
    color: themeColors.primaryText,
    fontWeight: '700',
    fontSize: 14,
    opacity: 1,
  },
  badgeProgress: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.mutedText,
    opacity: 0.7,
  },
  badgeProgressUnlocked: {
    color: themeColors.primaryText,
    fontWeight: '600',
    fontSize: 12,
    opacity: 0.9,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const themeResult = useTheme();
  const colors = themeResult?.colors;
  const insets = useSafeAreaInsets();
  
  // Loading state to prevent layout shifts
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  
  // NEW: Database achievements state for performance optimization
  const [databaseAchievements, setDatabaseAchievements] = useState<DatabaseAchievement[]>([]);
  
  // Get achievements from context (for overlay functionality)
  const {
    currentOverlay,
    isOverlayVisible,
    hideAchievementOverlay,
  } = useAchievements();
  
  // Local state for unlocked achievements (fallback)
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set([0, 1]));

  
  // Star positions for randomized animation
  const [starPositions, setStarPositions] = useState(() => 
    Array.from({ length: 100 }, () => ({
      x: Math.random() * width * 2,
      y: Math.random() * height,
      opacity: Math.random() * 0.9 + 0.15, // Enhanced opacity range: 0.15 to 1.05 for more variation
      speed: Math.random() * 0.15 + 0.03,
      directionX: (Math.random() - 0.5) * 2,
      directionY: (Math.random() - 0.5) * 2,
      size: Math.random() * 2.2 + 0.5, // Varied star sizes for depth
    }))
  );

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

  // Starfield animation
  useEffect(() => {
    // Randomized starfield animation - optimized for performance
    const starfieldInterval = setInterval(updateStarPositions, 50); // Reduced from 20ms to 50ms for better performance

    return () => {
      clearInterval(starfieldInterval);
    };
  }, [updateStarPositions]);

  // NEW: Load achievements using the optimized AchievementService
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        // LIGHTNING FAST: Show data instantly from memory
        const localAchievements = await achievementService.getLocalAchievements();
        setDatabaseAchievements(localAchievements);
        setIsDataReady(true);
        setIsLoading(false);
        
        // Background sync (non-blocking, user doesn't wait)
        setTimeout(async () => {
          try {
            await achievementService.initializeDefaultAchievements();
            const dbAchievements = await achievementService.getUserAchievements();
            setDatabaseAchievements(dbAchievements);
          } catch (dbError) {
            console.warn('Background sync failed, using local data:', dbError);
          }
        }, 50); // Minimal delay to not block UI
        
      } catch (error) {
        console.error('Error loading achievements:', error);
        setIsDataReady(true);
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, []);

  // NEW: Map database achievements to the expected format
  const mapDatabaseAchievementToDisplay = (dbAchievement: DatabaseAchievement) => {
    // Define gradient colors based on rarity
    const rarityColors = {
      common: ['#6B7280', '#9CA3AF', '#D1D5DB'] as const,
      rare: ['#3B82F6', '#60A5FA', '#93C5FD'] as const,
      epic: ['#8B5CF6', '#A78BFA', '#C4B5FD'] as const,
      legendary: ['#F59E0B', '#FBBF24', '#FCD34D'] as const,
    };

    // Static mapping for achievement icons to avoid dynamic require
    const iconMapping: Record<string, any> = {
      'sprout': require('../../assets/bigger-achievement-icons/Sprout-280px.png'),
      'the-oak': require('../../assets/bigger-achievement-icons/Da-Oak-280px.png'),
      'conqueror': require('../../assets/bigger-achievement-icons/Landmark-280px.png'),
      'sun-kissed': require('../../assets/bigger-achievement-icons/Sun-280px.png'),
      'deeply-rooted': require('../../assets/bigger-achievement-icons/Deeply-Rooted-280px.png'),
      'blossoming': require('../../assets/bigger-achievement-icons/Blossom-280px.png'),
    };

    return {
      id: dbAchievement.id,
      title: dbAchievement.title,
      description: dbAchievement.description,
      progress: dbAchievement.progress,
      maxProgress: dbAchievement.max_progress,
      gradientColors: rarityColors[dbAchievement.rarity],
      icon: 'custom' as const,
      iconSource: iconMapping[dbAchievement.achievement_id] || require('../../assets/bigger-achievement-icons/Sprout-280px.png'), // Fallback to sprout icon
      isUnlocked: dbAchievement.is_unlocked,
    };
  };

  // Enhanced safety check for theme colors
  if (!colors || 
      typeof colors !== 'object' || 
      !colors.primaryBackground || 
      !colors.primaryText ||
      !colors.backgroundGradient) {
    console.warn('⚠️ AchievementsScreen: Theme colors not ready, showing skeleton');
    return <ScreenSkeleton showHeader={true} showContent={true} />;
  }

  // Create styles with validated colors
  const styles = createStyles(colors);

  // LIGHTNING FAST: Show data immediately, no skeleton loading
  if (!isDataReady) {
    return (
      <View style={styles.container}>
        {/* Consistent background gradient */}
        <LinearGradient
          colors={colors.backgroundGradient}
          style={styles.backgroundGradient}
        />
        
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
                  opacity: star.opacity,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                }
              ]}
            />
          ))}
        </View>
        
        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.achievementsGrid}>
            {/* Empty state - will be replaced instantly */}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Use mapped achievements for display
  const achievements = databaseAchievements.map(mapDatabaseAchievementToDisplay);
  
  const unlockedCount = databaseAchievements.filter(a => a.is_unlocked).length;

  const unlockAchievement = async (index: number) => {
    if (!unlockedAchievements.has(index)) {
      setUnlockedAchievements(prev => new Set([...prev, index]));
      
      // Enhanced haptic feedback sequence for achievement unlock
      try {
        // Primary achievement unlock haptic
        await hapticService.trigger(HapticType.ACHIEVEMENT, HapticIntensity.PROMINENT);
        
        // Secondary success haptic after a short delay
        setTimeout(async () => {
          await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
        }, 200);
        
        // Final subtle confirmation haptic
        setTimeout(async () => {
          await hapticService.trigger(HapticType.SELECTION, HapticIntensity.SUBTLE);
        }, 400);
        
      } catch (error) {
        console.warn('Haptic feedback error:', error);
        // Fallback to basic haptics with multiple patterns
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 150);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 300);
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.backgroundGradient}
      />
      
      <View style={styles.starfield}>
        {starPositions.map((star, index) => (
          <View
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
              }
            ]}
          />
        ))}
      </View>
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color={colors.primaryText} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.primaryText }]}>
            Achievements
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#00D4FF', '#0099FF', '#0066FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill, 
                { width: `${(unlockedCount / achievements.length) * 100}%` }
              ]} 
            >
              <View style={styles.progressGlow} />
            </LinearGradient>
          </View>
          <Text style={styles.progressText}>
            {unlockedCount} of {achievements.length} achievements unlocked
          </Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <AchievementBadge
              key={index}
              {...achievement}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      {/* Achievement Overlay */}
      {currentOverlay && (
        <AchievementOverlay
          achievement={currentOverlay}
          isVisible={isOverlayVisible}
          onHide={hideAchievementOverlay}
        />
      )}
    </View>
  );
};