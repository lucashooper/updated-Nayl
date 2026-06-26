import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeGuaranteed } from '../context/ThemeContext';
import profileService from '../services/profileService';
import BrandLogo from './BrandLogo';

interface ProfileHeaderProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  navigation?: any;
  showName?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  size = 'medium',
  onPress,
  navigation,
  showName = false
}) => {
  const themeResult = useThemeGuaranteed();
  const colors = themeResult?.colors;
  
  // Enhanced safety check for theme colors
  if (!colors || 
      typeof colors !== 'object' || 
      !colors.primaryBackground || 
      !colors.primaryText ||
      !colors.primaryAccent) {
    console.warn('⚠️ ProfileHeader: Theme colors not ready, using fallback');
    // Return a minimal loading state
    return (
      <View style={{ 
        height: 120, 
        backgroundColor: '#2A2A2A', 
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>('Your Name');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const cached = await profileService.getCachedProfileData();
        if (cached) {
          setProfilePictureUrl(cached.profile_picture_url || null);
          setProfileName(cached.profile_name || 'Your Name');
          setIsLoading(false);
        }

        const profileData = await profileService.getProfileData();
        setProfilePictureUrl(profileData.profile_picture_url || null);
        setProfileName(profileData.profile_name || 'Your Name');
      } catch (error) {
        console.error('Error loading profile picture:', error);
        if (!profilePictureUrl) {
          setProfilePictureUrl(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfilePicture();
  }, []);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'large':
        return { width: 48, height: 48, borderRadius: 24 };
      default: // medium
        return { width: 40, height: 40, borderRadius: 20 };
    }
  };

  const sizeStyles = getSizeStyles();

  if (isLoading && !profilePictureUrl) {
    return (
      <View style={[styles.container, sizeStyles]}>
        <BrandLogo size={size} />
      </View>
    );
  }

  const renderProfileContent = () => {
    if (profilePictureUrl) {
      // Show user's profile picture
      return (
        <Image 
          source={{ uri: profilePictureUrl }} 
          style={[styles.profileImage, sizeStyles]}
          resizeMode="cover"
          fadeDuration={0}
        />
      );
    }
    
    // Fall back to basic logo
    return <BrandLogo size={size} />;
  };

  return (
    <TouchableOpacity 
      style={styles.wrapper} 
      onPress={onPress || (() => navigation?.navigate('Profile'))}
      activeOpacity={0.8}
    >
      <View style={[styles.container, sizeStyles]}>
        {renderProfileContent()}
      </View>
      {showName && (
        <Text style={styles.profileName} numberOfLines={1}>
          {profileName}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    opacity: 0.3,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: 120,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ProfileHeader;
