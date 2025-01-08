'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface DecideBottomProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const DecideBottom: React.FC<DecideBottomProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    const updateViewportHeight = () => {
      // 브라우저 UI를 제외한 실제 뷰포트 높이 계산
      setViewportHeight(window.innerHeight)
    }

    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight)

    return () => {
      window.removeEventListener('resize', updateViewportHeight)
    }
  }, [])

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // 드래그 속도와 위치에 따라 닫기
    const shouldClose =
      info.velocity.y > 200 || info.offset.y > viewportHeight * 0.25

    if (shouldClose) {
      onClose()
    }
    setIsDragging(false)
  }

  return (
    <AnimatePresence>
      {isOpen && viewportHeight > 0 && (
        <motion.div
          className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)] overflow-hidden"
          initial={{ y: viewportHeight }} // 시작 높이: 전체 화면 아래
          animate={{ y: 0 }} // 열린 상태: 64px만 남기고 열림
          exit={{ y: viewportHeight }} // 닫을 때: 화면 아래로 이동
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{
            height: `${viewportHeight - 64}px`, // 전체 화면 높이에서 64px 제외
          }}
        >
          <div className="py-3">
            <div className="h-[4px] w-[64px] bg-[#afafaf] rounded-full mx-auto" />
            <div
              className={`overflow-auto px-3 ${isDragging ? 'pointer-events-none' : ''}`}
            >
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DecideBottom
