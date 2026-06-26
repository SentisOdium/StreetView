import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Task, UsabilityState, TaskProgress } from '../types/Task';
import { versionA } from '../data/tasks/versionA';
import { versionB } from '../data/tasks/versionB';
import { versionC } from '../data/tasks/versionC';

const STORAGE_KEY = 'pup_wayfinder_usability_state';

const getTasksForVersion = (version: string): Task[] => {
  switch (version.toLowerCase()) {
    case 'v1':
    case 'versiona':
      return versionA;
    case 'v2':
    case 'versionb':
      return versionB;
    case 'v3':
    case 'versionc':
      return versionC;
    default:
      return [];
  }
};

const getVersionName = (version: string): string => {
  switch (version.toLowerCase()) {
    case 'v1': return 'Version A';
    case 'v2': return 'Version B';
    case 'v3': return 'Version C';
    default: return version;
  }
}

export const useTaskTesting = () => {
  const [searchParams] = useSearchParams();
  const taskParam = searchParams.get('task');
  const researcherParam = searchParams.get('researcher');

  const [state, setState] = useState<UsabilityState>(() => {
    // Try to load from session storage
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // We only restore if the URL parameter matches or if there's no URL param but we have state
        if (!taskParam || taskParam === parsed.version) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse usability state', e);
      }
    }

    // Initialize new state
    const version = taskParam || null;
    const tasks = version ? getTasksForVersion(version) : [];
    return {
      version,
      tasks,
      currentTaskIndex: 0,
      progress: [],
      isOverlayOpen: !!version,
      isTestingComplete: false,
      researcherMode: researcherParam === 'true',
    };
  });

  // Save to sessionStorage whenever state changes (but only if we are in testing mode)
  useEffect(() => {
    if (state.version) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Sync state if URL changes dynamically
  useEffect(() => {
    if (taskParam && taskParam !== state.version) {
      const newTasks = getTasksForVersion(taskParam);
      setState({
        version: taskParam,
        tasks: newTasks,
        currentTaskIndex: 0,
        progress: [],
        isOverlayOpen: true,
        isTestingComplete: false,
        researcherMode: researcherParam === 'true',
      });
    }
  }, [taskParam, researcherParam, state.version]);

  const startTask = useCallback(() => {
    setState((prev) => {
      const currentTask = prev.tasks[prev.currentTaskIndex];
      const newProgress = [...prev.progress];
      const existingProgressIndex = newProgress.findIndex((p) => p.taskId === currentTask.id);
      
      const progressEntry: TaskProgress = {
        taskId: currentTask.id,
        status: 'pending',
        startTime: Date.now(),
        finishTime: null,
        durationMs: null,
        clickCount: 0,
        searchCount: 0,
        routeGenerationCount: 0,
        detailsViewed: false,
        routeInfoViewed: false,
        overlayOpenedCount: 0,
      };

      if (existingProgressIndex >= 0) {
        if (newProgress[existingProgressIndex].status !== 'pending') {
           newProgress[existingProgressIndex] = progressEntry;
        }
      } else {
        newProgress.push(progressEntry);
      }

      return {
        ...prev,
        progress: newProgress,
      };
    });
  }, []);

  const completeTask = useCallback(() => {
    setState((prev) => {
      const currentTask = prev.tasks[prev.currentTaskIndex];
      const newProgress = [...prev.progress];
      const progressIndex = newProgress.findIndex((p) => p.taskId === currentTask.id);
      
      const now = Date.now();
      if (progressIndex >= 0) {
        const startTime = newProgress[progressIndex].startTime || now;
        newProgress[progressIndex] = {
          ...newProgress[progressIndex],
          status: 'completed',
          finishTime: now,
          durationMs: now - startTime,
        };
      }

      const isLastTask = prev.currentTaskIndex >= prev.tasks.length - 1;

      return {
        ...prev,
        progress: newProgress,
        currentTaskIndex: isLastTask ? prev.currentTaskIndex : prev.currentTaskIndex + 1,
        isOverlayOpen: true, 
        isTestingComplete: isLastTask,
      };
    });
  }, []);

  const skipTask = useCallback(() => {
    setState((prev) => {
      const currentTask = prev.tasks[prev.currentTaskIndex];
      const newProgress = [...prev.progress];
      const progressIndex = newProgress.findIndex((p) => p.taskId === currentTask.id);
      
      const now = Date.now();
      if (progressIndex >= 0) {
        const startTime = newProgress[progressIndex].startTime || now;
        newProgress[progressIndex] = {
          ...newProgress[progressIndex],
          status: 'skipped',
          finishTime: now,
          durationMs: now - startTime,
        };
      } else {
        newProgress.push({
          taskId: currentTask.id,
          status: 'skipped',
          startTime: now,
          finishTime: now,
          durationMs: 0,
          clickCount: 0,
          searchCount: 0,
          routeGenerationCount: 0,
          detailsViewed: false,
          routeInfoViewed: false,
          overlayOpenedCount: 0,
        });
      }

      const isLastTask = prev.currentTaskIndex >= prev.tasks.length - 1;

      return {
        ...prev,
        progress: newProgress,
        currentTaskIndex: isLastTask ? prev.currentTaskIndex : prev.currentTaskIndex + 1,
        isOverlayOpen: true,
        isTestingComplete: isLastTask,
      };
    });
  }, []);

  // --- Metrics Event Listeners ---
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      setState(prev => {
        if (prev.isOverlayOpen || prev.isTestingComplete || prev.tasks.length === 0) return prev;
        const currentTask = prev.tasks[prev.currentTaskIndex];
        const newProgress = [...prev.progress];
        const pIndex = newProgress.findIndex(p => p.taskId === currentTask.id);
        if (pIndex >= 0 && newProgress[pIndex].status === 'pending') {
          newProgress[pIndex] = { ...newProgress[pIndex], clickCount: newProgress[pIndex].clickCount + 1 };
          return { ...prev, progress: newProgress };
        }
        return prev;
      });
    };

    const handleCustomMetric = (e: Event) => {
      const customEvent = e as CustomEvent;
      const metric = customEvent.detail;
      setState(prev => {
        if (prev.isTestingComplete || prev.tasks.length === 0) return prev;
        const currentTask = prev.tasks[prev.currentTaskIndex];
        const newProgress = [...prev.progress];
        const pIndex = newProgress.findIndex(p => p.taskId === currentTask.id);
        if (pIndex >= 0 && newProgress[pIndex].status === 'pending') {
          const p = { ...newProgress[pIndex] };
          if (metric === 'search') p.searchCount += 1;
          else if (metric === 'routeGeneration') p.routeGenerationCount += 1;
          else if (metric === 'detailsViewed') p.detailsViewed = true;
          else if (metric === 'routeInfoViewed') p.routeInfoViewed = true;
          newProgress[pIndex] = p;
          return { ...prev, progress: newProgress };
        }
        return prev;
      });
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    window.addEventListener('usability_metric', handleCustomMetric);
    
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
      window.removeEventListener('usability_metric', handleCustomMetric);
    };
  }, []);

  const openOverlay = useCallback(() => {
    setState((prev) => {
      const currentTask = prev.tasks[prev.currentTaskIndex];
      const newProgress = [...prev.progress];
      const pIndex = newProgress.findIndex(p => p.taskId === currentTask?.id);
      if (pIndex >= 0 && newProgress[pIndex].status === 'pending') {
        newProgress[pIndex] = { ...newProgress[pIndex], overlayOpenedCount: newProgress[pIndex].overlayOpenedCount + 1 };
      }
      return { ...prev, isOverlayOpen: true, progress: newProgress };
    });
  }, []);

  const closeOverlay = useCallback(() => {
    setState((prev) => ({ ...prev, isOverlayOpen: false }));
  }, []);

  const finishTesting = useCallback(() => {
    // Researcher or participant is completely done. Could clear session storage here if desired.
    // For now, we will leave it so they don't lose data by accident.
    // Navigation to SUS page should be handled by the component.
  }, []);

  // Researcher actions
  const jumpToTask = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentTaskIndex: Math.max(0, Math.min(index, prev.tasks.length - 1)),
      isTestingComplete: false,
    }));
  }, []);

  const resetTasks = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentTaskIndex: 0,
      progress: [],
      isTestingComplete: false,
    }));
  }, []);

  return {
    state,
    versionName: state.version ? getVersionName(state.version) : '',
    currentTask: state.tasks[state.currentTaskIndex] || null,
    startTask,
    completeTask,
    skipTask,
    openOverlay,
    closeOverlay,
    finishTesting,
    // Researcher tools
    jumpToTask,
    resetTasks,
  };
};
