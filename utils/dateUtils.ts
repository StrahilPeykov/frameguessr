/**
 * Get today's date in the user's local timezone in YYYY-MM-DD format
 * Use this for client-side date calculations
 */
export function getTodayLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get today's date in UTC timezone in YYYY-MM-DD format
 * Use this for server-side consistency across different deployment regions
 */
export function getTodayUTC(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
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
 * Format a date object to YYYY-MM-DD string in UTC timezone
 */
export function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a date string represents today in the user's local timezone
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayLocal()
}

/**
 * Check if a date string represents today in UTC timezone
 */
export function isTodayUTC(dateString: string): boolean {
  return dateString === getTodayUTC()
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
 * Get the date N days from today in UTC timezone
 */
export function getDateOffsetUTC(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return formatDateUTC(date)
}

/**
 * Parse a YYYY-MM-DD date string into a Date object at local midnight
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Parse a YYYY-MM-DD date string into a Date object at UTC midnight
 */
export function parseDateStringUTC(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Get yesterday's date in local timezone
 */
export function getYesterday(): string {
  return getDateOffset(-1)
}

/**
 * Get yesterday's date in UTC timezone
 */
export function getYesterdayUTC(): string {
  return getDateOffsetUTC(-1)
}

/**
 * Get tomorrow's date in local timezone
 */
export function getTomorrow(): string {
  return getDateOffset(1)
}

/**
 * Get tomorrow's date in UTC timezone
 */
export function getTomorrowUTC(): string {
  return getDateOffsetUTC(1)
}

/**
 * Check if a date string is in the future compared to today (local timezone)
 */
export function isFuture(dateString: string): boolean {
  return dateString > getTodayLocal()
}

/**
 * Check if a date string is in the future compared to today (UTC timezone)
 */
export function isFutureUTC(dateString: string): boolean {
  return dateString > getTodayUTC()
}

/**
 * Check if a date string is in the past compared to today (local timezone)
 */
export function isPast(dateString: string): boolean {
  return dateString < getTodayLocal()
}

/**
 * Check if a date string is in the past compared to today (UTC timezone)
 */
export function isPastUTC(dateString: string): boolean {
  return dateString < getTodayUTC()
}

/**
 * Get timezone-safe today's date
 * Uses local timezone for client-side rendering to match user expectations
 * Falls back to UTC for SSR to avoid hydration mismatches
 */
export function getTodayTimezoneAware(): string {
  // Check if we're running in the browser
  if (typeof window !== 'undefined') {
    // Client-side: use local timezone for better UX
    return getTodayLocal()
  } else {
    // Server-side: use UTC to avoid timezone mismatches
    return getTodayUTC()
  }
}

/**
 * Convert a local date string to the same logical date in UTC
 * Useful for database storage while preserving the intended date
 */
export function localDateToUTC(localDateString: string): string {
  const [year, month, day] = localDateString.split('-').map(Number)
  const utcDate = new Date(Date.UTC(year, month - 1, day))
  return formatDateUTC(utcDate)
}

/**
 * Convert a UTC date string to the same logical date in local timezone
 * Useful for displaying stored UTC dates to users
 */
export function utcDateToLocal(utcDateString: string): string {
  const [year, month, day] = utcDateString.split('-').map(Number)
  const localDate = new Date(year, month - 1, day)
  return formatDateLocal(localDate)
}

/**
 * Get the current timezone offset in hours
 */
export function getTimezoneOffset(): number {
  return -new Date().getTimezoneOffset() / 60
}

/**
 * Get a human-readable timezone string
 */
export function getTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'Unknown'
  }
}

/**
 * Validate if a date string is in YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false
  }
  
  const date = new Date(dateString + 'T00:00:00.000Z')
  const [year, month, day] = dateString.split('-').map(Number)
  
  return !isNaN(date.getTime()) && 
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
}

/**
 * Calculate the difference in days between two date strings
 */
export function daysDifference(date1: string, date2: string): number {
  const d1 = parseDateStringUTC(date1)
  const d2 = parseDateStringUTC(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get an array of date strings between two dates (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = parseDateStringUTC(startDate)
  const end = parseDateStringUTC(endDate)
  
  const current = new Date(start)
  while (current <= end) {
    dates.push(formatDateUTC(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  
  return dates
}

/**
 * Debug function to log timezone information
 * Useful for troubleshooting timezone issues
 */
export function debugTimezone(): void {
  console.log('Timezone Debug Info:', {
    local: getTodayLocal(),
    utc: getTodayUTC(),
    offset: getTimezoneOffset(),
    timezone: getTimezoneName(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    timestamp: new Date().toISOString()
  })
}