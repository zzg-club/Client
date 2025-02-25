import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSmall } from '../Profiles/ProfileSmall'
import React, { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'
import DirectEditTitle from '@/components/Header/DirectEditTitle'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { useDateTimeStore } from '@/store/dateTimeStore'
import { useRouter } from 'next/navigation'
import SelectModal from '../Modals/SelectModal'

export type Participant = {
  id: number
  name: string
  image: string
  type: string
}

export interface LetsmeetCardProps {
  id: number
  startDate: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: Participant[]
  surveyId: number
  getSchedule: () => void
}

export function LetsmeetCard({
  id,
  startTime,
  endTime,
  title,
  location,
  participants,
}: LetsmeetCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [directTitle, setDirectTitle] = useState('제목 없는 일정') // 제목 상태 관리

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct

  const { selectedDates, stringDates, handleSelect, mode, selected } =
    useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [startDate, setStartDate] = useState<string>('') // 직접입력하기-시작날짜,시간
  const [endDate, setEndDate] = useState<string | null>(null) // 직접입력하기-끝날짜,시간

  const resetDateTime = useDateTimeStore((state) => state.resetDateTime)
  const router = useRouter()

  const [selectedLocation, setSelectedLocation] = useState(location || '')
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const handleLocationClick = () => {
    setIsEditingLocation(true)
  }

  const handleLocationBlur = () => {
    setIsEditingLocation(false)
  }

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingLocation(false)
    }
  }

  //참가자
  const handleMembersModalOpen = () => {
    setIsMembersModalOpen(!isMembersModalOpen)
  }

  // 선택된 멤버의 id값 전달을 위한 상태추적
  const [selectedMember, setSelectedMember] = useState(participants)

  // 실제 삭제 api 여기에 연동
  const handleRemoveMember = (id: number) => {
    setSelectedMember((prev) => prev.filter((member) => member.id !== id))
  }

  //제목 수정
  const handleTitleChange = async (newTitle: string) => {
    setDirectTitle(newTitle) // UI 업데이트

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/members?groupId=${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupName: newTitle,
            location: selectedLocation,
          }),
          credentials: 'include', // 인증 정보 포함
        },
      )

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`)
      }

      const data = await response.json()
      console.log('약속 이름 수정 성공:', data)
    } catch (error) {
      console.error('약속 이름 수정 실패:', error)
    }
  }

  const handleLocationChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newLocation = e.target.value
    setSelectedLocation(newLocation)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/members?groupId=${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupName: title,
            location: newLocation, // 입력된 장소 업데이트
          }),
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`)
      }

      const data = await response.json()
      console.log('장소 정보 수정 성공:', data)
    } catch (error) {
      console.error('장소 정보 수정 실패:', error)
    }
  }

  //일정 정하기 모달
  const handleOpenScheduleModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleCloseScheduleModal = () => {
    setIsOpen(false)
  }

  const handleOpenCdialog = () => {
    if (isCdialogOpen) {
      handleSelect(undefined)
    }
    setIsCdialogOpen(!isCdialogOpen)
  }

  const handleOpenDdialog = async () => {
    if (isDdialogOpen) {
      resetDateTime()
      setDirectTitle('제목 없는 일정')
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
      // 1. 약속(일정) 생성
      const response = await fetch(`${API_BASE_URL}/api/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: id,
          name: title,
          location: selectedLocation,
          startDate: startDate,
          endDate: endDate,
        }),
      })

      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`)
      }

      const create = await response.json()
      console.log('직접 생성 성공', create)
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
              {isEditingLocation ? (
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  onBlur={handleLocationBlur} // 입력창이 비활성화되면 변경 완료
                  onKeyDown={handleLocationKeyDown} // Enter 키를 누르면 변경 완료
                  autoFocus
                  className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff] bg-transparent border-b border-[#9562fa] focus:outline-none"
                />
              ) : (
                <span
                  className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff] cursor-pointer"
                  onClick={handleLocationClick}
                >
                  {selectedLocation}
                </span>
              )}
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
          members={participants}
        />
      </CustomModal>
      <SelectModal
        open={isOpen}
        onOpenChange={handleCloseScheduleModal}
        leftText={'직접 입력'}
        rightText={'선정하기'}
        onClickLeft={handleOpenDdialog}
        onClickRight={handleOpenCdialog}
      >
        {' '}
        <div className="flex item-center justify-center text-[#1e1e1e] text-xl font-medium leading-snug py-4 mt-3">
          일정을
          <br />
          조율할까요?
        </div>
      </SelectModal>
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
        <DirectEditTitle
          initialTitle={directTitle}
          onTitleChange={handleTitleChange}
        />
        <DateTimeModal onDateChange={handleDateChange} />
      </CustomModal>
    </div>
  )
}
