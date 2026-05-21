// lib/format-date.ts

// For homepage cards — show formatted date only, NEVER "just now" or "2h ago"
export function formatCardDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// For article page — full date
export function formatFullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// For admin — short date/time
export function formatAdminDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}
