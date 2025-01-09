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
    const shouldClose =
      info.velocity.y > 200 || info.offset.y > viewportHeight * 0.25

    if (shouldClose) {
      onClose()
    }
    setIsDragging(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)]"
        initial={{ y: isOpen ? viewportHeight : '300px' }}
        animate={{ y: isOpen ? 0 : '200px' }}
        exit={{ y: viewportHeight }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{
          height: isOpen ? `${viewportHeight - 64}px` : 'auto',
        }}
      >
        <div className="py-3 overflow-hidden">
          <div className="h-[4px] w-[64px] bg-[#afafaf] rounded-full mx-auto" />
          <div
            className={`px-3 overflow-auto ${
              isDragging ? 'pointer-events-none' : ''
            }`}
            style={{
              visibility: isOpen ? 'visible' : 'hidden',
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DecideBottom
