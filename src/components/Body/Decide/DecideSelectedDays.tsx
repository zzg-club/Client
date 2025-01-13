'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go'
import { LuDot } from 'react-icons/lu'

interface SelectedDate {
  date: number
  weekday: string
}

interface SelectedDaysProps {
  selectedDates: SelectedDate[]
  month: string
  currentPage: number
  onPageChange: (newPage: number) => void
}

const DAYS_PER_PAGE = 7

export default function SelectedDays({
  selectedDates,
  month,
  currentPage,
  onPageChange,
}: SelectedDaysProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const totalPages = Math.ceil(selectedDates.length / DAYS_PER_PAGE)
  const isSingleDate = selectedDates.length === 1

  const getCurrentPageDates = () => {
    const start = currentPage * DAYS_PER_PAGE
    return selectedDates.slice(start, start + DAYS_PER_PAGE)
  }

  const currentDates = getCurrentPageDates()
  const isFullWeek = currentDates.length === 7

  const handlePrevPage = () => {
    onPageChange(Math.max(0, currentPage - 1))
  }

  const handleNextPage = () => {
    onPageChange(Math.min(totalPages - 1, currentPage + 1))
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
          className={`flex items-center justify-center ml-2 ${
            currentPage === 0 ? 'text-gray-400' : 'text-[#9562FB]'
          }`}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-7 h-7 mb-4" />
        </button>
        <div className="flex-1 px-0 pb-4">
          {isSingleDate ? (
            <div className="grid grid-cols-7 gap-0 items-center w-full">
              <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
              <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
              <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
              <div className="flex flex-col items-center w-full">
                <span className="text-3xl font-medium mb-1">
                  {currentDates[0].date}
                </span>
                <span className="text-s mt-0">{currentDates[0].weekday}</span>
              </div>
              <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
              <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
              <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
            </div>
          ) : isFullWeek ? (
            <div className="grid grid-cols-7 gap-0">
              {currentDates.map(({ date, weekday }) => (
                <div key={date} className="flex flex-col items-center w-full">
                  <span className="text-3xl font-medium">{date}</span>
                  <span className="text-s mt-0">{weekday}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex justify-between w-full"
              style={{
                width: `calc(100% - ${currentDates.length}px)`,
                margin: '0 auto',
              }}
            >
              {currentDates.map(({ date, weekday }) => (
                <div key={date} className="flex flex-col items-center w-full">
                  <span className="text-3xl font-medium">{date}</span>
                  <span className="text-s mt-0">{weekday}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleNextPage}
          className={`flex items-center justify-center ${
            currentPage >= totalPages - 1 ? 'text-gray-400' : 'text-[#9562FB]'
          }`}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="w-7 h-7 mb-4 mr-2" />
        </button>
      </div>
      <div onClick={toggleExpand} className="flex items-center justify-center">
        {isExpanded ? (
          <GoTriangleUp className="w-5 h-5 text-[#9562FB] absolute bottom-1" />
        ) : (
          <GoTriangleDown className="w-5 h-5 text-[#9562FB] absolute bottom-1" />
        )}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[80px] h-2 bg-[#9562FB] border-b-red rounded-full flex items-center justify-center"></div>
      </div>
    </div>
  )
}
