// Time Formatting Utilities

/**
 * Format seconds into MM:SS format (T+05:30)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `T+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format seconds into human-readable format (5 minutes 30 seconds)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }
  if (secs === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
}

/**
 * Parse time string (T+05:30) into seconds
 */
export function parseTime(timeStr: string): number {
  const match = timeStr.match(/T\+(\d+):(\d+)/);
  if (!match) return 0;

  const mins = parseInt(match[1], 10);
  const secs = parseInt(match[2], 10);
  return mins * 60 + secs;
}

/**
 * Get current timestamp for events
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}
