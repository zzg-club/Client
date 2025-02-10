import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSmall } from '../Profiles/ProfileSmall'
import React, { useState, useEffect } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'
import SelectModal from '../Modals/SelectModal'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'
import EditTitle from '@/components/Header/EditTitle'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import mockSchedules from '@/data/dummyDataArray.json'

interface Participant {
  id: number
  name: string
  time: string
  image: string
  lat: number
  lng: number
  transport: string
  transportIcon: string
  depart: string
}

export interface LetsmeetCardProps {
  title: string
  startDate: string
  startTime: string
  endTime: string
  destination: string
  participants: {
    id: number
    name: string
    time: string
    image: string
    lat: number
    lng: number
    transport: string
    transportIcon: string
    depart: string
  }[]
}

export function LetsmeetCard({
  title,
  startDate,
  startTime,
  endTime,
  destination,
  participants,
}: LetsmeetCardProps) {
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isSelectedPlace, setIsSelectedPlace] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct
  const { selectedDates, stringDates, handleSelect } = useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [startDateState, setStartDateState] = useState<string | null>(null) // 직접입력하기-시작날짜,시간
  const [endDateState, setEndDateState] = useState<string | null>(null) // 직접입력하기-끝날짜,시간
  const [stitle, setsTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const [currentIndex, setCurrentIndex] = useState(0)
  const [participantState, setParticipantState] = useState<Participant[]>([])

  const handleTitleChange = (newTitle: string) => {
    setsTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const handleOpenCdialog = () => {
    setIsCdialogOpen(!isCdialogOpen)
  }
  const handleOpenDdialog = () => {
    setIsDdialogOpen(!isDdialogOpen)
  }

  // 직접입력하기 모달에서 받아온 시작, 끝 string 저장
  const handleDateChange = (startDate: string, endDate: string) => {
    setStartDateState(startDate)
    setEndDateState(endDate)
  }

  // membersVariant 모달 핸들
  const handleMembersModalOpen = () => {
    setIsMembersModalOpen(!isMembersModalOpen)
  }

  // 장소 선정하기 버튼 모달 open 핸들
  const handleOpenSelectedPlace = (e: React.MouseEvent) => {
    e.stopPropagation() // 이벤트 버블링 방지
    setIsSelectedPlace(true)
    console.log('dkdkdk')
  }

  // 장소 선정하기 버튼 모달 close 핸들
  const handleCloseSelectedPlace = () => {
    setIsSelectedPlace(false)
  }

  // 선택된 멤버의 id값 전달을 위한 상태추적
  const [selectedMember, setSelectedMember] = useState(participantState)

  // 실제 삭제 api 여기에 연동
  const handleRemoveMember = (id: number) => {
    setSelectedMember((prev) => prev.filter((member) => member.id !== id))
  }

  useEffect(() => {
    const updateParticipants = async () => {
      try {
        const location = await getCurrentLocation()
        const myInfo = {
          id: 0,
          name: '내 위치',
          time: '50분',
          image: '/sampleProfile.png',
          lat: location.lat,
          lng: location.lng,
          transport: 'subway',
          transportIcon: '/subwayPurple.svg',
          depart: '죽전역',
        }

        // participants Prop 기반으로 업데이트
        const updatedParticipants = [
          myInfo,
          ...participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayYellow.svg',
          })),
        ]

        setParticipantState(updatedParticipants)
      } catch (error) {
        console.error('현재 위치를 가져오지 못했습니다:', error)

        const fallbackInfo = {
          id: 0,
          name: '기본 위치',
          time: '기본 시간',
          image: '/sampleProfile.png',
          lat: 37.5665,
          lng: 126.978,
          transport: 'subway',
          transportIcon: '/subwayPurple.svg',
          depart: '서울역',
        }

        const updatedParticipants = [
          fallbackInfo,
          ...participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayYellow.svg',
          })),
        ]

        setParticipantState(updatedParticipants)
      }
    }

    updateParticipants()
  }, [participants])

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
              <ProfileSmall profiles={participantState} />
            </div>

            {/* 약속 장소 */}
            <div className="flex flex-col justify-center items-end gap-3">
              <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff]">
                {destination}
              </span>
              {(!startTime || !endTime) && (
                <WhiteButton
                  text="일정 정하기"
                  className={
                    'border-[#9562fa] text-[#9562fa] group-hover:border-white group-hover:text-white'
                  }
                  onClick={handleOpenSelectedPlace}
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
          destination={destination}
          startTime={startTime}
          endTime={endTime}
          members={selectedMember}
        />
      </CustomModal>

      {/* SelectModal 모달 - 장소 선정 */}
      <SelectModal
        open={isSelectedPlace}
        onOpenChange={handleCloseSelectedPlace}
        leftText={'직접 입력'}
        rightText={'선정하기'}
        onClickLeft={handleOpenDdialog}
        onClickRight={handleOpenCdialog}
      >
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
        onNext={() => alert(`선택한 날짜들: ${stringDates}`)}
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
        onNext={() =>
          alert(`startDate: ${startDate} / endDate: ${endDateState}`)
        }
        isFooter={true}
        footerText={'입력완료'}
      >
        <EditTitle initialTitle={title} onTitleChange={handleTitleChange} />
        <DateTimeModal onDateChange={handleDateChange} />
      </CustomModal>
    </div>
  )
}
