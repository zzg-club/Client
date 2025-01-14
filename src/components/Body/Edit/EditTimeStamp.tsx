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
  data: initialData,
  currentPage,
  onSlotClick,
}) => {
  const COLUMNS_PER_PAGE = 7
  const [scale, setScale] = useState(1)
  const [isEdit, setIsEdit] = useState<number | boolean>(false)
  const [draggingHandle, setDraggingHandle] = useState<null | 'start' | 'end'>(
    null,
  )
  const [data, setData] = useState(initialData) // 로컬 데이터 상태
  const dataRef = useRef(initialData) // 최신 상태를 저장할 Ref
  const gridRef = useRef<HTMLDivElement>(null)

  const currentDates = data.slice(
    currentPage * COLUMNS_PER_PAGE,
    (currentPage + 1) * COLUMNS_PER_PAGE,
  )

  // 상태를 업데이트하고 Ref에 반영
  const setAndSyncData = (updatedData: selectedScheduleData[]) => {
    setData(updatedData)
    dataRef.current = updatedData
  }

  // 핀치줌 코드
  useEffect(() => {
    const element = gridRef.current
    if (!element) return

    let initialDistance = 0

    // 핀치 줌 이벤트 처리
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

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistance = 0
      }
    }

    // 마우스 휠 줌 이벤트 처리
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setScale((prev) => Math.min(Math.max(prev * delta, 1), 2))
      }
    }

    // 이벤트 리스너 등록
    element.addEventListener('wheel', handleWheel, { passive: false })
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    // 클린업
    return () => {
      element.removeEventListener('wheel', handleWheel)
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // 슬롯을 클릭했을 때의 이벤트
  const handleSlotClick = (id: number) => {
    setIsEdit(id)
    onSlotClick(id)
    const selectedSlot = currentDates
      .flatMap((day) => day.timeSlots)
      .find((slot) => slot.id === id)

    console.log(
      `${id}번째 타임슬롯 선택:`,
      selectedSlot?.start,
      '-',
      selectedSlot?.end,
    )
  }

  // 슬롯부분 클릭했을 때의 이벤트
  const handleMouseDown = (id: number, type: 'start' | 'end') => {
    setDraggingHandle(type)
    setIsEdit(id)
  }

  // 슬롯부분 클릭 후 드래그 이벤트
  const handleMouseMove = (e: MouseEvent) => {
    if (isEdit === null || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const cellHeight = rect.height / 48
    const row = Math.min(
      Math.max(Math.floor((e.clientY - rect.top) / cellHeight), 0),
      47,
    )

    setAndSyncData(
      data.map((day) => ({
        ...day,
        timeSlots: day.timeSlots.map((slot) => {
          if (slot.id === isEdit) {
            const startRow =
              Number(slot.start.split(':')[0]) * 2 +
              Math.floor(Number(slot.start.split(':')[1]) / 30)
            const endRow =
              Number(slot.end.split(':')[0]) * 2 +
              Math.floor(Number(slot.end.split(':')[1]) / 30)

            if (draggingHandle === 'start' && row < endRow) {
              const newStartHour = Math.floor(row / 2)
              const newStartMinute = (row % 2) * 30
              return {
                ...slot,
                start: `${String(newStartHour).padStart(2, '0')}:${String(
                  newStartMinute,
                ).padStart(2, '0')}`,
              }
            }

            if (draggingHandle === 'end' && row > startRow) {
              const newEndHour = Math.floor(row / 2)
              const newEndMinute = (row % 2) * 30
              return {
                ...slot,
                end: `${String(newEndHour).padStart(2, '0')}:${String(
                  newEndMinute,
                ).padStart(2, '0')}`,
              }
            }
          }
          return slot
        }),
      })),
    )
  }

  // 슬롯 드래그 끝났을 때의 이벤트
  const handleMouseUp = () => {
    setDraggingHandle(null)
    setIsEdit(false)

    if (isEdit) {
      const updatedSlot = dataRef.current
        .flatMap((day) => day.timeSlots)
        .find((slot) => slot.id === isEdit)

      if (updatedSlot) {
        console.log(`수정된 값: ${updatedSlot.start} - ${updatedSlot.end}`)
      }
    }
  }

  useEffect(() => {
    if (draggingHandle) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingHandle])

  return (
    <div className="timestamp-container">
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 grid grid-cols-[auto_1fr]">
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

                  const startTop =
                    ((startHour * 2 + Math.floor(startMinute / 30)) *
                      (36 * scale)) /
                    2
                  const endTop =
                    ((endHour * 2 + Math.floor(endMinute / 30)) *
                      (36 * scale)) /
                    2
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
                      {isEdit === slot.id && (
                        <>
                          <div
                            className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              handleMouseDown(slot.id, 'start')
                            }}
                          />
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
