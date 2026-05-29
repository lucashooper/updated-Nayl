import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { typography, body, bodySmall, caption, buttonText } from '../constants/typography';
import { usePanicModal } from '../context/PanicModalContext';
import DeterrentPage from './DeterrentPage';
import * as HapticTypewriter from '../../modules/expo-haptic-typewriter';

const { width, height } = Dimensions.get('window');

// Color constants
const COLORS = {
  primaryBackground: '#000000',
  overlayBackground: 'rgba(0, 0, 0, 0.95)',
  primaryAccent: '#C1FF72',
  destructiveAction: '#BA2222',
  primaryText: '#FFFFFF',
  secondaryText: '#A9A9A9',
  mutedText: '#6B7280',
  cardBackground: '#1F2937',
  warningRed: '#EF4444',
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

// Premium typewriter component with native Core Haptics - ultra-smooth performance
const TypewriterText: React.FC<{ 
  messages: string[]; 
  speed?: number; 
  onComplete?: () => void;
  isVisible: boolean;
}> = ({ 
  messages, 
  speed = 4,
  onComplete,
  isVisible
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const charIndexRef = useRef(0);

  useEffect(() => {
    if (!isVisible) {
      // Clean up when not visible
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      HapticTypewriter.stopTypewriterHaptics();
      setDisplayedText('');
      return;
    }

    // Reset state
    currentIndexRef.current = 0;
    charIndexRef.current = 0;
    setDisplayedText('');

    const typeNextCharacter = () => {
      const currentMessage = messages[currentIndexRef.current];

      if (!currentMessage) return;

      if (charIndexRef.current < currentMessage.length) {
        // Type next character
        setDisplayedText(prev => currentMessage.slice(0, charIndexRef.current + 1));

        // Try native haptic first, fallback to Expo Haptics
        try {
          HapticTypewriter.tickCharacter();
        } catch {
          // Fallback for Expo Go
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        charIndexRef.current++;
      } else {
        // Message complete
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        if (currentIndexRef.current < messages.length - 1) {
          // Quick pause for seamless flow
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          timeoutRef.current = setTimeout(() => {
            currentIndexRef.current++;
            charIndexRef.current = 0;
            setDisplayedText('');
            
            // Start next message
            intervalRef.current = setInterval(typeNextCharacter, speed);
          }, 600);
        } else {
          // All messages complete
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onComplete?.();
        }
      }
    };

    // Start typing
    intervalRef.current = setInterval(typeNextCharacter, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      HapticTypewriter.stopTypewriterHaptics();
    };
  }, [isVisible]); // Only depend on isVisible to prevent infinite loops

  return (
    <View style={styles.typewriterContainer}>
      <Text style={styles.warningText}>
        {displayedText}
      </Text>
    </View>
  );
};

const PanicModal: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { isPanicModalVisible, setIsPanicModalVisible } = usePanicModal();
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [viewingDetail, setViewingDetail] = useState<'bacteria' | 'enamel' | 'anxiety' | null>(null);
  
  // Define all callbacks at the top level to ensure consistent hook order
  const handleTypewriterComplete = useCallback(() => {
    setTypewriterComplete(true);
  }, []);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPanicModalVisible(false);
  }, [setIsPanicModalVisible]);

  const handleKeepGoing = useCallback(() => {
    // Strong success haptic for positive action
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Additional heavy impact for emphasis
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 100);
    setIsPanicModalVisible(false);
  }, [setIsPanicModalVisible]);

  const handleUrges = useCallback(() => {
    // Strong error haptic for urge acknowledgment
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // Additional heavy impact for emphasis
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 100);
    // Could add additional logic here for handling urges
  }, []);

  const handleLearnMore = useCallback((type: 'bacteria' | 'enamel' | 'anxiety') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setViewingDetail(type);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewingDetail(null);
  }, []);
  
  // Trigger typewriter effect when modal opens
  useEffect(() => {
    if (isPanicModalVisible) {
      setShowTypewriter(true);
      setTypewriterComplete(false);
    } else {
      setShowTypewriter(false);
      setTypewriterComplete(false);
    }
  }, [isPanicModalVisible]);

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!isPanicModalVisible) {
      // Reset all state when modal closes
      setShowTypewriter(false);
      setTypewriterComplete(false);
      
      // The TypewriterText component will automatically stop all animations
      // when isVisible becomes false, preventing ongoing vibrations
    }
  }, [isPanicModalVisible]);
  
  if (!isPanicModalVisible) return null;

  // Define deterrent data
  const deterrentData = {
    bacteria: {
      icon: require('../../assets/see-images-page/bacteria.webp'),
      title: "Harmful Bacteria",
      description: "Your nails and fingers come into contact with countless surfaces throughout the day, collecting harmful bacteria, viruses, and other pathogens. When you bite your nails, you're directly transferring these microorganisms into your mouth, which can lead to infections, illness, and other health complications."
    },
    enamel: {
      icon: require('../../assets/see-images-page/damaged-enamel-icon.webp'),
      title: "Damaged Tooth Enamel",
      description: "Nail biting can cause significant damage to your tooth enamel, the protective outer layer of your teeth. This damage can lead to increased sensitivity, cavities, and even tooth fractures. The constant pressure and friction from biting can also cause your teeth to shift or become misaligned over time."
    },
    anxiety: {
      icon: require('../../assets/see-images-page/anxiety-loop.webp'),
      title: "Anxiety Reinforcement Loop",
      description: "Nail biting creates a vicious cycle that actually reinforces anxiety rather than relieving it. While it may provide temporary relief, the habit strengthens the neural pathways that associate stress with biting, making the urge stronger over time. This creates a self-perpetuating cycle where anxiety triggers biting, and biting reinforces anxiety, making it increasingly difficult to break free from both the habit and the underlying stress."
    }
  };

  const warningMessages = [
    { text: "Biting can damage your teeth enamel.", type: 'enamel' as const },
    { text: "Your nails are full of harmful bacteria.", type: 'bacteria' as const },
    { text: "Biting your nails can reinforce anxiety.", type: 'anxiety' as const }
  ];

  return (
    <View style={styles.overlay}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Close button positioned absolutely */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={COLORS.primaryText} />
        </TouchableOpacity>

        {/* Main Warning Text with Typewriter Effect */}
        <View style={styles.warningContainer}>
          {showTypewriter ? (
            <TypewriterText 
              key={`typewriter-${isPanicModalVisible}`}
              messages={[
                "STOP\nYOU MADE A\nPROMISE TO\nYOURSELF.",
                "IS THE SHORT\nRELIEF WORTH\nTHE SHAME?",
                "YOU CAN DO THIS,\nYOU ARE NOT\nALONE."
              ]}
              speed={4}
              onComplete={handleTypewriterComplete}
              isVisible={showTypewriter}
            />
          ) : (
            <Text style={styles.warningText}>
              STOP{'\n'}
              YOU MADE A{'\n'}
              PROMISE TO{'\n'}
              YOURSELF.
            </Text>
          )}
        </View>

        {/* Encouraging Message - show immediately */}
        <View style={styles.encouragingContainer}>
          <Text style={styles.encouragingText}>
            Keep going, the urge to bite will pass...
          </Text>
        </View>

        {/* Warning Messages - show immediately */}
        <View style={styles.warningsContainer}>
          {warningMessages.map((message, index) => (
            <View key={index} style={styles.warningBox}>
              <View style={styles.warningContentContainer}>
                <Image 
                  source={deterrentData[message.type].icon} 
                  style={styles.warningIcon}
                  resizeMode="contain"
                />
                <Text style={styles.warningBoxText}>{message.text}</Text>
              </View>
                                   <View style={styles.warningIconContainer}>
                   {message.type ? (
                     <TouchableOpacity
                       style={styles.learnMoreButton}
                       onPress={() => handleLearnMore(message.type!)}
                     >
                       <Ionicons name="arrow-forward" size={16} color={COLORS.primaryAccent} />
                     </TouchableOpacity>
                   ) : (
                     <Ionicons name="warning" size={16} color="#F59E0B" />
                   )}
                 </View>
            </View>
          ))}
        </View>

        {/* View Your Reasons Button */}
        {navigation && (
          <TouchableOpacity 
            style={styles.viewReasonsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsPanicModalVisible(false);
              navigation.navigate('Reasons');
            }}
          >
            <LinearGradient
              colors={['rgba(147, 51, 234, 0.25)', 'rgba(147, 51, 234, 0.15)']}
              style={styles.viewReasonsGradient}
            >
              <Ionicons name="heart" size={20} color="#9333EA" />
              <Text style={styles.viewReasonsText}>View Your Reasons for Changing</Text>
              <Ionicons name="chevron-forward" size={16} color="#9333EA" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Trigger Warning - show immediately */}
        <View style={styles.triggerWarningContainer}>
          <Text style={styles.triggerWarningText}>See images (Trigger warning)</Text>
        </View>

        {/* Action Buttons - show immediately */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.keepGoingButton} onPress={handleKeepGoing}>
            <LinearGradient
              colors={['#A3E635', '#16A34A']}
              style={styles.keepGoingGradient}
            >
              <Text style={styles.keepGoingText}>Keep Going</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.urgesButton} onPress={handleUrges}>
            <LinearGradient
              colors={['#EF4444', '#991B1B']}
              style={styles.urgesGradient}
            >
              <Text style={styles.urgesText}>I'm getting urges</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Conditional rendering for DeterrentPage */}
      {viewingDetail && (
        <DeterrentPage
          icon={deterrentData[viewingDetail].icon}
          title={deterrentData[viewingDetail].title}
          description={deterrentData[viewingDetail].description}
          onBack={handleBackFromDetail}
        />
      )}
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
    backgroundColor: COLORS.overlayBackground,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl, // Add top padding for the close button
    paddingBottom: SPACING.lg, // Standard bottom padding
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  warningContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    minHeight: 200, // Fixed height to prevent layout shifts
  },
  warningText: {
    ...body,
    color: COLORS.primaryText,
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 1,
  },
  cursor: {
    color: COLORS.primaryAccent,
    fontWeight: '900',
    fontSize: 36,
    textShadowColor: COLORS.primaryAccent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  encouragingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  encouragingText: {
    ...body,
    color: COLORS.primaryText,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningsContainer: {
    marginBottom: SPACING.lg,
  },
  warningBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    marginBottom: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  warningContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
            warningIcon: {
            width: 32,
            height: 32,
            marginRight: SPACING.sm,
          },
  warningBoxText: {
    ...body,
    color: COLORS.primaryText,
    flex: 1,
  },
  warningCloseButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIconContainer: {
    width: 80,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreButton: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(193, 255, 114, 0.2)',
    borderRadius: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },

  viewReasonsButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewReasonsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    borderRadius: SPACING.md,
  },
  viewReasonsText: {
    ...body,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  triggerWarningContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  triggerWarningText: {
    ...bodySmall,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    gap: SPACING.md,
  },
  keepGoingButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  keepGoingGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  keepGoingText: {
    ...buttonText,
    color: COLORS.primaryText, // Changed from COLORS.primaryBackground to white
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  urgesButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  urgesGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  urgesText: {
    ...buttonText,
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  typewriterContainer: {
    alignItems: 'center',
    minHeight: 200, // Fixed height to prevent layout shifts
    justifyContent: 'center',
  },
});

export default PanicModal; 