/**
 * Analytics Event Tracker for Vaultonaut AI Workspace.
 * Tracks application interactions:
 * - Conversation created
 * - Conversation opened
 * - Message sent
 * - Message regenerated
 * - Copy response
 * - Search conversation
 */

class AnalyticsService {
  track(eventName, properties = {}) {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      event: eventName,
      properties,
      timestamp
    };
    
    // In production mode, this sends data to analytics endpoint / telemetry collector
    console.log(`[Vaultonaut Analytics] ${eventName}:`, eventPayload);
  }
}

export const analytics = new AnalyticsService();
