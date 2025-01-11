'use client'

import { useState } from 'react'
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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleSelectedCol = (colIndex: number) => {
    setHighlightedCol(colIndex)
    // console.log('Highlighted Col:', colIndex)
  }

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
    // { date: 12, weekday: '일' },
    // { date: 13, weekday: '월' },
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
        />
      </div>
    </div>
  )
}
