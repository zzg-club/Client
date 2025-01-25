'use client'

import { useState, useEffect, useCallback } from 'react'
import Title from '@/components/Header/Title'
import DecideSelectedDays from '@/components/Body/Decide/DecideSelectedDays'
import DecideTimeStamp from '@/components/Body/Decide/DecideTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { SelectItem } from '@/components/Footer/ListItem/SelectItem'
import CustomModal from '@/components/Modals/CustomModal'
import DecideBottom from '@/components/Footer/BottomSheet/DecideBottom'
import { ScheduleItem } from '@/components/Footer/ListItem/ScheduleItem'
// import { useRouter } from 'next/navigation'

interface SelectedDate {
  year: number
  month: number
  day: number
  weekday: string
}

interface GroupedDate {
  weekday: string
  dates?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
  date?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
}

interface TimeSlot {
  start: string
  end: string
  selectedBy: string[]
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

interface PrevScheduleData {
  title: string
  userId: number
  groupId: number
  mode: string
  selected: string[] | null
  dateData: DateData[]
}

interface ScheduleData {
  title: string // 일정 이름
  userId: number // 사용자 ID
  groupId: number // 그룹 ID
  mode: string
  selected: string[] | null
  date: [string, string][] // 날짜 배열: [날짜, 요일]의 배열
}

// const mockDateTime: PrevScheduleData[] = [
//   {
//     title: '팀플 대면 모임',
//     userId: 2,
//     groupId: 1,
//     mode: 'range',
//     selected: null,
//     dateData: [
//       {
//         date: '2025-02-01',
//         timeSlots: [
//           {
//             start: '09:30',
//             end: '17:00',
//             selectedBy: ['user1', 'user2', 'user3'],
//           },
//           { start: '17:00', end: '22:00', selectedBy: ['user1'] },
//         ],
//       },
//       {
//         date: '2025-02-02',
//         timeSlots: [
//           { start: '08:00', end: '13:00', selectedBy: ['user2', 'user3'] },
//           { start: '13:00', end: '20:00', selectedBy: ['user1', 'user4'] },
//           { start: '20:00', end: '23:00', selectedBy: ['user3'] },
//         ],
//       },
//       {
//         date: '2025-02-03',
//         timeSlots: [
//           { start: '05:00', end: '10:00', selectedBy: ['user1', 'user2'] },
//           {
//             start: '10:00',
//             end: '16:00',
//             selectedBy: ['user2', 'user3', 'user4'],
//           },
//           { start: '16:00', end: '21:00', selectedBy: ['user1', 'user3'] },
//         ],
//       },
//       {
//         date: '2025-02-04',
//         timeSlots: [
//           {
//             start: '11:00',
//             end: '18:00',
//             selectedBy: ['user1', 'user2', 'user3', 'user4'],
//           },
//           { start: '18:00', end: '19:00', selectedBy: ['user2'] },
//         ],
//       },
//       {
//         date: '2025-02-05',
//         timeSlots: [
//           { start: '10:00', end: '15:00', selectedBy: ['user1'] },
//           {
//             start: '15:00',
//             end: '18:00',
//             selectedBy: ['user1', 'user2', 'user3'],
//           },
//           { start: '28:00', end: '22:00', selectedBy: ['user2', 'user4'] },
//         ],
//       },
//       {
//         date: '2025-02-06',
//         timeSlots: [
//           { start: '04:00', end: '06:00', selectedBy: ['user3'] },
//           {
//             start: '06:00',
//             end: '21:00',
//             selectedBy: ['user1', 'user2', 'user3', 'user4'],
//           },
//         ],
//       },
//       {
//         date: '2025-02-07',
//         timeSlots: [
//           { start: '06:00', end: '07:00', selectedBy: ['user2'] },
//           {
//             start: '07:00',
//             end: '19:00',
//             selectedBy: ['user1', 'user3', 'user4'],
//           },
//           { start: '19:00', end: '22:00', selectedBy: ['user1', 'user2'] },
//         ],
//       },
//       {
//         date: '2025-02-08',
//         timeSlots: [
//           {
//             start: '10:00',
//             end: '19:00',
//             selectedBy: ['user1', 'user3', 'user4'],
//           },
//           { start: '19:00', end: '22:00', selectedBy: ['user1', 'user2'] },
//         ],
//       },
//     ],
//   },
// ]

const mockDateTime: PrevScheduleData[] = [
  {
    title: '팀플 대면 모임',
    userId: 2,
    groupId: 1,
    mode: 'week',
    selected: ['mon', 'wed', 'fri'],
    dateData: [
      {
        date: '2025-01-06',
        timeSlots: [
          {
            start: '09:30',
            end: '17:00',
            selectedBy: ['user1', 'user2', 'user3'],
          },
          { start: '17:00', end: '22:00', selectedBy: ['user1'] },
        ],
      },
      {
        date: '2025-02-05',
        timeSlots: [
          { start: '08:00', end: '13:00', selectedBy: ['user2', 'user3'] },
          { start: '13:00', end: '20:00', selectedBy: ['user1', 'user4'] },
          { start: '20:00', end: '23:00', selectedBy: ['user3'] },
        ],
      },
      {
        date: '2025-01-13',
        timeSlots: [
          { start: '05:00', end: '10:00', selectedBy: ['user1', 'user2'] },
          {
            start: '10:00',
            end: '16:00',
            selectedBy: ['user2', 'user3', 'user4'],
          },
          { start: '16:00', end: '21:00', selectedBy: ['user1', 'user3'] },
        ],
      },
      {
        date: '2025-02-12',
        timeSlots: [
          {
            start: '11:00',
            end: '18:00',
            selectedBy: ['user1', 'user2', 'user3', 'user4'],
          },
          { start: '18:00', end: '19:00', selectedBy: ['user2'] },
        ],
      },
      {
        date: '2025-03-07',
        timeSlots: [
          { start: '10:00', end: '15:00', selectedBy: ['user1'] },
          {
            start: '15:00',
            end: '18:00',
            selectedBy: ['user1', 'user2', 'user3'],
          },
          { start: '28:00', end: '22:00', selectedBy: ['user2', 'user4'] },
        ],
      },
      {
        date: '2025-02-19',
        timeSlots: [
          { start: '04:00', end: '06:00', selectedBy: ['user3'] },
          {
            start: '06:00',
            end: '21:00',
            selectedBy: ['user1', 'user2', 'user3', 'user4'],
          },
        ],
      },
      {
        date: '2025-01-20',
        timeSlots: [
          { start: '06:00', end: '07:00', selectedBy: ['user2'] },
          {
            start: '07:00',
            end: '19:00',
            selectedBy: ['user1', 'user3', 'user4'],
          },
          { start: '19:00', end: '22:00', selectedBy: ['user1', 'user2'] },
        ],
      },
      {
        date: '2025-01-27',
        timeSlots: [
          {
            start: '10:00',
            end: '19:00',
            selectedBy: ['user1', 'user3', 'user4'],
          },
          { start: '19:00', end: '22:00', selectedBy: ['user1', 'user2'] },
        ],
      },
    ],
  },
]

export default function Page() {
  const [title, setTitle] = useState('제목 없는 일정')
  const [isPurple, setIsPurple] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [finalData, setFinalData] = useState<
    {
      id: string
      number: number
      startDate: string
      startTime: string
      endTime: string
    }[]
  >([])
  const [dateTime, setDateTime] = useState<
    { date: string; timeSlots: { start: string; end: string }[] }[]
  >([])
  const [isOpen, setIsOpen] = useState(false)
  const [dateCounts, setDateCounts] = useState<number[]>([])
  const [groupedDate, setGroupedDate] = useState<GroupedDate[]>([])

  const [warning, setWarning] = useState(false)
  const [decideBottomOpen, setDecideBottomOpen] = useState(false)

  const onClickConfirm = () => {
    if (isPurple && !decideBottomOpen) {
      setDecideBottomOpen(true)
    } else if (!isPurple && !decideBottomOpen) {
      setWarning(true)
    } else if (isPurple && decideBottomOpen) {
      alert('확정')
    }
  }

  const DAYS_PER_PAGE = 7
  const highlightedIndex =
    highlightedCol !== null
      ? highlightedCol - currentPage * DAYS_PER_PAGE
      : null

  function transformDateTime(mockData: PrevScheduleData[]) {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

    // Helper function to get the day name for a given date
    function getDayName(dateStr: string) {
      const date = new Date(dateStr)
      return dayNames[date.getUTCDay()]
    }

    return mockData.map(
      ({ title, userId, groupId, mode, selected, dateData }) => {
        const date = dateData.flatMap(({ date }) => [[date, getDayName(date)]])

        return {
          title,
          userId,
          groupId,
          mode,
          selected,
          date,
        }
      },
    )
  }

  const transformData = transformDateTime(mockDateTime).map((data) => ({
    ...data,
    date: data.date as [string, string][],
  }))

  console.log('transformData', transformData)

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setIsOpen(false)
  }

