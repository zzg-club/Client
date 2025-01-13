import { create } from 'zustand'
import { format, addHours, addDays, parse, isAfter } from 'date-fns'

interface DateTimeState {
  startDate: Date | undefined // 시작날짜
  endDate: Date | undefined // 종료날짜
  startTime: string // 시작시간
  endTime: string // 종료시간
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
  setStartTime: (time: string) => void
  setEndTime: (time: string) => void
  adjustEndDateTime: () => void // 하루를 기준으로 endTime이 startTime보다 앞 시간일 때 endDate +1
}

export const useDateTimeStore = create<DateTimeState>((set, get) => ({
  startDate: undefined,
  endDate: undefined,
  startTime: '08:00 PM',
  endTime: '09:00 PM',
  setStartDate: (date) => set({ startDate: date, endDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setStartTime: (time) => {
    set({ startTime: time })
    const nextHour = addHours(parse(time, 'hh:mm a', new Date()), 1)
    set({ endTime: format(nextHour, 'hh:mm a') })
  },
  setEndTime: (time) => set({ endTime: time }),
  adjustEndDateTime: () => {
    const { startDate, endDate, startTime, endTime } = get()
    if (startDate && endDate) {
      const startDateTime = parse(startTime, 'hh:mm a', startDate)
      const endDateTime = parse(endTime, 'hh:mm a', endDate)
      if (!isAfter(endDateTime, startDateTime)) {
        set({ endDate: addDays(endDate, 1) })
      }
    }
  },
}))
