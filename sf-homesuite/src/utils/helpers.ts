import dayjs from 'dayjs'

export function formatDate(date: string | Date | null | undefined, format = 'MMM D, YYYY'): string {
  if (!date) return '-'
  const d = dayjs(date)
  return d.isValid() ? d.format(format) : '-'
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = dayjs(date)
  return d.isValid() ? d.format('MMM D, YYYY h:mm A') : '-'
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = dayjs(date)
  return d.isValid() ? d.format('h:mm A') : '-'
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = dayjs(date)
  return d.isValid() ? d.fromNow() : '-'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    INITIATED: 'info',
    SCHEDULED: 'primary',
    ACCEPTED: 'success',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    REJECTED: 'error',
    CANCELLED: 'grey',
    NOT_REACHABLE: 'orange'
  }
  return colors[status] || 'grey'
}

export function getStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
