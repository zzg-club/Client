'use client'

import { useEffect, useState } from 'react'
import WheelTimePicker from '@/components/Pickers/WheelTimePicker'
import CustomModal from '../CustomModal'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { useDateTimeStore } from '@/store/dateTimeStore'

interface DateTimeModalProps {
  onDateChange: (startDate: string, endDate: string) => void
}

export default function DateTimeModal({ onDateChange }: DateTimeModalProps) {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    adjustEndDateTime,
  } = useDateTimeStore()

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false)
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false)

  useEffect(() => {
    adjustEndDateTime()
  }, [startDate, startTime, endDate, endTime])

  useEffect(() => {
    if (startDate && endDate) {
      const startDateString = `${format(startDate, 'yyyy-MM-dd')}T${formatTime(startTime)}:00.000Z`
      const endDateString = `${format(endDate, 'yyyy-MM-dd')}T${formatTime(endTime)}:00.000Z`
      onDateChange(startDateString, endDateString)
    }
  }, [startDate, endDate, startTime, endTime, onDateChange])

  const handleCalendarOpen = () => setIsCalendarOpen(!isCalendarOpen)
  const handleTimePickerOpen = () => {
    setIsCalendarOpen(false)
    setIsTimePickerOpen(!isTimePickerOpen)
  }

  const handleStartDateSelect = (
    selection: Date | DateRange | Date[] | undefined,
  ) => {
    if (selection instanceof Date) {
      setStartDate(selection)
    } else if (Array.isArray(selection) && selection.length > 0) {
      setStartDate(selection[0])
    } else if (selection && 'from' in selection && selection.from) {
      setStartDate(selection.from)
    }
  }

  const handleEndDateSelect = (
    selection: Date | DateRange | Date[] | undefined,
  ) => {
    if (selection instanceof Date) {
      setEndDate(selection)
    } else if (Array.isArray(selection) && selection.length > 0) {
      setEndDate(selection[0])
    } else if (selection && 'from' in selection && selection.from) {
      setEndDate(selection.from)
    }
  }

  const formatDateDisplay = (date: Date | undefined) => {
    return date ? format(date, 'MM월 dd일') : '--월 --일'
  }

  const formatTime = (time: string) => {
    const [hour, minutePart] = time.split(':')
    const [minute, period] = minutePart.split(' ')
    let hourNumber = parseInt(hour, 10)
    if (period === 'PM' && hourNumber !== 12) hourNumber += 12
    if (period === 'AM' && hourNumber === 12) hourNumber = 0
    return `${String(hourNumber).padStart(2, '0')}:${minute}`
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
              {startDate ? (
                <div className="flex space-x-1 justify-center">
                  <div>{formatDateDisplay(startDate)}</div>
                  <div>{startTime}</div>
                </div>
              ) : (
                '--월 --일 --:--'
              )}
            </button>
          </div>
          <div>
            <button className="text-[#1e1e1e] text-base font-normal">
              {endDate ? (
                <div className="flex space-x-1 justify-center">
                  <div onClick={() => setIsEndDatePickerOpen(true)}>
                    {formatDateDisplay(endDate)}
                  </div>
                  <div onClick={() => setIsEndTimePickerOpen(true)}>
                    {endTime}
                  </div>
                </div>
              ) : (
                '--월 --일 --:--'
              )}
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
          selected={startDate}
          onSelect={handleStartDateSelect}
        />
      </CustomModal>

      <CustomModal
        open={isTimePickerOpen}
        onOpenChange={() => setIsTimePickerOpen(false)}
        onNext={() => setIsTimePickerOpen(false)}
        isFooter={true}
        footerText={'다음으로'}
        contentPadding={false}
      >
        <WheelTimePicker
          value={startTime}
          onChange={setStartTime}
          className="w-full max-w-xs"
        />
      </CustomModal>

      <CustomModal
        open={isEndDatePickerOpen}
        onOpenChange={() => setIsEndDatePickerOpen(false)}
        onNext={() => setIsEndDatePickerOpen(false)}
        isFooter={true}
        footerText={'다음으로'}
      >
        <CustomCalendar
          initialMode="single"
          selected={endDate}
          onSelect={handleEndDateSelect}
        />
      </CustomModal>

      <CustomModal
        open={isEndTimePickerOpen}
        onOpenChange={() => setIsEndTimePickerOpen(false)}
        onNext={() => setIsEndTimePickerOpen(false)}
        isFooter={true}
        footerText={'다음으로'}
        contentPadding={false}
      >
        <WheelTimePicker
          value={endTime}
          onChange={setEndTime}
          className="w-full max-w-xs"
        />
      </CustomModal>
    </div>
  )
}
