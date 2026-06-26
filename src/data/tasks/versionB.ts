import type { Task } from '../../types/Task';

export const versionB: Task[] = [
  {
    id: 1,
    title: 'Search Function',
    description: 'Using the search feature, locate the **Library** and open its location details on the map.',
    allowedActions: ['search', 'marker_click'],
    targetNodeNames: ['Library']
  },
  {
    id: 2,
    title: 'Route Information',
    description: 'While viewing a route to any destination, identify the additional navigation information provided by the system (e.g., estimated distance, floor level, landmarks, or accessibility information).',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click']
  },
  {
    id: 3,
    title: 'Route Navigation',
    description: 'Using the system, find the route from the **Mechanical Laboratory** to **Room 305**.',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ['Mechanical Laboratory', 'Room 305']
  },
  {
    id: 4,
    title: 'Emergency Navigation',
    description: 'After reaching **Room 305**, locate the nearest **Emergency Exit**.',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ['Room 305', 'Emergency Exit']
  },
  {
    id: 5,
    title: 'Office Navigation',
    description: "Using the system, locate the **Dean's Office** from the **Medical Clinic**.",
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ["Dean's Office", 'Medical Clinic']
  }
];
