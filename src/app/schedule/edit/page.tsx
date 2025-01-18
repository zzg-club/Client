'use client'

import { useState, useEffect, useCallback } from 'react'
import SelectedDays from '@/components/Header/SelectedDays'
import Title from '@/components/Header/Title'
import EditTimeStamp from '@/components/Body/Edit/EditTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { EditItem } from '@/components/Footer/ListItem/EditItem'

interface TimeSlot {
  slotId: number
  start: string
  end: string
  date?: string
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

interface SelectedDate {
  date: number
  weekday: string
  month: number
}

const mockSelectedSchedule: DateData[] = [
  {
    date: '2025-01-01',
    timeSlots: [
      {
        slotId: 1,
        start: '01:00',
        end: '05:30',
      },
      {
        slotId: 2,
        start: '12:30',
        end: '16:00',
      },
    ],
  },
  {
    date: '2025-01-02',
    timeSlots: [
      {
        slotId: 3,
        start: '09:00',
        end: '13:00',
      },
      {
        slotId: 4,
        start: '17:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2025-01-03',
    timeSlots: [
      {
        slotId: 5,
        start: '04:30',
        end: '10:00',
      },
      {
        slotId: 6,
        start: '13:30',
        end: '16:00',
      },
    ],
  },
  {
    date: '2025-01-04',
    timeSlots: [
      {
        slotId: 7,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 8,
        start: '17:30',
        end: '22:00',
      },
    ],
  },
]

export default function SchedulePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [title, setTitle] = useState('제목 없는 일정')
  const [isPurple, setIsPurple] = useState(false)
  const [dateTime, setDateTime] = useState<
    { date: number; timeSlots: { start: string; end: string }[] }[]
  >([])
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [updateData, setUpdateData] = useState<
    {
      slotId: number
      number: number
      startDate: string
      startTime: string
      endTime: string
    }[]
  >([])

  const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([])
  const [selectedTimeInfo, setSelectedTimeInfo] = useState<{
    date: string
    startTime: string
    endTime: string
    slotId: number
  } | null>(null)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // useEffect(() => {
  //   console.log(`Updated dateTimeData:`, dateTime)

  //   const updatedData = dateTime.flatMap((dateItem, index) => {
  //     const { date, timeSlots } = dateItem

  //     // date에서 일자만 추출
  //     const day = date.toString().split('-')[2] // "YYYY-MM-DD"에서 마지막 부분만 가져옴
  //     console.log(`Extracted day: ${day}`) // 일자 콘솔 출력

  //     const startDate = `${new Date().getMonth() + 1}월 ${date}일` // date 기반으로 날짜 형식 생성

  //     return timeSlots.map((slot) => ({
  //       slotId: index + 1, // 고유 ID 생성
  //       number: index + 1,
  //       startDate,
  //       startTime: slot.start,
  //       endTime: slot.end,
  //     }))
  //   })

  //   setUpdateData(updatedData)
  // }, [dateTime]) // dateTimeData가 변경될 때마다 호출

  const getDateTime = (col: number, start: string, end: string) => {
    setTimeout(() => {
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
          return updated
        } else {
          newEntry = { date: col, timeSlots: [{ start, end }] }
          return [...prev, newEntry]
        }
      })
      setIsOpen(false)
      setIsPurple(true)
    }, 0) // 비동기로 처리
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const initializeSelectedDates = useCallback(() => {
    return mockSelectedSchedule.map((dateData) => ({
      date: parseInt(dateData.date.split('-')[2]),
      weekday: new Date(dateData.date).toLocaleDateString('ko-KR', {
        weekday: 'short',
      }),
      month: parseInt(dateData.date.split('-')[1]),
    }))
  }, [])

  useEffect(() => {
    if (selectedDates.length === 0) {
      setSelectedDates(initializeSelectedDates())
    }
  }, [initializeSelectedDates, selectedDates])

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

  const handleDeleteSchedule = (slotId: number) => {
    setUpdateData((prev) => prev.filter((item) => item.slotId !== slotId))
    console.log(`${slotId} 삭제`)
  }

  const handleSelectedCol = (colIndex: number) => {
    setHighlightedCol(colIndex)
    setIsOpen(true)
  }

  const handleTimeSelect = (
    colIndex: number,
    startTime: string,
    endTime: string,
    slotId: number,
  ) => {
    if (colIndex >= 0 && selectedDates[colIndex]) {
      const selectedDate = selectedDates[colIndex]

      // 비동기 상태 업데이트
      setTimeout(() => {
        setSelectedTimeInfo({
          date: `${selectedDate.month}월 ${selectedDate.date}일`,
          startTime,
          endTime,
          slotId,
        })
      }, 0)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <Title
        buttonText="완료"
        initialTitle={title}
        onTitleChange={handleTitleChange}
        isPurple={isPurple}
      />
      <SelectedDays
        selectedDates={selectedDates}
        month={'1월'}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        highlightedCol={highlightedCol}
      />
      <div className="flex-grow overflow-hidden mt-2">
        <EditTimeStamp
          selectedDates={selectedDates}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          handleSelectedCol={handleSelectedCol}
          getDateTime={getDateTime}
          mockSelectedSchedule={mockSelectedSchedule}
          handleTimeSelect={handleTimeSelect}
          isBottomSheetOpen={isOpen}
        />
      </div>
      <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div>
          <EditItem
            slotId={selectedTimeInfo?.slotId || 0}
            date={selectedTimeInfo?.date || ''}
            startTime={selectedTimeInfo?.startTime || ''}
            endTime={selectedTimeInfo?.endTime || ''}
            onDelete={(slotId) => handleDeleteSchedule(slotId)}
          />
        </div>
      </SelectedBottom>
    </div>
  )
}
