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
  dates?: { date: number; weekday: string }[]
}

export default function TimeStamp({
  dates = [
    { date: 3, weekday: '금' },
    { date: 4, weekday: '토' },
    { date: 5, weekday: '일' },
    { date: 6, weekday: '월' },
    { date: 7, weekday: '화' },
    { date: 8, weekday: '수' },
    { date: 9, weekday: '목' },
    { date: 10, weekday: '금' },
    { date: 11, weekday: '토' },
    { date: 12, weekday: '일' },
    { date: 13, weekday: '월' },
  ],
}: TimeStampProps) {
  const [selections, setSelections] = useState<Selection[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null)
  const [resizingPoint, setResizingPoint] = useState<'start' | 'end' | null>(
    null,
  )
  const gridRef = useRef<HTMLDivElement>(null)

  // 선택 영역이 겹치는지 확인
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

  // 초기 선택 시작
  const handleMouseDown = (
    rowIndex: number,
    colIndex: number,
    isEndpoint: boolean,
    selection?: Selection,
  ) => {
    if (isEndpoint && selection) {
      // 끝점을 클릭한 경우 리사이징 시작
      setIsResizing(true)
      setActiveSelection(selection)
      setResizingPoint(
        rowIndex === selection.startRow && colIndex === selection.startCol
          ? 'start'
          : 'end',
      )
    } else if (!isEndpoint && !activeSelection) {
      // 새로운 선택 시작
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

  // 드래그 중
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!gridRef.current || !activeSelection) return

      const rect = gridRef.current.getBoundingClientRect()
      const cellWidth = (rect.width - 80) / dates.length
      const cellHeight = rect.height / 48

      const col = Math.min(
        Math.max(Math.floor((e.clientX - rect.left - 80) / cellWidth), 0),
        dates.length - 1,
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
    [activeSelection, isResizing, resizingPoint, dates.length],
  )

  // 드래그 종료
  const handleMouseUp = useCallback(() => {
    if (activeSelection) {
      if (isResizing) {
        // 리사이징 종료
        setSelections((prev) =>
          prev.map((sel) =>
            sel === activeSelection
              ? { ...activeSelection, isConfirmed: true }
              : sel,
          ),
        )
      } else {
        // 새로운 선택 확인
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

  // 마우스 이벤트 리스너
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

  // 셀이 선택 영역에 포함되어 있는지 확인
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
    <div className="w-full max-w-4xl mx-auto bg-white p-4">
      {/* 타임 그리드 */}
      <div
        ref={gridRef}
        className="relative grid mt-2"
        style={{
          gridTemplateColumns: `35px repeat(${dates.length}, 1fr)`,
          background: 'linear-gradient(#06ff7e 1px, transparent 1px)',
          backgroundSize: `100% ${16}px`,
        }}
      >
        {/* 시간 레이블 */}
        <div className="relative">
          {Array.from({ length: 23 }, (_, i) => (
            <div
              key={i}
              className="h-8 flex items-center justify-end pr-1 text-xs text-gray-500"
            >
              {`${String(i + 1).padStart(2, '0')}시`}
            </div>
          ))}
        </div>

        {/* 선택 가능한 그리드 */}
        {dates.map((_, colIndex) => (
          <div
            key={colIndex}
            className="relative border border-[#ff0606]"
            style={{
              gridTemplateColumns: `80px repeat(${dates.length}, fr)`,
              background: 'linear-gradient(#2d00f7 1px, transparent 1px)',
              backgroundSize: `100% ${16}px`,
            }}
          >
            {Array.from({ length: 40 }, (_, rowIndex) => {
              const cellStatus = getCellStatus(rowIndex, colIndex)
              return (
                <div
                  key={rowIndex}
                  className={`
                    h-12 relative cursor-pointer
                    ${
                      cellStatus.isSelected
                        ? cellStatus.isConfirmed
                          ? 'bg-purple-400'
                          : 'bg-purple-100'
                        : ''
                    }
                  `}
                  style={{
                    height: cellStatus.isSelected ? '16px' : '16px', // 선택된 경우 높이를 줄임
                    marginBottom: cellStatus.isSelected ? '0px' : '0px', // 선택된 셀 간격 추가
                  }}
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
                    <div className="absolute -top-1 -left-1 w-3 h-2 bg-purple-500 rounded-full cursor-move" />
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
