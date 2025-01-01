import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSelected } from '../Profiles/ProfileSelected'
import React, { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'

export interface ScheduleCardProps {
  date: string
  title: string
  startTime?: string
  endTime?: string
  location?: string
  participants: { id: number; name: string; image: string }[]
}

export function ScheduleCard({
  date,
  title,
  startTime,
  endTime,
  location,
  participants,
}: ScheduleCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)

  const handleOpenDialog = () => {
    setIsDialogOpen(!isDialogOpen)
  }

  const handleOpenSelectModal = (e: React.MouseEvent) => {
    e.stopPropagation() // 이벤트 버블링 방지
    setIsSelectModalOpen(true)
  }

  const handleCloseSelectModal = () => {
    setIsSelectModalOpen(false)
  }

  return (
    <div className="px-4 mb-5">
      <div className="text-[#1e1e1e] text-xs font-medium leading-[17px] ml-[12px]">
        {date}
      </div>
      <div
        className="group w-full h-[114px] max-w-full rounded-3xl border-2 border-[#9562fa] px-6 py-[18px] cursor-pointer bg-white border-[#9562fa] hover:bg-[#9562fa] hover:text-[#fff]"
        onClick={handleOpenDialog}
      >
        <div className="flex flex-col gap-4">
          {/* 내용 정렬 */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-4">
              {/* 일정 제목 */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium leading-[17px] text-[#8e8d8d] group-hover:text-[#fff]">
                  {title}
                </span>
              </div>

              {/* 모임원 프로필 */}
              <ProfileSelected profiles={participants} />
            </div>

            {/* 약속 시간, 장소 */}
            <div className="flex flex-col items-end gap-2 py-[4px]">
              <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff]">
                {startTime} - {endTime}
              </span>
              {location ? (
                <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff]">
                  {location}
                </span>
              ) : (
                <WhiteButton
                  text="장소 정하기"
                  className={
                    'border-[#9562fa] text-[#9562fa] group-hover:border-white group-hover:text-white'
                  }
                  onClick={handleOpenSelectModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* MembersVariant 모달 */}
      <CustomModal
        open={isDialogOpen}
        onOpenChange={handleOpenDialog}
        isFooter={false}
        isUserPlus={true}
        onPlus={() => alert('친구추가')}
      >
        <MembersVariant
          onRemove={() => alert('정말로 삭제')}
          date={date}
          location={location}
          startTime={startTime}
          endTime={endTime}
          members={participants}
        />
      </CustomModal>

      {/* SelectModal 모달 */}
      <CustomModal
        open={isSelectModalOpen}
        onOpenChange={handleCloseSelectModal}
        isFooter={false}
        isUserPlus={false}
      >
        <div>장소 선택 모달 내용 ~~</div>
      </CustomModal>
    </div>
  )
}
