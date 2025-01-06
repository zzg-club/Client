'use client'

import { useState } from 'react'
import WheelTimePicker from '@/components/Pickers/WheelTimePicker'
import CustomModal from '../CustomModal'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { format } from 'date-fns'

export default function DateTimeModal() {
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const { selectedDates, stringDates, handleSelect } = useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [selectedTime, setSelectedTime] = useState('08:00 PM')

  const formattedStringDates = stringDates.map((date) => {
    const dateObject = new Date(date)
    return format(dateObject, 'MM월 dd일')
  })

  const handleTimeChange = (time: string) => {
    setSelectedTime(time) // WheelTimePicker에서 전달받은 시간 설정
  }

  const handleTimePickerOpen = () => {
    setIsCalendarOpen(false)
    setIsTimePickerOpen(!isTimePickerOpen)
  }
  const handleCalendarOpen = () => {
    setIsCalendarOpen(!isCalendarOpen)
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
                  <div>{selectedTime}</div>
                </div>
              ) : (
                '--월 --일 --:--'
              )}
            </button>
          </div>
          <div>
            <button className="text-[#1e1e1e] text-base font-normal">
              --월 --일 --:--
            </button>
          </div>
        </div>
      </div>

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
          value={selectedTime} // 현재 시간 전달
          onChange={handleTimeChange} // 시간 변경 핸들러 전달
          className="w-full max-w-xs"
        />
      </CustomModal>
    </div>
  )
}
