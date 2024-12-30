'use client'

import React, { useState } from 'react'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CustomModal from '@/components/Modals/CustomModal'
import CustomCalendar from '@/components/CustomCalendar'
import Button from '@/components/Buttons/Floating/Button'
import { DateRange } from 'react-day-picker'
import NavBar from '@/components/Navigate/NavBar'
import EditTitle from '@/components/Header/EditTitle'

export default function ScheduleLanding() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct
  const [selectedDates, setSelectedDates] = useState<
    DateRange | Date[] | undefined
  >()
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const handleSelect = (selection: DateRange | Date[] | undefined) => {
    setSelectedDates(selection)
    console.log('Selected:', selection)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }
  const handleOpenCdialog = () => {
    setIsCdialogOpen(!isCdialogOpen)
  }
  const handleOpenDdialg = () => {
    setIsDdialogOpen(!isDdialogOpen)
  }
  return (
    <div>
      {/* Add Moim Button */}
      <NavBar />
      <ScheduleOptions
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        optionStringUp="일정 조율하기"
        optionStringDown="직접 입력하기"
        onClickUp={handleOpenCdialog}
        onClickDown={handleOpenDdialg}
      />
      <Button
        buttonString="일정 추가하기"
        onClick={handleToggle}
        isOpen={isOpen}
      />

      {/* 일정 조율하기 모달 */}
      <CustomModal
        open={isCdialogOpen}
        onOpenChange={handleOpenCdialog}
        onNext={() => alert('다음으로')}
        isFooter={true}
        footerText={'다음으로'}
      >
        <CustomCalendar
          initialMode="range"
          selected={selectedDates}
          onSelect={handleSelect}
        />
      </CustomModal>

      {/* 직접 입력하기 모달 - 날짜, 시간 */}
      <CustomModal
        open={isDdialogOpen}
        onOpenChange={handleOpenDdialg}
        onNext={() => alert('다음으로')}
        isFooter={true}
        footerText={'입력완료'}
      >
        <EditTitle initialTitle={title} onTitleChange={handleTitleChange} />
      </CustomModal>
    </div>
  )
}
