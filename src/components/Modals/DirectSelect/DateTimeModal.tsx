'use client'

import { useState, useEffect } from 'react'
import WheelTimePicker from '@/components/Pickers/WheelTimePicker'
import CustomModal from '../CustomModal'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { format, addHours, addDays, parse, isAfter } from 'date-fns'
import { DateRange } from 'react-day-picker'

interface DateTimeModalProps {
  onDateChange: (startDate: string, endDate: string) => void
}

export default function DateTimeModal({ onDateChange }: DateTimeModalProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false)
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState<boolean>(false)
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [startTime, setStartTime] = useState('08:00 PM')
  const [endTime, setEndTime] = useState('09:00 PM')

  useEffect(() => {
    if (dateRange?.from) {
      setDateRange({ from: dateRange.from, to: dateRange.from })
      setEndTime(calculateNextHour(startTime))
    }
  }, [dateRange?.from, startTime])

  // endTime 변경시마다 adjustEndDate 호출 (endDate 변경을 위해)
  useEffect(() => {
    adjustEndDate()
  }, [endTime])

  // startTime 설정 시 endTime은 +1시간 뒤로 설정하기 위한 함수
  const calculateNextHour = (time: string) => {
    const [hour, minutePart] = time.split(':')
    const [minute, period] = minutePart.split(' ')
    let hourNumber = parseInt(hour, 10)
    if (period === 'PM' && hourNumber !== 12) hourNumber += 12
    if (period === 'AM' && hourNumber === 12) hourNumber = 0

    const date = new Date(2000, 0, 1, hourNumber, parseInt(minute, 10))
    const nextHour = addHours(date, 1)
    return format(nextHour, 'hh:mm a')
  }

  // endTime이 하루를 기준으로 startTime보다 앞일 경우 to날짜를 from날짜 하루 뒤로 설정
  const adjustEndDate = () => {
    if (dateRange?.from && dateRange?.to) {
      const startDateTime = parse(startTime, 'hh:mm a', dateRange.from)
      const endDateTime = parse(endTime, 'hh:mm a', dateRange.to)

      if (!isAfter(endDateTime, startDateTime)) {
        setDateRange((prev) => ({
          from: prev?.from,
          to: addDays(prev?.to || prev?.from || new Date(), 1),
        }))
      }
    }
  }

  const handleCalendarOpen = () => {
    setIsCalendarOpen(!isCalendarOpen)
  }

  const handleTimePickerOpen = () => {
    setIsCalendarOpen(false)
    setIsTimePickerOpen(!isTimePickerOpen)
  }

  // 시작 날짜 선택 시 handle 함수 - from날짜 = to날짜로 설정
  const handleStartDateSelect = (
    selection: Date | DateRange | Date[] | undefined,
  ) => {
    if (selection instanceof Date) {
      setDateRange({ from: selection, to: selection })
    } else if (Array.isArray(selection) && selection.length > 0) {
      setDateRange({ from: selection[0], to: selection[0] })
    } else if (selection && 'from' in selection && selection.from) {
      setDateRange({ from: selection.from, to: selection.from })
    }
  }

  // 종료 날짜 선택 시 handle 함수 - from날짜: 기존 / to날짜: 선택한 날짜로 변경
  const handleEndDateSelect = (
    selection: Date | DateRange | Date[] | undefined,
  ) => {
    if (selection instanceof Date) {
      setDateRange((prev) => ({ from: prev?.from || selection, to: selection }))
    } else if (Array.isArray(selection) && selection.length > 0) {
      setDateRange((prev) => ({
        from: prev?.from || selection[0],
        to: selection[0],
      }))
    } else if (selection && 'from' in selection && selection.from) {
      setDateRange((prev) => ({
        from: prev?.from || selection.from,
        to: selection.from,
      }))
    }
  }

  const handleStartTimeChange = (time: string) => {
    setStartTime(time)
    setEndTime(calculateNextHour(time))
  }

  const handleEndTimeChange = (time: string) => {
    setEndTime(time)
  }

  // Date type의 날짜 객체를 MM월 dd일 형식으로 반환
  const formatDateDisplay = (date: Date | undefined) => {
    return date ? format(date, 'MM월 dd일') : '--월 --일'
  }

  // 종료 시간
  const handleConfirm = () => {
    setIsEndTimePickerOpen(false)
    if (dateRange?.from && dateRange?.to) {
      const startDateString = `${format(dateRange.from, 'yyyy-MM-dd')}T${formatTime(startTime)}:00.000Z`
      const endDateString = `${format(dateRange.to, 'yyyy-MM-dd')}T${formatTime(endTime)}:00.000Z`
      onDateChange(startDateString, endDateString)
    } else {
      console.warn('Start or end date not selected.')
    }
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
              {dateRange?.from ? (
                <div className="flex space-x-1 justify-center">
                  <div>{formatDateDisplay(dateRange.from)}</div>
                  <div>{startTime}</div>
                </div>
              ) : (
                '--월 --일 --:--'
              )}
            </button>
          </div>
          <div>
            <button className="text-[#1e1e1e] text-base font-normal">
              {dateRange?.to ? (
                <div className="flex space-x-1 justify-center">
                  <div onClick={() => setIsEndDatePickerOpen(true)}>
                    {formatDateDisplay(dateRange.to)}
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

      {/* 시작 날짜 입력 모달 */}
      <CustomModal
        open={isCalendarOpen}
        onOpenChange={handleCalendarOpen}
        onNext={handleTimePickerOpen}
        isFooter={true}
        footerText={'다음으로'}
      >
        <CustomCalendar
          initialMode="single"
          selected={dateRange?.from}
          onSelect={handleStartDateSelect}
        />
      </CustomModal>

      {/* 시작 시간 입력 모달 */}
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
          onChange={handleStartTimeChange}
          className="w-full max-w-xs"
        />
      </CustomModal>

      {/* 종료 날짜 입력 모달 */}
      <CustomModal
        open={isEndDatePickerOpen}
        onOpenChange={() => setIsEndDatePickerOpen(false)}
        onNext={() => setIsEndDatePickerOpen(false)}
        isFooter={true}
        footerText={'다음으로'}
      >
        <CustomCalendar
          initialMode="single"
          selected={dateRange?.to}
          onSelect={handleEndDateSelect}
        />
      </CustomModal>

      {/* 종료 시간 입력 모달 */}
      <CustomModal
        open={isEndTimePickerOpen}
        onOpenChange={() => setIsEndTimePickerOpen(false)}
        onNext={handleConfirm}
        isFooter={true}
        footerText={'다음으로'}
        contentPadding={false}
      >
        <WheelTimePicker
          value={endTime}
          onChange={handleEndTimeChange}
          className="w-full max-w-xs"
        />
      </CustomModal>
    </div>
  )
}
