'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import '../../styles/TimeStamp.css'

interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
  isSelected: boolean
  isConfirmed: boolean
}

interface TimeStampProps {
  selectedDates: { date: number; weekday: string }[]
  currentPage: number
  onPageChange: (newPage: number) => void
}

const COLUMNS_PER_PAGE = 7

export default function TimeStamp({
  selectedDates,
  currentPage,
}: TimeStampProps) {
  const [selections] = useState<Selection[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null)
  const [resizingPoint, setResizingPoint] = useState<'start' | 'end' | null>(
    null,
  )
  const gridRef = useRef<HTMLDivElement>(null)

  const currentDates = selectedDates.slice(
    currentPage * COLUMNS_PER_PAGE,
    (currentPage + 1) * COLUMNS_PER_PAGE,
  )

  const [selectionsByPage, setSelectionsByPage] = useState<{
    [key: number]: Selection[]
  }>({})

  const currentSelections = selectionsByPage[currentPage] || []

  const isOverlapping = useCallback(
    (selection: Selection) => {
      const { startRow, endRow, startCol, endCol } = selection
      const minRow = Math.min(startRow, endRow)
      const maxRow = Math.max(startRow, endRow)
      const minCol = Math.min(startCol, endCol)
      const maxCol = Math.max(startCol, endCol)

      return selections.some((existing) => {
        const existingMinRow = Math.min(existing.startRow, existing.endRow)
        const existingMaxRow = Math.max(existing.startRow, existing.endRow)
        const existingMinCol = Math.min(existing.startCol, existing.endCol)
        const existingMaxCol = Math.max(existing.startCol, existing.endCol)

        return !(
          maxRow < existingMinRow ||
          minRow > existingMaxRow ||
          maxCol < existingMinCol ||
          minCol > existingMaxCol
        )
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

      console.log('Block selected (Prev):', prevSelections)
      console.log('Block selected (Click):', newSelection)

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

      console.log('Resizing started on (Down):', selection)
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

        const newSelection = isResizing
          ? {
              ...prev,
              ...(resizingPoint === 'start'
                ? { startRow: row }
                : { endRow: row }),
            }
          : prev

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
        // 이전 선택을 가져오기
        const updatedSelections =
          prev[currentPage]?.filter(
            (sel) =>
              // 이전 선택의 startRow 또는 startCol이 확장된 선택과 겹치지 않도록 조건 추가
              (sel.startRow !== finalizedSelection.startRow ||
                sel.startCol !== finalizedSelection.startCol) &&
              // startRow 확장이 반영된 선택이 없으면 추가
              !(
                sel.startRow >= finalizedSelection.startRow &&
                sel.startRow <= finalizedSelection.endRow &&
                sel.startCol === finalizedSelection.startCol
              ),
          ) || []

        // 중복 확인 후 병합
        const mergedSelections = [...updatedSelections, finalizedSelection]

        console.log('Merged Selections:', mergedSelections)

        return {
          ...prev,
          [currentPage]: mergedSelections,
        }
      })
    }

    setIsResizing(false)
    setActiveSelection(null)
    setResizingPoint(null)
  }, [activeSelection, currentPage])

  useEffect(() => {
    if (activeSelection || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeSelection, isResizing, handleMouseMove, handleMouseUp])

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
    if (!cellStatus.isSelected || cellStatus.isConfirmed) return {}

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

    return {
      borderTop:
        !isSelected(row - 1, col) && !isActiveSelection(row - 1, col)
          ? '2px solid #9562fa'
          : 'none',
      borderBottom:
        !isSelected(row + 1, col) && !isActiveSelection(row + 1, col)
          ? '2px solid #9562fa'
          : 'none',
      borderLeft: '2px solid #9562fa',
      borderRight: '2px solid #9562fa',
    }
  }

  useEffect(() => {
    const confirmedSelections = currentSelections.filter(
      (selection) => selection.isConfirmed,
    )

    // 선택된 셀들을 rowIndex 기준으로 정렬
    const sortedSelections = confirmedSelections.sort(
      (a, b) => a.startRow - b.startRow,
    )

    // 시간 범위를 그룹화
    const timeRanges: { start: string; end: string }[] = []

    let currentRangeStart: string | null = null
    let currentRangeEnd: string | null = null

    const getTimeLabel = (rowIndex: number) => {
      const hours = Math.floor(rowIndex / 2)
      const minutes = (rowIndex % 2) * 30
      const formattedHour = String(hours).padStart(2, '0')
      const formattedMinute = String(minutes).padStart(2, '0')
      return `${formattedHour}:${formattedMinute}`
    }

    sortedSelections.forEach((selection) => {
      const startTime = getTimeLabel(selection.startRow)
      const endTime = getTimeLabel(selection.endRow + 1) // endRow에 +1 적용

      // 연속된 시간 범위인지 확인
      if (currentRangeStart === null) {
        currentRangeStart = startTime
      }

      if (
        currentRangeEnd === null ||
        (currentRangeEnd === startTime &&
          selection.startCol === confirmedSelections[0]?.startCol)
      ) {
        currentRangeEnd = endTime
      } else {
        // 연속적인 시간 범위가 끊어진 경우
        if (currentRangeStart && currentRangeEnd) {
          timeRanges.push({ start: currentRangeStart, end: currentRangeEnd })
        }
        currentRangeStart = startTime
        currentRangeEnd = endTime
      }
    })

    // 마지막 남은 범위 추가
    if (currentRangeStart && currentRangeEnd) {
      timeRanges.push({ start: currentRangeStart, end: currentRangeEnd })
    }

    console.log(`Confirmed selections for page ${currentPage}:`)
    timeRanges.forEach((range) => {
      console.log(`Time: ${range.start} - ${range.end}`)
    })
  }, [currentPage, currentSelections])

  return (
    <div className="timestamp-container">
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 flex grid grid-cols-[auto_1fr]">
          <div className="relative pt-8 w-7 pr-1">
            {Array.from({ length: 23 }, (_, i) => (
              <div key={i} className="h-9 text-[10px] text-[#afafaf]">
                {`${String(i + 1).padStart(2, '0')}시`}{' '}
              </div>
            ))}
          </div>
          <div
            ref={gridRef}
            className=" w-full relative grid z-100 border-[1px] border-[#d9d9d9] rounded-3xl overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${currentDates.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36}px`,
            }}
          >
            {currentDates.map((_, colIndex) => (
              <div
                key={colIndex}
                className="relative border border-[#d9d9d9] z-100"
              >
                {Array.from({ length: 48 }, (_, rowIndex) => {
                  const cellStatus = getCellStatus(rowIndex, colIndex)
                  const cellBorder = getCellBorder(rowIndex, colIndex)
                  return (
                    <div
                      key={rowIndex}
                      className={`h-[18px] relative cursor-pointer ${
                        cellStatus.isSelected
                          ? cellStatus.isConfirmed
                            ? 'bg-[#9562fa]/70 z-200'
                            : 'bg-[#9562fa]/20 z-200'
                          : ''
                      }`}
                      style={cellBorder}
                      onMouseDown={() => handleMouseClick(rowIndex, colIndex)}
                    >
                      {!cellStatus.isConfirmed && cellStatus.isStartCell && (
                        <div
                          className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                          onMouseDown={() =>
                            handleMouseDown(
                              rowIndex,
                              colIndex,
                              true,
                              cellStatus.selection!,
                            )
                          }
                        />
                      )}
                      {!cellStatus.isConfirmed && cellStatus.isEndCell && (
                        <div
                          className="absolute -bottom-[5px] right-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                          onMouseDown={() =>
                            handleMouseDown(
                              rowIndex,
                              colIndex,
                              true,
                              cellStatus.selection!,
                            )
                          }
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
