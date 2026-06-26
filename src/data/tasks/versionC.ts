import type { Task } from '../../types/Task';

export const versionC: Task[] = [
  {
    id: 1,
    title: 'Search Function',
    description: 'Using the search feature, locate the **AVR** and open its location details on the map.',
    allowedActions: ['search', 'marker_click'],
    targetNodeNames: ['AVR']
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
    description: "Using the system, find the route from the **OMIT Chairperson's Office** to the **ADFA Office**.",
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ["OMIT Chairperson's Office", 'ADFA Office']
  },
  {
    id: 4,
    title: 'Emergency Navigation',
    description: 'After reaching the **ADFA Office**, locate the nearest **Emergency Exit**.',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ['ADFA Office', 'Emergency Exit']
  },
  {
    id: 5,
    title: 'Office Navigation',
    description: 'Using the system, locate the **Faculty Office (Room 308, 3rd Floor)** from the **ADFA Office**.',
    allowedActions: ['directions', 'search', 'navigation', 'marker_click'],
    targetNodeNames: ['Faculty Office (Room 308, 3rd Floor)', 'ADFA Office']
  }
];
