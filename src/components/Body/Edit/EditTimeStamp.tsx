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
  isBottomSheetOpen: boolean
}

export default function EditTimeStamp({
  data: initialData,
  currentPage,
  onSlotClick,
  isBottomSheetOpen,
}: EditTimeStampProps) {
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
    const cellHeight = rect.height / 48 // 48개의 셀로 분할
    const row = Math.min(
      Math.max(Math.floor((e.clientY - rect.top) / cellHeight), 0),
      48, // 최대 48까지 허용 (24:00)
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

            if (draggingHandle === 'start') {
              // 시작 핸들: 종료 핸들 위치까지 이동 가능
              const newStartRow = Math.min(row, endRow)
              const newStartHour = Math.floor(newStartRow / 2)
              const newStartMinute = (newStartRow % 2) * 30
              return {
                ...slot,
                start: `${String(newStartHour).padStart(2, '0')}:${String(
                  newStartMinute,
                ).padStart(2, '0')}`,
              }
            }

            if (draggingHandle === 'end') {
              // 종료 핸들: 시작 핸들 위치까지 이동 가능
              const newEndRow = Math.max(row, startRow)
              const newEndHour = Math.floor(newEndRow / 2)
              const newEndMinute = (newEndRow % 2) * 30
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

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  const mergeOverlappingSlots = (day: selectedScheduleData) => {
    const sortedSlots = [...day.timeSlots].sort((a, b) =>
      a.start.localeCompare(b.start),
    )

    const mergedSlots: TimeSlot[] = []

    sortedSlots.forEach((slot) => {
      if (
        mergedSlots.length > 0 &&
        timeToMinutes(mergedSlots[mergedSlots.length - 1].end) >=
          timeToMinutes(slot.start)
      ) {
        // 병합
        const newEnd = Math.max(
          timeToMinutes(mergedSlots[mergedSlots.length - 1].end),
          timeToMinutes(slot.end),
        )

        mergedSlots[mergedSlots.length - 1].end = minutesToTime(newEnd)
      } else {
        // 새로운 슬롯 추가
        mergedSlots.push(slot)
      }
    })

    return {
      ...day,
      timeSlots: mergedSlots,
    }
  }

  // DELETE 요청 함수 (나중에 백엔드 delete api 연결할 함수ㄴ)
  const deleteTimeSlot = (id: number) => {
    console.log(`${id} 삭제되었습니다.`)
  }

  // 슬롯 드래그 끝났을 때의 이벤트
  const handleMouseUp = () => {
    setDraggingHandle(null)
    setIsEdit(false)

    if (isEdit) {
      const updatedData = dataRef.current.map((day) =>
        day.timeSlots.some((slot) => slot.id === isEdit)
          ? mergeOverlappingSlots(day)
          : day,
      )

      setAndSyncData(updatedData)

      const updatedSlot = updatedData
        .flatMap((day) => day.timeSlots)
        .find((slot) => slot.id === isEdit)

      if (updatedSlot) {
        // start와 end가 같으면 삭제
        if (updatedSlot.start === updatedSlot.end) {
          console.log(
            `Deleting slot with id ${updatedSlot.id} as start and end are the same.`,
          )

          // DELETE 요청
          deleteTimeSlot(updatedSlot.id)

          // 로컬 데이터에서 삭제
          const newData = updatedData.map((day) => ({
            ...day,
            timeSlots: day.timeSlots.filter(
              (slot) => slot.id !== updatedSlot.id,
            ),
          }))
          setAndSyncData(newData)
        } else {
          console.log(`Updated slot: ${updatedSlot.start} - ${updatedSlot.end}`)
        }
      }
    }
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
    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    })
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
    <div
      className={`timestamp-container ${isBottomSheetOpen ? 'pb-[100px]' : 'pb-[40px]'}`}
    >
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 grid grid-cols-[auto_1fr]">
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
              gridTemplateColumns: `repeat(${currentDates.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36 * scale}px`,
            }}
          >
            {currentDates.map((day) => (
              <div
                key={day.date}
                className="relative border-r border-[#d9d9d9] z-100"
              >
                {day.timeSlots.map((slot) => {
                  // console.log('Slot 데이터:', slot)

                  // slot.start와 slot.end가 문자열인지 확인하고 변환
                  const start =
                    typeof slot.start === 'string'
                      ? slot.start
                      : String(slot.start)
                  const end =
                    typeof slot.end === 'string' ? slot.end : String(slot.end)

                  // start와 end를 split
                  const [startHour, startMinute] = start.split(':').map(Number)
                  const [endHour, endMinute] = end.split(':').map(Number)

                  // 위치 계산
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
