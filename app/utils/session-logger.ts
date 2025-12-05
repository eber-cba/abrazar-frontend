/**
 * Session Logger
 * Development utility for debugging authentication flow
 * Records token refreshes, login attempts, and forced logouts
 */

type SessionEvent = {
  type: 'LOGIN' | 'LOGOUT' | 'REFRESH_SUCCESS' | 'REFRESH_FAILED' | 'TOKEN_EXPIRED' | 'FORCED_LOGOUT' | 'AUTH_ERROR';
  timestamp: Date;
  details?: string;
};

class SessionLogger {
  private events: SessionEvent[] = [];
  private refreshAttempts: number = 0;
  private maxEvents: number = 100;

  /**
   * Log a session event
   */
  log(type: SessionEvent['type'], details?: string): void {
    const event: SessionEvent = {
      type,
      timestamp: new Date(),
      details,
    };

    this.events.push(event);

    // Keep only last N events to prevent memory issues
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log to console in development
    if (__DEV__) {
      const emoji = this.getEmoji(type);
      console.log(`${emoji} [SessionLogger] ${type}${details ? `: ${details}` : ''}`);
    }
  }

  /**
   * Track refresh token attempts
   */
  incrementRefreshAttempts(): number {
    this.refreshAttempts++;
    this.log('REFRESH_SUCCESS', `Attempt #${this.refreshAttempts}`);
    return this.refreshAttempts;
  }

  /**
   * Reset refresh attempts counter
   */
  resetRefreshAttempts(): void {
    this.refreshAttempts = 0;
  }

  /**
   * Get current refresh attempt count
   */
  getRefreshAttempts(): number {
    return this.refreshAttempts;
  }

  /**
   * Log successful login
   */
  logLogin(userEmail?: string): void {
    this.resetRefreshAttempts();
    this.log('LOGIN', userEmail ? `User: ${userEmail}` : undefined);
  }

  /**
   * Log logout (user initiated)
   */
  logLogout(): void {
    this.resetRefreshAttempts();
    this.log('LOGOUT', 'User initiated');
  }

  /**
   * Log forced logout (token invalid, session expired, etc.)
   */
  logForcedLogout(reason: string): void {
    this.log('FORCED_LOGOUT', reason);
    this.resetRefreshAttempts();
  }

  /**
   * Log token expiration
   */
  logTokenExpired(): void {
    this.log('TOKEN_EXPIRED');
  }

  /**
   * Log refresh token success
   */
  logRefreshSuccess(): void {
    this.incrementRefreshAttempts();
  }

  /**
   * Log refresh token failure
   */
  logRefreshFailed(error?: string): void {
    this.log('REFRESH_FAILED', error);
  }

  /**
   * Log authentication error
   */
  logAuthError(error: string): void {
    this.log('AUTH_ERROR', error);
  }

  /**
   * Get all events (for debugging)
   */
  getEvents(): SessionEvent[] {
    return [...this.events];
  }

  /**
   * Get summary of session activity
   */
  getSummary(): { totalEvents: number; refreshAttempts: number; lastEvent?: SessionEvent } {
    return {
      totalEvents: this.events.length,
      refreshAttempts: this.refreshAttempts,
      lastEvent: this.events[this.events.length - 1],
    };
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    this.refreshAttempts = 0;
  }

  /**
   * Get emoji for event type
   */
  private getEmoji(type: SessionEvent['type']): string {
    switch (type) {
      case 'LOGIN':
        return '🔐';
      case 'LOGOUT':
        return '👋';
      case 'REFRESH_SUCCESS':
        return '🔄';
      case 'REFRESH_FAILED':
        return '❌';
      case 'TOKEN_EXPIRED':
        return '⏰';
      case 'FORCED_LOGOUT':
        return '🚨';
      case 'AUTH_ERROR':
        return '⚠️';
      default:
        return '📝';
    }
  }
}

// Export singleton instance
export const sessionLogger = new SessionLogger();

// Export type for external use
export type { SessionEvent };
