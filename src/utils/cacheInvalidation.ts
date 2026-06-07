/**
 * Helper to broadcast admin data changes across tabs and within the same tab.
 * It writes to localStorage (for cross‑tab sync) and dispatches a CustomEvent
 * (`admin_data_changed`) that listeners in the same tab can react to.
 */
export function broadcastAdminChange(payload: {
  nodeId: number;
  type: string;
  timestamp: number;
}) {
  try {
    // Cross‑tab sync via localStorage
    localStorage.setItem('admin_data_changed', JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to write admin_data_changed to localStorage', e);
  }

  try {
    const event = new CustomEvent('admin_data_changed', { detail: payload });
    window.dispatchEvent(event);
  } catch (e) {
    console.warn('Failed to dispatch admin_data_changed event', e);
  }
}
