import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAchievements } from '../context/AchievementContext';
import { SPACING } from '../constants/theme';
import { typography } from '../constants/typography';
import profileService, { ProfileData } from '../services/profileService';
import sessionService from '../services/sessionService';

const PRIVACY_POLICY_URL = 'https://nayl.app/privacy';
const SUPPORT_URL = 'https://nayl.app/support';

type ProfileStackParamList = {
  ProfileMain: undefined;
  Reasons: undefined;
  TriggerHistory: undefined;
};

interface ProfileScreenProps {
  navigation: NavigationProp<ProfileStackParamList>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors, isReady, currentTheme, setTheme } = useTheme();
  const { unlockedAchievements } = useAchievements();
  const insets = useSafeAreaInsets();
  
  // Profile data state
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    profile_name: 'Your Name',
    longest_streak_seconds: 0,
    consecutive_days: 0,
    total_days_logged_in: 0
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Check if theme context is ready
  if (!isReady || !colors) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading theme...</Text>
      </View>
    );
  }

  // Load basic profile data on mount
  useEffect(() => {
    loadBasicProfileData();
  }, []);

  const loadBasicProfileData = async () => {
    try {
      const existingProfile = await profileService.getProfileData();
      if (existingProfile) {
        setProfileData({
          profile_name: existingProfile.profile_name || 'Your Name',
          longest_streak_seconds: existingProfile.longest_streak_seconds || 0,
          consecutive_days: existingProfile.consecutive_days || 0,
          total_days_logged_in: existingProfile.total_days_logged_in || 0
        });
        
        if (existingProfile.profile_picture_url) {
          setProfileImage(existingProfile.profile_picture_url);
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleImageUpload = async (imageUri: string) => {
    try {
      setIsLoading(true);
      
      // Upload image to Supabase
      const uploadedUrl = await profileService.uploadProfilePicture(imageUri);
      
      // Update profile picture in database
      await profileService.updateProfilePicture(uploadedUrl);
      
      // Update local state
      setProfileImage(uploadedUrl);
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Upload Failed', `Failed to upload image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfileName = async () => {
    try {
      if (editingName && editingName.trim()) {
        const trimmedName = editingName.trim();
        
        // Save to database via profileService
        await profileService.updateProfileName(trimmedName);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          profile_name: trimmedName
        }));
        
        // Close modal
        setShowNameEditModal(false);
        setEditingName('');
        
        Alert.alert('Success', 'Profile name updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile name:', error);
      Alert.alert('Error', 'Failed to update profile name. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your Nayl data including your progress, photos, triggers, and achievements. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'All your data will be permanently deleted. You cannot recover it after this point.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsDeletingAccount(true);
                      await sessionService.deleteAllUserData();
                      Alert.alert(
                        'Account Deleted',
                        'Your data has been permanently deleted.',
                        [
                          {
                            text: 'OK',
                            onPress: () => navigation.navigate('Home' as never),
                          },
                        ],
                      );
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete your data. Please try again or contact support.');
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) {
      return '0m';
    }
    
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${totalSeconds}s`;
    }
  };
  
  return (
    <View style={{ flex: 1 }}>
      {/* Premium Background with Gradient - EXACTLY like HomeScreen */}
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.55, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // Ensure it's behind all content
        }}
      />
      
      {/* Starfield Animation - Enhanced */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
        {Array.from({ length: 60 }, (_, index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: Math.random() * 400,
              top: Math.random() * 800,
              width: Math.random() * 2.5 + 0.6,
              height: Math.random() * 2.5 + 0.6,
              backgroundColor: 'rgba(200, 200, 200, 0.7)',
              borderRadius: (Math.random() * 2.5 + 0.6) / 2,
              opacity: Math.random() * 0.6 + 0.15,
              shadowColor: 'rgba(255, 255, 255, 0.3)',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 1.5,
              elevation: 2,
            }}
          />
        ))}
      </View>

      {/* Header */}
      <View style={{ 
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        paddingTop: insets.top + 20,
        zIndex: 10,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: SPACING.md,
          position: 'relative',
        }}>
          {/* Back button positioned absolutely on the left */}
          <TouchableOpacity style={{
            position: 'absolute',
            left: 0,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }} onPress={() => navigation.navigate('Home' as never)}>
            <Ionicons name="chevron-back" size={28} color={colors.primaryText} />
          </TouchableOpacity>
          
          {/* Centered title */}
          <Text style={{ 
            ...typography.displayMedium,
            color: colors.primaryText,
            textAlign: 'center',
            fontSize: 36,
            fontWeight: '700',
            letterSpacing: 0.5,
            textShadowColor: colors.primaryBackground,
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
            shadowColor: colors.primaryAccent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
          }}>Profile</Text>
        </View>
      </View>

      {/* Profile Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Profile Info */}
        <View style={{ alignItems: 'center', paddingVertical: SPACING.lg }}>
          {/* Profile Image */}
          <TouchableOpacity 
            style={{ marginBottom: SPACING.lg }}
            onPress={() => {
              Alert.alert(
                'Choose Profile Picture',
                'How would you like to add a profile picture?',
                [
                  {
                    text: 'Take Photo',
                    onPress: () => takePhoto(),
                  },
                  {
                    text: 'Choose from Library',
                    onPress: () => pickImage(),
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ]
              );
            }}
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={{ 
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: colors.glassBorder,
                }}
                fadeDuration={0}
              />
            ) : (
              <View style={{ 
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.cardBackground,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: colors.glassBorder,
              }}>
                <Ionicons name="person" size={48} color={colors.secondaryText} />
              </View>
            )}
            <View style={{ 
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
            
            {/* Loading Overlay */}
            {isLoading && (
              <View style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.overlayBackground,
                borderRadius: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="cloud-upload" size={24} color={colors.primaryText} />
                <Text style={{ 
                  color: colors.primaryText,
                  fontSize: 12,
                  fontWeight: '500',
                  marginTop: SPACING.xs,
                }}>Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Profile Name - Now Editable */}
          <TouchableOpacity 
            onPress={() => {
              setEditingName(profileData.profile_name);
              setShowNameEditModal(true);
            }}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Text style={{ 
                fontSize: 28,
                fontWeight: '700',
                color: colors.primaryText,
                textAlign: 'center',
              }}>{profileData.profile_name}</Text>
              
              {/* Subtle pen icon for editing */}
              <Ionicons 
                name="pencil" 
                size={16} 
                color={colors.secondaryText} 
                style={{ 
                  marginLeft: SPACING.xs,
                  opacity: 0.6,
                }} 
              />
            </View>
          </TouchableOpacity>
          
          {/* Login Streak Display */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: SPACING.sm,
          }}>
            <Image 
              source={require('../../assets/new-flame-icon.webp')}
              style={{ 
                width: 16,
                height: 16,
                marginRight: SPACING.xs,
              }}
              fadeDuration={0}
            />
            <Text style={{ 
              fontSize: 16,
              color: '#FF6B35',
              fontWeight: '600',
              textAlign: 'center',
            }}>
              {`${profileData.consecutive_days} day login streak`}
            </Text>
          </View>
        </View>

        {/* Basic Stats */}
        <View style={{ flexDirection: 'row', marginBottom: SPACING.xl, gap: SPACING.md }}>
          <View style={{ 
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: SPACING.md,
            padding: SPACING.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: colors.primaryAccent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Text style={{ 
                fontSize: 24,
                fontWeight: '700',
                color: colors.primaryText,
                marginRight: SPACING.xs,
              }}>{profileData.consecutive_days}</Text>
              <Image 
                source={require('../../assets/new-flame-icon.webp')}
                style={{ 
                  width: 20,
                  height: 20,
                }}
                fadeDuration={0}
              />
            </View>
            <Text style={{ 
              fontSize: 14,
              color: colors.secondaryText,
              textAlign: 'center',
            }}>Consecutive Days</Text>
          </View>
          
          <View style={{ 
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: SPACING.md,
            padding: SPACING.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: colors.primaryAccent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Text style={{ 
                fontSize: 24,
                fontWeight: '700',
                color: colors.primaryText,
                marginRight: SPACING.xs,
              }}>{profileData.total_days_logged_in}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 14,
              color: colors.secondaryText,
              textAlign: 'center',
            }}>Total Days</Text>
          </View>
        </View>

        {/* Complex Streak Card with Gradients */}
        <View style={{ 
          marginBottom: SPACING.lg,
          borderRadius: SPACING.lg,
          overflow: 'hidden',
          elevation: 8,
          shadowColor: colors.primaryAccent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}>
          <LinearGradient
            colors={[
              'rgba(242, 0, 255, 0.95)',
              'rgba(200, 20, 120, 0.9)',
              'rgba(160, 40, 80, 0.9)',
              'rgba(220, 20, 60, 0.9)'
            ]}
            style={{ padding: SPACING.lg, borderRadius: SPACING.lg, overflow: 'hidden' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.3, 0.7, 1]}
          >
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: SPACING.sm,
            }}>
              <View style={{ 
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: SPACING.md,
              }}>
                <Image 
                  source={require('../../assets/cooler-trophy-icon.webp')}
                  style={{ width: 64, height: 64, resizeMode: 'contain' }}
                  fadeDuration={0}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 24,
                  color: colors.primaryText,
                  fontWeight: '800',
                  marginBottom: SPACING.xs,
                  textShadowColor: 'rgba(0, 0, 0, 0.4)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                  letterSpacing: 0.5,
                }}>Longest Streak</Text>
                <Text style={{ 
                  fontSize: 32,
                  color: '#FFD700',
                  fontWeight: '900',
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                  letterSpacing: 1,
                }}>
                  {formatTime(profileData.longest_streak_seconds)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Unlocked Achievements Row */}
        <View style={{ 
          marginBottom: SPACING.xl,
          paddingVertical: SPACING.lg,
        }}>
          <Text style={{ 
            fontSize: 18,
            color: colors.primaryText,
            fontWeight: '600',
            marginBottom: SPACING.md,
            textAlign: 'center',
          }}>
            Your Achievements
          </Text>
          
          <View style={{ 
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
          }}>
            {unlockedAchievements && Array.isArray(unlockedAchievements) && unlockedAchievements.length > 0 ? (
              <View style={{ 
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: SPACING.md,
              }}>
                {unlockedAchievements.map((achievement, index) => {
                  // Safety checks for achievement data
                  if (!achievement || typeof achievement !== 'object') {
                    return null;
                  }
                  
                  if (!achievement.id || !achievement.title) {
                    return null;
                  }
                  
                  return (
                    <View key={achievement.id || index} style={{ 
                      alignItems: 'center',
                      minWidth: 80,
                    }}>
                      {achievement.iconSource ? (
                        <Image 
                          source={achievement.iconSource}
                          style={{ 
                            width: 60, 
                            height: 60,
                            resizeMode: 'contain',
                            marginBottom: SPACING.xs,
                          }}
                          fadeDuration={0}
                        />
                      ) : (
                        <Text style={{ 
                          fontSize: 48,
                          marginBottom: SPACING.xs,
                        }}>
                          {achievement.icon && typeof achievement.icon === 'string' ? achievement.icon : '🏆'}
                        </Text>
                      )}
                      <Text style={{ 
                        fontSize: 12,
                        color: colors.secondaryText,
                        textAlign: 'center',
                        fontWeight: '500',
                      }}>
                        {achievement.title}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{ 
                alignItems: 'center',
                paddingVertical: SPACING.lg,
              }}>
                <Text style={{ 
                  fontSize: 16,
                  color: colors.secondaryText,
                  textAlign: 'center',
                  opacity: 0.7,
                }}>
                  Complete your first day to unlock achievements!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Reasons for Changing Card */}
        <View style={{ marginBottom: SPACING.lg, borderRadius: SPACING.lg, overflow: 'hidden' }}>
          <LinearGradient
            colors={[colors.cardBackground, colors.secondaryBackground]}
            style={{ padding: SPACING.lg }}
          >
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Reasons')}
            >
              <View style={{ 
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: SPACING.md,
                borderWidth: 1,
                borderColor: 'rgba(147, 51, 234, 0.3)',
              }}>
                <Ionicons name="heart" size={32} color="#9333EA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 18,
                  color: colors.primaryText,
                  fontWeight: '600',
                  marginBottom: SPACING.xs,
                }}>Reasons for Changing</Text>
                <Text style={{ 
                  fontSize: 14,
                  color: colors.secondaryText,
                }}>
                  Add your personal reasons for stopping nail biting
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Profile Options */}
        <View style={{ marginTop: SPACING.xl }}>
          <TouchableOpacity style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: SPACING.md,
            marginBottom: SPACING.sm,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: colors.primaryAccent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => navigation.navigate('TriggerHistory')}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="book-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Journal</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: SPACING.md,
            marginBottom: SPACING.sm,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: colors.primaryAccent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="settings-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: SPACING.md,
            marginBottom: SPACING.sm,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: colors.primaryAccent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="notifications-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: SPACING.md,
              marginBottom: SPACING.sm,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              shadowColor: colors.primaryAccent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="shield-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: SPACING.md,
              marginBottom: SPACING.sm,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              shadowColor: colors.primaryAccent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={() => Linking.openURL(SUPPORT_URL)}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          {/* Delete Account — required by App Store Guideline 5.1.1(v) */}
          <TouchableOpacity
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: SPACING.md,
              marginBottom: SPACING.sm,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.25)',
              elevation: 4,
            }}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: '#EF4444',
              fontWeight: '500',
              flex: 1,
            }}>
              {isDeletingAccount ? 'Deleting…' : 'Delete Account & Data'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Theme Switcher Section */}
        <View style={{ marginTop: SPACING.xl, marginBottom: SPACING.lg }}>
          <Text style={{ 
            fontSize: 20,
            color: colors.primaryText,
            fontWeight: '600',
            marginBottom: SPACING.md,
          }}>Appearance</Text>
          
          <View style={{ gap: SPACING.md }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: SPACING.md,
                backgroundColor: currentTheme === 'midnight' ? colors.primaryAccent + '20' : '#0F172A',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: currentTheme === 'midnight' ? colors.primaryAccent : 'rgba(255, 255, 255, 0.14)',
              }}
              onPress={() => setTheme('midnight')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: SPACING.md,
                  borderWidth: 2,
                  borderColor: colors.glassBorder,
                  backgroundColor: colors.primaryBackground,
                }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16,
                    color: colors.primaryText,
                    fontWeight: '600',
                    marginBottom: SPACING.xs,
                  }}>Midnight</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.secondaryText,
                  }}>Premium dark depth</Text>
                </View>
              </View>
              {currentTheme === 'midnight' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primaryAccent} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: SPACING.md,
                backgroundColor: currentTheme === 'ocean' ? colors.primaryAccent + '20' : '#0F172A',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: currentTheme === 'ocean' ? colors.primaryAccent : 'rgba(255, 255, 255, 0.14)',
              }}
              onPress={() => setTheme('ocean')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: SPACING.md,
                  borderWidth: 2,
                  borderColor: colors.glassBorder,
                  backgroundColor: colors.cardBackground,
                }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16,
                    color: colors.primaryText,
                    fontWeight: '600',
                    marginBottom: SPACING.xs,
                  }}>Ocean</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.secondaryText,
                  }}>Deep blue waves</Text>
                </View>
              </View>
              {currentTheme === 'ocean' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primaryAccent} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: SPACING.md,
                backgroundColor: currentTheme === 'twilight' ? colors.primaryAccent + '20' : '#0F172A',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: currentTheme === 'twilight' ? colors.primaryAccent : 'rgba(255, 255, 255, 0.14)',
              }}
              onPress={() => setTheme('twilight')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: SPACING.md,
                  borderWidth: 2,
                  borderColor: colors.glassBorder,
                  backgroundColor: colors.primaryBackground,
                }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16,
                    color: colors.primaryText,
                    fontWeight: '600',
                    marginBottom: SPACING.xs,
                  }}>Twilight</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.secondaryText,
                  }}>Subtle dark blue</Text>
                </View>
              </View>
              {currentTheme === 'twilight' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primaryAccent} />
              )}
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>

      {/* Custom Name Edit Modal */}
      {showNameEditModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderRadius: SPACING.lg,
            padding: SPACING.xl,
            marginHorizontal: SPACING.lg,
            width: '85%',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: SPACING.lg,
            }}>
              Edit Profile Name
            </Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: SPACING.md,
                padding: SPACING.md,
                fontSize: 16,
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                marginBottom: SPACING.lg,
                textAlign: 'center',
              }}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              autoFocus
            />
            
            <View style={{
              flexDirection: 'row',
              gap: SPACING.md,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.lg,
                  borderRadius: SPACING.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                onPress={() => {
                  setShowNameEditModal(false);
                  setEditingName('');
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.lg,
                  borderRadius: SPACING.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                onPress={handleSaveProfileName}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;
