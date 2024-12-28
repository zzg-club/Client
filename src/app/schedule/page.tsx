'use client'

import React, { useState } from 'react'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CustomModal from '@/components/Modals/CustomModal'
import CustomCalendar from '@/components/CustomCalendar'
import Button from '@/components/Buttons/Floating/Button'
import { DateRange } from 'react-day-picker'

export default function ScheduleLanding() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<DateRange>()
  console.log('from', selectedDate?.from)
  console.log('to', selectedDate?.to)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }
  const handleOpenDialog = () => {
    setIsDialogOpen(!isDialogOpen)
  }
  return (
    <div>
      {/* Add Moim Button */}
      <ScheduleOptions
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        optionStringUp="일정 조율하기"
        optionStringDown="직접 입력하기"
        onClickUp={handleOpenDialog}
        onClickDown={() => alert('직접 입력하기 선택')}
      />
      <Button
        buttonString="일정 추가하기"
        onClick={handleToggle}
        isOpen={isOpen}
      />

      {/* Dialog */}
      <CustomModal
        open={isDialogOpen}
        onOpenChange={handleOpenDialog}
        onNext={() => alert('다음으로')}
      >
        <CustomCalendar selected={selectedDate} onSelect={setSelectedDate} />
      </CustomModal>
    </div>
  )
}
