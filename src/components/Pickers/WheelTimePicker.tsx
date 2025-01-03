'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import '../../styles/WheelTimePicker.css'

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  className?: string
}

interface WheelOption {
  label: string
  value: string
}

const ITEM_HEIGHT = 44
const VISIBLE_ITEMS = 5

const WheelPicker: React.FC<{
  options: WheelOption[]
  value: string
  onChange: (value: string) => void
  height: number
  itemHeight: number
}> = ({ options, value, onChange, height, itemHeight }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(
    options.findIndex((opt) => opt.value === value) || 0,
  )

  const snapToIndex = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, options.length - 1))
    if (containerRef.current) {
      const targetScrollTop = boundedIndex * itemHeight
      containerRef.current.style.scrollBehavior = 'smooth'
      containerRef.current.scrollTop = targetScrollTop
      containerRef.current.style.scrollBehavior = 'auto'
      setSelectedIndex(boundedIndex)
      onChange(options[boundedIndex].value)
    }
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = selectedIndex * itemHeight
    }
  }, [selectedIndex, itemHeight])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - startY
    const newScrollTop = scrollTop - deltaY * 0.8
    if (containerRef.current) {
      containerRef.current.scrollTop = newScrollTop
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / itemHeight)
      snapToIndex(index)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (containerRef.current) {
      const delta = Math.sign(e.deltaY) * 0.8
      const newIndex = Math.round(selectedIndex + delta)
      snapToIndex(newIndex)
    }
  }

  return (
    <div className="wheel-picker-container">
      <div
        ref={containerRef}
        className="wheel-picker-scroll"
        style={{ height: `${height}px` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div style={{ height: `${(height - itemHeight) / 2}px` }} />
        {options.map((option, index) => {
          const distance = Math.abs(selectedIndex - index)
          return (
            <div
              key={option.value}
              className={cn(
                'wheel-picker-item',
                selectedIndex === index && 'wheel-picker-item-selected',
              )}
              style={{
                height: `${itemHeight}px`,
                transform: `scale(${1 - distance * 0.1})`,
                opacity: Math.max(0, 1 - distance * 0.3),
              }}
            >
              {option.label}
            </div>
          )
        })}
        <div style={{ height: `${(height - itemHeight) / 2}px` }} />
      </div>
      <div className="wheel-picker-gradient" />
    </div>
  )
}

export default function WheelTimePicker({
  value,
  onChange,
  className,
}: TimePickerProps) {
  const [selectedTime, setSelectedTime] = useState({
    hour: '08',
    minute: '00',
    meridiem: 'PM',
  })

  const hours: WheelOption[] = Array.from({ length: 12 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString().padStart(2, '0'),
  }))

  const minutes: WheelOption[] = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i.toString().padStart(2, '0'),
  }))

  const meridiems: WheelOption[] = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' },
  ]

  useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ')
      const [hour, minute] = time.split(':')
      setSelectedTime({
        hour,
        minute,
        meridiem: period,
      })
    }
  }, [value])

  const handleChange = (type: keyof typeof selectedTime, newValue: string) => {
    const newTime = {
      ...selectedTime,
      [type]: newValue,
    }
    setSelectedTime(newTime)
    if (onChange) {
      const formattedTime = `${newTime.hour}:${newTime.minute} ${newTime.meridiem}`
      onChange(formattedTime)
      console.log('Selected time:', formattedTime)
    }
  }

  const totalHeight = ITEM_HEIGHT * VISIBLE_ITEMS

  return (
    <div className={cn('wheel-time-picker', className)}>
      <div className="wheel-time-picker-content">
        <WheelPicker
          options={hours}
          value={selectedTime.hour}
          onChange={(value) => handleChange('hour', value)}
          height={totalHeight}
          itemHeight={ITEM_HEIGHT}
        />
        <div className="wheel-time-picker-separator">:</div>
        <WheelPicker
          options={minutes}
          value={selectedTime.minute}
          onChange={(value) => handleChange('minute', value)}
          height={totalHeight}
          itemHeight={ITEM_HEIGHT}
        />
        <WheelPicker
          options={meridiems}
          value={selectedTime.meridiem}
          onChange={(value) => handleChange('meridiem', value)}
          height={totalHeight}
          itemHeight={ITEM_HEIGHT}
        />
      </div>
      <div className="wheel-time-picker-selection" />
    </div>
  )
}
