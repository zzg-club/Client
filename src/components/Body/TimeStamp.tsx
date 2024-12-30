'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
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
  const [selections, setSelections] = useState<Selection[]>([])
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

  const isOverlapping = (selection: Selection) => {
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
  }

  const handleMouseDown = (
    rowIndex: number,
    colIndex: number,
    isEndpoint: boolean,
    selection?: Selection,
  ) => {
    if (isEndpoint && selection) {
      setIsResizing(true)
      setActiveSelection(selection)
      setResizingPoint(
        rowIndex === selection.startRow && colIndex === selection.startCol
          ? 'start'
          : 'end',
      )
    } else if (!isEndpoint && !activeSelection) {
      const newSelection: Selection = {
        startRow: rowIndex,
        startCol: colIndex,
        endRow: rowIndex,
        endCol: colIndex,
        isConfirmed: false,
      }

      if (!isOverlapping(newSelection)) {
        setActiveSelection(newSelection)
      }
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!gridRef.current || !activeSelection) return

      const rect = gridRef.current.getBoundingClientRect()
      const cellWidth = (rect.width - 80) / currentDates.length
      const cellHeight = rect.height / 48

      const col = Math.min(
        Math.max(Math.floor((e.clientX - rect.left - 80) / cellWidth), 0),
        currentDates.length - 1,
      )
      const row = Math.min(
        Math.max(Math.floor((e.clientY - rect.top) / cellHeight), 0),
        47,
      )

      if (isResizing) {
        setActiveSelection((prev) => {
          if (!prev) return null
          const newSelection = {
            ...prev,
            ...(resizingPoint === 'start'
              ? { startRow: row, startCol: col }
              : { endRow: row, endCol: col }),
          }
          return !isOverlapping(newSelection) ? newSelection : prev
        })
      } else {
        setActiveSelection((prev) => {
          if (!prev) return null
          const newSelection = {
            ...prev,
            endRow: row,
            endCol: col,
          }
          return !isOverlapping(newSelection) ? newSelection : prev
        })
      }
    },
    [
      activeSelection,
      isResizing,
      resizingPoint,
      currentDates.length,
      isOverlapping,
    ],
  )

  const handleMouseUp = useCallback(() => {
    if (activeSelection) {
      if (isResizing) {
        setSelections((prev) =>
          prev.map((sel) =>
            sel === activeSelection
              ? { ...activeSelection, isConfirmed: true }
              : sel,
          ),
        )
      } else {
        setSelections((prev) => [
          ...prev,
          { ...activeSelection, isConfirmed: true },
        ])
      }
    }
    setIsResizing(false)
    setActiveSelection(null)
    setResizingPoint(null)
  }, [activeSelection, isResizing])

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
    const allSelections = [...selections, activeSelection].filter(
      Boolean,
    ) as Selection[]

    for (const selection of allSelections) {
      const minRow = Math.min(selection.startRow, selection.endRow)
      const maxRow = Math.max(selection.startRow, selection.endRow)
      const minCol = Math.min(selection.startCol, selection.endCol)
      const maxCol = Math.max(selection.startCol, selection.endCol)

      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
        return {
          isSelected: true,
          isConfirmed: selection.isConfirmed,
          isEndpoint:
            (row === selection.startRow && col === selection.startCol) ||
            (row === selection.endRow && col === selection.endCol),
          selection,
        }
      }
    }

    return { isSelected: false, isConfirmed: false, isEndpoint: false }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white pl-0 pr-8 py-5">
      <div
        ref={gridRef}
        className="relative grid z-100 border border-r-[#d9d9d9] "
        style={{
          gridTemplateColumns: `40px repeat(${currentDates.length}, 1fr)`,
          backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
          backgroundSize: `100% ${36}px`,
        }}
      >
        <div className="relative pt-8 bg-white overflow-hidden z-10">
          {Array.from(
            { length: 23 },
            (
              _,
              i, //시간 몇개로 나눌 건지
            ) => (
              <div key={i} className="h-9 pl-3 text-[8px] text-[#d9d9d9]-500">
                {`${String(i + 1).padStart(2, '0')}시`}
              </div>
            ),
          )}
        </div>

        {currentDates.map((_, colIndex) => (
          <div key={colIndex} className="relative border-l border-gray-200">
            {Array.from({ length: 48 }, (_, rowIndex) => {
              // 선택 가능한 세로 길이 범위
              const cellStatus = getCellStatus(rowIndex, colIndex)
              return (
                <div
                  key={rowIndex}
                  className={`
                    h-[18px] relative cursor-pointer 
                    ${
                      cellStatus.isSelected
                        ? cellStatus.isConfirmed
                          ? 'bg-purple-400'
                          : 'bg-purple-100'
                        : ''
                    }
                  `} // 색칠된 보라색 1칸
                  onMouseDown={() =>
                    handleMouseDown(
                      rowIndex,
                      colIndex,
                      cellStatus.isEndpoint,
                      cellStatus.selection,
                    )
                  }
                >
                  {cellStatus.isEndpoint && (
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-500 rounded-full cursor-move" />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
