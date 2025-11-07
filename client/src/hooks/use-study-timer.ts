import { useState, useEffect, useCallback } from "react";

interface TimerState {
  isRunning: boolean;
  seconds: number;
  startTime: string;
  selectedSubject: string;
  selectedTopic: string;
  notes: string;
  sessionStartedAt: number | null;
}

const STORAGE_KEY = "study-timer-state";

function loadTimerState(): TimerState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      // If timer was running, calculate elapsed time
      if (state.isRunning && state.sessionStartedAt) {
        const elapsed = Math.floor((Date.now() - state.sessionStartedAt) / 1000);
        return {
          ...state,
          seconds: state.seconds + elapsed,
        };
      }
      return state;
    }
  } catch (error) {
    console.error("Failed to load timer state:", error);
  }
  
  return {
    isRunning: false,
    seconds: 0,
    startTime: "",
    selectedSubject: "",
    selectedTopic: "",
    notes: "",
    sessionStartedAt: null,
  };
}

function saveTimerState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save timer state:", error);
  }
}

export function useStudyTimer() {
  const [state, setState] = useState<TimerState>(loadTimerState);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isRunning) {
      interval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          seconds: prev.seconds + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isRunning]);

  const startTimer = useCallback((startTime: string) => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      startTime: prev.startTime || startTime,
      sessionStartedAt: Date.now(),
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      sessionStartedAt: null,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setState({
      isRunning: false,
      seconds: 0,
      startTime: "",
      selectedSubject: "",
      selectedTopic: "",
      notes: "",
      sessionStartedAt: null,
    });
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
    isRunning: state.isRunning,
    seconds: state.seconds,
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
