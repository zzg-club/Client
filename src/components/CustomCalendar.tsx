'use client'

import {
  DateRange,
  DayPicker,
  SelectMultipleEventHandler,
  SelectRangeEventHandler,
} from 'react-day-picker'
import { useState } from 'react'

import '../styles/CustomCalendarStyle.css'

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
  const [selectedWeekday, setSelectedWeekday] = useState<number>(0)

  // 현재 월 정보와 요일을 인자로 받아 현재 월에 존재하는 해당 요일의 날짜 배열을 리턴
  const getDatesByWeekday = (weekday: number, month: Date) => {
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
      if (day.getDay() === weekday) {
        dates.push(new Date(day))
      }
    }
    return dates
  }

  const handleWeekdayClick = (weekday: number) => {
    const dates = getDatesByWeekday(weekday, month)
    setSelectedWeekday(weekday)
    if (dates.length > 0 && mode === 'range') {
      // 처음 요일을 선택할 경우
      setMode('multiple')
      onSelect?.(dates)
    } else if (selectedWeekday === weekday) {
      // 같은 요일을 두 번 클릭할 경우 multiple mode 취소
      setMode('range')
      onSelect?.({ from: undefined, to: undefined })
    } else {
      // 요일을 선택했다가, 바로 다른 요일을 선택할 경우
      setMode('multiple')
      onSelect?.(dates)
    }
  }

  const handleDayClick = (day: Date) => {
    if (mode === 'multiple') {
      console.log('hdc')
      setMode('range')
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
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xl font-semibold">
            {displayMonth.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
      Head: () => (
        <thead>
          <tr className="calendar-head-row">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
              (day, index) => (
                <th
                  key={index}
                  className="calendar-head-cell cursor-pointer"
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
