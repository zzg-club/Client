import { useState, useRef } from 'react'

export const useBottomSheet = () => {
  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'middle' | 'expanded'>('collapsed')
  const startY = useRef<number | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const threshold = 50

  const handleStart = (y: number) => {
    startY.current = y
    isDraggingRef.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
  }

  const handleMove = (y: number, participantsLength: number) => {
    if (!isDraggingRef.current || startY.current === null) return

    const deltaY = startY.current - y

    if (participantsLength < 4) {
      // ❌ 4명 이하일 때는 드래그 비활성화
      return
    }

    if (deltaY > threshold) {
      setBottomSheetState((prev) => {
        if (prev === 'collapsed' && participantsLength >= 4) return 'middle'
        if (prev === 'middle' && participantsLength >= 6) return 'expanded'
        return prev
      })
      startY.current = y
    } else if (deltaY < -threshold) {
      setBottomSheetState((prev) => {
        if (prev === 'expanded' && participantsLength >= 6) return 'middle'
        if (prev === 'middle' && participantsLength >= 4) return 'collapsed'
        return prev
      })
      startY.current = y
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientY, 4) // 기본값 설정 (useBottomSheet 사용 시 participants.length를 넘겨줘야 함)
  }

  const handleEnd = () => {
    startY.current = null
    isDraggingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleEnd)
  }

  return {
    bottomSheetState,
    setBottomSheetState,
    handleStart,
    handleMove,
    handleEnd,
  }
}
