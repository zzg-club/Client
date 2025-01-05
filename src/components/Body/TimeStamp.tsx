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

    if (pairStartRow === pairEndRow) return

    setSelectionsByPage((prev) => {
      const newSelections = (prev[currentPage] || [])
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

      console.log('Block selected (Click):', newSelection)

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

      console.log('Resizing started on (Down):', selection)
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!gridRef.current || !activeSelection) return

      const rect = gridRef.current.getBoundingClientRect()
      const cellHeight = rect.height / 48
      // const cellWidth = (rect.width - 80) / currentDates.length
      // const col = Math.min(
      //   Math.max(Math.floor((e.clientX - rect.left - 80) / cellWidth), 0),
      //   currentDates.length - 1,
      // )
      const row = Math.min(
        Math.max(Math.floor((e.clientY - rect.top) / cellHeight), 0),
        47,
      )

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
      setSelectionsByPage((prev) => {
        const updatedSelections =
          prev[currentPage]?.map((sel) =>
            sel === activeSelection ? { ...sel, isConfirmed: true } : sel,
          ) || []

        const newSelectionConfirmed = updatedSelections.map((selection) =>
          selection.isSelected
            ? { ...selection, isConfirmed: true }
            : selection,
        )

        if (!updatedSelections.some((sel) => sel === activeSelection)) {
          newSelectionConfirmed.push({ ...activeSelection, isConfirmed: true })
        }

        console.log(
          `Selection completed (Up) from [Row: ${activeSelection.startRow}, Col: ${activeSelection.startCol}] to [Row: ${activeSelection.endRow}, Col: ${activeSelection.endCol}]`,
        )

        return {
          ...prev,
          [currentPage]: newSelectionConfirmed,
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
        const isEndCell = row === selection.startRow && col === selection.endCol

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
            // 세로줄
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
                {(() => {
                  const groupedCells: {
                    start: number
                    end: number
                    isConfirmed: boolean
                  }[] = []
                  let startIndex: number | null = null
                  let isConfirmedGroup = true

                  Array.from({ length: 48 }).forEach((_, rowIndex) => {
                    const cellStatus = getCellStatus(rowIndex, colIndex)
                    if (cellStatus.isSelected) {
                      if (startIndex === null) {
                        startIndex = rowIndex
                      }
                      if (!cellStatus.isConfirmed) {
                        isConfirmedGroup = false
                      }
                    } else if (startIndex !== null) {
                      groupedCells.push({
                        start: startIndex,
                        end: rowIndex - 1,
                        isConfirmed: isConfirmedGroup,
                      })
                      startIndex = null
                      isConfirmedGroup = true
                    }
                  })
                  if (startIndex !== null) {
                    groupedCells.push({
                      start: startIndex,
                      end: 47,
                      isConfirmed: isConfirmedGroup,
                    })
                  }
                  return groupedCells.map((group, groupIndex) => (
                    <div
                      key={`group-${groupIndex}`}
                      className={`absolute w-full ${
                        group.isConfirmed
                          ? 'bg-[#9562fa]/70'
                          : 'bg-[#9562fa]/20 border-[2px] border-[#9562fa]'
                      }`}
                      style={{
                        top: `${group.start * 18}px`,
                        height: `${(group.end - group.start + 1) * 18}px`,
                      }}
                    >
                      {!group.isConfirmed && (
                        <>
                          <div
                            className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                            onMouseDown={() => {
                              handleMouseDown(group.start, groupIndex, true)
                            }}
                          />
                          <div
                            className="absolute -bottom-[5px] right-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                            onMouseDown={() => {
                              handleMouseDown(group.end, groupIndex, true)
                            }}
                          />
                        </>
                      )}
                    </div>
                  ))
                })()}

                {Array.from({ length: 48 }, (_, rowIndex) => {
                  const cellStatus = getCellStatus(rowIndex, colIndex)
                  return (
                    <div
                      key={rowIndex}
                      className="h-[18px] relative cursor-pointer"
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
                    ></div>
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
