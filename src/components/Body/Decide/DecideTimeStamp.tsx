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

interface TimeSlot {
  start: string
  end: string
  selectedBy: string[]
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
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
  mockDateTime: DateData[]
  dateTime: { date: string; timeSlots: { start: string; end: string }[] }[]
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
  mockDateTime,
  dateTime,
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

  // Helper function to convert time string to index
  const timeToIndex = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 2 + (minutes >= 30 ? 1 : 0)
  }

  // Process mockDateTime data
  const processedMockData = useMemo(() => {
    // week 모드일 경우 데이터 순서를 재정렬
    if (mode === 'week') {
      // 요일의 정렬 우선순위
      const weekdayOrder = ['월', '화', '수', '목', '금', '토', '일']

      // 날짜를 요일로 변환하는 함수
      const getWeekday = (dateStr: string) => {
        const date = new Date(dateStr)
        const weekdays = ['일', '월', '화', '수', '목', '금', '토']
        return weekdays[date.getDay()]
      }

      // 정렬된 데이터 생성
      const sortedData = [...mockDateTime].sort((a, b) => {
        const weekdayA = getWeekday(a.date)
        const weekdayB = getWeekday(b.date)

        // 요일 우선순위 비교
        const orderA = weekdayOrder.indexOf(weekdayA)
        const orderB = weekdayOrder.indexOf(weekdayB)

        if (orderA !== orderB) {
          return orderA - orderB
        }

        // 같은 요일이라면 날짜 비교
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

      return sortedData.map((dateData) => {
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
    }

    // range 모드일 때는 기존 로직 유지
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
  }, [mockDateTime, currentPage, mode])

  const maxOverlap = useMemo(() => {
    return Math.max(...processedMockData.flatMap((data) => data.slots))
  }, [processedMockData])

  const getOpacity = (count: number) => {
    return count > 0 ? 0.2 + (count / maxOverlap) * 0.8 : 0
  }

  const onColumnClick = (colIndex: number, rowIndex: number) => {
    console.log('onColumnClick')
    // if (colIndex === -1) {
    //   handleSelectedCol(colIndex, rowIndex)
    //   return 0
    // }

    // colIndex가 -1이면 early return
    if (colIndex === -1) {
      handleSelectedCol(colIndex, rowIndex)
      return 0
    }

    // 현재 열의 날짜 구하기
    let currentDate: string
    if (mode === 'range') {
      const date = selectedDates[currentPage * COLUMNS_PER_PAGE + colIndex]
      currentDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    } else {
      const groupedArray = groupedDate[currentPage]?.date ?? []
      currentDate = `${groupedArray[colIndex]?.year}-${String(groupedArray[colIndex]?.month).padStart(2, '0')}-${String(groupedArray[colIndex]?.day).padStart(2, '0')}`
    }

    const schedule = dateTime.find((item) => {
      // 날짜가 일치하는지 먼저 확인
      if (item.date !== currentDate) return false

      // 해당 날짜의 timeSlots 중에서 선택한 rowIndex가 포함되는 시간대가 있는지 확인
      return item.timeSlots.some((slot) => {
        const startIdx = timeToIndex(slot.start)
        const endIdx = timeToIndex(slot.end) - 1
        return rowIndex >= startIdx && rowIndex <= endIdx
      })
    })
    console.log('schedule', schedule)

    if (schedule) {
      return 0
    }

    if (gridRef.current) {
      const actualColIndex = currentPage * COLUMNS_PER_PAGE + colIndex
      handleSelectedCol(actualColIndex, rowIndex)
    }
  }

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
    console.log('handleMouseClick')

    // 현재 열의 날짜 구하기
    let currentDate: string
    if (mode === 'range') {
      const date = selectedDates[currentPage * COLUMNS_PER_PAGE + colIndex]
      currentDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    } else {
      const groupedArray = groupedDate[currentPage]?.date ?? []
      currentDate = `${groupedArray[colIndex]?.year}-${String(groupedArray[colIndex]?.month).padStart(2, '0')}-${String(groupedArray[colIndex]?.day).padStart(2, '0')}`
    }

    const schedule = dateTime.find((item) => {
      // 날짜가 일치하는지 먼저 확인
      if (item.date !== currentDate) return false

      // 해당 날짜의 timeSlots 중에서 선택한 rowIndex가 포함되는 시간대가 있는지 확인
      return item.timeSlots.some((slot) => {
        const startIdx = timeToIndex(slot.start)
        const endIdx = timeToIndex(slot.end) - 1
        return rowIndex >= startIdx && rowIndex <= endIdx
      })
    })
    console.log('schedule', schedule)

    if (schedule) {
      return
    }

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

  // 원래 성하의 handleTouchEnd 함수
  // const handleTouchEnd = () => {
  //   if (activeSelection) {
  //     const finalizedSelection = {
  //       ...activeSelection,
  //       isSelected: false,
  //       isConfirmed: true,
  //     }

  //     setSelectionsByPage((prev) => {
  //       const currentSelections = prev[currentPage] || []
  //       const updatedSelections = currentSelections.flatMap((sel) => {
  //         const isOverlap =
  //           sel.startRow <= finalizedSelection.endRow &&
  //           sel.endRow >= finalizedSelection.startRow &&
  //           sel.startCol === finalizedSelection.startCol

  //         if (!isOverlap) {
  //           return [sel]
  //         }

  //         const splitSelections = []
  //         if (sel.startRow < finalizedSelection.startRow) {
  //           splitSelections.push({
  //             ...sel,
  //             endRow: finalizedSelection.startRow - 1,
  //           })
  //         }
  //         if (sel.endRow > finalizedSelection.endRow) {
  //           splitSelections.push({
  //             ...sel,
  //             startRow: finalizedSelection.endRow + 1,
  //           })
  //         }
  //         return splitSelections
  //       })

  //       const mergedSelections = [...updatedSelections, finalizedSelection]

  //       const startCol = finalizedSelection.startCol
  //       const getTimeLabel = (rowIndex: number) => {
  //         const hours = Math.floor(rowIndex / 2)
  //         const minutes = (rowIndex % 2) * 30
  //         const formattedHour = String(hours).padStart(2, '0')
  //         const formattedMinute = String(minutes).padStart(2, '0')
  //         return `${formattedHour}:${formattedMinute}`
  //       }

  //       let selectedDate: string
  //       if (mode === 'range') {
  //         // mode가 'range'일 경우 기존 로직
  //         selectedDate = `${currentDates[startCol]?.year}-${String(currentDates[startCol]?.month).padStart(2, '0')}-${String(currentDates[startCol]?.day).padStart(2, '0')}`
  //       } else {
  //         // mode가 'range'가 아닐 경우 다른 로직
  //         const groupedArray = groupedDate?.[currentPage]?.date ?? []
  //         selectedDate = `${groupedArray[startCol]?.year}-${String(groupedArray[startCol]?.month).padStart(2, '0')}-${String(groupedArray[startCol]?.day).padStart(2, '0')}`
  //       }

  //       console.log('groupedDate', groupedDate)

  //       // console.log('selectedDate', selectedDate)

  //       const startTime = getTimeLabel(finalizedSelection.startRow)
  //       const endTime = getTimeLabel(finalizedSelection.endRow + 1)

  //       handleDateTimeSelect(selectedDate, startTime, endTime)

  //       return {
  //         ...prev,
  //         [currentPage]: mergedSelections,
  //       }
  //     })
  //   }
  // }

  // 윤정언니 handleTouchEnd 함수
  const handleTouchEnd = () => {
    handleMouseUp()
  }

  // 윤정언니 handleTouchStart 함수
  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    rowIndex: number,
    colIndex: number,
    isStartPoint: boolean,
    selection: Selection,
  ) => {
    e.preventDefault()
    // 현재 열의 날짜 구하기
    let currentDate: string
    if (mode === 'range') {
      const date = selectedDates[currentPage * COLUMNS_PER_PAGE + colIndex]
      currentDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    } else {
      const groupedArray = groupedDate[currentPage]?.date ?? []
      currentDate = `${groupedArray[colIndex]?.year}-${String(groupedArray[colIndex]?.month).padStart(2, '0')}-${String(groupedArray[colIndex]?.day).padStart(2, '0')}`
    }

    const schedule = dateTime.find((item) => {
      // 날짜가 일치하는지 먼저 확인
      if (item.date !== currentDate) return false

      // 해당 날짜의 timeSlots 중에서 선택한 rowIndex가 포함되는 시간대가 있는지 확인
      return item.timeSlots.some((slot) => {
        const startIdx = timeToIndex(slot.start)
        const endIdx = timeToIndex(slot.end) - 1
        return rowIndex >= startIdx && rowIndex <= endIdx
      })
    })
    console.log('schedule', schedule)

    if (schedule) {
      return
    }
    if (selection) {
      setIsResizing(true)
      setActiveSelection(selection)
      setResizingPoint(isStartPoint ? 'start' : 'end')
    }
  }

  useEffect(() => {
    const element = gridRef.current
    if (!element) return

    const handleTouchMove = (e: TouchEvent) => {
      if (!gridRef.current || !activeSelection) return

      const rect = gridRef.current.getBoundingClientRect()
      const cellHeight = rect.height / 48
      const clientY = e.touches[0]?.clientY // 첫 번째 터치의 Y 좌표
      const row = Math.min(
        Math.max(Math.floor((clientY - rect.top) / cellHeight), 0),
        47,
      )

      // console.log('ActiveSelection', activeSelection);

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

      e.preventDefault() // 터치 스크롤 방지
    }
    element.addEventListener('touchmove', handleTouchMove, {
      passive: false, // preventDefault 사용 가능하도록 설정
    })

    return () => {
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isResizing, activeSelection, resizingPoint, isOverlapping])

  useEffect(() => {
    const handleMouseUpWithColumnClick = () => {
      handleMouseUp()
      handleTouchEnd()
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
    // 핀치 줌 구현
    const element = gridRef.current
    if (!element) return

    let initialDistance = 0

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSelectionsByPage((prev) => {
        const newSelections = { ...prev }

        Object.keys(newSelections).forEach((pageKey) => {
          const page = Number.parseInt(pageKey, 10)
          const pageSelections = newSelections[page]
          if (!pageSelections) return

          // 현재 페이지의 선택 영역을 필터링
          newSelections[page] = pageSelections.filter((selection) => {
            // 아직 확정되지 않은 선택 영역은 항상 유지
            if (!selection.isConfirmed) return true

            // 선택 영역의 날짜와 시간 정보 계산
            const colDate =
              mode === 'range'
                ? selectedDates[selection.startCol + page * COLUMNS_PER_PAGE]
                  ? `${selectedDates[selection.startCol + page * COLUMNS_PER_PAGE]?.year}-${String(
                      selectedDates[
                        selection.startCol + page * COLUMNS_PER_PAGE
                      ]?.month,
                    ).padStart(2, '0')}-${String(
                      selectedDates[
                        selection.startCol + page * COLUMNS_PER_PAGE
                      ]?.day,
                    ).padStart(2, '0')}`
                  : undefined
                : groupedDate[page]?.date?.[selection.startCol]
                  ? `${groupedDate[page]?.date?.[selection.startCol]?.year}-${String(
                      groupedDate[page]?.date?.[selection.startCol]?.month,
                    ).padStart(
                      2,
                      '0',
                    )}-${String(groupedDate[page]?.date?.[selection.startCol]?.day).padStart(2, '0')}`
                  : undefined

            console.log('colDate', colDate)

            if (!colDate) {
              console.log(
                `Removing selection due to missing colDate:`,
                selection,
              )
              return false
            }

            const getTimeFromRow = (row: number) => {
              const hours = Math.floor(row / 2)
              const minutes = (row % 2) * 30
              return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
            }

            const selectionStart = getTimeFromRow(selection.startRow)
            const selectionEnd = getTimeFromRow(selection.endRow + 1)

            // dateTime에서 해당 날짜와 시간대가 존재하는지 확인
            const exists = dateTime.some(
              (dateItem) =>
                dateItem.date === colDate &&
                dateItem.timeSlots.some(
                  (slot) =>
                    slot.start === selectionStart || slot.end === selectionEnd,
                ),
            )

            console.log('exists', exists)

            if (!exists) {
              console.log(`Removing selection due to missing timeSlot:`, {
                selection,
                colDate,
                selectionStart,
                selectionEnd,
              })
            }

            return exists // dateTime에 존재하는 경우만 유지
          })

          // 빈 페이지 제거
          if (newSelections[page].length === 0) {
            console.log(`Removing empty page          `, page)
            delete newSelections[page]
          }
        })

        console.log('Updated selectionsByPage:', newSelections)
        return newSelections
      })
    }, 500) // 1000ms (1초) 지연

    return () => clearTimeout(timeoutId) // 컴포넌트 언마운트 시 타이머 클리어
  }, [dateTime, selectedDates, mode, groupedDate])

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
            className=" w-full relative grid z-500 border-[1px] border-[#d9d9d9] rounded-3xl"
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

                  const mockDataForDate = processedMockData.find(
                    (data) =>
                      new Date(data.date).getDate() ===
                      currentDates[colIndex].day,
                  )
                  const overlayOpacity = mockDataForDate
                    ? getOpacity(mockDataForDate.slots[rowIndex])
                    : 0

                  return (
                    <div
                      key={rowIndex}
                      className={`relative cursor-pointer ${cornerStyleRound}`}
                      style={{
                        ...cellBorder,
                        height: `${18 * scale}px`,
                        // borderCollapse: 'separate',
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
                        className={`absolute inset-0 ${cornerStyleRound}`}
                        style={{
                          backgroundColor: `rgba(149, 98, 251, ${overlayOpacity})`,
                          zIndex: 50,
                        }}
                      />
                      <div
                        className={`absolute inset-0 ${cornerStyleRound} ${
                          cellStatus.isSelected
                            ? cellStatus.isConfirmed
                              ? 'opacity-50 bg-[#2a027a]'
                              : 'opacity-50 bg-[#2a027a]'
                            : ''
                        }`}
                        style={{ zIndex: 100 }}
                        onTouchStart={(e) =>
                          handleTouchStart(
                            e,
                            rowIndex,
                            colIndex,
                            cellStatus.isStartCell,
                            cellStatus.selection!,
                          )
                        }
                        onTouchEnd={handleTouchEnd}
                      />
                      {!cellStatus.isConfirmed && cellStatus.isStartCell && (
                        // <div
                        //   className="absolute -top-[0px] left-[0%] w-[100%] h-[100%] touch-target z-[2000]"
                        //   onMouseDown={() => {
                        //     // e.stopPropagation()
                        //     handleMouseDown(
                        //       rowIndex,
                        //       colIndex,
                        //       true,
                        //       cellStatus.selection!,
                        //     )
                        //     onColumnClick(colIndex, rowIndex)
                        //   }}
                        // >
                        <div
                          className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
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
                        // </div>
                      )}
                      {!cellStatus.isConfirmed && cellStatus.isEndCell && (
                        // <div
                        //   className="absolute -bottom-[0px] right-[0%] w-[100%] h-[100%] touch-target"
                        //   style={{ zIndex: 3000 }}
                        //   // onTouchStart={(e) => {
                        //   //   e.stopPropagation()
                        //   //   handleMouseDown(
                        //   //     rowIndex,
                        //   //     colIndex,
                        //   //     false,
                        //   //     cellStatus.selection!,
                        //   //   )
                        //   //   onColumnClick(colIndex, rowIndex)
                        //   // }}
                        // >
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
                        // </div>
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
