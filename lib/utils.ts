import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format a date string using date-fns
 * @param dateString - ISO date string or Date object
 * @param formatStr - date-fns format string (default: 'PP' - e.g., "Apr 29, 2023")
 */
export function formatDate(dateString: string | Date | null | undefined, formatStr = 'PP'): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}
