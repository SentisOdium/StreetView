export interface Task {
  id: number;
  title: string;
  description: string;
  allowedActions?: string[];
  targetNodeNames?: string[];
}

export interface TaskProgress {
  taskId: number;
  status: 'pending' | 'completed' | 'skipped' | 'abandoned';
  startTime: number | null;
  finishTime: number | null;
  durationMs: number | null;
  clickCount: number;
  searchCount: number;
  routeGenerationCount: number;
  detailsViewed: boolean;
  routeInfoViewed: boolean;
  overlayOpenedCount: number;
}

export interface UsabilityState {
  version: string | null;
  tasks: Task[];
  currentTaskIndex: number;
  progress: TaskProgress[];
  isOverlayOpen: boolean;
  isTestingComplete: boolean;
  researcherMode: boolean;
  sessionUuid?: string;
}

export interface UsabilityActionLog {
  task_number: number;
  event_type: string;
  event_target: string;
  is_allowed: boolean;
}

