'use client'

import { useMemo } from 'react'
import { processTimeSlots, getMaxOverlap } from '@/utils/timeUtils'

interface TimeSlot {
  start: string
  end: string
  selectedBy: string[]
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

interface TimeGridProps {
  dates: DateData[]
  currentPage: number
}

export default function TimeGrid({ dates, currentPage }: TimeGridProps) {
  const processedData = useMemo(() => {
    const visibleDates = dates.slice(currentPage * 7, (currentPage + 1) * 7)
    return visibleDates.map((dateData) => ({
      date: dateData.date,
      slots: processTimeSlots(dateData.timeSlots),
    }))
  }, [dates, currentPage])

  const maxOverlap = useMemo(() => {
    return Math.max(...processedData.map((date) => getMaxOverlap(date.slots)))
  }, [processedData])

  const getOpacity = (count: number) => {
    return count > 0 ? 0.2 + (count / maxOverlap) * 0.8 : 0
  }

  return (
    <div className="timestamp-container">
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 flex grid grid-cols-[auto_1fr]">
          <div className="relative pt-4 w-12 pr-1">
            {Array.from({ length: 23 }, (_, i) => (
              <div key={i + 1} className="h-[36px] flex items-center">
                <span className="text-xs text-[#afafaf]">
                  {`${String(i + 1).padStart(2, '0')}시`}
                </span>
              </div>
            ))}
          </div>
          <div
            className="w-full relative grid z-10 border-[1px] border-[#d9d9d9] rounded-3xl overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${processedData.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36}px`,
            }}
          >
            {processedData.map((dateData) => (
              <div
                key={dateData.date}
                className="relative border-r border-[#d9d9d9] last:border-r-0"
              >
                {Array.from({ length: 23 }, (_, rowIndex) => {
                  const slotData = dateData.slots[rowIndex] || []
                  const count = slotData[0]?.count || 0

                  return (
                    <div
                      key={rowIndex}
                      className="h-[36px] relative"
                      style={{
                        backgroundColor:
                          count > 0
                            ? `rgba(149, 98, 251, ${getOpacity(count)})`
                            : 'transparent',
                        transition: 'background-color 0.2s ease-in-out',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
