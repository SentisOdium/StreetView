import type { Task } from '../../types/Task';

export const versionA: Task[] = [
  {
    id: 1,
    title: 'Search Function',
    description: 'Using the search feature, locate the **Registrar Office** and open its location details on the map.',
    allowedActions: ['search', 'marker_click'],
    targetNodeNames: ['Registrar']
  },
  {
    id: 2,
    title: 'Route Information',
    description: 'While viewing a Location details, identify the additional navigation information provided by the system (e.g., estimated distance, floor level, landmarks, or accessibility information).',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click']
  },
  {
    id: 3,
    title: 'Route Navigation',
    description: 'Using the system, find the route from the **Main Entrance** to **IT Laboratory 105**.',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ['Entrance', '105']
  },
  {
    id: 4,
    title: 'Emergency Navigation',
    description: 'After reaching **IT Laboratory 105**, locate the nearest **Emergency Exit**.',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ['105', 'Exit']
  },
  {
    id: 5,
    title: 'Facility Locator',
    description: 'From the **Library**, locate the nearest **Restroom**.',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ['Library', 'Restroom']
  }
];
