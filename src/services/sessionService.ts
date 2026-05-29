import { supabase, UserSession, UserStats, UserStatsPartial, UserDashboard, UserAnalytics } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@nayl_current_session';
const USER_ID_KEY = '@nayl_user_id';

class SessionService {
  private currentUserId: string | null = null;

  // Initialize user ID (for demo purposes, you might want to implement proper auth later)
  async initializeUser(): Promise<string> {
    try {
      let userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(USER_ID_KEY, userId);
      }
      this.currentUserId = userId;
      return userId;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }

  // Get current user ID
  async getCurrentUserId(): Promise<string> {
    if (!this.currentUserId) {
      return await this.initializeUser();
    }
    return this.currentUserId;
  }

  // Start or resume a session
  async startSession(): Promise<UserSession> {
    try {
      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Check if there's an existing active session
      const { data: existingSession, error: fetchError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching existing session:', fetchError);
        // Return a mock session for offline functionality instead of throwing
        return {
          id: 'offline-session',
          user_id: userId,
          start_time: now,
          current_streak_seconds: 0,
          total_streak_seconds: 0,
          last_reset_time: now,
          created_at: now,
          updated_at: now,
        } as UserSession;
      }

      if (existingSession) {
        // Update existing session
        const { data: updatedSession, error: updateError } = await supabase
          .from('user_sessions')
          .update({
            updated_at: now,
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating session:', updateError);
          // Return the existing session data instead of throwing
          return {
            ...existingSession,
            updated_at: now,
          };
        }
        
        // Update daily login tracking
        await this.updateDailyLoginTracking(today).catch(error => {
          console.warn('Failed to update daily login tracking:', error);
        });
        
        return updatedSession;
      } else {
        // Create new session
        const { data: newSession, error: insertError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: userId,
            start_time: now,
            current_streak_seconds: 0,
            total_streak_seconds: 0,
            last_reset_time: now,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating new session:', insertError);
          // Return a mock session for offline functionality instead of throwing
          return {
            id: 'offline-session',
            user_id: userId,
            start_time: now,
            current_streak_seconds: 0,
            total_streak_seconds: 0,
            last_reset_time: now,
            created_at: now,
            updated_at: now,
          } as UserSession;
        }
        
        // Update daily login tracking for new user
        await this.updateDailyLoginTracking(today).catch(error => {
          console.warn('Failed to update daily login tracking:', error);
        });
        
        return newSession;
      }
    } catch (error) {
      console.error('Error starting session:', error);
      
      // If it's a network error, we can still continue with local functionality
      if (error instanceof Error && error.message.includes('Network request failed')) {
        console.warn('Network error detected - continuing with local functionality');
        // Return a mock session for offline functionality
        return {
          id: 'offline-session',
          user_id: await this.getCurrentUserId(),
          start_time: new Date().toISOString(),
          current_streak_seconds: 0,
          total_streak_seconds: 0,
          last_reset_time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserSession;
      }
      
      // For any other error, return a mock session instead of throwing
      return {
        id: 'error-session',
        user_id: await this.getCurrentUserId(),
        start_time: new Date().toISOString(),
        current_streak_seconds: 0,
        total_streak_seconds: 0,
        last_reset_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as UserSession;
    }
  }

  // Update session with current streak
  async updateSession(currentStreakSeconds: number): Promise<void> {
    try {
      // Validate streak value to prevent extremely large numbers
      if (currentStreakSeconds < 0 || currentStreakSeconds > 3153600000) { // Max ~100 years in seconds
        console.warn(`Invalid streak value: ${currentStreakSeconds} seconds. Clamping to reasonable range.`);
        currentStreakSeconds = Math.max(0, Math.min(currentStreakSeconds, 3153600000));
      }

      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('user_sessions')
        .update({
          current_streak_seconds: currentStreakSeconds,
          // Don't update total_streak_seconds here - it should only be updated when a streak ends
          updated_at: now,
        })
        .eq('user_id', userId);

      if (error) {
        console.warn('Error updating session:', error);
        // Don't throw the error, just log it
      }

      // Also update user stats to track longest streak
      await this.updateUserStats(currentStreakSeconds);
      
      // Ensure longest streak is updated if needed
      await this.updateLongestStreakIfNeeded(currentStreakSeconds);
    } catch (error) {
      console.error('Error updating session:', error);
      // Don't throw the error, just log it
    }
  }

  // Update streak start time (for editing streak)
  async updateStreakStartTime(newStartTime: Date): Promise<void> {
    try {
      // Validate date to prevent extremely old or future dates
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 100, 0, 1); // Max 100 years ago
      const maxDate = new Date(now.getFullYear() + 10, 11, 31); // Max 10 years in future
      
      if (newStartTime < minDate || newStartTime > maxDate) {
        console.warn(`Invalid start time: ${newStartTime}. Clamping to reasonable range.`);
        newStartTime = new Date(Math.max(minDate.getTime(), Math.min(newStartTime.getTime(), maxDate.getTime())));
      }

      const userId = await this.getCurrentUserId();
      const nowISO = now.toISOString();
      const newStartTimeISO = newStartTime.toISOString();
      


      const { error } = await supabase
        .from('user_sessions')
        .update({
          start_time: newStartTimeISO,
          last_reset_time: newStartTimeISO, // Also update last_reset_time for consistency
          updated_at: nowISO,
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating streak start time:', error);
      throw error;
    }
  }

  // Reset session (when user resets their streak)
  async resetSession(trigger: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();

      // Get current streak before resetting
      const { data: currentSession } = await supabase
        .from('user_sessions')
        .select('current_streak_seconds')
        .eq('user_id', userId)
        .single();

      // If there's a current streak, add it to the total before resetting
      if (currentSession && currentSession.current_streak_seconds > 0) {
        await this.addCompletedStreakToTotal(currentSession.current_streak_seconds);
      }

      // Update session to reset streak
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .update({
          current_streak_seconds: 0,
          last_reset_time: now,
          updated_at: now,
        })
        .eq('user_id', userId);

      if (sessionError) throw sessionError;

      // Update user stats
      await this.updateUserStats(0, trigger);

    } catch (error) {
      console.error('Error resetting session:', error);
      throw error;
    }
  }

  // Get current session
  async getCurrentSession(): Promise<UserSession | null> {
    try {
      const userId = await this.getCurrentUserId();

      // Add timeout and better error handling
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id, user_id, start_time, current_streak_seconds, total_streak_seconds, last_reset_time, last_login_date, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No session found - this is normal for new users
          return null;
        }
        
        // Log specific error details for debugging
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Don't throw the error, just return null
        return null;
      }

      return data;
    } catch (error) {
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error getting current session:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } else {
        console.error('Unknown error getting current session:', error);
      }
      
      // Return null instead of throwing to prevent app crashes
      return null;
    }
  }

