import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSmall } from '../Profiles/ProfileSmall'
import React, { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'
import EditTitle from '@/components/Header/EditTitle'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { useDateTimeStore } from '@/store/dateTimeStore'
import { useRouter } from 'next/navigation'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'

export interface LetsmeetCardProps {
  id: number
  startDate: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: { id: number; name: string; image: string }[]
}

export function LetsmeetCard({
  startTime,
  endTime,
  location,
  participants,
}: LetsmeetCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct

  const { selectedDates, stringDates, handleSelect, mode, selected } =
    useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [startDate, setStartDate] = useState<string>('') // 직접입력하기-시작날짜,시간
  const [endDate, setEndDate] = useState<string | null>(null) // 직접입력하기-끝날짜,시간

  const resetDateTime = useDateTimeStore((state) => state.resetDateTime)
  const router = useRouter()

  //참가자
  // membersVariant 모달 핸들
  const handleMembersModalOpen = () => {
    setIsMembersModalOpen(!isMembersModalOpen)
  }

  // 선택된 멤버의 id값 전달을 위한 상태추적
  const [selectedMember, setSelectedMember] = useState(participants)

  // 실제 삭제 api 여기에 연동
  const handleRemoveMember = (id: number) => {
    setSelectedMember((prev) => prev.filter((member) => member.id !== id))
  }

  //제목
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  //일정 정하기 모달
  const handleOpenScheduleModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleOpenCdialog = () => {
    if (isCdialogOpen) {
      handleSelect(undefined)
    }
    setIsCdialogOpen(!isCdialogOpen)
  }

  const handleOpenDdialg = async () => {
    if (isDdialogOpen) {
      resetDateTime()
    }
    setIsDdialogOpen(!isDdialogOpen)
  }

  const handleDateChange = (startDateState: string, endDate: string) => {
    setStartDate(startDateState)
    setEndDate(endDate)
  }

  const handlePostSchedule = () => {
    console.log('선택날짜', stringDates)
    console.log('mode', mode)
    console.log('selected', selected)

    router.push('/schedule/select')
  }

  const handlePostDirectSchedule = async () => {
    console.log('startDate', startDate)
    console.log('endDate', endDate)

    try {
      // 그룹 생성
      const response1 = await fetch('https://api.moim.team/api/members', {
        method: 'POST',
        credentials: 'include', // 쿠키 전송을 위해 필요
      })

      if (!response1.ok) {
        throw new Error(`서버 에러: ${response1.status}`)
      }

      const data1 = await response1.json()
      console.log('그룹 ID:', data1)
      const groupId = data1.data.groupId // 그룹 ID 저장

      // 스케줄 생성 - 첫 번째 요청이 끝난 후 실행
      const response2 = await fetch('https://api.moim.team/api/schedule', {
        method: 'POST',
        credentials: 'include', // 쿠키 전송을 위해 필요
        headers: {
          'Content-Type': 'application/json', // JSON 형식 명시
        },
        body: JSON.stringify({
          groupId: groupId, // 첫 번째 요청에서 받은 그룹 ID 사용
          name: title,
          startDate: startDate,
          endDate: endDate,
        }),
      })

      if (!response2.ok) {
        throw new Error(`서버 에러: ${response2.status}`)
      }

      const data2 = await response2.json()
      console.log('직접 생성 성공', data2)
    } catch (error) {
      console.error('API 요청 실패', error)
    }

    setIsDdialogOpen(false)
    setIsOpen(false)
    resetDateTime()
    router.push('/schedule')
  }

  return (
    <div className="px-4 mb-5">
      <div className="text-[#1e1e1e] text-xs font-medium leading-[17px] ml-[12px]">
        {startDate}
      </div>
      <div
        className="group w-full h-full rounded-3xl border-2 border-[#9562fa] px-6 py-[18px] cursor-pointer bg-white border-[#9562fa] hover:bg-[#9562fa] hover:text-[#fff]"
        onClick={handleMembersModalOpen}
      >
        <div className="flex flex-col">
          {/* 내용 정렬 */}
          <div className="flex justify-between">
            {/* 일정 제목 */}
            <div className="flex flex-col justify-between gap-4">
              <span className="text-xl font-medium leading-[17px] text-[#8e8d8d] group-hover:text-[#fff] ml-[5px]s">
                {title}
              </span>
              {/* 모임원 프로필 */}
              <ProfileSmall profiles={participants} />
            </div>

            {/* 약속 장소 */}
            <div className="flex flex-col justify-center items-end gap-3">
              <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff]">
                {location}
              </span>
              {(!startTime || !endTime) && (
                <WhiteButton
                  text="일정 정하기"
                  className={
                    'border-[#9562fa] text-[#9562fa] group-hover:border-white group-hover:text-white'
                  }
                  onClick={handleOpenScheduleModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MembersVariant 모달 */}
      <CustomModal
        open={isMembersModalOpen}
        onOpenChange={handleMembersModalOpen}
        isFooter={false}
      >
        <MembersVariant
          onClickX={handleRemoveMember}
          startDate={startDate}
          location={location}
          startTime={startTime}
          endTime={endTime}
          members={selectedMember}
        />
      </CustomModal>
      <ScheduleOptions
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        optionStringUp="일정 조율하기"
        optionStringDown="직접 입력하기"
        onClickUp={handleOpenCdialog}
        onClickDown={handleOpenDdialg}
      />

      {/* 일정 조율하기 모달 */}
      <CustomModal
        open={isCdialogOpen}
        onOpenChange={handleOpenCdialog}
        onNext={handlePostSchedule}
        isFooter={true}
        footerText={'다음으로'}
        isDisabled={stringDates[0] ? false : true}
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
        onNext={handlePostDirectSchedule}
        isFooter={true}
        footerText={'입력완료'}
      >
        <EditTitle initialTitle={title} onTitleChange={handleTitleChange} />
        <DateTimeModal onDateChange={handleDateChange} />
      </CustomModal>
    </div>
  )
}
