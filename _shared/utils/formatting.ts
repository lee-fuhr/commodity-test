/**
 * Text formatting utility functions
 */

/**
 * Extract hostname from URL, removing www. prefix
 * @param url - Full URL or hostname
 * @returns Clean hostname without www.
 */
export function formatHostname(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    // If URL parsing fails, assume it's already a hostname
    return url.replace(/^www\./, '')
  }
}

/**
 * Format company name from site snapshot or hostname
 * @param siteSnapshot - Site metadata with optional title
 * @param hostname - Fallback hostname to derive name from
 * @returns Formatted company name
 */
export function formatCompanyName(
  siteSnapshot: { title?: string } | undefined,
  hostname: string
): string {
  if (siteSnapshot?.title) {
    return siteSnapshot.title
  }

  // Derive from hostname: "acme.com" -> "acme"
  const cleanHost = formatHostname(hostname)
  return cleanHost.split('.')[0]
}

/**
 * Pad number with leading zeros
 * @param num - Number to pad
 * @param digits - Total digits (default: 2)
 * @returns Zero-padded string
 * @example padNumber(1, 2) // "01"
 * @example padNumber(42, 3) // "042"
 */
export function padNumber(num: number, digits: number = 2): string {
  return String(num).padStart(digits, '0')
}

/**
 * Truncate text to maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format date as readable string
 * @param date - Date object or timestamp
 * @returns Formatted date string like "January 15, 2024"
 */
export function formatDate(date: Date | number | string): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}
