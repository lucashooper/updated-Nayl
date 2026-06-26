import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionService from './sessionService';

export const PROFILE_CACHE_KEY = '@nayl_profile_cache';

export interface ProfileData {
  profile_picture_url?: string;
  profile_name?: string;
  longest_streak_seconds: number;
  consecutive_days: number;
  total_days_logged_in: number;
}

class ProfileService {
  private async getUserId(): Promise<string> {
    // Use the session service to get the current user ID
    return await sessionService.getCurrentUserId();
  }

  async uploadProfilePicture(imageUri: string): Promise<string> {
    try {
      console.log('Starting image upload with improved method...');
      
      // Convert image URI to ArrayBuffer (recommended for Supabase)
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('Image converted to ArrayBuffer, size:', arrayBuffer.byteLength);

      // Generate unique filename
      const userId = await this.getUserId();
      const timestamp = Date.now();
      const filename = `profile-pictures/${userId}/${timestamp}.jpg`;
      console.log('Uploading to filename:', filename);

      // Upload to Supabase Storage using ArrayBuffer
      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(filename, arrayBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful, getting public URL...');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filename);

      console.log('Public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  async updateProfilePicture(profilePictureUrl: string): Promise<void> {
    try {
      console.log('Updating profile picture in database...');
      const userId = await this.getUserId();
      
      // First, try to update existing record
      const { data: existingData } = await supabase
        .from('user_stats')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_stats')
          .update({
            profile_picture_url: profilePictureUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          throw new Error(`Failed to update profile picture: ${error.message}`);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            profile_picture_url: profilePictureUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          throw new Error(`Failed to create profile picture record: ${error.message}`);
        }
      }
      
      console.log('Profile picture updated in database successfully');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }

  async getCachedProfileData(): Promise<ProfileData | null> {
    try {
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as ProfileData;
      }
    } catch {
      // Ignore cache read errors
    }
    return null;
  }

  private async cacheProfileData(data: ProfileData): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
    } catch {
      // Non-critical
    }
  }

  async getProfileData(): Promise<ProfileData> {
    try {
      const userId = await this.getUserId();
      
      // Get profile data from user_stats
      const { data, error } = await supabase
        .from('user_stats')
        .select('profile_picture_url, profile_name, consecutive_days, total_days_logged_in')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to get profile data: ${error.message}`);
      }

      // Get longest streak from session service for more accurate data
      const longestStreakSeconds = await sessionService.getLongestStreakSeconds();

      const profile: ProfileData = {
        profile_picture_url: data?.profile_picture_url,
        profile_name: data?.profile_name || 'Your Name',
        longest_streak_seconds: longestStreakSeconds,
        consecutive_days: data?.consecutive_days || 0,
        total_days_logged_in: data?.total_days_logged_in || 0,
      };

      await this.cacheProfileData(profile);
      return profile;
    } catch (error) {
      console.error('Error getting profile data:', error);
      return {
        profile_picture_url: undefined,
        profile_name: 'Your Name',
        longest_streak_seconds: 0,
        consecutive_days: 0,
        total_days_logged_in: 0
      };
    }
  }

  async deleteProfilePicture(): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const { error } = await supabase
        .from('user_stats')
        .update({
          profile_picture_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete profile picture: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  }

  async updateProfileName(name: string): Promise<void> {
    try {
      console.log('Updating profile name in database...');
      const userId = await this.getUserId();
      
      // First, try to update existing record
      const { data: existingData } = await supabase
        .from('user_stats')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_stats')
          .update({
            profile_name: name,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          throw new Error(`Failed to update profile name: ${error.message}`);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            profile_name: name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          throw new Error(`Failed to create profile name record: ${error.message}`);
        }
      }
      
      console.log('Profile name updated in database successfully');
    } catch (error) {
      console.error('Error updating profile name:', error);
      throw error;
    }
  }
}

export default new ProfileService();
