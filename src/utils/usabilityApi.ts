import axios from 'axios';
import type { TaskProgress } from '../types/Task';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const USABILITY_API = `${API_BASE}/api/usability`;

const mapVersionToEnum = (version: string) => {
  const v = version.toLowerCase();
  if (v === 'v1' || v === 'versiona') return 'A';
  if (v === 'v2' || v === 'versionb') return 'B';
  if (v === 'v3' || v === 'versionc') return 'C';
  return 'A'; // fallback
};

export const startUsabilitySession = async (sessionUuid: string, version: string) => {
  try {
    const response = await axios.post(`${USABILITY_API}/session`, {
      session_uuid: sessionUuid,
      version: mapVersionToEnum(version)
    });
    return response.data;
  } catch (error) {
    console.error('Error starting usability session:', error);
    return null;
  }
};

export const logUsabilityTask = async (sessionUuid: string, taskNumber: number, progress: TaskProgress) => {
  try {
    const payload = {
      session_uuid: sessionUuid,
      task_number: taskNumber,
      status: progress.status,
      duration_ms: progress.durationMs,
      interactions_count: progress.clickCount + progress.overlayOpenedCount,
      used_search: progress.searchCount > 0,
      used_minimap: progress.routeGenerationCount > 0 // Proxy for minimap/route usage
    };
    const response = await axios.post(`${USABILITY_API}/task`, payload);
    return response.data;
  } catch (error) {
    console.error('Error logging usability task:', error);
    return null;
  }
};
