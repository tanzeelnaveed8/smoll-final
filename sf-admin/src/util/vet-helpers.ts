import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

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

export function getStatusColor(status: string | null | undefined): string {
  const normalized = (status || '').toUpperCase()
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
  return colors[normalized] || 'grey'
}

export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Scheduled'

  const normalized = (status || '').toUpperCase()

  switch (normalized) {
    case 'INITIATED':
      return 'Initiated'
    case 'SCHEDULED':
      return 'Scheduled'
    case 'ACCEPTED':
      return 'Accepted'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'COMPLETED':
      return 'Completed'
    case 'REJECTED':
      return 'Rejected'
    case 'CANCELLED':
      return 'Cancelled'
    case 'NOT_REACHABLE':
      return 'Not Reachable'
    default:
      return normalized
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
  }
}
