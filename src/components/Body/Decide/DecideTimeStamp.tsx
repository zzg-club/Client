'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { processTimeSlots, getMaxOverlap } from '@/utils/timeUtils'
import '@/styles/TimeStamp.css'

interface TimeSlot {
  start: string
  end: string
  selectedBy: string[]
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

interface DecideTimeStampProps {
  dates: DateData[]
  currentPage: number
}

export default function DecideTimeStamp({
  dates,
  currentPage,
}: DecideTimeStampProps) {
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

  const [scale, setScale] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = gridRef.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setScale((prev) => Math.min(Math.max(prev * delta, 1), 2))
      }
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div className="timestamp-container">
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 flex grid grid-cols-[auto_1fr]">
          <div className="w-7 pr-1 -mt-1">
            {Array.from({ length: 23 }, (_, i) => (
              <div
                key={i}
                className="text-[10px] text-[#afafaf]"
                style={{
                  height: `${18 * scale}px`,
                  paddingTop: `${36 * scale}px`,
                }}
              >
                {`${String(i + 1).padStart(2, '0')}시`}{' '}
              </div>
            ))}
          </div>
          <div
            ref={gridRef}
            className="w-full relative grid z-100 border-[1px] border-[#d9d9d9] rounded-3xl overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${processedData.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36 * scale}px`,
            }}
          >
            {processedData.map((dateData) => (
              <div
                key={dateData.date}
                className="relative border-r border-[#d9d9d9] last:border-r-0"
              >
                {Array.from({ length: 24 }, (_, rowIndex) => {
                  const hourSlot = dateData.slots[rowIndex] || []
                  const halfHourSlot = dateData.slots[rowIndex + 0.5] || []

                  return (
                    <div
                      key={rowIndex}
                      className="relative"
                      style={{
                        height: `${36 * scale}px`,
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-[50%]"
                        style={{
                          backgroundColor:
                            hourSlot.length > 0
                              ? `rgba(149, 98, 251, ${getOpacity(hourSlot[0].count)})`
                              : 'transparent',
                          transition: 'background-color 0.2s ease-in-out',
                        }}
                      />
                      <div
                        className="absolute top-[50%] left-0 w-full h-[50%]"
                        style={{
                          backgroundColor:
                            halfHourSlot.length > 0
                              ? `rgba(149, 98, 251, ${getOpacity(halfHourSlot[0].count)})`
                              : 'transparent',
                          transition: 'background-color 0.2s ease-in-out',
                        }}
                      />
                    </div>
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