  // Update user statistics
  async updateUserStats(currentStreakSeconds: number, trigger?: string): Promise<void> {
    try {
      // Validate streak value to prevent extremely large numbers
      if (currentStreakSeconds < 0 || currentStreakSeconds > 3153600000) { // Max ~100 years in seconds
        console.warn(`Invalid streak value in updateUserStats: ${currentStreakSeconds} seconds. Clamping to reasonable range.`);
        currentStreakSeconds = Math.max(0, Math.min(currentStreakSeconds, 3153600000));
      }

      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();

      // Get current stats - selective query
      const { data: existingStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('id, total_episodes, longest_streak_seconds, total_streak_seconds')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const updateData: Partial<UserStats> = {
        current_streak_seconds: currentStreakSeconds,
        updated_at: now,
      };

      if (existingStats) {
        // Update existing stats
        // Don't add current streak to total every time - this causes integer overflow
        // Only update current streak, total_streak_seconds should be managed separately
        updateData.current_streak_seconds = currentStreakSeconds;
        
        // Update longest streak if current streak is longer
        if (currentStreakSeconds > existingStats.longest_streak_seconds) {
          updateData.longest_streak_seconds = currentStreakSeconds;
          // Reduced logging to prevent terminal spam
          // console.log(`🎉 New longest streak achieved: ${currentStreakSeconds} seconds (${Math.floor(currentStreakSeconds / 86400)} days)`);
        }
        
        if (trigger) {
          updateData.total_episodes = existingStats.total_episodes + 1;
        }

        const { error: updateError } = await supabase
          .from('user_stats')
          .update(updateData)
          .eq('id', existingStats.id);

        if (updateError) throw updateError;
      } else {
        // Create new stats
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            total_episodes: trigger ? 1 : 0,
            longest_streak_seconds: currentStreakSeconds,
            current_streak_seconds: currentStreakSeconds,
            total_streak_seconds: 0, // Start with 0, don't set to current streak
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Update longest streak if current streak exceeds it
  async updateLongestStreakIfNeeded(currentStreakSeconds: number): Promise<void> {
    try {
      // Validate streak value to prevent extremely large numbers
      if (currentStreakSeconds < 0 || currentStreakSeconds > 3153600000) { // Max ~100 years in seconds
        console.warn(`Invalid streak value in updateLongestStreakIfNeeded: ${currentStreakSeconds} seconds. Clamping to reasonable range.`);
        currentStreakSeconds = Math.max(0, Math.min(currentStreakSeconds, 3153600000));
      }

      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();

      // Get current stats - selective query
      const { data: existingStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('longest_streak_seconds')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.warn('Error fetching stats for longest streak update:', fetchError);
        return;
      }

      const currentLongest = existingStats?.longest_streak_seconds || 0;

      // If no stats exist or current streak is longer, update
      if (!existingStats || currentStreakSeconds > currentLongest) {
        const { error: updateError } = await supabase
          .from('user_stats')
          .upsert({
            user_id: userId,
            longest_streak_seconds: currentStreakSeconds,
            updated_at: now,
          }, {
            onConflict: 'user_id'
          });

        if (updateError) {
          console.warn('Error updating longest streak:', updateError);
        } else {
          // Reduced logging to prevent terminal spam
          // console.log(`🎉 Longest streak updated: ${currentLongest}s → ${currentStreakSeconds}s (${Math.floor(currentStreakSeconds / 86400)} days)`);
        }
      }
      // Removed the else clause that was logging every time the streak was unchanged
    } catch (error) {
      console.error('Error updating longest streak:', error);
      // Don't throw error to avoid breaking the main streak tracking
    }
  }

  // Add completed streak to total when streak ends
  async addCompletedStreakToTotal(completedStreakSeconds: number): Promise<void> {
    try {
      // Validate streak value to prevent extremely large numbers
      if (completedStreakSeconds < 0 || completedStreakSeconds > 3153600000) { // Max ~100 years in seconds
        console.warn(`Invalid completed streak value: ${completedStreakSeconds} seconds. Clamping to reasonable range.`);
        completedStreakSeconds = Math.max(0, Math.min(completedStreakSeconds, 3153600000));
      }

      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();

      // Get current stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('total_streak_seconds')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.warn('Error fetching stats for total streak update:', fetchError);
        return;
      }

      if (existingStats) {
        // Add the completed streak to the total
        const newTotal = (existingStats.total_streak_seconds || 0) + completedStreakSeconds;
        
        const { error: updateError } = await supabase
          .from('user_stats')
          .update({
            total_streak_seconds: newTotal,
            updated_at: now,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.warn('Error updating total streak seconds:', updateError);
        }
      }
    } catch (error) {
      console.error('Error adding completed streak to total:', error);
      // Don't throw error to avoid breaking the main streak tracking
    }
  }

  // Reset longest streak (for testing purposes)
  async resetLongestStreak(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          longest_streak_seconds: 0,
          updated_at: now,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.warn('Error resetting longest streak:', error);
      } else {
        console.log('Longest streak reset to 0 for testing');
      }
    } catch (error) {
      console.error('Error resetting longest streak:', error);
      throw error;
    }
  }

  // Force refresh longest streak data (useful for testing/debugging)
  async forceRefreshLongestStreak(): Promise<void> {
    try {
      const currentStreak = await this.getCurrentStreakSeconds();
      console.log(`Force refreshing longest streak. Current streak: ${currentStreak}s`);
      
      // Update both user stats and longest streak
      await this.updateUserStats(currentStreak);
      await this.updateLongestStreakIfNeeded(currentStreak);
      
      console.log('Longest streak data force refreshed');
    } catch (error) {
      console.error('Error force refreshing longest streak:', error);
      throw error;
    }
  }

  // Get user statistics - selective query
  async getUserStats(): Promise<UserStatsPartial | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('user_stats')
        .select('total_episodes, longest_streak_seconds, current_streak_seconds, total_streak_seconds, consecutive_days, total_days_logged_in, last_login_date')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Calculate brain rewiring percentage (100% = 60 days)
  calculateBrainRewiringPercentage(totalSeconds: number): number {
    const sixtyDaysInSeconds = 60 * 24 * 60 * 60; // 60 days in seconds
    const percentage = (totalSeconds / sixtyDaysInSeconds) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  }

  // Get consecutive days for flame counter - selective query
  async getConsecutiveDays(): Promise<number> {
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase
        .from('user_stats')
        .select('consecutive_days')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('Error getting consecutive days:', error);
        return 0;
      }
      return data?.consecutive_days || 0;
    } catch (error) {
      console.error('Error getting consecutive days:', error);
      return 0;
    }
  }

