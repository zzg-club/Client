'use client'

import { useState, useEffect, useCallback } from 'react'
import Title from '@/components/Header/Title'
import SelectedDays from '@/components/Header/SelectedDays'
import TimeStamp from '@/components/Body/TimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { SelectItem } from '@/components/Footer/ListItem/SelectItem'

interface SelectedDate {
  year: number
  month: number
  day: number
  weekday: string
}

interface ScheduleData {
  name: string // 일정 이름
  userId: number // 사용자 ID
  groupId: number // 그룹 ID
  mode: string
  selected: string[] | null
  date: [string, string][] // 날짜 배열: [날짜, 요일]의 배열
}

export default function Page() {
  const [title, setTitle] = useState('제목 없는 일정')
  const [isPurple, setIsPurple] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [dateTime, setDateTime] = useState<
    { date: number; timeSlots: { start: string; end: string }[] }[]
  >([])
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [dateCounts, setDateCounts] = useState<number[]>([])

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  const togglecollapse = () => {
    setIsExpanded(false)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleDateCountsChange = (counts: number[]) => {
    setDateCounts(counts)
  }

  const handleSelectedCol = useCallback(
    (colIndex: number, rowIndex: number) => {
      const pairStartRow = Math.floor(rowIndex / 2) * 2
      const pairEndRow = pairStartRow + 1

      const getStartLabel = (rowIndex: number) => {
        const hours = Math.floor(rowIndex / 2)
        const minutes = (rowIndex % 2) * 30
        const formattedHour = String(hours).padStart(2, '0')
        const formattedMinute = String(minutes).padStart(2, '0')
        return `${formattedHour}:${formattedMinute}`
      }

      const getEndLabel = (rowIndex: number) => {
        const nextRowIndex = rowIndex + 1
        const hours = Math.floor(nextRowIndex / 2)
        const minutes = (nextRowIndex % 2) * 30
        const formattedHour = String(hours).padStart(2, '0')
        const formattedMinute = String(minutes).padStart(2, '0')
        return `${formattedHour}:${formattedMinute}`
      }

      const DefaultStartTime = getStartLabel(pairStartRow)
      const DefaultEndTime = getEndLabel(pairEndRow)

      setStartTime(DefaultStartTime)
      setEndTime(DefaultEndTime)

      setHighlightedCol(colIndex)
      togglecollapse()
      setIsOpen(true)
    },
    [],
  )

  const handleActiveTime = (start: number, end: number) => {
    const getStartLabel = (rowIndex: number) => {
      const hours = Math.floor(rowIndex / 2)
      const minutes = (rowIndex % 2) * 30
      const formattedHour = String(hours).padStart(2, '0')
      const formattedMinute = String(minutes).padStart(2, '0')
      return `${formattedHour}:${formattedMinute}`
    }

    const getEndLabel = (rowIndex: number) => {
      const nextRowIndex = rowIndex + 1
      const hours = Math.floor(nextRowIndex / 2)
      const minutes = (nextRowIndex % 2) * 30
      const formattedHour = String(hours).padStart(2, '0')
      const formattedMinute = String(minutes).padStart(2, '0')
      return `${formattedHour}:${formattedMinute}`
    }

    const calculatedStartTime = getStartLabel(start)
    const calculatedEndTime = getEndLabel(end)

    setStartTime(calculatedStartTime)
    setEndTime(calculatedEndTime)
  }

  const getDateTime = (col: number, start: string, end: string) => {
    setDateTime((prev) => {
      const existingDateIndex = prev.findIndex((item) => item.date === col)
      let newEntry = null

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
          const mergedSlot = {
            start: `${Math.floor(mergedStart / 60)
              .toString()
              .padStart(2, '0')}:${(mergedStart % 60)
              .toString()
              .padStart(2, '0')}`,
            end: `${Math.floor(mergedEnd / 60)
              .toString()
              .padStart(2, '0')}:${(mergedEnd % 60)
              .toString()
              .padStart(2, '0')}`,
          }
          timeSlots.push(mergedSlot)
          newEntry = { date: col, timeSlots: [mergedSlot] }
        } else {
          const newSlot = { start, end }
          timeSlots.push(newSlot)
          newEntry = { date: col, timeSlots: [newSlot] }
        }

        timeSlots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

        updated[existingDateIndex].timeSlots = timeSlots
        // console.log('새로 추가된 항목:', newEntry)
        return updated
      } else {
        newEntry = { date: col, timeSlots: [{ start, end }] }
        // console.log('새로 추가된 항목:', newEntry)
        return [...prev, newEntry]
      }
    })
    setIsPurple(true)
    setIsOpen(false)
  }

  useEffect(() => {
    console.log(`Updated dateTimeData:`, dateTime)
  }, [dateTime])

  const weekdayMap: { [key: string]: string } = {
    mon: '월',
    tue: '화',
    wed: '수',
    thu: '목',
    fri: '금',
    sat: '토',
    sun: '일',
  }

  function convertToSelectedDates(
    scheduleData: ScheduleData[],
  ): SelectedDate[] {
    return scheduleData.flatMap((schedule) =>
      schedule.date.map(([fullDate, weekday]) => {
        const [year, month, day] = fullDate.split('-').map(Number)
        return {
          year,
          month,
          day: day,
          weekday: weekdayMap[weekday],
        }
      }),
    )
  }

  const scheduleData: ScheduleData[] = [
    {
      name: '팀플 대면 모임',
      userId: 2,
      groupId: 1,
      // mode: 'week',
      // selected: ['mon', 'wed', 'fri'],
      // date: [
      //   ['2024-01-06', 'mon'],
      //   ['2024-01-08', 'wed'],
      //   ['2024-01-13', 'mon'],
      //   ['2024-01-15', 'wed'],
      //   ['2024-01-20', 'mon'],
      //   ['2024-01-22', 'wed'],
      //   ['2024-01-27', 'mon'],
      //   ['2024-01-03', 'fri'],
      //   ['2024-01-10', 'fri'],
      //   ['2024-01-17', 'fri'],
      //   ['2024-01-24', 'fri'],
      //   ['2024-01-31', 'fri'],
      // ],
      mode: 'range',
      selected: null,
      date: [
        ['2024-12-30', 'mon'],
        ['2024-12-31', 'tue'],
        ['2024-01-01', 'wed'],
        ['2024-01-02', 'thu'],
        ['2024-01-03', 'fri'],
        ['2024-01-04', 'sat'],
        ['2024-01-05', 'sun'],
        ['2024-01-06', 'mon'],
        ['2024-01-07', 'tue'],
        ['2024-01-08', 'wed'],
        ['2024-01-09', 'thu'],
        ['2024-01-10', 'fri'],
        // ['2024-01-11', 'sat'],
        // ['2024-01-12', 'sun'],
      ],
    },
  ]

  const selectedDates: SelectedDate[] = convertToSelectedDates(scheduleData)
  const mode = scheduleData[0].mode
  const dayofWeek = scheduleData[0].selected
  const month = `${selectedDates[0]?.month}월`

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div>
      <Title
        buttonText={isExpanded ? '다음' : '완료'}
        initialTitle={scheduleData[0]?.name || title}
        onTitleChange={handleTitleChange}
        isPurple={isPurple}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <SelectedDays
        selectedDates={selectedDates}
        month={month}
        mode={mode}
        dayofWeek={dayofWeek}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        highlightedCol={highlightedCol}
        isExpanded={isExpanded}
        toggleExpand={toggleExpand}
        onDateCountsChange={handleDateCountsChange}
      />
      <div className="flex-grow overflow-hidden mt-2">
        <TimeStamp
          selectedDates={selectedDates}
          currentPage={currentPage}
          mode={mode}
          onPageChange={handlePageChange}
          dateCounts={dateCounts}
          handleSelectedCol={handleSelectedCol}
          handleActiveTime={handleActiveTime}
          getDateTime={getDateTime}
          isExpanded={isExpanded}
          toggleCollapse={togglecollapse}
          isBottomSheetOpen={isOpen}
        />
      </div>
      <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div>
          <SelectItem
            date={
              highlightedCol !== null
                ? `${selectedDates[0]?.month}월 ${selectedDates[highlightedCol]?.day}일`
                : ''
            }
            startTime={`${startTime}`}
            endTime={`${endTime}`}
          />
        </div>
      </SelectedBottom>
    </div>
  )
}
