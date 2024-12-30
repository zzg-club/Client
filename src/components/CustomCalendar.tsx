'use client'

import {
  DateRange,
  DayPicker,
  SelectMultipleEventHandler,
  SelectRangeEventHandler,
} from 'react-day-picker'
import { useState } from 'react'
import '../styles/CustomCalendarStyle.css'
import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

type Mode = 'range' | 'multiple'

interface CustomCalendarProps {
  initialMode?: Mode
  selected?: DateRange | Date[]
  onSelect?: (date: DateRange | Date[] | undefined) => void
}

export default function CustomCalendar({
  initialMode = 'range',
  selected,
  onSelect,
}: CustomCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date(2024, 11))
  const [mode, setMode] = useState<Mode>(initialMode)
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])

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
      if (weekdays.includes(day.getDay())) {
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

  const commonProps = {
    month,
    onMonthChange: setMonth,
    showOutsideDays: false,
    onDayClick: handleDayClick,
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
    </div>
  )
}
