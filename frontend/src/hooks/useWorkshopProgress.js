import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const STORAGE_KEY = 'afm_workshop_progress';
const SESSION_KEY = 'afm_workshop_session_id';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const generateSessionId = () => {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
};

const getSessionId = () => {
  try {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
};

const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return {
    completedSteps: [],
    step1Choice: null,
    currentStep: 1,
  };
};

export const useWorkshopProgress = () => {
  const [state, setState] = useState(getInitialState);
  const [syncing, setSyncing] = useState(false);
  const [syncedFromBackend, setSyncedFromBackend] = useState(false);
  const syncTimeoutRef = useRef(null);
  const sessionId = useRef(getSessionId());

  // On mount: try to load from backend (cross-device sync)
  useEffect(() => {
    const loadFromBackend = async () => {
      try {
        const res = await axios.get(`${API}/progress/${sessionId.current}`);
        if (res.data && res.data.completedSteps) {
          const backendState = {
            completedSteps: res.data.completedSteps || [],
            step1Choice: res.data.step1Choice || null,
            currentStep: res.data.currentStep || 1,
          };
          // Merge: use whichever has more progress
          const localState = getInitialState();
          if (backendState.completedSteps.length >= localState.completedSteps.length) {
            setState(backendState);
          }
        }
      } catch (e) {
        // Backend might not have data for this session yet, that's fine
      } finally {
        setSyncedFromBackend(true);
      }
    };
    loadFromBackend();
  }, []);

  // Persist to localStorage immediately
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [state]);

  // Debounced sync to backend
  useEffect(() => {
    if (!syncedFromBackend) return; // Don't sync before initial load

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setSyncing(true);
        await axios.post(`${API}/progress`, {
          sessionId: sessionId.current,
          completedSteps: state.completedSteps,
          step1Choice: state.step1Choice,
          currentStep: state.currentStep,
        });
      } catch (e) {
        console.error('Failed to sync progress to backend:', e);
      } finally {
        setSyncing(false);
      }
    }, 800);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [state, syncedFromBackend]);

  const completeStep = useCallback((stepOrder) => {
    setState(prev => {
      const newCompleted = prev.completedSteps.includes(stepOrder)
        ? prev.completedSteps
        : [...prev.completedSteps, stepOrder].sort((a, b) => a - b);
      const nextStep = stepOrder < 8 ? stepOrder + 1 : 8;
      return {
        ...prev,
        completedSteps: newCompleted,
        currentStep: nextStep,
      };
    });
  }, []);

  const goToStep = useCallback((stepOrder) => {
    setState(prev => ({
      ...prev,
      currentStep: stepOrder,
    }));
  }, []);

  const setStep1Choice = useCallback((choiceId) => {
    setState(prev => ({
      ...prev,
      step1Choice: choiceId,
    }));
  }, []);

  const resetProgress = useCallback(async () => {
    const newState = {
      completedSteps: [],
      step1Choice: null,
      currentStep: 1,
    };
    setState(newState);
    // Also reset on backend
    try {
      await axios.post(`${API}/progress`, {
        sessionId: sessionId.current,
        ...newState,
      });
    } catch (e) {
      console.error('Failed to reset progress on backend:', e);
    }
  }, []);

  const isStepCompleted = useCallback((stepOrder) => {
    return state.completedSteps.includes(stepOrder);
  }, [state.completedSteps]);

  const completedCount = state.completedSteps.length;
  const progressPercent = Math.round((completedCount / 8) * 100);

  return {
    ...state,
    completedCount,
    progressPercent,
    syncing,
    sessionId: sessionId.current,
    completeStep,
    goToStep,
    setStep1Choice,
    resetProgress,
    isStepCompleted,
  };
};
