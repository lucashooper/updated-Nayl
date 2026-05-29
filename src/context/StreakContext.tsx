import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import sessionService from '../services/sessionService';

interface StreakContextType {
  elapsedSeconds: number;
  refreshStreakData: () => Promise<void>;
  setElapsedSecondsDirectly: (seconds: number) => void;
  updateStreakStartTime: (newStartTime: Date) => Promise<void>;
  updateCurrentStreak: () => Promise<void>;
  isLoading: boolean;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

interface StreakProviderProps {
  children: ReactNode;
}

export const StreakProvider: React.FC<StreakProviderProps> = ({ children }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Function to refresh streak data from database
  const refreshStreakData = useCallback(async () => {
    try {
      const currentStreak = await sessionService.getCurrentStreakSeconds();
      setElapsedSeconds(currentStreak);
    } catch (error) {
      console.error('StreakContext: Error refreshing streak data:', error);
    }
  }, []);

  // Function to immediately set elapsed seconds (for instant reset)
  const setElapsedSecondsDirectly = useCallback((seconds: number) => {
    setElapsedSeconds(seconds);
  }, []);

  // Function to update streak start time
  const updateStreakStartTime = useCallback(async (newStartTime: Date) => {
    try {
      setIsLoading(true);
      
      // Update the database
      await sessionService.updateStreakStartTime(newStartTime);
      
      // Immediately refresh the streak data
      await refreshStreakData();
      
      setIsLoading(false);
    } catch (error) {
      console.error('StreakContext: Error updating streak start time:', error);
      setIsLoading(false);
      throw error;
    }
  }, [refreshStreakData]);

  // Function to manually update the current streak in the database
  const updateCurrentStreak = useCallback(async () => {
    try {
      setIsLoading(true);
      await sessionService.updateSession(elapsedSeconds);
      setIsLoading(false);
    } catch (error) {
      console.error('StreakContext: Error updating current streak:', error);
      setIsLoading(false);
      throw error;
    }
  }, [elapsedSeconds]);

  // Initialize streak data on mount
  useEffect(() => {
    refreshStreakData();
  }, [refreshStreakData]);

  // Set up timer to update streak every second
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const currentStreak = await sessionService.getCurrentStreakSeconds();
        setElapsedSeconds(currentStreak);
        
        // Update the session in the database every 60 seconds instead of every 10 seconds
        if (currentStreak > 0 && currentStreak % 60 === 0) {
          await sessionService.updateSession(currentStreak);
        }
        
        // Update longest streak if needed (every 5 minutes instead of every 30 seconds)
        if (currentStreak > 0 && currentStreak % 300 === 0) {
          await sessionService.updateLongestStreakIfNeeded(currentStreak);
        }
      } catch (error) {
        console.error('StreakContext: Error updating timer:', error);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const value: StreakContextType = useMemo(() => ({
    elapsedSeconds,
    refreshStreakData,
    setElapsedSecondsDirectly,
    updateStreakStartTime,
    updateCurrentStreak,
    isLoading,
  }), [elapsedSeconds, refreshStreakData, setElapsedSecondsDirectly, updateStreakStartTime, updateCurrentStreak, isLoading]);

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = (): StreakContextType => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};
