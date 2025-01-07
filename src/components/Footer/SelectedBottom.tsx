'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface SelectedBottomProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const SelectedBottom: React.FC<SelectedBottomProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      info.velocity.y > 20 ||
      (info.velocity.y >= 0 && info.point.y > window.innerHeight * 0.8)
    ) {
      onClose()
    }
    setIsDragging(false)
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)]"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '66px' }} // 애니메이션 66px에서 멈추게 설정
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <div className="py-3 overflow-hidden">
            <div className="h-[4px] w-[64px] bg-[#afafaf] rounded-full mx-auto" />
            <div className={`px-3 ${isDragging ? 'pointer-events-none' : ''}`}>
              {children}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)]"
          initial={{ y: '66px' }} // false일 때 66px 위치에서 시작
          animate={{ y: '66px' }} // false일 때 위치를 66px로 고정
          exit={{ y: '66px' }} // false일 때 exit할 때도 66px에서 멈춤
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="py-3 overflow-hidden">
            <div className="h-[4px] w-[64px] bg-[#afafaf] rounded-full mx-auto" />
            <div
              className={` px-3 ${isDragging ? 'pointer-events-none' : ''}`}
              style={{
                visibility: isOpen ? 'visible' : 'hidden',
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            >
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SelectedBottom
