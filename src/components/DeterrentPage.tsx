import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { typography, body } from '../constants/typography';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryBackground: '#000000',
  primaryText: '#FFFFFF',
  secondaryText: '#B0B8C4',
};

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

interface DeterrentPageProps {
  icon: any;
  title: string;
  description: string;
  onBack: () => void;
}

const DeterrentPage: React.FC<DeterrentPageProps> = ({
  icon,
  title,
  description,
  onBack,
}) => {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBack();
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['#000000', '#0A0A12', '#0F0F1A']}
        style={styles.backgroundGradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="chevron-back" size={28} color={COLORS.primaryText} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <Image source={icon} style={styles.icon} resizeMode="contain" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  iconContainer: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 140,
    height: 140,
  },
  title: {
    ...typography.h1,
    color: COLORS.primaryText,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 36,
  },
  description: {
    ...body,
    color: COLORS.secondaryText,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: width - SPACING.lg * 2,
    letterSpacing: 0.2,
  },
});

export default DeterrentPage;
