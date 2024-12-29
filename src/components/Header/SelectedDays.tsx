'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FaCaretUp, FaCaretDown } from 'react-icons/fa'

interface SelectedDate {
  date: number
  weekday: string
}

interface SelectedDaysProps {
  selectedDates?: SelectedDate[]
  month?: string
}

const DAYS_PER_PAGE = 7

export default function SelectedDays({
  selectedDates = [
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
  ],
  month = '3월',
}: SelectedDaysProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)

  const totalPages = Math.ceil(selectedDates.length / DAYS_PER_PAGE)

  const getCurrentPageDates = () => {
    const start = currentPage * DAYS_PER_PAGE
    return selectedDates.slice(start, start + DAYS_PER_PAGE)
  }

  const currentDates = getCurrentPageDates()
  const isFullWeek = currentDates.length === 7

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="pt-0 relative">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="text-[#1e1e1e] text-3xl font-['Pretendard'] leading-[17px] tracking-tight pl-5 pt-3 pb-5">
          {month}
        </div>
      </div>
      <div className="w-full px-0 pb-3 bg-white rounded-bl-3xl rounded-br-3xl shadow-[0_4px_6px_-1px_rgba(30,30,30,0.1),0_2px_4px_-2px_rgba(30,30,30,0.1)] flex items-center">
        <button
          onClick={handlePrevPage}
          className={`flex items-center justify-center ${
            currentPage === 0
              ? 'text-gray-400'
              : 'text-purple-600 hover:bg-purple-100'
          }`}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <div className="flex-1 px-0 pb-4 ">
          {isFullWeek ? (
            <div className="grid grid-cols-7 gap-0 ">
              {currentDates.map(({ date, weekday }) => (
                <div key={date} className="flex flex-col items-center w-full">
                  <span className="text-3xl font-medium">{date}</span>
                  <span className="text-s mt-1">{weekday}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex justify-between w-full "
              style={{
                width: `calc(100% - ${currentDates.length}px)`,
                margin: '0 auto',
              }}
            >
              {currentDates.map(({ date, weekday }) => (
                <div key={date} className="flex flex-col items-center w-full ">
                  <span className="text-3xl font-medium">{date}</span>
                  <span className="text-s mt-1">{weekday}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleNextPage}
          className={`flex items-center justify-center  ${
            currentPage >= totalPages - 1
              ? 'text-gray-400'
              : 'text-purple-600 hover:bg-purple-100'
          }`}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>
      <div onClick={toggleExpand} className="flex items-center justify-center">
        {isExpanded ? (
          <FaCaretUp className="w-4 h-4 text-purple-600 absolute bottom-2" />
        ) : (
          <FaCaretDown className="w-4 h-4 text-purple-600 absolute bottom-2" />
        )}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[80px] h-2 bg-purple-600 border-b-red rounded-full flex items-center justify-center"></div>
      </div>
    </div>
  )
}
