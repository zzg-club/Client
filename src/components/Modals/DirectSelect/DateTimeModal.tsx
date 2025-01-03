'use client'

import { useState } from 'react'
import WheelTimePicker from '@/components/Pickers/WheelTimePicker'
import CustomModal from '../CustomModal'

export default function DateTimeModal() {
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false)
  //const [startTime, setStartTime] = useState<String>('--:--')

  const handleTimePickerOpen = () => {
    setIsTimePickerOpen(!isTimePickerOpen)
  }
  return (
    <div className="w-full items-center">
      <div className="flex justify-center gap-2">
        <button className="text-[#1e1e1e] text-base font-normal">
          --월 --일
        </button>
        <button
          className="text-[#1e1e1e] text-base font-normal"
          onClick={handleTimePickerOpen}
        >
          --:--
        </button>
      </div>

      <CustomModal
        open={isTimePickerOpen}
        onOpenChange={handleTimePickerOpen}
        onNext={() => alert('다음으로')}
        isFooter={true}
        footerText={'다음으로'}
      >
        <WheelTimePicker
          value="08:00 PM"
          onChange={(time) => console.log('Selected time:', time)}
          className="w-full max-w-xs"
        />
      </CustomModal>
    </div>
  )
}
