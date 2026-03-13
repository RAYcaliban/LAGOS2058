/**
 * Formatting utilities for LAGOS 2058.
 *
 * Locale-aware formatters for numbers, percentages, PC costs, and
 * dates / relative timestamps used throughout the UI.
 */

import { format as fnsFormat, formatDistanceToNow, parseISO } from 'date-fns';

// ---------------------------------------------------------------------------
// Numeric formatters
// ---------------------------------------------------------------------------

/**
 * Format a number with locale-aware thousand separators.
 *
 * @example formatNumber(12345) // "12,345"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Format a decimal as a percentage string.
 *
 * @param n         Value where 1.0 = 100%.  Accepts any numeric range.
 * @param decimals  Number of decimal places (default 1).
 *
 * @example formatPercent(0.35)    // "35.0%"
 * @example formatPercent(0.351, 2) // "35.10%"
 */
export function formatPercent(n: number, decimals: number = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Format a Political Capital value for display.
 *
 * @example formatPC(7) // "7 PC"
 */
export function formatPC(pc: number): string {
  return `${pc} PC`;
}

// ---------------------------------------------------------------------------
// Date / time formatters
// ---------------------------------------------------------------------------

/** Coerce a string-or-Date to a Date object. */
function toDate(date: string | Date): Date {
  if (typeof date === 'string') {
    return parseISO(date);
  }
  return date;
}

/**
 * Format a date as a readable string.
 *
 * @example formatDate('2058-03-15T18:00:00Z') // "Mar 15, 2058"
 */
export function formatDate(date: string | Date): string {
  return fnsFormat(toDate(date), 'MMM d, yyyy');
}

/**
 * Format a date as a human-readable relative time string.
 *
 * @example formatRelativeTime('2058-03-15T16:00:00Z') // "2 hours ago"
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
}

/**
 * Format a turn deadline for display in the game UI.
 *
 * @param deadline  ISO timestamp, Date, or null if no deadline is set.
 * @returns         "Deadline: Mar 15, 6:00 PM" or "No deadline set".
 *
 * @example formatTurnDeadline('2058-03-15T18:00:00Z') // "Deadline: Mar 15, 6:00 PM"
 * @example formatTurnDeadline(null)                    // "No deadline set"
 */
export function formatTurnDeadline(deadline: string | Date | null): string {
  if (deadline === null) {
    return 'No deadline set';
  }
  const d = toDate(deadline);
  return `Deadline: ${fnsFormat(d, 'MMM d, h:mm a')}`;
}
