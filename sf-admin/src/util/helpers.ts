import { CaseStatusEnum } from '@/stores/types/cases.d'
import dayjs from 'dayjs'

export const truncateString = (str: string | null | undefined, num: number) => {
  if (!str) return '-'
  if (str.length > num) {
    return str.slice(0, num) + '...'
  } else {
    return str
  }
}

export const getDateObject = (date: string) => {
  const parsedDate = new Date(date)
  return {
    date: parsedDate.getDate().toString(),
    month: dayjs(parsedDate).format('MMMM'),
    year: parsedDate.getFullYear().toString()
  }
}

export const shortenFileName = (fileName: string, maxLength: number): string => {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return fileName // No extension found

  const name = fileName.slice(0, lastDotIndex)
  const extension = fileName.slice(lastDotIndex) // Keep the extension

  return name.length > maxLength ? name.slice(0, maxLength) + '...' + extension : fileName
}

// function parseTime(timeStr: string) {
//   const period = timeStr.slice(-2) // 'AM' or 'PM'
//   let hours = parseInt(timeStr.slice(0, -2), 10)

//   if (period === 'PM' && hours !== 12) hours += 12
//   if (period === 'AM' && hours === 12) hours = 0

//   return hours * 60 // convert to minutes
// }

// export function sortByCurrentTime(arr: { id: string; content: string }[]) {
//   const now = new Date()
//   const currentMinutes = now.getHours() * 60

//   const sortedTimeGroup = arr
//     .map((obj: { id: string; content: string }) => ({
//       ...obj,
//       timeInMinutes: parseTime(obj.id)
//     }))
//     .sort((a: any, b: any) => {
//       const diffA = (a.timeInMinutes - currentMinutes + 1440) % 1440
//       const diffB = (b.timeInMinutes - currentMinutes + 1440) % 1440
//       return diffA - diffB
//     })

//   return sortedTimeGroup
// }

// export const convertTimeToUtc = (time: string) => {
//   const date = dayjs().format('YYYY-MM-DD')

//   return dayjs(date.toString() + 'T' + time)
//     .utc()
//     .format('HH:mm')
// }

// export const convertTimeToLocal = (time: string) => {
//   const date = dayjs().format('YYYY-MM-DD')

//   return dayjs(date.toString() + 'T' + time + 'Z').format('HH:mm')
// }

export const getCaseStatusData = (
  status: CaseStatusEnum
): {
  label: string
  color: string
} => {
  switch (status) {
    case CaseStatusEnum.PENDING:
      return {
        label: 'Open',
        color: '#56b686'
      }
    case CaseStatusEnum.OPEN_ESCALATED:
      return {
        label: 'Open Escalated',
        color: '#e31f7d'
      }
    case CaseStatusEnum.CONFIRMED:
      return {
        label: 'Confirmed',
        color: '#222222'
      }
    case CaseStatusEnum.REJECTED:
      return {
        label: 'Rejected',
        color: '#E02A2A'
      }
    default:
      return {
        label: 'Unknown',
        color: '#000'
      }
  }
}
