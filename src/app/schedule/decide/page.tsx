'use client'

import { useCallback, useEffect, useState } from 'react'
import DecideSelectedDays from '@/components/Body/Decide/DecideSelectedDays'
import Title from '@/components/Header/Title'
import DecideTimeStamp from '@/components/Body/Decide/DecideTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { SelectItem } from '@/components/Footer/ListItem/SelectItem'
import CustomModal from '@/components/Modals/CustomModal'

interface TimeSlot {
  start: string
  end: string
  selectedBy: string[]
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

interface ScheduleData {
  data: DateData[]
}

interface SelectedDate {
  date: number
  weekday: string
  month: number
}

const mockDateTime: ScheduleData[] = [
  {
    data: [
      {
        date: '2025-01-01',
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
        date: '2025-01-02',
        timeSlots: [
          { start: '08:00', end: '13:00', selectedBy: ['user2', 'user3'] },
          { start: '13:00', end: '20:00', selectedBy: ['user1', 'user4'] },
          { start: '20:00', end: '23:00', selectedBy: ['user3'] },
        ],
      },
      {
        date: '2025-01-03',
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
        date: '2025-01-04',
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
        date: '2025-01-05',
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
        date: '2025-01-06',
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
        date: '2025-01-07',
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
        date: '2025-01-08',
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

const participants = [
  {
    id: 1,
    name: '나',
    image: '/sampleProfile.png',
  },
  {
    id: 2,
    name: '김태엽',
    image: '/sampleProfile.png',
  },
  {
    id: 3,
    name: '지유진',
    image: '/sampleProfile.png',
  },
  {
    id: 4,
    name: '이소룡',
    image: '/sampleProfile.png',
  },
  {
    id: 5,
    name: '박진우',
    image: '/sampleProfile.png',
  },
  {
    id: 6,
    name: '이예지',
    image: '/sampleProfile.png',
  },
  {
    id: 7,
    name: '조성하',
    image: '/sampleProfile.png',
  },
  {
    id: 8,
    name: '성윤정',
    image: '/sampleProfile.png',
  },
  {
    id: 9,
    name: '김나영',
    image: '/sampleProfile.png',
  },
  {
    id: 10,
    name: '이채연',
    image: '/sampleProfile.png',
  },
]

export default function Page() {
  const [currentPage, setCurrentPage] = useState(0)
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const [isPurple, setIsPurple] = useState(false)
  const [dateTime, setDateTime] = useState<
    { date: number; timeSlots: { start: string; end: string }[] }[]
  >([])
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)

  const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    console.log(`Updated dateTimeData:`, dateTime)
  }, [dateTime]) // dateTimeData가 변경될 때마다 호출

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
      setIsOpen(true)
    },
    [],
  )

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
    setIsOpen(false)
    setIsPurple(true)
  }

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const initializeSelectedDates = useCallback(() => {
    return mockDateTime[0].data.map((dateData) => ({
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

  const [warning, setWarning] = useState(false)

  const onClickConfirm = () => {
    if (isPurple) {
      alert('바텀시트를 올려라')
    } else {
      setWarning(true)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <Title
        buttonText="확정"
        initialTitle={title} // 하위 컴포넌트에 제목 전달
        onTitleChange={handleTitleChange} // 제목 수정 함수 전달
        isPurple={isPurple}
        onClickTitleButton={onClickConfirm}
      />
      <DecideSelectedDays
        selectedDates={selectedDates}
        month={`${selectedDates[0]?.month}월`}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        highlightedCol={highlightedCol}
        participants={participants}
        title={title}
      />
      <div className="flex-grow overflow-hidden mt-2">
        <DecideTimeStamp
          selectedDates={selectedDates}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          handleSelectedCol={handleSelectedCol}
          getDateTime={getDateTime}
          mockDateTime={mockDateTime[0].data}
          handleActiveTime={handleActiveTime}
          isBottomSheetOpen={isOpen}
        />
      </div>
      <div className="z-[2000]">
        <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div>
            <SelectItem
              date={
                highlightedCol !== null
                  ? `${selectedDates[0]?.month}월 ${selectedDates[highlightedCol]?.date}일`
                  : ''
              }
              startTime={`${startTime}`}
              endTime={`${endTime}`}
            />
          </div>
        </SelectedBottom>
      </div>

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
    </div>
  )
}
