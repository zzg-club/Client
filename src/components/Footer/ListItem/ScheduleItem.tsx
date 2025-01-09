import React, { useState } from 'react'
import { X } from 'lucide-react'
import SelectModal from '@/components/Modals/SelectModal'

export interface ScheduleItemProps {
  number: number
  // title: string
  startDate: string
  startTime: string
  endTime: string
  // participants: { id: number; name: string; image: string }[]
}

export function ScheduleItem({
  number,
  // title,
  startDate,
  startTime,
  endTime,
  // participants,
}: ScheduleItemProps) {
  const [isSelectDeleteOpen, setIsSelectDeleteOpen] = useState(false)

  const handleSelectDelete = () => {
    setIsSelectDeleteOpen(!isSelectDeleteOpen)
    console.log('zmfflr')
  }

  return (
    <div className="flex items-center justify-between py-9 h-full">
      <div className="flex items-center gap-2">
        <span className="text-[20px] font-medium text-[#9562fa]">{number}</span>
        <span className="text-[16px] font-normal text-black">
          {startDate} &nbsp;
          {startTime} - {endTime}
        </span>
      </div>
      <button>
        <X onClick={handleSelectDelete} />
      </button>
      <SelectModal
        open={isSelectDeleteOpen}
        onOpenChange={handleSelectDelete}
        leftText={'예'}
        rightText={'아니오'}
        onClickLeft={() => alert('삭제')}
        onClickRight={handleSelectDelete}
      >
        <div className="flex item-center justify-center text-[#1e1e1e] text-xl font-medium leading-snug py-4 mt-3">
          정말로 일정을
          <br />
          삭제할까요?
        </div>
      </SelectModal>
    </div>
  )
}
