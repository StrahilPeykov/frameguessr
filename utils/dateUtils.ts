/**
 * Get today's date in the user's local timezone in YYYY-MM-DD format
 */
export function getTodayLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a date object to YYYY-MM-DD string in local timezone
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a date string represents today in the user's local timezone
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayLocal()
}

/**
 * Get the date N days from today in local timezone
 */
export function getDateOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDateLocal(date)
}

/**
 * Parse a YYYY-MM-DD date string into a Date object at local midnight
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get yesterday's date in local timezone
 */
export function getYesterday(): string {
  return getDateOffset(-1)
}

/**
 * Get tomorrow's date in local timezone
 */
export function getTomorrow(): string {
  return getDateOffset(1)
}

/**
 * Check if a date string is in the future compared to today (local timezone)
 */
export function isFuture(dateString: string): boolean {
  return dateString > getTodayLocal()
}

/**
 * Check if a date string is in the past compared to today (local timezone)
 */
export function isPast(dateString: string): boolean {
  return dateString < getTodayLocal()
}