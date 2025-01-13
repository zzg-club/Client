'use client'

import { useState } from 'react'
import SelectedDays from '@/components/Body/Edit/EditSelectedDays'
import Title from '@/components/Header/Title'
import EditTimeStamp from '@/components/Body/Edit/EditTimeStamp'

interface TimeSlot {
  id: number
  start: string
  end: string
}

interface selectedScheduleData {
  date: string
  timeSlots: TimeSlot[]
}

const mockDateTime: selectedScheduleData[] = [
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
        start: '08:00',
        end: '09:30',
      },
      {
        id: 7,
        start: '13:30',
        end: '18:30',
      },
      {
        id: 8,
        start: '20:30',
        end: '23:00',
      },
    ],
  },
  {
    date: '2025-01-04',
    timeSlots: [
      {
        id: 9,
        start: '08:00',
        end: '09:00',
      },
      {
        id: 10,
        start: '13:30',
        end: '18:00',
      },
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
        id: 12,
        start: '08:00',
        end: '09:00',
      },
      {
        id: 13,
        start: '13:30',
        end: '18:00',
      },
      {
        id: 14,
        start: '20:00',
        end: '21:30',
      },
    ],
  },
  {
    date: '2025-01-06',
    timeSlots: [
      {
        id: 15,
        start: '08:00',
        end: '09:00',
      },
      {
        id: 16,
        start: '13:30',
        end: '18:00',
      },
      {
        id: 17,
        start: '20:00',
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
      {
        id: 19,
        start: '13:30',
        end: '18:00',
      },
      {
        id: 20,
        start: '20:00',
        end: '21:30',
      },
    ],
  },
]

export default function SchedulePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [title, setTitle] = useState('제목 없는 일정')
  const isPurple = false

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const selectedDates = mockDateTime.map((dateData) => ({
    date: parseInt(dateData.date.split('-')[2]),
    weekday: new Date(dateData.date).toLocaleDateString('ko-KR', {
      weekday: 'short',
    }),
  }))
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
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
          data={mockDateTime}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
