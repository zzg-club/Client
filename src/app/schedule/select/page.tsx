'use client'

import { useState, useEffect, useCallback } from 'react'
import Title from '@/components/Header/Title'
import SelectedDays from '@/components/Header/SelectedDays'
import TimeStamp from '@/components/Body/TimeStamp'

interface SelectedDate {
  date: number
  weekday: string
}

export default function Page() {
  const [title, setTitle] = useState('제목 없는 일정')
  const isPurple = false
  const [currentPage, setCurrentPage] = useState(0)
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [dateTime, setDateTime] = useState<
    { date: number; timeSlots: { start: string; end: string }[] }[]
  >([])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleSelectedCol = useCallback((colIndex: number) => {
    setHighlightedCol(colIndex)
  }, [])

  const getDateTime = (col: number, start: string, end: string) => {
    setDateTime((prev) => {
      const existingDateIndex = prev.findIndex((item) => item.date === col)

      if (existingDateIndex !== -1) {
        const updated = [...prev]
        let timeSlots = updated[existingDateIndex].timeSlots

        const toMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number)
          return hours * 60 + minutes
        }

        const newStartMinutes = toMinutes(start)
        const newEndMinutes = toMinutes(end)

        const overlappingSlots = timeSlots.filter((slot) => {
          const slotStartMinutes = toMinutes(slot.start)
          const slotEndMinutes = toMinutes(slot.end)

          return (
            (newStartMinutes <= slotEndMinutes &&
              newEndMinutes >= slotStartMinutes) ||
            slotEndMinutes === newStartMinutes ||
            slotStartMinutes === newEndMinutes
          )
        })

        if (overlappingSlots.length > 0) {
          const mergedStart = Math.min(
            newStartMinutes,
            ...overlappingSlots.map((slot) => toMinutes(slot.start)),
          )
          const mergedEnd = Math.max(
            newEndMinutes,
            ...overlappingSlots.map((slot) => toMinutes(slot.end)),
          )

          timeSlots = timeSlots.filter(
            (slot) => !overlappingSlots.includes(slot),
          )
          timeSlots.push({
            start: `${Math.floor(mergedStart / 60)
              .toString()
              .padStart(
                2,
                '0',
              )}:${(mergedStart % 60).toString().padStart(2, '0')}`,
            end: `${Math.floor(mergedEnd / 60)
              .toString()
              .padStart(
                2,
                '0',
              )}:${(mergedEnd % 60).toString().padStart(2, '0')}`,
          })
        } else {
          timeSlots.push({ start, end })
        }

        timeSlots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

        updated[existingDateIndex].timeSlots = timeSlots
        return updated
      } else {
        return [...prev, { date: col, timeSlots: [{ start, end }] }]
      }
    })
  }

  useEffect(() => {
    console.log(`Updated dateTimeData:`, dateTime)
  }, [dateTime]) // dateTimeData가 변경될 때마다 호출

  const selectedDates: SelectedDate[] = [
    { date: 3, weekday: '금' },
    { date: 4, weekday: '토' },
    { date: 5, weekday: '일' },
    { date: 6, weekday: '월' },
    { date: 7, weekday: '화' },
    { date: 8, weekday: '수' },
    { date: 9, weekday: '목' },
    { date: 10, weekday: '금' },
    { date: 11, weekday: '토' },
    { date: 12, weekday: '일' },
    { date: 13, weekday: '월' },
  ]

  const month = '3월'

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div>
      <Title
        buttonText="완료"
        buttonLink="/"
        initialTitle={title}
        onTitleChange={handleTitleChange}
        isPurple={isPurple}
      />
      <SelectedDays
        selectedDates={selectedDates}
        month={month}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        highlightedCol={highlightedCol}
      />
      <div className="flex-grow overflow-hidden mt-2">
        <TimeStamp
          selectedDates={selectedDates}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          handleSelectedCol={handleSelectedCol}
          getDateTime={getDateTime}
        />
      </div>
    </div>
  )
}
