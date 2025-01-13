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
  const [isEdit, setIsEdit] = useState<number | null>(null) // 수정 모드 상태
  const gridRef = useRef<HTMLDivElement>(null)

  const currentDates = data.slice(
    currentPage * COLUMNS_PER_PAGE,
    (currentPage + 1) * COLUMNS_PER_PAGE,
  )

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
    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const handleSlotClick = (id: number) => {
    setIsEdit(id) // 클릭한 슬롯의 ID를 isEdit 상태로 설정
    onSlotClick(id) // 슬롯 클릭 콜백
  }

  const handleMouseDown = (id: number, type: 'start' | 'end') => {
    console.log(`Dragging ${type} handle for slot ID: ${id}`)
    // 드래그 로직
  }

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
            {currentDates.map((day) => (
              <div
                key={day.date}
                className="relative border-r border-[#d9d9d9]"
              >
                {day.timeSlots.map((slot) => {
                  const [startHour, startMinute] = slot.start
                    .split(':')
                    .map(Number)
                  const [endHour, endMinute] = slot.end.split(':').map(Number)

                  const startTop = (startHour + startMinute / 60) * 36 * scale
                  const endTop = (endHour + endMinute / 60) * 36 * scale
                  const height = endTop - startTop

                  return (
                    <div
                      key={slot.id}
                      className={`absolute left-0 cursor-pointer ${
                        isEdit === slot.id
                          ? 'bg-[#9562fa]/20 z-200 border-2 border-[#9562fa]'
                          : 'bg-[#9562fa]/60 z-200'
                      }`}
                      style={{
                        top: `${startTop}px`,
                        height: `${height}px`,
                        width: '100%',
                      }}
                      onMouseDown={() => handleSlotClick(slot.id)}
                    >
                      {/* 수정 모드일 때 핸들 표시 */}
                      {isEdit === slot.id && (
                        <>
                          {/* 상단 핸들 */}
                          <div
                            className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              handleMouseDown(slot.id, 'start')
                            }}
                          />
                          {/* 하단 핸들 */}
                          <div
                            className="absolute -bottom-[5px] right-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              handleMouseDown(slot.id, 'end')
                            }}
                          />
                        </>
                      )}
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

export default EditTimeStamp
