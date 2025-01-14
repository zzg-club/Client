'use client'

import { useState } from 'react'
import SelectedDays from '@/components/Body/Edit/EditSelectedDays'
import Title from '@/components/Header/Title'
import EditTimeStamp from '@/components/Body/Edit/EditTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { EditItem } from '@/components/Footer/ListItem/EditItem'

interface TimeSlot {
  id: number
  start: string
  end: string
  date?: string
}

interface selectedScheduleData {
  date: string
  timeSlots: TimeSlot[]
}

const mockSelectedSchedule: selectedScheduleData[] = [
  {
    date: '2025-01-01',
    timeSlots: [
      {
        id: 1,
        start: '09:00',
        end: '13:00',
      },
      {
        id: 2,
        start: '17:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2025-01-02',
    timeSlots: [
      {
        id: 3,
        start: '08:00',
        end: '12:00',
      },
      {
        id: 4,
        start: '15:00',
        end: '20:00',
      },
      {
        id: 5,
        start: '22:00',
        end: '23:00',
      },
    ],
  },
  {
    date: '2025-01-03',
    timeSlots: [
      {
        id: 6,
        start: '02:00',
        end: '06:30',
      },

      {
        id: 8,
        start: '16:30',
        end: '19:00',
      },
    ],
  },
  {
    date: '2025-01-04',
    timeSlots: [
      {
        id: 11,
        start: '20:00',
        end: '21:30',
      },
    ],
  },
  {
    date: '2025-01-05',
    timeSlots: [
      {
        id: 13,
        start: '09:30',
        end: '18:00',
      },
    ],
  },
  {
    date: '2025-01-06',
    timeSlots: [
      {
        id: 15,
        start: '03:00',
        end: '09:00',
      },
      {
        id: 16,
        start: '13:30',
        end: '18:00',
      },
      {
        id: 17,
        start: '19:00',
        end: '21:30',
      },
    ],
  },
  {
    date: '2025-01-07',
    timeSlots: [
      {
        id: 18,
        start: '08:00',
        end: '09:00',
      },
    ],
  },
  {
    date: '2025-01-08',
    timeSlots: [
      {
        id: 19,
        start: '00:00',
        end: '05:00',
      },
      {
        id: 20,
        start: '14:00',
        end: '19:30',
      },
    ],
  },
]

export default function SchedulePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [title, setTitle] = useState('제목 없는 일정')
  const isPurple = false
  const [isOpen, setIsOpen] = useState(false)
  const [scheduleData, setScheduleData] = useState<TimeSlot[]>([])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const selectedDates = mockSelectedSchedule.map((scheduleData) => ({
    date: parseInt(scheduleData.date.split('-')[2]),
    weekday: new Date(scheduleData.date).toLocaleDateString('ko-KR', {
      weekday: 'short',
    }),
  }))
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // 바텀시트 핸들
  const handleSlotClick = (id: number) => {
    const selectedDay = mockSelectedSchedule.find((day) =>
      day.timeSlots.some((slot) => slot.id === id),
    )
    if (selectedDay) {
      const selectedSlot = selectedDay.timeSlots.find((slot) => slot.id === id)
      if (selectedSlot) {
        // YYYY-MM-DD -> MM월 DD일로 date 형식 변환
        const formattedDate = new Date(selectedDay.date).toLocaleDateString(
          'ko-KR',
          {
            month: 'long',
            day: 'numeric',
          },
        )
        setScheduleData([{ ...selectedSlot, date: formattedDate }]) // 변환된 날짜 설정
        setIsOpen(true) // BottomSheet 열기
      }
    }
  }

  // 삭제하기 버튼 클릭 이벤트 로직
  const handleDelete = (id: number) => {
    alert(`${id}번 삭제되었습니다.`)
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
        month="1월"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <div className="flex-1 overflow-auto">
        <EditTimeStamp
          data={mockSelectedSchedule}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onSlotClick={handleSlotClick}
        />
      </div>
      <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div>
          {scheduleData.map((item) => (
            <EditItem
              key={item.id}
              id={item.id}
              date={item.date}
              startTime={item.start}
              endTime={item.end}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SelectedBottom>
    </div>
  )
}
