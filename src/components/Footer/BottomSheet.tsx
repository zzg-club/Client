'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo,
} from 'framer-motion'
import '../../styles/BottomSheet.css'

export interface BottomSheetProps {
  children: React.ReactNode
}

export function BottomSheet({ children }: BottomSheetProps) {
  const [sheetState, setSheetState] = useState<
    'collapsed' | 'middle' | 'expanded'
  >('collapsed')
  const controls = useAnimation()
  const y = useMotionValue(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  const height = useTransform(y, (latest) => {
    if (latest < -600) return '90%'
    if (latest < -100) return 140
    return 62
  })

  useEffect(() => {
    controls.start({ height: 62 })
  }, [controls])

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const velocity = info.velocity.y
    const offset = info.offset.y

    if (velocity > 500 || offset > 100) {
      setSheetState('collapsed')
      controls.start({ height: 62 })
    } else if (velocity < -500 || offset < -100) {
      if (sheetState === 'collapsed') {
        setSheetState('middle')
        controls.start({ height: 140 })
      } else {
        setSheetState('expanded')
        controls.start({ height: '90%' })
      }
    } else {
      controls.start({ height: height.get() })
    }
  }

  return (
    <motion.div
      ref={sheetRef}
      //   className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)] overflow-hidden"
      className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0px_0px_10px_0px_rgba(30,30,30,0.10)] overflow-hidden"
      style={{ height, maxHeight: '90%' }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      //   dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      <div className="px-3 py-2">
        <div className="w-[64px] h-[4px] bg-[#afafaf] rounded-full mx-auto mb-[17px]" />
        <div
          className="overflow-hidden p-1"
          style={{ height: 'calc(100% - 24px)' }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  )
}
