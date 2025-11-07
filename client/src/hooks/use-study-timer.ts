import { useState, useEffect, useCallback } from "react";

interface TimerState {
  startTime: string; // HH:mm format for display
  sessionStartedAt: number | null; // Timestamp when timer started (for elapsed calculation)
  pausedDuration: number; // Total seconds paused (accumulated when pausing)
  pausedAt: number | null; // Timestamp when timer was paused
  selectedSubject: string;
  selectedTopic: string;
  notes: string;
}

const STORAGE_KEY = "study-timer-state";

function loadTimerState(): TimerState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load timer state:", error);
  }
  
  return {
    startTime: "",
    sessionStartedAt: null,
    pausedDuration: 0,
    pausedAt: null,
    selectedSubject: "",
    selectedTopic: "",
    notes: "",
  };
}

function saveTimerState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save timer state:", error);
  }
}

function calculateElapsedSeconds(state: TimerState): number {
  if (!state.sessionStartedAt) return 0;
  
  const now = Date.now();
  const totalElapsed = Math.floor((now - state.sessionStartedAt) / 1000);
  
  // Subtract paused time
  let pausedTime = state.pausedDuration;
  if (state.pausedAt) {
    // Currently paused, add current pause duration
    pausedTime += Math.floor((now - state.pausedAt) / 1000);
  }
  
  return Math.max(0, totalElapsed - pausedTime);
}

export function useStudyTimer() {
  const [state, setState] = useState<TimerState>(loadTimerState);
  const [displaySeconds, setDisplaySeconds] = useState<number>(() => calculateElapsedSeconds(loadTimerState()));

  const isRunning = state.sessionStartedAt !== null && state.pausedAt === null;

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  // Timer tick effect - updates display every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setDisplaySeconds(calculateElapsedSeconds(state));
      }, 1000);
    } else {
      setDisplaySeconds(calculateElapsedSeconds(state));
    }
    return () => clearInterval(interval);
  }, [isRunning, state]);

  const startTimer = useCallback((startTime: string) => {
    setState((prev) => {
      if (prev.sessionStartedAt === null) {
        // Starting fresh
        return {
          ...prev,
          startTime,
          sessionStartedAt: Date.now(),
          pausedDuration: 0,
          pausedAt: null,
        };
      } else if (prev.pausedAt !== null) {
        // Resuming from pause
        const pauseDuration = Math.floor((Date.now() - prev.pausedAt) / 1000);
        return {
          ...prev,
          pausedDuration: prev.pausedDuration + pauseDuration,
          pausedAt: null,
        };
      }
      return prev;
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pausedAt: Date.now(),
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setState({
      startTime: "",
      sessionStartedAt: null,
      pausedDuration: 0,
      pausedAt: null,
      selectedSubject: "",
      selectedTopic: "",
      notes: "",
    });
    setDisplaySeconds(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateSubject = useCallback((subject: string) => {
    setState((prev) => ({ ...prev, selectedSubject: subject }));
  }, []);

  const updateTopic = useCallback((topic: string) => {
    setState((prev) => ({ ...prev, selectedTopic: topic }));
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  return {
    isRunning,
    seconds: displaySeconds,
    startTime: state.startTime,
    selectedSubject: state.selectedSubject,
    selectedTopic: state.selectedTopic,
    notes: state.notes,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSubject,
    updateTopic,
    updateNotes,
  };
}
