'use client'

import { useState } from 'react'
import SelectedDays from '@/components/Body/Decide/DecideSelectedDays'
import Title from '@/components/Header/Title'
import DecideTimeStamp from '@/components/Body/Decide/DecideTimeStamp'

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

export default function SchedulePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const isPurple = false

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const selectedDates = mockDateTime[0].data.map((dateData) => ({
    date: parseInt(dateData.date.split('-')[2]),
    weekday: new Date(dateData.date).toLocaleDateString('ko-KR', {
      weekday: 'short',
    }),
  }))

  return (
    <div className="flex flex-col h-full bg-white">
      <Title
        buttonText="완료"
        initialTitle={title} // 하위 컴포넌트에 제목 전달
        onTitleChange={handleTitleChange} // 제목 수정 함수 전달
        isPurple={isPurple}
      />
      <SelectedDays
        selectedDates={selectedDates}
        month="1월"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <div className="flex-1 overflow-auto">
        <DecideTimeStamp
          dates={mockDateTime[0].data}
          currentPage={currentPage}
        />
      </div>
    </div>
  )
}
