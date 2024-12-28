'use client'

import { DateRange, DayPicker } from 'react-day-picker'
import { useState } from 'react'

import '../styles/CustomCalendarStyle.css'

interface CustomCalendarProps {
  selected?: DateRange
  onSelect?: (date: DateRange | undefined) => void
}

export default function CustomCalendar({
  selected,
  onSelect,
}: CustomCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date(2024, 11))

  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={onSelect}
      month={month}
      onMonthChange={setMonth}
      showOutsideDays={false}
      classNames={{
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
      }}
      components={{
        Caption: ({ displayMonth }) => (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xl font-semibold">
              {displayMonth.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        ),
      }}
    />
  )
}
