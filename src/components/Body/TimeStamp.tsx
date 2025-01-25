'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import '../../styles/TimeStamp.css'

interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
  isSelected: boolean
  isConfirmed: boolean
}

interface GroupedDate {
  weekday: string
  dates?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
  date?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
}

interface TimeStampProps {
  selectedDates: { year: number; month: number; day: number }[]
  currentPage: number
  mode: string
  onPageChange: (newPage: number) => void
  dateCounts: number[]
  handleSelectedCol: (colIndex: number, rowIndex: number) => void
  handleActiveTime: (start: number, end: number) => void
  getDateTime: (date: string, start: string, end: string) => void
  isBottomSheetOpen: boolean
  groupedDate: GroupedDate[]
}

const COLUMNS_PER_PAGE = 7

export default function TimeStamp({
  selectedDates,
  currentPage,
  mode,
  dateCounts,
  groupedDate,
  handleSelectedCol,
  handleActiveTime,
  getDateTime,
  isBottomSheetOpen,
}: TimeStampProps) {
  const [selections] = useState<Selection[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null)
  const [resizingPoint, setResizingPoint] = useState<'start' | 'end' | null>(
    null,
  )
  const [scale, setScale] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  const currentDates =
    mode === 'range'
      ? selectedDates.slice(
          currentPage * COLUMNS_PER_PAGE,
          (currentPage + 1) * COLUMNS_PER_PAGE,
        )
      : (() => {
          let startIndex = 0
          let endIndex = 0

          // dateCounts에 따라 날짜 범위 계산
          for (let i = 0; i < dateCounts.length; i++) {
            const pageSize = dateCounts[i]
            if (currentPage === i) {
              endIndex = startIndex + pageSize
              break
            }
            startIndex += pageSize
          }

          return selectedDates.slice(startIndex, endIndex)
        })()

  const [selectionsByPage, setSelectionsByPage] = useState<{
    [key: number]: Selection[]
  }>({})

  const currentSelections = useMemo(() => {
    return selectionsByPage[currentPage] || []
  }, [selectionsByPage, currentPage])

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

  const onActiveTime = useCallback(
    (start: number, end: number) => {
      setTimeout(() => {
        handleActiveTime(start, end)
      }, 0)
    },
    [handleActiveTime],
  )

  const handleDateTimeSelect = useCallback(
    (date: string, start: string, end: string) => {
      setTimeout(() => {
        getDateTime(date, start, end)
      }, 0)
    },
    [getDateTime],
  )

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
      const updatedSelections = Object.keys(prev).reduce(
        (acc, page) => {
          acc[Number(page)] = (prev[Number(page)] || []).filter(
            (selection) => selection.isConfirmed,
          )
          return acc
        },
        {} as { [key: number]: Selection[] },
      )

      const newSelection: Selection = {
        startRow: pairStartRow,
        startCol: colIndex,
        endRow: pairEndRow,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      }

      return {
        ...updatedSelections,
        [currentPage]: [
          ...(updatedSelections[currentPage] || []),
          newSelection,
        ],
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
      console.log('Resizing started on', resizingPoint, selection)
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

        // console.log(
        //   '현재 상황',
        //   currentDates,
        //   '시작 열',
        //   startCol,
        //   '현재 일자',
        //   currentDates[startCol],
        //   '현재 페이지',
        //   currentPage,
        //   '그룹 데이터',
        //   groupedDate,
        // )

        let selectedDate: string
        if (mode === 'range') {
          // mode가 'range'일 경우 기존 로직
          selectedDate = `${currentDates[startCol]?.year}-${String(currentDates[startCol]?.month).padStart(2, '0')}-${String(currentDates[startCol]?.day).padStart(2, '0')}`
        } else {
          // mode가 'range'가 아닐 경우 다른 로직
          const groupedArray = groupedDate?.[currentPage]?.date ?? []
          selectedDate = `${groupedArray[startCol]?.year}-${String(groupedArray[startCol]?.month).padStart(2, '0')}-${String(groupedArray[startCol]?.day).padStart(2, '0')}`
        }

        // console.log('selectedDate', selectedDate)

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
  }, [
    activeSelection,
    currentDates,
    currentPage,
    groupedDate,
    handleDateTimeSelect,
    mode,
  ])

  const handleSelectionStart = (
    rowIndex: number,
    colIndex: number,
    isTouchEvent: boolean,
  ) => {
    // 이미 선택된 상태라면 새로운 선택을 시작하지 않음
    const cellStatus = getCellStatus(rowIndex, colIndex)
    if (cellStatus.isSelected) return

    if (!isTouchEvent) {
      return
    }

    console.log('handleSelectionStart', rowIndex, colIndex, isTouchEvent)

    const pairStartRow = Math.floor(rowIndex / 2) * 2
    const pairEndRow = pairStartRow + 1

    setSelectionsByPage((prev) => {
      const updatedSelections = Object.keys(prev).reduce(
        (acc, page) => {
          acc[Number(page)] = (prev[Number(page)] || []).filter(
            (selection) => selection.isConfirmed,
          )
          return acc
        },
        {} as { [key: number]: Selection[] },
      )

      const newSelection: Selection = {
        startRow: pairStartRow,
        startCol: colIndex,
        endRow: pairEndRow,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      }

      return {
        ...updatedSelections,
        [currentPage]: [
          ...(updatedSelections[currentPage] || []),
          newSelection,
        ],
      }
    })
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
        row = Math.min(
          Math.max(Math.floor((clientY - rect.top) / cellHeight), 0),
          47,
        )
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

  const handleTouchUp = useCallback(() => {
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

        let selectedDate: string
        if (mode === 'range') {
          selectedDate = `${currentDates[startCol]?.year}-${String(currentDates[startCol]?.month).padStart(2, '0')}-${String(currentDates[startCol]?.day).padStart(2, '0')}`
        } else {
          const groupedArray = groupedDate?.[currentPage]?.date ?? []
          selectedDate = `${groupedArray[startCol]?.year}-${String(groupedArray[startCol]?.month).padStart(2, '0')}-${String(groupedArray[startCol]?.day).padStart(2, '0')}`
        }

        const startTime = getTimeLabel(finalizedSelection.startRow)
        const endTime = getTimeLabel(finalizedSelection.endRow + 1)

        handleDateTimeSelect(selectedDate, startTime, endTime)

        return {
          ...prev,
          [currentPage]: mergedSelections,
        }
      })
    }
  }, [
    activeSelection,
    currentDates,
    currentPage,
    groupedDate,
    handleDateTimeSelect,
    mode,
  ])

  useEffect(() => {
    const handleMouseUpWithColumnClick = () => {
      handleMouseUp()
      onColumnClick(-1, -1)
    }

    const handleTouchUpWithColumnClick = () => {
      handleTouchUp()
      onColumnClick(-1, -1)
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY, false)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault() // 셀 범위 조정과 y축 스크롤 중첩 방지
        handleMove(e.touches[0].clientY, false)
      }
    }

    if (activeSelection || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUpWithColumnClick)
      window.addEventListener('touchend', handleTouchUpWithColumnClick)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', handleMouseUpWithColumnClick)
      window.removeEventListener('touchend', handleTouchUpWithColumnClick)
    }
  }, [
    activeSelection,
    isResizing,
    handleMouseMove,
    handleMouseUp,
    onColumnClick,
    currentSelections,
    handleMove,
    handleTouchUp,
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

    // console.log(activeSelection)
    if (activeSelection) {
      onActiveTime(activeSelection.startRow, activeSelection.endRow)
    }

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
    // 핀치 줌 구현
    const element = gridRef.current
    if (!element) return

    let initialDistance = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
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
        e.preventDefault()
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
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 flex grid grid-cols-[auto_1fr]">
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
            className=" w-full relative grid z-100 border-[1px] border-[#d9d9d9] rounded-3xl"
            style={{
              gridTemplateColumns: `repeat(${currentDates.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36 * scale}px`,
              // clipPath: 'inset(1px 0 0)',
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

                  const isTopLeftCorner = rowIndex === 0 && colIndex === 0
                  const isTopRightCorner =
                    rowIndex === 0 && colIndex === currentDates.length - 1
                  const isBottomLeftCorner = rowIndex === 47 && colIndex === 0
                  const isBottomRightCorner =
                    rowIndex === 47 && colIndex === currentDates.length - 1

                  const cornerStyleRound = `
                    ${isTopLeftCorner ? 'rounded-tl-[20px]' : ''}
                    ${isTopRightCorner ? 'rounded-tr-[20px]' : ''}
                    ${isBottomLeftCorner ? 'rounded-bl-[20px]' : ''}
                    ${isBottomRightCorner ? 'rounded-br-[20px]' : ''}
                  `
                  return (
                    <div
                      key={rowIndex}
                      className={`relative cursor-pointer ${cornerStyleRound} ${
                        cellStatus.isSelected
                          ? cellStatus.isConfirmed
                            ? 'bg-[#9562fa]/60 z-200'
                            : 'bg-[#9562fa]/20 z-200'
                          : ''
                      }`}
                      style={{
                        ...cellBorder,
                        height: `${18 * scale}px`,
                      }}
                      onMouseDown={() => {
                        handleMouseClick(rowIndex, colIndex)
                        onColumnClick(colIndex, rowIndex)
                      }}
                      onTouchStart={() => {
                        handleSelectionStart(rowIndex, colIndex, true)
                      }}
                    >
                      {!cellStatus.isConfirmed && cellStatus.isStartCell && (
                        <div
                          className="absolute -top-[0px] left-[0%] w-[100%] h-[100%] touch-target"
                          onTouchStart={(e) => {
                            e.stopPropagation()
                            handleMouseDown(
                              rowIndex,
                              colIndex,
                              true,
                              cellStatus.selection!,
                            )
                            onColumnClick(colIndex, rowIndex)
                          }}
                        >
                          <div
                            className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                            onMouseDown={() => {
                              handleMouseDown(
                                rowIndex,
                                colIndex,
                                true,
                                cellStatus.selection!,
                              )
                            }}
                          />
                        </div>
                      )}
                      {!cellStatus.isConfirmed && cellStatus.isEndCell && (
                        <div
                          className="absolute -bottom-[0px] right-[0%] w-[100%] h-[100%] touch-target"
                          onTouchStart={(e) => {
                            e.stopPropagation()
                            handleMouseDown(
                              rowIndex,
                              colIndex,
                              false,
                              cellStatus.selection!,
                            )
                            onColumnClick(colIndex, rowIndex)
                          }}
                        >
                          <div
                            className="absolute -bottom-[5px] right-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move "
                            onMouseDown={() => {
                              handleMouseDown(
                                rowIndex,
                                colIndex,
                                false,
                                cellStatus.selection!,
                              )
                            }}
                          />
                        </div>
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