  const handleDateCountsChange = (
    counts: number[],
    groupedData: GroupedDate[],
  ) => {
    setDateCounts(counts)
    setGroupedDate(groupedData)
  }

  // console.log('groupedData', groupedDate)

  const handleSelectedCol = useCallback(
    (colIndex: number, rowIndex: number) => {
      if (rowIndex === -1) {
        setHighlightedCol(null)
        return 0
      }

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

    setIsOpen(true)
  }

  const getDateTime = (date: string, start: string, end: string) => {
    setDateTime((prev) => {
      const existingDateIndex = prev.findIndex((item) => item.date === date)
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
          newEntry = { date: date, timeSlots: [mergedSlot] }
        } else {
          const newSlot = { start, end }
          timeSlots.push(newSlot)
          newEntry = { date: date, timeSlots: [newSlot] }
        }
        // console.log(date)
        timeSlots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

        updated[existingDateIndex].timeSlots = timeSlots
        // console.log('새로 추가된 항목:', newEntry)
        return updated
      } else {
        newEntry = { date: date, timeSlots: [{ start, end }] }
        // console.log('새로 추가된 항목:', newEntry)
        return [...prev, newEntry]
      }
    })
    setIsPurple(true)
    setIsOpen(false)
  }

  useEffect(() => {
    console.log(`Updated dateTimeData:`, dateTime)
    const transformedData = dateTime.flatMap((dateItem, dateIndex) => {
      const { date, timeSlots } = dateItem

      const month = date.split('-')[1]
      const day = date.split('-')[2].padStart(2, '0')

      const startDate = `${month}월 ${day}일`

      return timeSlots.map((slot, slotIndex) => ({
        id: `${dateIndex}-${slotIndex}`,
        number: dateIndex + 1,
        startDate,
        startTime: slot.start,
        endTime: slot.end,
      }))
    })

    setFinalData(transformedData)
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
    transformData: ScheduleData[],
  ): SelectedDate[] {
    return transformData.flatMap((schedule) =>
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

  const selectedDates: SelectedDate[] = convertToSelectedDates(transformData)
  const mode = mockDateTime[0].mode
  const dayofWeek = mockDateTime[0].selected
  const month =
    mode === 'range'
      ? currentPage === Math.floor((highlightedCol ?? 0) / DAYS_PER_PAGE)
        ? `${selectedDates[highlightedCol ?? currentPage * DAYS_PER_PAGE]?.month}월`
        : `${selectedDates[currentPage * DAYS_PER_PAGE]?.month}월`
      : `${groupedDate[currentPage]?.date?.[highlightedIndex ?? 0]?.month ?? groupedDate[currentPage]?.date?.[0]?.month}월`

  // const router = useRouter()

  const handleDeleteSchedule = (id: string | undefined) => {
    if (id === undefined) return

    setFinalData((prevFinalData) =>
      prevFinalData.filter((item) => item.id !== id),
    )

    // dateTime에서 해당 시간대 찾기
    const [dateIndex, slotIndex] = id.split('-').map(Number)

    setDateTime((prevDateTime) => {
      return prevDateTime
        .map((dateItem, index) => {
          if (index !== dateIndex) return dateItem

          const updatedTimeSlots = dateItem.timeSlots.filter(
            (_, idx) => idx !== slotIndex,
          )
          return { ...dateItem, timeSlots: updatedTimeSlots }
        })
        .filter((dateItem) => dateItem.timeSlots.length > 0)
    })
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <Title
        buttonText={'확정'}
        initialTitle={mockDateTime[0]?.title || title}
        onTitleChange={handleTitleChange}
        isPurple={isPurple}
        onClickTitleButton={onClickConfirm}
      />
      <DecideSelectedDays
        selectedDates={selectedDates}
        month={month}
        mode={mode}
        dayofWeek={dayofWeek}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        highlightedCol={highlightedCol}
        onDateCountsChange={handleDateCountsChange}
        isPurple={isPurple}
      />
      <div className="flex-grow overflow-hidden mt-2">
        <DecideTimeStamp
          selectedDates={selectedDates}
          currentPage={currentPage}
          mode={mode}
          groupedDate={groupedDate}
          onPageChange={handlePageChange}
          dateCounts={dateCounts}
          handleSelectedCol={handleSelectedCol}
          handleActiveTime={handleActiveTime}
          getDateTime={getDateTime}
          isBottomSheetOpen={isOpen}
          mockDateTime={mockDateTime[0].dateData}
          dateTime={dateTime}
        />
      </div>
      {!decideBottomOpen && (
        <div className="z-[1000]">
          <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div>
              <SelectItem
                date={
                  highlightedCol !== null && highlightedIndex !== null
                    ? mode === 'range'
                      ? `${selectedDates[highlightedCol]?.month}월 ${selectedDates[highlightedCol]?.day}일`
                      : (() => {
                          const month =
                            groupedDate[currentPage]?.date?.[highlightedIndex]
                              ?.month
                          const day =
                            groupedDate[currentPage]?.date?.[highlightedIndex]
                              ?.day
                          return month && day ? `${month}월 ${day}일` : ''
                        })()
                    : ''
                }
                startTime={`${startTime}`}
                endTime={`${endTime}`}
              />
            </div>
          </SelectedBottom>
        </div>
      )}

      <CustomModal
        isFooter={true}
        footerText="확인"
        onNext={() => setWarning(false)}
        open={warning}
        onOpenChange={() => setWarning(!warning)}
      >
        <div className="text-center pt-4">
          한 개 이상 일정을 선택해야 <br />
          확정할 수 있어요
        </div>
      </CustomModal>

      <div className="z-[1000]">
        <DecideBottom
          isOpen={decideBottomOpen}
          onClose={() => setDecideBottomOpen(false)}
        >
          <div>
            {finalData.map((item) => (
              <ScheduleItem
                key={item.id}
                id={item.id}
                number={item.number}
                startDate={item.startDate}
                startTime={item.startTime}
                endTime={item.endTime}
                onDelete={handleDeleteSchedule}
              />
            ))}
          </div>
        </DecideBottom>
      </div>
    </div>
  )
}
