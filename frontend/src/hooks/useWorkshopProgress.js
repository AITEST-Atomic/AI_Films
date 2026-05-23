import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'afm_workshop_progress';

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

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [state]);

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

  const resetProgress = useCallback(() => {
    setState({
      completedSteps: [],
      step1Choice: null,
      currentStep: 1,
    });
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
    completeStep,
    goToStep,
    setStep1Choice,
    resetProgress,
    isStepCompleted,
  };
};