  // Get weekly check-in data - optimized query
  async getWeeklyCheckIns(): Promise<boolean[]> {
    try {
      const userId = await this.getCurrentUserId();
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      // Use the optimized query with proper indexing
      const { data, error } = await supabase
        .from('user_sessions')
        .select('last_login_date')
        .eq('user_id', userId)
        .gte('last_login_date', startOfWeek.toISOString().split('T')[0])
        .order('last_login_date', { ascending: true });

      if (error) {
        console.warn('Error getting weekly check-ins:', error);
        throw error;
      }

      // Create array of 7 days (Sunday to Saturday)
      const weekDays = Array(7).fill(false);
      
      // Mark days that have been logged in
      data?.forEach(session => {
        if (session.last_login_date) {
          const loginDate = new Date(session.last_login_date);
          const dayIndex = loginDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          weekDays[dayIndex] = true;
        }
      });

      return weekDays;
    } catch (error) {
      console.error('Error getting weekly check-ins:', error);
      return Array(7).fill(false);
    }
  }

  // Mark today as checked in
  async markTodayCheckedIn(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const today = new Date().toISOString().split('T')[0];
      
      // Update user_stats with today's login
      try {
        await this.updateDailyLoginTracking(today);
      } catch (trackingError) {
        console.warn('Failed to update daily login tracking:', trackingError);
      }
      
      // Try to update user_sessions last_login_date
      try {
        const { error } = await supabase
          .from('user_sessions')
          .update({ last_login_date: today })
          .eq('user_id', userId);

        if (error) {
          console.warn('Error updating user_sessions last_login_date:', error);
        }
      } catch (columnError) {
        // If last_login_date column doesn't exist, just log it
        console.log('last_login_date column not found, skipping user_sessions update');
      }
    } catch (error) {
      console.error('Error marking today as checked in:', error);
      // Don't throw the error, just log it
    }
  }

  // Get longest streak in seconds - selective query
  async getLongestStreakSeconds(): Promise<number> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('user_stats')
        .select('longest_streak_seconds')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error getting longest streak:', error);
        return 0;
      }

      return data?.longest_streak_seconds || 0;
    } catch (error) {
      console.error('Error getting longest streak:', error);
      return 0;
    }
  }

  // NEW: Get dashboard data using the performance view
  async getDashboardData(): Promise<UserDashboard | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('user_dashboard')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('Error getting dashboard data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }

  // NEW: Get analytics data using the performance view
  async getAnalyticsData(): Promise<UserAnalytics | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('Error getting analytics data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return null;
    }
  }

  // Get local dashboard data for instant display (fallback while database syncs)
  async getLocalDashboard(): Promise<UserDashboard> {
    // Return mock data for instant display
    // This simulates what would come from memory/cache
    return {
      user_id: 'default_user',
      current_streak_seconds: 604800, // 7 days
      total_streak_seconds: 1209600, // 14 days
      start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      last_reset_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_login_date: new Date().toISOString().split('T')[0],
      consecutive_days: 7,
      longest_streak_seconds: 604800, // 7 days
      total_episodes: 12,
      total_days_logged_in: 15,
      successful_days_this_week: 5,
      total_achievements: 6,
      unlocked_achievements: 2,
    };
  }

  // Get local analytics for instant display (fallback while database syncs)
  async getLocalAnalytics(): Promise<UserAnalytics> {
    // Return mock data for instant display
    // This simulates what would come from memory/cache
    return {
      user_id: 'default_user',
      current_streak_seconds: 604800, // 7 days
      total_streak_seconds: 1209600, // 14 days
      start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      longest_streak_seconds: 604800, // 7 days
      total_episodes: 12,
      consecutive_days: 7,
      total_days_logged_in: 15,
      successful_days_this_week: 5,
      total_triggers: 8,
      days_with_triggers: 5,
      avg_trigger_time: 14.5, // 2:30 PM average
    };
  }

  // Get current streak in seconds
  async getCurrentStreakSeconds(): Promise<number> {
    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return 0;
      }

      // Use start_time instead of last_reset_time for more accurate streak calculation
      const startTime = new Date(session.start_time);
      const now = new Date();
      const timeSinceStart = Math.floor((now.getTime() - startTime.getTime()) / 1000);

      // Ensure we don't return negative values
      const currentStreak = Math.max(0, timeSinceStart);
      
      // Removed frequent logging to reduce terminal spam
      // if (currentStreak > 0 && currentStreak % 300 === 0) {
      //   console.log(`Current streak: ${currentStreak}s (${Math.floor(currentStreak / 86400)} days)`);
      // }

      return currentStreak;
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  }

  // Update daily login tracking
  async updateDailyLoginTracking(today: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      // Get current stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingStats) {
        const lastLoginDate = existingStats.last_login_date;
        const isNewDay = lastLoginDate !== today;
        
        if (isNewDay) {
          // Calculate consecutive days
          let newConsecutiveDays = existingStats.consecutive_days || 0;
          
          if (lastLoginDate) {
            const lastLogin = new Date(lastLoginDate);
            const currentLogin = new Date(today);
            
            // Check if dates are valid before calculating
            if (!isNaN(lastLogin.getTime()) && !isNaN(currentLogin.getTime())) {
              const daysDiff = Math.floor((currentLogin.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysDiff === 1) {
                // Consecutive day
                newConsecutiveDays = (existingStats.consecutive_days || 0) + 1;
              } else if (daysDiff > 1) {
                // Gap in days, reset consecutive count
                newConsecutiveDays = 1;
              }
              // If daysDiff === 0, it's the same day, don't update
            } else {
              // Invalid dates, treat as first login
              newConsecutiveDays = 1;
            }
          } else {
            // No last login date, treat as first login
            newConsecutiveDays = 1;
          }

          // Update stats
          const { error: updateError } = await supabase
            .from('user_stats')
            .update({
              last_login_date: today,
              consecutive_days: newConsecutiveDays,
              total_days_logged_in: (existingStats.total_days_logged_in || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingStats.id);

          if (updateError) throw updateError;
        }
      } else {
        // Create new stats for first login
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            last_login_date: today,
            consecutive_days: 1,
            total_days_logged_in: 1,
            successful_days_this_week: 0,
            total_episodes: 0,
            longest_streak_seconds: 0,
            current_streak_seconds: 0,
            total_streak_seconds: 0,
            cumulative_brain_rewiring_seconds: 0,
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating daily login tracking:', error);
      throw error;
    }
  }

  // NEW: Track successful days (days without episodes)
  async updateSuccessfulDaysTracking(today: string, hadEpisode: boolean): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      // Get current stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingStats) {
        // Check if we're in a new week (Monday = 1, Sunday = 0)
        const todayDate = new Date(today);
        const dayOfWeek = todayDate.getDay();
        const isNewWeek = dayOfWeek === 1; // Monday

        let newSuccessfulDays = existingStats.successful_days_this_week || 0;

        if (isNewWeek) {
          // Reset for new week
          newSuccessfulDays = hadEpisode ? 0 : 1;
        } else {
          // Same week, update count
          if (!hadEpisode) {
            newSuccessfulDays = Math.min(7, newSuccessfulDays + 1);
          }
          // If had episode, don't increment (but don't reset either)
        }

        // Update stats
        const { error: updateError } = await supabase
          .from('user_stats')
          .update({
            successful_days_this_week: newSuccessfulDays,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingStats.id);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating successful days tracking:', error);
      throw error;
    }
  }

  // NEW: Mark today as a successful day (no episodes)
  async markTodayAsSuccessful(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      await this.updateSuccessfulDaysTracking(today, false);
    } catch (error) {
      console.error('Error marking today as successful:', error);
      throw error;
    }
  }

  // Delete all data for the current user (account deletion, required by App Store Guideline 5.1.1v)
  async deleteAllUserData(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      // Delete from all tables that reference this user_id
      const tablesToDelete = [
        'user_sessions',
        'user_stats',
        'user_triggers',
        'user_achievements',
        'user_reasons',
        'nail_progress_photos',
        'user_profiles',
      ];

      for (const table of tablesToDelete) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
        if (error && error.code !== '42P01') {
          // 42P01 = table does not exist, skip silently
          console.warn(`Error deleting from ${table}:`, error.message);
        }
      }

      // Delete profile pictures from Supabase Storage
      const { data: files } = await supabase.storage
        .from('user-uploads')
        .list(userId);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('user-uploads').remove(paths);
      }

      // Delete nail progress photos from storage
      const { data: nailFiles } = await supabase.storage
        .from('nail-progress')
        .list(userId);
      if (nailFiles && nailFiles.length > 0) {
        const paths = nailFiles.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('nail-progress').remove(paths);
      }

      // Clear all local AsyncStorage data
      const allKeys = await AsyncStorage.getAllKeys();
      const naylKeys = allKeys.filter((k) => k.startsWith('@nayl'));
      if (naylKeys.length > 0) {
        await AsyncStorage.multiRemove(naylKeys);
      }

      // Reset in-memory user ID so a fresh anonymous ID is created on next launch
      this.currentUserId = null;
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}

export default new SessionService();