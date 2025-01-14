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
  const gridRef = useRef<HTMLDivElement>(null)

  const currentDates = data.slice(
    currentPage * COLUMNS_PER_PAGE,
    (currentPage + 1) * COLUMNS_PER_PAGE,
  )

  // 핀치줌 코드
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

  // 슬롯을 클릭했을 때의 이벤트
  const handleSlotClick = (id: number) => {
    setIsEdit(id) // 클릭한 슬롯의 ID를 isEdit 상태로 설정
    onSlotClick(id) // 슬롯 클릭 콜백
    const selectedSlot = currentDates
      .flatMap((day) => day.timeSlots) // 모든 TimeSlot 펼치기
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
    setIsEdit(id) // 드래그 시작 시 수정 상태로 설정
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

    // const activeHour = Math.floor(row / 2)
    // const activeMinute = (row % 2) * 30
    // // const activeTimeValue = `${String(activeHour).padStart(2, '0')}:${String(
    // //   activeMinute,
    // // ).padStart(2, '0')}`

    // 업데이트하는 변화값이 start 핸들인지 end 핸들인지 구분하여 나타냄
    // console.log(
    //   `${draggingHandle === 'start' ? 'Start' : 'End'} 값 업데이트 중:`,
    //   activeTimeValue,
    // )

    setData((prevData) =>
      prevData.map((day) => ({
        ...day,
        timeSlots: day.timeSlots.map((slot) => {
          if (slot.id === isEdit) {
            const [startHour, startMinute] = slot.start.split(':').map(Number)
            const [endHour, endMinute] = slot.end.split(':').map(Number)

            const startRow = startHour * 2 + Math.floor(startMinute / 30)
            const endRow = endHour * 2 + Math.floor(endMinute / 30)

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
    setDraggingHandle(null) // 드래그 종료
    setIsEdit(false)
  }

  // 슬롯 영역 변경 -> 시간 변경 추적
  useEffect(() => {
    if (isEdit) {
      const updatedSlot = data
        .flatMap((day) => day.timeSlots)
        .find((slot) => slot.id === isEdit)

      if (updatedSlot) {
        console.log(
          `${isEdit}번째 타임슬롯 업데이트:`,
          updatedSlot.start,
          '-',
          updatedSlot.end,
        )
      }
    }
  }, [data])

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
