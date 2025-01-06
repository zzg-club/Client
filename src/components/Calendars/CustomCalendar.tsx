'use client'

import {
  DateRange,
  DayPicker,
  SelectMultipleEventHandler,
  SelectRangeEventHandler,
  SelectSingleEventHandler,
} from 'react-day-picker'
import { useState } from 'react'
import '../../styles/CustomCalendarStyle.css'
import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { isBefore } from 'date-fns' // 날짜 비교를 위한 date-fns 라이브러리 사용

type Mode = 'range' | 'multiple' | 'single'

interface CustomCalendarProps {
  initialMode?: Mode
  selected?: DateRange | Date[] | Date
  onSelect?: (date: DateRange | Date[] | Date | undefined) => void
}

export default function CustomCalendar({
  initialMode = 'range',
  selected,
  onSelect,
}: CustomCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date())
  const [mode, setMode] = useState<Mode>(initialMode)
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 오늘 날짜의 시간을 초기화

  const getDatesByWeekdays = (weekdays: number[], month: Date) => {
    const dates: Date[] = []
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDayOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    )

    for (
      let day = new Date(firstDayOfMonth);
      day <= lastDayOfMonth;
      day.setDate(day.getDate() + 1)
    ) {
      if (weekdays.includes(day.getDay()) && !isBefore(day, today)) {
        dates.push(new Date(day))
      }
    }
    return dates
  }

  const handleWeekdayClick = (weekday: number) => {
    let newSelectedWeekdays: number[]

    if (selectedWeekdays.includes(weekday)) {
      // 이미 선택된 요일을 클릭한 경우 제거
      newSelectedWeekdays = selectedWeekdays.filter((day) => day !== weekday)
    } else {
      // 새로운 요일을 선택한 경우 추가
      newSelectedWeekdays = [...selectedWeekdays, weekday]
    }

    setSelectedWeekdays(newSelectedWeekdays)

    if (newSelectedWeekdays.length > 0) {
      // 요일이 하나라도 선택된 경우
      setMode('multiple')
      const dates = getDatesByWeekdays(newSelectedWeekdays, month)
      onSelect?.(dates)
    } else {
      // 모든 요일 선택이 해제된 경우
      setMode('range')
      onSelect?.({ from: undefined, to: undefined })
    }
  }

  const handleDayClick = (day: Date) => {
    if (mode === 'multiple') {
      setMode('range')
      setSelectedWeekdays([])
      onSelect?.({ from: day, to: undefined })
    }
  }

  const handleRangeSelect: SelectRangeEventHandler = (range) => {
    if (mode === 'range') {
      onSelect?.(range)
    }
  }

  const handleMultipleSelect: SelectMultipleEventHandler = (dates) => {
    if (mode === 'multiple') {
      onSelect?.(dates || [])
    }
  }

  const handleSingleSelect: SelectSingleEventHandler = (date) => {
    if (mode === 'single') {
      onSelect?.(date)
    }
  }

  const commonProps = {
    month,
    onMonthChange: setMonth,
    showOutsideDays: false,
    onDayClick: handleDayClick,
    disabled: (date: Date) => isBefore(date, today), // 오늘 이전 날짜를 비활성화
    modifiers: {
      firstWeekday: (date: Date) => {
        // 요일별 첫번째 날짜 찾기
        const weekdayToFirstDateMap = selectedWeekdays.reduce(
          (acc, weekday) => {
            const dates = getDatesByWeekdays([weekday], month)
            if (dates.length > 0) {
              acc[weekday] = dates[0].getTime() // 요일별 첫 번째 날짜
            }
            return acc
          },
          {} as Record<number, number>,
        )
        return Object.values(weekdayToFirstDateMap).includes(date.getTime())
      },
      lastWeekday: (date: Date) => {
        // 요일별 마지막 날짜 찾기
        const weekdayToLastDateMap = selectedWeekdays.reduce(
          (acc, weekday) => {
            const dates = getDatesByWeekdays([weekday], month)
            if (dates.length > 0) {
              acc[weekday] = dates[dates.length - 1].getTime() // 요일별 마지막 날짜
            }
            return acc
          },
          {} as Record<number, number>,
        )
        return Object.values(weekdayToLastDateMap).includes(date.getTime())
      },
    },
    modifiersClassNames: {
      firstWeekday: 'weekday-first',
      lastWeekday: 'weekday-last',
    },
    classNames: {
      months: 'calendar-months',
      month: 'calendar-month',
      caption: 'calendar-caption',
      caption_label: 'calendar-caption-label',
      nav: 'calendar-nav',
      nav_button: 'calendar-nav-button',
      nav_button_previous: 'calendar-nav-button-prev',
      nav_button_next: 'calendar-nav-button-next',
      table: 'calendar-table',
      head_row: 'calendar-head-row',
      head_cell: 'calendar-head-cell',
      row: 'calendar-row',
      cell: 'calendar-cell',
      day: 'calendar-day',
      day_selected: 'calendar-day-selected',
      day_today: 'calendar-day-today',
      day_outside: 'calendar-day-outside',
      day_range_start: 'calendar-day-range-start',
      day_range_middle: 'calendar-day-range-middle',
      day_range_end: 'calendar-day-range-end',
      day_disabled: 'calendar-day-disabled', // 비활성화된 날짜의 클래스
    },
    components: {
      Caption: ({ displayMonth }: { displayMonth: Date }) => (
        <div className="flex items-center px-1 py-3 gap-2">
          <span className="text-xl font-semibold">
            {displayMonth.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <div className="flex gap-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMonth(
                  new Date(
                    displayMonth.getFullYear(),
                    displayMonth.getMonth() - 1,
                  ),
                )
              }}
              className="text-[#3b82f6] hover:text-blue-700 w-6"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMonth(
                  new Date(
                    displayMonth.getFullYear(),
                    displayMonth.getMonth() + 1,
                  ),
                )
              }}
              className="text-[#3b82f6] hover:text-blue-700 w-6"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      ),
      Head: () => (
        <thead>
          <tr className="calendar-head-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
              (day, index) => (
                <th
                  key={index}
                  className={`calendar-head-cell cursor-pointer ${
                    selectedWeekdays.includes(index) ? 'text-[#9562fa]' : ''
                  }`}
                  onClick={() => handleWeekdayClick(index)}
                >
                  {day}
                </th>
              ),
            )}
          </tr>
        </thead>
      ),
    },
  }

  return (
    <div data-mode={mode}>
      {mode === 'range' && (
        <DayPicker
          mode="range"
          selected={selected as DateRange | undefined}
          onSelect={handleRangeSelect}
          {...commonProps}
        />
      )}
      {mode === 'multiple' && (
        <DayPicker
          mode="multiple"
          selected={selected as Date[] | undefined}
          onSelect={handleMultipleSelect}
          {...commonProps}
        />
      )}
      {mode === 'single' && (
        <DayPicker
          mode="single"
          selected={selected as Date | undefined}
          onSelect={handleSingleSelect}
          {...commonProps}
        />
      )}
    </div>
  )
}
