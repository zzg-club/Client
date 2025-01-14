'use client'

import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { eachDayOfInterval, format } from 'date-fns'
import { useFormatDate } from './useFormatDate'

type DateInfo = [string, string] // [yyyy-MM-dd, day of week]

type UseHandleSelectReturn = {
  selectedDates: DateRange | Date[] | Date | undefined
  stringDates: DateInfo[]
  handleSelect: (selection: DateRange | Date[] | Date | undefined) => void
}

export function useHandleSelect(): UseHandleSelectReturn {
  const [selectedDates, setSelectedDates] = useState<
    DateRange | Date[] | Date | undefined
  >()
  const [stringDates, setStringDates] = useState<DateInfo[]>([])
  const { formatDateToString } = useFormatDate()

  const formatDateInfo = (date: Date): DateInfo => [
    formatDateToString(date),
    format(date, 'EEE').toLowerCase(),
  ]

  const handleSelect = (selection: DateRange | Date[] | Date | undefined) => {
    setSelectedDates(selection)
    if (selection) {
      if (Array.isArray(selection)) {
        // multiple mode 처리
        const formattedDates = selection.map(formatDateInfo)
        setStringDates(formattedDates)
        console.log('[multiple] 선택된 날짜:', formattedDates)
      } else if ('from' in selection && selection.from) {
        // range mode 처리
        if (selection.to) {
          const dates = eachDayOfInterval({
            start: selection.from,
            end: selection.to,
          })
          const formattedDates = dates.map(formatDateInfo)
          setStringDates(formattedDates)
          console.log('[range] 선택된 날짜:', formattedDates)
        } else {
          const startDayOnlyInfo = formatDateInfo(selection.from)
          setStringDates([startDayOnlyInfo])
          console.log('[range] 첫 날짜만 선택:', startDayOnlyInfo)
        }
      } else if (selection instanceof Date) {
        // single 모드 처리
        const formattedDate = formatDateInfo(selection)
        setStringDates([formattedDate])
        console.log('[single] 선택된 날짜:', formattedDate)
      }
    } else {
      setStringDates([])
      console.log('No date selected')
    }
  }

  return { selectedDates, stringDates, handleSelect }
}
