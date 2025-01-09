import React, { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import { X } from 'lucide-react'

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
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)

  const handleMembersModalOpen = () => {
    setIsMembersModalOpen(!isMembersModalOpen)
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
      <div className="flex items-center gap-2">
        {/* <ProfileSmall
          profiles={participants}
          onClickMore={handleMembersModalOpen}
        /> */}
        {/* </div>
      <div> */}
        <X></X>
      </div>
      <CustomModal
        open={isMembersModalOpen}
        onOpenChange={handleMembersModalOpen}
        isFooter={false}
      >
        <div>삭제모달</div>
      </CustomModal>
    </div>
  )
}
