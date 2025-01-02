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
    setSelectionsByPage((prev) => {
      // Ensure newSelections is always an array, even if prev[currentPage] doesn't exist
      const newSelections = (prev[currentPage] || [])
        .map((selection) => (selection.isConfirmed ? selection : null))
        .filter(Boolean) as Selection[]

      const newSelection: Selection = {
        startRow: rowIndex,
        startCol: colIndex,
        endRow: rowIndex,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      }

      // Add the new selection
      return {
        ...prev,
        [currentPage]: [...newSelections, newSelection],
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

      // 드래그 중에는 활성 선택을 업데이트
      setActiveSelection((prev) => {
        if (!prev) return null

        const newSelection = isResizing
          ? {
              ...prev,
              ...(resizingPoint === 'start'
                ? { startRow: row, startCol: col }
                : { endRow: row, endCol: col }),
            }
          : prev

        // 선택 영역이 겹치지 않으면 업데이트
        return !isOverlapping(newSelection) ? newSelection : prev
      })
    },
    [
      activeSelection,
      isResizing,
      resizingPoint,
      currentDates.length,
      isOverlapping,
    ],
  )

  const [selectionsByPage, setSelectionsByPage] = useState<{
    [key: number]: Selection[]
  }>({})

  const handleMouseUp = useCallback(() => {
    if (activeSelection) {
      // 드래그 후, 선택 영역을 isConfirmed로 설정
      setSelectionsByPage((prev) => {
        const updatedSelections =
          prev[currentPage]?.map((sel) =>
            sel === activeSelection
              ? { ...sel, isConfirmed: true } // 드래그된 영역을 isConfirmed로 설정
              : sel,
          ) || []

        // 기존의 클릭된 부분도 선택 영역에 포함되었을 때 isConfirmed로 설정
        const newSelectionConfirmed = updatedSelections.map((selection) =>
          selection.isSelected
            ? { ...selection, isConfirmed: true }
            : selection,
        )

        if (!updatedSelections.some((sel) => sel === activeSelection)) {
          newSelectionConfirmed.push({ ...activeSelection, isConfirmed: true })
        }

        return {
          ...prev,
          [currentPage]: newSelectionConfirmed,
        }
      })
    }

    // 상태 초기화
    setIsResizing(false)
    setActiveSelection(null)
    setResizingPoint(null)
  }, [activeSelection, isResizing, currentPage])

  const currentSelections = selectionsByPage[currentPage] || []

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
    const allSelections = [
      ...currentSelections,
      ...selections,
      activeSelection,
    ].filter(Boolean) as Selection[]

    for (const selection of allSelections) {
      const minRow = Math.min(selection.startRow, selection.endRow)
      const maxRow = Math.max(selection.startRow, selection.endRow)
      const minCol = Math.min(selection.startCol, selection.endCol)
      const maxCol = Math.max(selection.startCol, selection.endCol)

      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
        const isStartCell =
          row === selection.startRow && col === selection.startCol
        const isEndCell = row === selection.endRow && col === selection.endCol

        if (selection.isConfirmed) {
          return {
            isSelected: true,
            isConfirmed: selection.isConfirmed,
            isStartCell: false,
            isEndCell: false,
            selection,
          }
        }

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

  return (
    <div className="timestamp-container">
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 flex grid grid-cols-[auto_1fr]">
          <div className="relative pt-8 w-7 pr-1">
            {Array.from(
              { length: 23 },
              (
                _,
                i, //시간 몇개로 나눌 건지
              ) => (
                <div key={i} className="h-9 text-[10px] text-[#afafaf]">
                  {`${String(i + 1).padStart(2, '0')}시`}{' '}
                </div>
              ),
            )}
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
              <div key={colIndex} className="relative border border-[#d9d9d9]">
                {Array.from({ length: 48 }, (_, rowIndex) => {
                  // 선택 가능한 세로 길이 범위
                  const cellStatus = getCellStatus(rowIndex, colIndex)
                  return (
                    <div
                      key={rowIndex}
                      className={`h-[18px] relative cursor-pointer ${
                        cellStatus.isSelected
                          ? cellStatus.isConfirmed
                            ? 'bg-[#9562fa]/70'
                            : 'bg-[#9562fa]/20'
                          : ''
                      }`}
                      onMouseDown={() =>
                        cellStatus.isStartCell || cellStatus.isEndCell
                          ? handleMouseDown(
                              rowIndex,
                              colIndex,
                              true,
                              cellStatus.selection,
                            )
                          : handleMouseClick(rowIndex, colIndex)
                      }
                    >
                      {cellStatus.isStartCell && (
                        <div className="absolute -top-1 left-0 w-2 h-2 bg-[#9562fa] rounded-full cursor-move" />
                      )}
                      {cellStatus.isEndCell && (
                        <div className="absolute -bottom-1 right-0 w-2 h-2 bg-[#9562fa] rounded-full cursor-move" />
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
