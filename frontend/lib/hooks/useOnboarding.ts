import { useState, useEffect } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

export interface OnboardingProgress {
  hasCreatedBranch: boolean;
  hasCreatedUser: boolean;
  hasViewedDashboard: boolean;
  dismissed: boolean;
}

const ONBOARDING_KEY = 'noesis_onboarding_progress';

export function useOnboarding() {
  const [progress, setProgress] = useState<OnboardingProgress>({
    hasCreatedBranch: false,
    hasCreatedUser: false,
    hasViewedDashboard: false,
    dismissed: false,
  });

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ONBOARDING_KEY);
      if (saved) {
        try {
          setProgress(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to load onboarding progress:', error);
        }
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: Partial<OnboardingProgress>) => {
    const updated = { ...progress, ...newProgress };
    setProgress(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
    }
  };

  const markBranchCreated = () => saveProgress({ hasCreatedBranch: true });
  const markUserCreated = () => saveProgress({ hasCreatedUser: true });
  const markDashboardViewed = () => saveProgress({ hasViewedDashboard: true });
  const dismissOnboarding = () => saveProgress({ dismissed: true });
  const resetOnboarding = () => {
    const reset = {
      hasCreatedBranch: false,
      hasCreatedUser: false,
      hasViewedDashboard: false,
      dismissed: false,
    };
    setProgress(reset);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(reset));
    }
  };

  const completedSteps = [
    progress.hasCreatedBranch,
    progress.hasCreatedUser,
    progress.hasViewedDashboard,
  ].filter(Boolean).length;

  const totalSteps = 3;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const isComplete = completedSteps === totalSteps;
  const shouldShow = !progress.dismissed && !isComplete;

  return {
    progress,
    markBranchCreated,
    markUserCreated,
    markDashboardViewed,
    dismissOnboarding,
    resetOnboarding,
    completedSteps,
    totalSteps,
    progressPercentage,
    isComplete,
    shouldShow,
  };
}
