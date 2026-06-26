import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from 'react';
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
  const streakStartMsRef = useRef<number>(Date.now());

  const computeElapsed = useCallback(() => {
    return Math.max(0, Math.floor((Date.now() - streakStartMsRef.current) / 1000));
  }, []);

  const syncStartTimeFromDatabase = useCallback(async () => {
    try {
      const session = await sessionService.getCurrentSession();
      if (session?.start_time) {
        streakStartMsRef.current = new Date(session.start_time).getTime();
      }
      setElapsedSeconds(computeElapsed());
    } catch (error) {
      console.error('StreakContext: Error syncing start time:', error);
    }
  }, [computeElapsed]);

  const refreshStreakData = useCallback(async () => {
    await syncStartTimeFromDatabase();
  }, [syncStartTimeFromDatabase]);

  // Instantly set elapsed time by adjusting the local anchor — no DB round-trip
  const setElapsedSecondsDirectly = useCallback((seconds: number) => {
    streakStartMsRef.current = Date.now() - seconds * 1000;
    setElapsedSeconds(seconds);
  }, []);

  const updateStreakStartTime = useCallback(async (newStartTime: Date) => {
    try {
      setIsLoading(true);
      await sessionService.updateStreakStartTime(newStartTime);
      streakStartMsRef.current = newStartTime.getTime();
      setElapsedSeconds(computeElapsed());
      setIsLoading(false);
    } catch (error) {
      console.error('StreakContext: Error updating streak start time:', error);
      setIsLoading(false);
      throw error;
    }
  }, [computeElapsed]);

  const updateCurrentStreak = useCallback(async () => {
    try {
      setIsLoading(true);
      const elapsed = computeElapsed();
      await sessionService.updateSession(elapsed);
      setIsLoading(false);
    } catch (error) {
      console.error('StreakContext: Error updating current streak:', error);
      setIsLoading(false);
      throw error;
    }
  }, [computeElapsed]);

  useEffect(() => {
    syncStartTimeFromDatabase();
  }, [syncStartTimeFromDatabase]);

  // Tick locally from anchor — avoids DB race conditions on reset
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = computeElapsed();
      setElapsedSeconds(elapsed);

      if (elapsed > 0 && elapsed % 60 === 0) {
        sessionService.updateSession(elapsed).catch(() => undefined);
      }
      if (elapsed > 0 && elapsed % 300 === 0) {
        sessionService.updateLongestStreakIfNeeded(elapsed).catch(() => undefined);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [computeElapsed]);

  const value: StreakContextType = useMemo(
    () => ({
      elapsedSeconds,
      refreshStreakData,
      setElapsedSecondsDirectly,
      updateStreakStartTime,
      updateCurrentStreak,
      isLoading,
    }),
    [
      elapsedSeconds,
      refreshStreakData,
      setElapsedSecondsDirectly,
      updateStreakStartTime,
      updateCurrentStreak,
      isLoading,
    ],
  );

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
