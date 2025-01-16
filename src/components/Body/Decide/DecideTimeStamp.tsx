'use client'

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  CSSProperties,
} from 'react'
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

interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
  isSelected: boolean
  isConfirmed: boolean
}

interface DecideTimeStampProps {
  selectedDates: { date: number; weekday: string }[]
  currentPage: number
  onPageChange: (newPage: number) => void
  handleSelectedCol: (colIndex: number, rowIndex: number) => void
  getDateTime: (col: number, start: string, end: string) => void
  mockDateTime: DateData[]
  handleActiveTime: (start: number, end: number) => void
  isBottomSheetOpen: boolean
}

const COLUMNS_PER_PAGE = 7

export default function DecideTimeStamp({
  selectedDates,
  currentPage,
  handleSelectedCol,
  getDateTime,
  mockDateTime,
  handleActiveTime,
  isBottomSheetOpen,
}: DecideTimeStampProps) {
  const [selections] = useState<Selection[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null)
  const [resizingPoint, setResizingPoint] = useState<'start' | 'end' | null>(
    null,
  )
  const [scale, setScale] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  const onActiveTime = useCallback(
    (start: number, end: number) => {
      setTimeout(() => {
        handleActiveTime(start, end)
      }, 0)
    },
    [handleActiveTime],
  )

  const currentDates = selectedDates.slice(
    currentPage * COLUMNS_PER_PAGE,
    (currentPage + 1) * COLUMNS_PER_PAGE,
  )

  // Helper function to convert time string to index
  const timeToIndex = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 2 + (minutes >= 30 ? 1 : 0)
  }

  // Process mockDateTime data
  const processedMockData = useMemo(() => {
    const startDate = new Date(mockDateTime[0].date)
    const pageStartDate = new Date(
      startDate.getTime() + currentPage * 7 * 24 * 60 * 60 * 1000,
    )

    return mockDateTime
      .filter((dateData) => {
        const date = new Date(dateData.date)
        return (
          date >= pageStartDate &&
          date < new Date(pageStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        )
      })
      .map((dateData) => {
        const slots = new Array(48).fill(0)
        dateData.timeSlots.forEach((slot) => {
          const startIndex = timeToIndex(slot.start)
          const endIndex = timeToIndex(slot.end)
          for (let i = startIndex; i < endIndex; i++) {
            slots[i] += slot.selectedBy.length
          }
        })
        return { date: dateData.date, slots }
      })
  }, [mockDateTime, currentPage])

  const maxOverlap = useMemo(() => {
    return Math.max(...processedMockData.flatMap((data) => data.slots))
  }, [processedMockData])

  const getOpacity = (count: number) => {
    return count > 0 ? 0.2 + (count / maxOverlap) * 0.8 : 0
  }

  const onColumnClick = useCallback(
    (colIndex: number, rowIndex: number) => {
      if (colIndex === -1) {
        handleSelectedCol(colIndex, rowIndex)
        return 0
      }
      if (gridRef.current) {
        const actualColIndex = currentPage * COLUMNS_PER_PAGE + colIndex
        handleSelectedCol(actualColIndex, rowIndex)
      }
    },
    [handleSelectedCol, currentPage],
  )

  const handleDateTimeSelect = useCallback(
    (col: number, start: string, end: string) => {
      setTimeout(() => {
        getDateTime(col, start, end)
      }, 0)
    },
    [getDateTime],
  )

  const [selectionsByPage, setSelectionsByPage] = useState<{
    [key: number]: Selection[]
  }>({})

  const currentSelections = useMemo(() => {
    return selectionsByPage[currentPage] || []
  }, [selectionsByPage, currentPage])

  const isOverlapping = useCallback(
    (selection: Selection) => {
      const { startRow, endRow } = selection
      const minRow = Math.min(startRow, endRow)
      const maxRow = Math.max(startRow, endRow)

      return selections.some((existing) => {
        const existingMinRow = Math.min(existing.startRow, existing.endRow)
        const existingMaxRow = Math.max(existing.startRow, existing.endRow)

        return !(maxRow < existingMinRow || minRow > existingMaxRow)
      })
    },
    [selections],
  )

  const handleMouseClick = (rowIndex: number, colIndex: number) => {
    const pairStartRow = Math.floor(rowIndex / 2) * 2
    const pairEndRow = pairStartRow + 1

    setSelectionsByPage((prev) => {
      const prevSelections = (prev[currentPage] || [])
        .map((selection) => (selection.isConfirmed ? selection : null))
        .filter(Boolean) as Selection[]

      const newSelection: Selection = {
        startRow: pairStartRow,
        startCol: colIndex,
        endRow: pairEndRow,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      }

      // console.log('Block selected (Prev):', prevSelections)
      // console.log('Block selected (Click):', newSelection)

      return {
        ...prev,
        [currentPage]: [...prevSelections, newSelection],
      }
    })
  }

  const handleMouseDown = (
    rowIndex: number,
    colIndex: number,
    isEndpoint: boolean,
    selection?: Selection,
  ) => {
    if (selection) {
      setIsResizing(true)
      setActiveSelection(selection)
      setResizingPoint(
        rowIndex === selection.startRow && colIndex === selection.startCol
          ? 'start'
          : 'end',
      )
      // console.log('Resizing started on (Down):', selection)
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!gridRef.current || !activeSelection) return

      const rect = gridRef.current.getBoundingClientRect()
      const cellHeight = rect.height / 48
      const row = Math.min(
        Math.max(Math.floor((e.clientY - rect.top) / cellHeight), 0),
        47,
      )

      // console.log('ActiveSelection', activeSelection)

      setActiveSelection((prev) => {
        if (!prev) return null

        const newSelection = { ...prev }

        if (isResizing) {
          if (resizingPoint === 'start') {
            if (row - 1 <= prev.endRow) {
              newSelection.startRow = row
            }
          } else if (resizingPoint === 'end') {
            if (row + 1 >= prev.startRow) {
              newSelection.endRow = row
            }
          }
        }
        return !isOverlapping(newSelection) ? newSelection : prev
      })
    },
    [activeSelection, isResizing, resizingPoint, isOverlapping],
  )

  const handleMouseUp = useCallback(() => {
    if (activeSelection) {
      const finalizedSelection = {
        ...activeSelection,
        isSelected: false,
        isConfirmed: true,
      }

      setSelectionsByPage((prev) => {
        const currentSelections = prev[currentPage] || []
        const updatedSelections = currentSelections.flatMap((sel) => {
          const isOverlap =
            sel.startRow <= finalizedSelection.endRow &&
            sel.endRow >= finalizedSelection.startRow &&
            sel.startCol === finalizedSelection.startCol

          if (!isOverlap) {
            return [sel]
          }

          const splitSelections = []
          if (sel.startRow < finalizedSelection.startRow) {
            splitSelections.push({
              ...sel,
              endRow: finalizedSelection.startRow - 1,
            })
          }
          if (sel.endRow > finalizedSelection.endRow) {
            splitSelections.push({
              ...sel,
              startRow: finalizedSelection.endRow + 1,
            })
          }
          return splitSelections
        })

        const mergedSelections = [...updatedSelections, finalizedSelection]

        const startCol = finalizedSelection.startCol
        const getTimeLabel = (rowIndex: number) => {
          const hours = Math.floor(rowIndex / 2)
          const minutes = (rowIndex % 2) * 30
          const formattedHour = String(hours).padStart(2, '0')
          const formattedMinute = String(minutes).padStart(2, '0')
          return `${formattedHour}:${formattedMinute}`
        }

        const selectedDate = currentDates[startCol]?.date
        const startTime = getTimeLabel(finalizedSelection.startRow)
        const endTime = getTimeLabel(finalizedSelection.endRow + 1)

        handleDateTimeSelect(selectedDate, startTime, endTime)

        return {
          ...prev,
          [currentPage]: mergedSelections,
        }
      })
    }

    setIsResizing(false)
    setActiveSelection(null)
    setResizingPoint(null)
  }, [activeSelection, currentDates, currentPage, handleDateTimeSelect])

  const handleSelectionStart = (
    rowIndex: number,
    colIndex: number,
    isTouchEvent: boolean,
  ) => {
    if (isTouchEvent) {
      if (rowIndex % 2 !== 1) return
    }

    const pairStartRow = Math.floor(rowIndex / 2) * 2
    const pairEndRow = pairStartRow + 1

    setSelectionsByPage((prev) => {
      const prevSelections = (prev[currentPage] || [])
        .map((selection) => (selection.isConfirmed ? selection : null))
        .filter(Boolean) as Selection[]

      const newSelection: Selection = {
        startRow: pairStartRow,
        startCol: colIndex,
        endRow: pairEndRow,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      }

      console.log('Block selected (Prev):', prevSelections)
      console.log('Block selected (Start):', newSelection)

      return {
        ...prev,
        [currentPage]: [...prevSelections, newSelection],
      }
    })
  }

  const handleResizeStart = (
    rowIndex: number,
    colIndex: number,
    isEndpoint: boolean,
    selection: Selection,
  ) => {
    setIsResizing(true)
    setActiveSelection(selection)
    setResizingPoint(
      rowIndex === selection.startRow && colIndex === selection.startCol
        ? 'start'
        : 'end',
    )

    // console.log('Resizing started on (Down):', selection)
  }

  const handleMove = useCallback(
    (clientY: number, isTouchEvent: boolean) => {
      if (!gridRef.current || !activeSelection) return

      const rect = gridRef.current.getBoundingClientRect()
      const cellHeight = rect.height / 48
      let row = Math.min(
        Math.max(Math.floor((clientY - rect.top) / cellHeight), 0),
        47,
      )

      if (isTouchEvent) {
        // For touch events, snap to the nearest bottom border
        row = Math.floor(row / 2) * 2 + 1
      }

      setActiveSelection((prev) => {
        if (!prev) return null

        const newSelection = { ...prev }

        if (isResizing) {
          if (resizingPoint === 'start') {
            if (row < prev.endRow) {
              newSelection.startRow = row
            }
          } else if (resizingPoint === 'end') {
            if (row > prev.startRow) {
              newSelection.endRow = row
            }
          }
        }

        return !isOverlapping(newSelection) ? newSelection : prev
      })
    },
    [activeSelection, isResizing, resizingPoint, isOverlapping],
  )

  useEffect(() => {
    const handleMouseUpWithColumnClick = () => {
      handleMouseUp()
      onColumnClick(-1, -1)
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY, false)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        // e.preventDefault()
        handleMove(e.touches[0].clientY, true)
      }
    }

    if (activeSelection || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUpWithColumnClick)
      window.addEventListener('touchend', handleMouseUpWithColumnClick)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', handleMouseUpWithColumnClick)
      window.removeEventListener('touchend', handleMouseUpWithColumnClick)
    }
  }, [
    activeSelection,
    isResizing,
    handleMouseMove,
    handleMouseUp,
    onColumnClick,
    currentSelections,
    handleMove,
  ])

  const getCellStatus = (row: number, col: number) => {
    const allSelections = [...currentSelections, ...selections].filter(
      Boolean,
    ) as Selection[]

    if (activeSelection) {
      const minRow = Math.min(activeSelection.startRow, activeSelection.endRow)
      const maxRow = Math.max(activeSelection.startRow, activeSelection.endRow)
      const minCol = Math.min(activeSelection.startCol, activeSelection.endCol)
      const maxCol = Math.min(activeSelection.startCol, activeSelection.endCol)

      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
        const isStartCell =
          row === activeSelection.startRow && col === activeSelection.startCol
        const isEndCell =
          row === activeSelection.endRow && col === activeSelection.endCol

        return {
          isSelected: true,
          isConfirmed: false,
          isStartCell,
          isEndCell,
          selection: activeSelection,
        }
      }
    }

    for (const selection of allSelections) {
      const minRow = Math.min(selection.startRow, selection.endRow)
      const maxRow = Math.max(selection.startRow, selection.endRow)
      const minCol = Math.min(selection.startCol, selection.endCol)
      const maxCol = Math.max(selection.startCol, selection.endCol)

      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
        const isStartCell =
          row === selection.startRow && col === selection.startCol
        const isEndCell = row === selection.endRow && col === selection.endCol

        return {
          isSelected: true,
          isConfirmed: selection.isConfirmed,
          isStartCell,
          isEndCell,
          selection,
        }
      }
    }

    return {
      isSelected: false,
      isConfirmed: false,
      isStartCell: false,
      isEndCell: false,
    }
  }

  const getCellBorder = (row: number, col: number) => {
    const allSelections = [...currentSelections, ...selections].filter(
      Boolean,
    ) as Selection[]

    const cellStatus = getCellStatus(row, col)
    if (!cellStatus.isSelected) return {}

    const isSelected = (r: number, c: number) =>
      allSelections.some(
        (selection) =>
          Math.min(selection.startRow, selection.endRow) <= r &&
          Math.max(selection.startRow, selection.endRow) >= r &&
          Math.min(selection.startCol, selection.endCol) <= c &&
          Math.max(selection.startCol, selection.endCol) >= c,
      )

    const isActiveSelection = (r: number, c: number) =>
      activeSelection &&
      Math.min(activeSelection.startRow, activeSelection.endRow) <= r &&
      Math.max(activeSelection.startRow, activeSelection.endRow) >= r &&
      Math.min(activeSelection.startCol, activeSelection.endCol) <= c &&
      Math.max(activeSelection.startCol, activeSelection.endCol) >= c

    if (activeSelection) {
      onActiveTime(activeSelection.startRow, activeSelection.endRow)
    }

    const borderStyle = cellStatus.isConfirmed
      ? '2px solid #9562FB'
      : '2px solid #ffffff'

    const top = !isSelected(row - 1, col) && !isActiveSelection(row - 1, col)
    const bottom = !isSelected(row + 1, col) && !isActiveSelection(row + 1, col)

    const styles: CSSProperties = {
      // height: `${18 * scale}px`,
      borderTop: top ? borderStyle : 'none',
      borderBottom: bottom ? borderStyle : 'none',
      borderLeft: borderStyle,
      borderRight: borderStyle,
      boxShadow: [
        top ? '0 -4px 8px -2px rgba(255, 255, 255, 0.7)' : '',
        bottom ? '0 4px 8px -2px rgba(255, 255, 255, 0.7)' : '',
        //left ? '-4px 0 8px -20px rgba(255, 255, 255, 0.7)' : '',
        //right ? '4px 0 8px -2px rgba(255, 255, 255, 0.7)' : '',
      ]
        .filter(Boolean)
        .join(', '),
      position: 'relative' as const,
      zIndex: cellStatus.isSelected ? 1000 : 'auto',
    }

    return styles
  }

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

    // 마우스 휠 줌 이벤트
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

  return (
    <div
      className={`timestamp-container ${isBottomSheetOpen ? 'pb-[100px]' : 'pb-[40px]'}`}
    >
      <div className="timestamp-content">
        <div className="timestamp-grid w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 flex grid grid-cols-[auto_1fr]">
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
            className="timestamp-grid w-full relative grid z-100 border-[1px] border-[#d9d9d9] rounded-3xl"
            style={{
              gridTemplateColumns: `repeat(${currentDates.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36 * scale}px`,
              clipPath: 'inset(1px 0 0 0)', // 위쪽 1px 잘라냄
            }}
          >
            {currentDates.map((_, colIndex) => (
              <div
                key={colIndex}
                className="relative border-r border-[#d9d9d9] z-100 last:border-r-0"
              >
                {Array.from({ length: 48 }, (_, rowIndex) => {
                  const cellStatus = getCellStatus(rowIndex, colIndex)
                  const cellBorder = getCellBorder(rowIndex, colIndex)
                  const mockDataForDate = processedMockData.find(
                    (data) =>
                      new Date(data.date).getDate() ===
                      currentDates[colIndex].date,
                  )
                  const overlayOpacity = mockDataForDate
                    ? getOpacity(mockDataForDate.slots[rowIndex])
                    : 0

                  return (
                    <div
                      key={rowIndex}
                      className={`relative cursor-pointer overflow-visible`}
                      style={{
                        ...cellBorder,
                        height: `${18 * scale}px`,
                        borderCollapse: 'separate',
                      }}
                      onMouseDown={() => {
                        handleMouseClick(rowIndex, colIndex)
                        onColumnClick(colIndex, rowIndex)
                      }}
                      onTouchStart={() => {
                        handleSelectionStart(rowIndex, colIndex, true)
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: `rgba(149, 98, 251, ${overlayOpacity})`,
                          zIndex: 50,
                        }}
                      />
                      <div
                        className={`absolute inset-0 ${
                          cellStatus.isSelected
                            ? cellStatus.isConfirmed
                              ? 'opacity-50 bg-[#2a027a] z-200'
                              : 'opacity-50 bg-[#2a027a] z-200'
                            : ''
                        }`}
                        style={{ zIndex: 100 }}
                      />
                      {!cellStatus.isConfirmed && cellStatus.isStartCell && (
                        <div
                          className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move z-[2000]"
                          onMouseDown={() => {
                            handleMouseDown(
                              rowIndex,
                              colIndex,
                              true,
                              cellStatus.selection!,
                            )
                            onColumnClick(colIndex, rowIndex)
                          }}
                        />
                      )}
                      {!cellStatus.isConfirmed && cellStatus.isEndCell && (
                        <div
                          className="absolute -bottom-[5px] right-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                          style={{ zIndex: 3000 }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            handleResizeStart(
                              rowIndex,
                              colIndex,
                              false,
                              cellStatus.selection!,
                            )
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation()
                            handleResizeStart(
                              rowIndex,
                              colIndex,
                              false,
                              cellStatus.selection!,
                            )
                            onColumnClick(colIndex, rowIndex)
                          }}
                        />
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
