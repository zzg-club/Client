import { useState, useRef, useEffect } from 'react'
import '../../../styles/TimeStamp.css'

interface TimeSlot {
  id: number
  start: string
  end: string
}

interface selectedScheduleData {
  date: string
  timeSlots: TimeSlot[]
}

interface EditTimeStampProps {
  data: selectedScheduleData[]
  currentPage: number
  onPageChange: (newPage: number) => void
  onSlotClick: (id: number) => void
}

const EditTimeStamp: React.FC<EditTimeStampProps> = ({
  data,
  currentPage,
  onSlotClick,
}) => {
  const COLUMNS_PER_PAGE = 7
  const [scale, setScale] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  const currentDates = data.slice(
    currentPage * COLUMNS_PER_PAGE,
    (currentPage + 1) * COLUMNS_PER_PAGE,
  )

  useEffect(() => {
    const element = gridRef.current
    if (!element) return

    let initialDistance = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2),
        )
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2),
        )

        const scaleChange = currentDistance / initialDistance
        setScale((prev) => Math.min(Math.max(prev * scaleChange, 1), 2))
        initialDistance = currentDistance
      }
    }

    const handleTouchEnd = () => {
      initialDistance = 0
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setScale((prev) => Math.min(Math.max(prev * delta, 1), 2))
      }
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('wheel', handleWheel)
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  //   const handleMouseClick = (rowIndex: number, colIndex: number) => {
  //     console.log(`Clicked Row: ${rowIndex}, Column: ${colIndex}`)
  //   }

  return (
    <div className="timestamp-container">
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 grid grid-cols-[auto_1fr]">
          {/* 시간 표시 열 */}
          <div className="w-7 pr-1 -mt-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="text-[10px] text-[#afafaf]"
                style={{
                  height: `${36 * scale}px`,
                }}
              >
                {`${String(i).padStart(2, '0')}시`}
              </div>
            ))}
          </div>

          {/* 날짜별 데이터 열 */}
          <div
            ref={gridRef}
            className="w-full relative grid z-100 border-[1px] border-[#d9d9d9] rounded-3xl overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${currentDates.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36 * scale}px`,
            }}
          >
            {/* {currentDates.map((day, colIndex) => ( */}
            {currentDates.map((day) => (
              <div
                key={day.date}
                className="relative border-r border-[#d9d9d9]"
              >
                {day.timeSlots.map((slot) => {
                  // 시작 시간과 분
                  const [startHour, startMinute] = slot.start
                    .split(':')
                    .map(Number)
                  const [endHour, endMinute] = slot.end.split(':').map(Number)

                  // 시작 위치, 높이 계산 (30분 = 0.5)
                  const startTop = (startHour + startMinute / 60) * 36 * scale // 1시간 = 36px
                  const endTop = (endHour + endMinute / 60) * 36 * scale
                  const height = endTop - startTop

                  return (
                    <div
                      key={slot.id}
                      className="absolute left-0 bg-[#9562fa]/60 cursor-pointer"
                      style={{
                        top: `${startTop}px`, // 30분 단위로 시작 위치 설정
                        height: `${height}px`, // 30분 단위로 높이 설정
                        width: '100%',
                      }}
                      //   onMouseDown={() => console.log(`Clicked ID: ${slot.id}`)}
                      onMouseDown={() => onSlotClick(slot.id)}
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

export default EditTimeStamp
