import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSmall } from '../Profiles/ProfileSmall'
import React, { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'
import DirectEditTitle from '@/components/Header/DirectEditTitle'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { useGroupStore } from '@/store/groupStore'
import { useLocationIdStore } from '@/store/locationIdStore'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { useDateTimeStore } from '@/store/dateTimeStore'
import { useRouter } from 'next/navigation'
import SelectModal from '../Modals/SelectModal'

export type Participant = {
  id: number
  name: string
  image: string
  type: string
  locationComplete: string
}

export interface LetsmeetCardProps {
  id: number
  startDate: string
  endDate?: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: Participant[]
  surveyId?: number
  locationId: number
  getSchedule: () => void
  onRemoveMember: (userId: number, type: string) => void
}

export function LetsmeetCard({
  id,
  startDate,
  endDate,
  startTime,
  endTime,
  title,
  location,
  participants,
  locationId,
  onRemoveMember,
}: LetsmeetCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [directTitle, setDirectTitle] = useState('제목 없는 일정') // 제목 상태 관리

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct

  const { selectedDates, stringDates, handleSelect, mode, selected } =
    useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [directStartDate, setDirectStartDate] = useState<string>('') // 직접입력하기-시작날짜,시간
  const [directEndDate, setDirectEndDate] = useState<string | null>(null) // 직접입력하기-끝날짜,시간

  const resetDateTime = useDateTimeStore((state) => state.resetDateTime)
  const router = useRouter()
  const { setSelectedGroupId } = useGroupStore()
  const { setSelectedLocationId } = useLocationIdStore()
  const [selectedLocation] = useState(
    location === '미확정' ? '장소 선정 중' : location,
  )

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const myCompleteIndex = participants.findIndex(
    (p) => p.type === '&my' || p.type === 'creator&my',
  )

  const dateText =
    startDate === '' && endDate === ''
      ? '날짜 미정'
      : endDate === ''
        ? startDate
        : `${startDate} - ${endDate}`

  // membersVariant 모달 핸들
  const handleMembersModalOpen = () => {
    setSelectedGroupId(id)
    setIsMembersModalOpen(!isMembersModalOpen)
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
          credentials: 'include',
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

  const buttonText =
    myCompleteIndex !== -1 &&
    participants[myCompleteIndex]?.locationComplete === 'COMPLETED'
      ? participants[myCompleteIndex]?.type === 'creator&my'
        ? '+ 장소 확정하기'
        : '내 장소 수정'
      : selectedLocation === '장소 선정 중'
        ? '+ 출발지 수정'
        : '+ 일정 정하기'

  const handleOpenScheduleModal = (e: React.MouseEvent) => {
    e.stopPropagation()

    //console.log('클릭된 그룹 ID:', id)
    //console.log('클릭된 로케이션 ID:', locationId)

    const finalLocationId =
      locationId !== -1
        ? locationId
        : useLocationIdStore.getState().selectedLocationId

    if (finalLocationId === -1 || finalLocationId === undefined) {
      console.error(
        '오류: 유효하지 않은 locationId입니다. 장소를 다시 추가하세요.',
      )
      return // locationId가 없으면 함수 실행을 멈춤
    }

    setSelectedLocationId(locationId)
    setSelectedGroupId(id)

    if (buttonText === '+ 출발지 수정') {
      // 모임장이면 중간 지점 찾기 페이지로 이동
      if (participants.some((p) => p.type === 'creator&my')) {
        router.push('/letsmeet/middle')
      } else {
        router.push('/search?from=/letsmeet')
      }
    } else if (buttonText === '+ 장소 확정하기') {
      router.push('/letsmeet/middle')
    } else if (selectedLocation === '장소 선정 중') {
      router.push('/search?from=/letsmeet')
    } else {
      setIsOpen(true)
    }
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
    setDirectStartDate(startDateState)
    setDirectEndDate(endDate)
    console.log(directStartDate, directEndDate)
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
        {dateText}
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
              <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff] cursor-pointer">
                {selectedLocation}
              </span>

              {(!startTime || !endTime) && (
                <WhiteButton
                  text={buttonText}
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
          onClickX={(userId: number, type: string) =>
            onRemoveMember(userId, type)
          }
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
        onOpenChange={handleOpenDdialog}
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
