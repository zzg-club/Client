'use client'

import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { eachDayOfInterval } from 'date-fns'
import { useFormatDate } from './useFormatDate'

type UseHandleSelectReturn = {
  selectedDates: DateRange | Date[] | Date | undefined
  stringDates: string[]
  handleSelect: (selection: DateRange | Date[] | Date | undefined) => void
}

// 달력 날짜 선택 모드(single, range, multiple)에 따라 날짜 데이터 포맷 변경 후 배열을 반환하는 훅
export function useHandleSelect(): UseHandleSelectReturn {
  const [selectedDates, setSelectedDates] = useState<
    DateRange | Date[] | Date | undefined
  >()
  const [stringDates, setStringDates] = useState<string[]>([])
  const { formatDateToString } = useFormatDate()

  const handleSelect = (selection: DateRange | Date[] | Date | undefined) => {
    setSelectedDates(selection)
    if (selection) {
      if (Array.isArray(selection)) {
        // multiple mode 처리
        const formattedDates = selection.map(formatDateToString)
        setStringDates(formattedDates)
        console.log('[multiple] 선택된 날짜:', formattedDates)
      } else if ('from' in selection && selection.from) {
        // range mode 처리
        if (selection.to) {
          const dates = eachDayOfInterval({
            start: selection.from,
            end: selection.to,
          })
          const formattedDates = dates.map(formatDateToString)
          setStringDates(formattedDates)
          console.log('[range] 선택된 날짜:', formattedDates)
        } else {
          const startDayOnlyString = formatDateToString(selection.from)
          setStringDates([startDayOnlyString])
          console.log('[range] 첫 날짜만 선택:', startDayOnlyString)
        }
      } else if (selection instanceof Date) {
        // single 모드 처리
        const formattedDate = formatDateToString(selection)
        setStringDates([formattedDate])
        console.log('[single] 선택된 날짜:', formattedDate)
      }
    } else {
      console.log('No date selected')
    }
  }

  return { selectedDates, stringDates, handleSelect }
}
