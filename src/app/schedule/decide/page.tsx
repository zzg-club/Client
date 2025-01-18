'use client'

import { useCallback, useEffect, useState } from 'react'
import DecideSelectedDays from '@/components/Body/Decide/DecideSelectedDays'
import Title from '@/components/Header/Title'
import DecideTimeStamp from '@/components/Body/Decide/DecideTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { SelectItem } from '@/components/Footer/ListItem/SelectItem'
import CustomModal from '@/components/Modals/CustomModal'
import DecideBottom from '@/components/Footer/BottomSheet/DecideBottom'
import { ScheduleItem } from '@/components/Footer/ListItem/ScheduleItem'
import { EditItem } from '@/components/Footer/ListItem/EditItem'
import useEditStore from '@/store/useEditStore'

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
        date: '2025-02-01',
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
        date: '2025-02-02',
        timeSlots: [
          { start: '08:00', end: '13:00', selectedBy: ['user2', 'user3'] },
          { start: '13:00', end: '20:00', selectedBy: ['user1', 'user4'] },
          { start: '20:00', end: '23:00', selectedBy: ['user3'] },
        ],
      },
      {
        date: '2025-02-03',
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
        date: '2025-02-04',
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
        date: '2025-02-05',
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
        date: '2025-02-06',
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
        date: '2025-02-07',
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
        date: '2025-02-08',
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
  const { isEdit, setIsEdit, isEditBottomSheetOpen, setIsEditBottomSheetOpen } =
    useEditStore()
  const [currentPage, setCurrentPage] = useState(0)
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const [isPurple, setIsPurple] = useState(false)
  const [dateTime, setDateTime] = useState<
    {
      id: number
      date: string
      month: string
      year: number
      timeSlots: { start: string; end: string }[]
    }[]
  >([])
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
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

  const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    console.log(`Updated dateTimeData:`, dateTime)

    const transformedData = dateTime.flatMap((dateItem, dateIndex) => {
      const { date, month, timeSlots } = dateItem

      const startDate = `${month}월 ${Number(date)}일`

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

      setTimeout(() => {
        console.log('page - isEdit', isEdit)
        setStartTime(DefaultStartTime)
        setEndTime(DefaultEndTime)
        setHighlightedCol(colIndex)
        if (isEdit) {
          setIsEditBottomSheetOpen(true)
        } else {
          setIsOpen(true)
        }
      }, 0)
    },
    [isEdit, setIsEditBottomSheetOpen],
  )

  const getDateTime = (
    col: number,
    start: string,
    end: string,
    colIndex: number,
  ) => {
    setDateTime((prev) => {
      const existingDateIndex = prev.findIndex(
        (item) => Number(item.date) === col,
      )

      const selectedDate = selectedDates.find((date) => date.date === col)
      const month = String(
        selectedDate?.month || new Date().getMonth() + 1,
      ).padStart(2, '0')
      const date = String(col).padStart(2, '0')
      const year = 2025

      if (existingDateIndex !== -1) {
        const updated = [...prev]

        if (isEdit) {
          // isEdit일 때는 기존 timeSlots를 새로운 slot으로 교체
          updated[existingDateIndex] = {
            id: colIndex,
            date: date,
            month: month,
            year,
            timeSlots: [{ start, end }], // 단일 slot만 포함
          }

          setTimeout(() => {
            setIsEdit(false)
          }, 0)
          return updated
        }

        // isEdit이 아닐 때
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
          // 겹치는 시간대가 있을 때는 병합
          const mergedStart = Math.min(
            newStartMinutes,
            ...overlappingSlots.map((slot) => toMinutes(slot.start)),
          )
          const mergedEnd = Math.max(
            newEndMinutes,
            ...overlappingSlots.map((slot) => toMinutes(slot.end)),
          )

          // 겹치지 않는 시간대만 필터링
          timeSlots = timeSlots.filter(
            (slot) => !overlappingSlots.includes(slot),
          )

          // 병합된 새로운 시간대 추가
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
          timeSlots = [...timeSlots, mergedSlot]
        } else {
          // 겹치는 시간대가 없을 때는 새로운 시간대 추가
          timeSlots = [...timeSlots, { start, end }]
        }

        // 시간순으로 정렬
        timeSlots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

        updated[existingDateIndex] = {
          id: colIndex,
          date: date,
          month: month,
          year,
          timeSlots: timeSlots,
        }
        return updated
      } else {
        // 새로운 날짜 추가
        return [
          ...prev,
          {
            id: colIndex,
            date: date,
            month: month,
            year,
            timeSlots: [{ start, end }],
          },
        ]
      }
    })
    setIsOpen(false)
    // setIsEditBottomSheetOpen(false)
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
  const [decideBottomOpen, setDecideBottomOpen] = useState(false)

  const formatTime = (time: string) => {
    const [hour, minutePart] = time.split(':')
    const [minute, period] = minutePart.split(' ')
    let hourNumber = parseInt(hour, 10)
    if (period === 'PM' && hourNumber !== 12) hourNumber += 12
    if (period === 'AM' && hourNumber === 12) hourNumber = 0
    return `${String(hourNumber).padStart(2, '0')}:${minute}`
  }

  const onClickConfirm = () => {
    if (isPurple && !decideBottomOpen) {
      setDecideBottomOpen(true)
    } else if (!isPurple && !decideBottomOpen) {
      setWarning(true)
    } else if (isPurple && decideBottomOpen) {
      const startDateString = `${dateTime[0].year}-${dateTime[0].month}-${dateTime[0].date}T${formatTime(dateTime[0].timeSlots[0].start)}:00.000Z`
      const endDateString = `${dateTime[0].year}-${dateTime[0].month}-${dateTime[0].date}T${formatTime(dateTime[0].timeSlots[0].end)}:00.000Z`

      alert(
        `확정 스케줄: startDate - ${startDateString} /// endDate - ${endDateString}`,
      )
    }
  }

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

  useEffect(() => {
    if (dateTime.length === 0) {
      setDecideBottomOpen(false)
      setIsPurple(false) // 선택된 시간이 없으므로 확정 버튼도 비활성화
    }
  }, [dateTime])

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
          dateTime={dateTime}
        />
      </div>
      {!decideBottomOpen && (
        <div className="z-[1000]">
          <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {isEditBottomSheetOpen ? (
              <EditItem
                key={1}
                date={
                  highlightedCol !== null
                    ? `${selectedDates[0]?.month}월 ${selectedDates[highlightedCol]?.date}일`
                    : ''
                }
                startTime={`${startTime}`}
                endTime={`${endTime}`}
              />
            ) : (
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
            )}
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
