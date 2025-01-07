'use client'

import { useState } from 'react'
import WheelTimePicker from '@/components/Pickers/WheelTimePicker'
import CustomModal from '../CustomModal'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { format } from 'date-fns'

interface DateTimeModalProps {
  onDateChange: (startDate: string, endDate: string) => void
}

export default function DateTimeModal({ onDateChange }: DateTimeModalProps) {
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false)
  const [isTimePicker2Open, setIsTimePicker2Open] = useState<boolean>(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const { selectedDates, stringDates, handleSelect } = useHandleSelect()
  const [startTime, setStartTime] = useState('08:00 PM')
  const [finTime, setFinTime] = useState('08:00 PM')
  const [isFinTime, setIsFinTime] = useState<boolean>(false)

  const formattedStringDates = stringDates.map((date) => {
    const dateObject = new Date(date)
    return format(dateObject, 'MM월 dd일')
  })

  const handleTimeChange = (time: string) => {
    console.log('[date-time-modal] Selected time: ', time)
    if (isTimePickerOpen) {
      setStartTime(time) // WheelTimePicker에서 전달받은 시간 설정
    } else {
      setFinTime(time)
    }
  }

  // 시작 시간 선택 모달 오픈
  const handleTimePickerOpen = () => {
    setIsCalendarOpen(false)
    setIsTimePickerOpen(!isTimePickerOpen)
  }
  // 끝 시간 선택 모달 오픈
  const handleTimePicker2Open = () => {
    setIsTimePicker2Open(!isTimePicker2Open)
    setIsFinTime(true)
  }

  const handleCalendarOpen = () => {
    setIsCalendarOpen(!isCalendarOpen)
    setIsFinTime(false)
  }

  // 선택한 시간 포맷 변경
  const formatTime = (time: string) => {
    const [hour, minutePart] = time.split(':')
    const minute = minutePart.slice(0, 2)
    const period = minutePart.slice(3)

    let hourNumber = parseInt(hour, 10)
    if (period === 'PM' && hourNumber !== 12) {
      hourNumber += 12
    } else if (period === 'AM' && hourNumber === 12) {
      hourNumber = 0
    }

    return `${String(hourNumber).padStart(2, '0')}:${minute}`
  }

  // 두번째 날짜/시간까지 입력했을 경우 부모컴포넌트로 state 전달
  const handleConfirm = () => {
    if (stringDates[0]) {
      const formattedDate = stringDates[0]
        .replace(/월|일/g, '') // 'MM월 DD일'에서 'MM DD'로 변환
        .trim()
        .split(' ')

      const month = formattedDate[0] || '01' // 기본값 '01'
      const day = formattedDate[1] || '01' // 기본값 '01'

      const startDateString = `${month.padStart(2, '0')}-${day.padStart(2, '0')}T${formatTime(startTime)}:00.000Z`
      const endDateString = `${month.padStart(2, '0')}-${day.padStart(2, '0')}T${formatTime(finTime)}:00.000Z`

      try {
        onDateChange(startDateString, endDateString)
        setIsTimePicker2Open(!isTimePicker2Open)
      } catch (error) {
        console.error('Invalid date format:', error)
      }
    } else {
      console.warn('No date selected.')
    }
  }

  return (
    <div className="w-full items-center pt-[20px]">
      <div className="flex justify-center gap-2">
        <div className="space-y-2.5 w-full text-center">
          <div>
            <button
              className="text-[#1e1e1e] text-base font-normal"
              onClick={handleCalendarOpen}
            >
              {formattedStringDates[0] ? (
                <div className="flex space-x-1">
                  <div>{formattedStringDates[0]}</div>
                  <div>{startTime}</div>
                </div>
              ) : (
                '--월 --일 --:--'
              )}
            </button>
          </div>
          <div>
            <button
              className="text-[#1e1e1e] text-base font-normal"
              onClick={handleTimePicker2Open}
            >
              {isFinTime && formattedStringDates[0] ? (
                <div className="flex space-x-1">
                  <div>{formattedStringDates[0]}</div>
                  <div>{finTime}</div>
                </div>
              ) : (
                '--월 --일 --:--'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 첫번째 달력 모달 */}
      <CustomModal
        open={isCalendarOpen}
        onOpenChange={handleCalendarOpen}
        onNext={handleTimePickerOpen}
        isFooter={true}
        footerText={'다음으로'}
      >
        <CustomCalendar
          initialMode="single"
          selected={selectedDates}
          onSelect={handleSelect}
        />
      </CustomModal>

      <CustomModal
        open={isCalendarOpen}
        onOpenChange={handleCalendarOpen}
        onNext={handleTimePickerOpen}
        isFooter={true}
        footerText={'다음으로'}
      >
        <CustomCalendar
          initialMode="single"
          selected={selectedDates}
          onSelect={handleSelect}
        />
      </CustomModal>

      <CustomModal
        open={isTimePickerOpen}
        onOpenChange={handleTimePickerOpen}
        onNext={handleTimePickerOpen}
        isFooter={true}
        footerText={'다음으로'}
        contentPadding={false}
      >
        <WheelTimePicker
          value={startTime} // 현재 시간 전달
          onChange={handleTimeChange} // 시간 변경 핸들러 전달
          className="w-full max-w-xs"
        />
      </CustomModal>

      <CustomModal
        open={isTimePicker2Open}
        onOpenChange={handleTimePicker2Open}
        onNext={handleConfirm} // 두번째 날짜/시간까지 입력했다면 컨펌
        isFooter={true}
        footerText={'다음으로'}
        contentPadding={false}
      >
        <WheelTimePicker
          value={finTime} // 현재 시간 전달
          onChange={handleTimeChange} // 시간 변경 핸들러 전달
          className="w-full max-w-xs"
        />
      </CustomModal>
    </div>
  )
}
