import React, { useState } from 'react'
import { ProfileSelected } from '../Profiles/ProfileSelected'
import CustomModal from '@/components/Modals/CustomModal'
import MembersDefault from '@/components/Modals/MembersDefault'

export interface ScheduleItemProps {
  number: number
  title: string
  startDate: string
  startTime: string
  endTime: string
  participants: { id: number; name: string; image: string }[]
}

export function ScheduleItem({
  number,
  title,
  startDate,
  startTime,
  endTime,
  participants,
}: ScheduleItemProps) {
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)

  const handleMembersModalOpen = () => {
    setIsMembersModalOpen(!isMembersModalOpen)
    console.log('zmfflr')
  }

  return (
    <div className="flex items-center justify-between py-9 h-full">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-medium text-[#9562fa]">{number}</span>
        <span className="text-lg font-normal text-black">
          {startDate} &nbsp;
          {startTime} - {endTime}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ProfileSelected
          profiles={participants}
          onClickMore={handleMembersModalOpen}
        />
      </div>
      <CustomModal
        open={isMembersModalOpen}
        onOpenChange={handleMembersModalOpen}
        isFooter={false}
      >
        <MembersDefault
          title={title}
          memberCount={participants.length}
          members={participants}
        />
      </CustomModal>
    </div>
  )
}
