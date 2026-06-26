import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Task, UsabilityState, TaskProgress, UsabilityActionLog } from '../types/Task';
import { versionA } from '../data/tasks/versionA';
import { versionB } from '../data/tasks/versionB';
import { versionC } from '../data/tasks/versionC';
import { startUsabilitySession, logUsabilityTasksBulk, logUsabilityActionsBulk } from '../utils/usabilityApi';

const STORAGE_KEY = 'pup_wayfinder_usability_state';
const ACTIONS_STORAGE_KEY = 'pup_wayfinder_usability_actions';

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
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface TaskTestingContextProps {
  state: UsabilityState;
  versionName: string;
  currentTask: Task | null;
  startTask: () => void;
  completeTask: () => void;
  skipTask: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
  finishTesting: () => void;
  jumpToTask: (index: number) => void;
  resetTasks: () => void;
  logAction: (eventType: string, eventTarget: string, isAllowed?: boolean) => void;
  checkAction: (actionType: string, targetName?: string) => boolean;
}

const TaskTestingContext = createContext<TaskTestingContextProps | undefined>(undefined);

export const useTaskTesting = () => {
  const context = useContext(TaskTestingContext);
  if (!context) {
    throw new Error('useTaskTesting must be used within a TaskTestingProvider');
  }
  return context;
};

export const TaskTestingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const taskParam = searchParams.get('task');
  const researcherParam = searchParams.get('researcher');
  
  const loggedSessionRef = useRef<string | null>(null);

  const [state, setState] = useState<UsabilityState>(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (!taskParam || taskParam === parsed.version) {
          if (!parsed.sessionUuid) {
            parsed.sessionUuid = generateUUID();
          }
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse usability state', e);
      }
    }

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
      sessionUuid: generateUUID(),
    };
  });

  const [actionsQueue, setActionsQueue] = useState<UsabilityActionLog[]>(() => {
    const saved = sessionStorage.getItem(ACTIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (state.version) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    if (state.version) {
      sessionStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actionsQueue));
    }
  }, [actionsQueue, state.version]);

  useEffect(() => {
    if (state.sessionUuid && state.version) {
      startUsabilitySession(state.sessionUuid, state.version);
    }
  }, []);

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
        sessionUuid: state.sessionUuid || generateUUID(),
      });
      setActionsQueue([]);
      sessionStorage.removeItem(ACTIONS_STORAGE_KEY);
      
      if (state.sessionUuid) {
        startUsabilitySession(state.sessionUuid, taskParam);
      }
    }
  }, [taskParam, researcherParam, state.version, state.sessionUuid]);

  const logAction = useCallback((eventType: string, eventTarget: string, isAllowed = true) => {
    if (!state.version || state.isTestingComplete) return;
    const currentTask = state.tasks[state.currentTaskIndex];
    if (!currentTask) return;

    const newAction: UsabilityActionLog = {
      task_number: currentTask.id,
      event_type: eventType,
      event_target: String(eventTarget),
      is_allowed: isAllowed,
    };

    setActionsQueue(prev => [...prev, newAction]);
  }, [state.version, state.isTestingComplete, state.tasks, state.currentTaskIndex]);

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

  useEffect(() => {
    if (state.isTestingComplete && state.sessionUuid && state.sessionUuid !== loggedSessionRef.current) {
      logUsabilityTasksBulk(state.sessionUuid, state.progress);
      if (actionsQueue.length > 0) {
        logUsabilityActionsBulk(state.sessionUuid, actionsQueue);
        setActionsQueue([]);
        sessionStorage.removeItem(ACTIONS_STORAGE_KEY);
      }
      loggedSessionRef.current = state.sessionUuid;
    }
  }, [state.isTestingComplete, state.sessionUuid, state.progress, actionsQueue]);

  useEffect(() => {
    const handleGlobalClick = () => {
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
    // Session end cleanup
  }, []);

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
    setActionsQueue([]);
    sessionStorage.removeItem(ACTIONS_STORAGE_KEY);
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const checkAction = useCallback((actionType: string, targetName?: string): boolean => {
    if (!state.version || state.isOverlayOpen || state.isTestingComplete) {
      return true;
    }

    const currentTask = state.tasks[state.currentTaskIndex];
    if (!currentTask) return true;

    const currentTaskProgress = state.progress.find(p => p.taskId === currentTask.id);
    const isTaskStarted = currentTaskProgress?.status === 'pending';
    
    if (!isTaskStarted) {
      showToast("Please click 'Start Task' in the panel to begin.");
      return false;
    }

    if (currentTask.allowedActions && !currentTask.allowedActions.includes(actionType)) {
      showToast(`Action restricted: Not allowed for task "${currentTask.title}"`);
      logAction(actionType, targetName || 'unspecified', false);
      return false;
    }

    if (actionType !== 'navigation' && targetName && currentTask.targetNodeNames && currentTask.targetNodeNames.length > 0) {
      const isTarget = currentTask.targetNodeNames.some(name => 
        targetName.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(targetName.toLowerCase())
      );
      if (!isTarget) {
        showToast(`Action restricted: Not related to ${currentTask.targetNodeNames.join(' / ')}`);
        logAction(actionType, targetName, false);
        return false;
      }
    }

    logAction(actionType, targetName || 'unspecified', true);
    return true;
  }, [state, showToast, logAction]);

  return (
    <TaskTestingContext.Provider
      value={{
        state,
        versionName: state.version ? getVersionName(state.version) : '',
        currentTask: state.tasks[state.currentTaskIndex] || null,
        startTask,
        completeTask,
        skipTask,
        openOverlay,
        closeOverlay,
        finishTesting,
        jumpToTask,
        resetTasks,
        logAction,
        checkAction,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] bg-[#800000] text-white px-6 py-3 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md font-bold text-sm animate-bounce-subtle pointer-events-none">
          ⚠️ {toastMessage}
        </div>
      )}
    </TaskTestingContext.Provider>
  );
};
