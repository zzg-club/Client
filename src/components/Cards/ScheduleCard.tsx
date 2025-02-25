import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSmall } from '../Profiles/ProfileSmall'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // useRouter 훅 사용
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'
import SelectModal from '../Modals/SelectModal'
import { useGroupStore } from '@/store/groupStore'
import { useSurveyStore } from '@/store/surveyStore'
import { useNotificationStore } from '@/store/notificationStore'
import axios from 'axios'
// import LocationModal from '@/components/Modals/DirectSelect/LocationModal'
import { useLocationStore } from '@/store/locationStore'
import Image from 'next/image'

export interface ScheduleCardProps {
  id: number
  startDate: string
  endDate?: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: {
    id: number
    name: string
    image: string
    type: string
    scheduleComplete: string
  }[]
  surveyId: number
  getSchedule: () => void
  fetchNotification: () => void
}

export function ScheduleCard({
  id,
  startDate,
  endDate,
  title,
  startTime,
  endTime,
  location,
  participants,
  surveyId,
  getSchedule,
  fetchNotification,
}: ScheduleCardProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isSelectedPlace, setIsSelectedPlace] = useState(false)
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
  const router = useRouter()

  const { setSelectedGroupId, selectedGroupId } = useGroupStore()
  const { setSelectedSurveyId } = useSurveyStore()
  const { selectedLocation } = useLocationStore()
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )

  const myCompleteIndex = participants.findIndex(
    (p) => p.type === '&my' || p.type === 'creator&my',
  )

  const dateText =
    startDate === '' && endDate === ''
      ? '날짜 미정'
      : endDate === ''
        ? startDate
        : `${startDate} - ${endDate}`

  const timeText =
    startTime === '' && endTime === ''
      ? '조율 진행중'
      : `${startTime} - ${endTime}`

  const buttonText =
    myCompleteIndex !== -1 &&
    participants[myCompleteIndex]?.scheduleComplete === 'COMPLETED'
      ? participants[myCompleteIndex]?.type === 'creator&my'
        ? '+ 일정 확정하기'
        : '내 일정 수정'
      : startTime === '' && endTime === ''
        ? '+ 이어서 하기'
        : '+ 장소 정하기'

  // membersVariant 모달 핸들
  const handleMembersModalOpen = () => {
    setSelectedGroupId(id)
    setIsMembersModalOpen(!isMembersModalOpen)
  }

  // 장소 선정하기 버튼 모달 open 핸들
  const handleOpenSelectedPlace = (e: React.MouseEvent) => {
    e.stopPropagation() // 이벤트 버블링 방지
    if (buttonText === '+ 일정 확정하기') {
      setSelectedSurveyId(surveyId)
      setSelectedGroupId(id)
      router.push('/schedule/decide')
    } else if (startTime === '' && endTime === '') {
      setSelectedSurveyId(surveyId)
      setSelectedGroupId(id)
      router.push('/schedule/select')
      // console.log('이어서 하기')
    } else {
      setIsSelectedPlace(true)
      // console.log('장소 정하기 모달 오픈')
    }
  }

  // 장소 선정하기 버튼 모달 close 핸들
  const handleCloseSelectedPlace = () => {
    setIsSelectedPlace(false)
  }

  const handleNotification = (type: string) => {
    if (type == 'creator&my') {
      showNotification('모임 나가기 완료!')
    } else if (type == '&other') {
      showNotification('내보내기 완료!')
    } else if (type == '&my') {
      showNotification('모임 나가기 완료!')
    } else {
      showNotification('삭제 실패')
    }
  }

  // 모임장, 모임원 삭제하기 api 조건
  const handleRemoveMember = async (userId: number, type: string) => {
    try {
      let url = ''
      let requestData: unknown = { userId }

      if (type === 'creator&my') {
        url = `${API_BASE_URL}/api/members/creator/${selectedGroupId}`
        requestData = undefined
      } else if (type === '&other') {
        url = `${API_BASE_URL}/api/group-members/delete/${selectedGroupId}`
      } else if (type === '&my') {
        url = `${API_BASE_URL}/api/group-members/delete/self/${selectedGroupId}`
      } else {
        console.error('잘못된 타입:', type)
        return
      }

      const response = await axios.delete(url, {
        withCredentials: true,
        data: requestData,
      })

      console.log(`${type} 삭제 성공:`, response.data.data)
      setIsMembersModalOpen(false)
      getSchedule()
      fetchNotification()
      handleNotification(type)
      return response
    } catch (error) {
      console.error(`${type} 삭제 실패:`, error)
      handleNotification('error')
      throw error
    }
  }

  const handleDirectLetsmeet = () => {
    setIsSelectedPlace(false)
    setIsDirectModalOpen(!isDirectModalOpen)
  }

  const handleSearchNavigation = () => {
    // setIsDirectModalOpen(true) // `direct` 모달 활성화
    router.push(`/search?from=/letsmeet&direct=true`)
  }

  const handleDirectComplete = () => {
    setIsDirectModalOpen(false)
    alert('입력완료 클릭시 선정한 장소 api 연동')
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
        <div className="flex flex-col gap-4">
          {/* 내용 정렬 */}
          <div className="flex justify-between">
            {/* 일정 제목 */}
            <div className="flex flex-col justify-between gap-2">
              <span className="text-xl font-medium leading-[17px] text-[#8e8d8d] group-hover:text-[#fff]">
                {title}
              </span>
              {/* 모임원 프로필 */}
              <ProfileSmall
                profiles={participants.map((p) => ({
                  ...p,
                  scheduleComplete: 'COMPLETE',
                }))}
              />
            </div>

            {/* 약속 시간, 장소 */}
            <div className="flex flex-col justify-center items-end gap-2">
              <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff]">
                {timeText}
              </span>
              {location ? (
                <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff] my-1">
                  {location}
                </span>
              ) : (
                <WhiteButton
                  text={buttonText}
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
          endDate={endDate}
          location={location}
          startTime={startTime}
          endTime={endTime}
          members={participants}
        />
      </CustomModal>

      {/* SelectModal 모달 - 장소 선정 */}
      <SelectModal
        open={isSelectedPlace}
        onOpenChange={handleCloseSelectedPlace}
        leftText={'직접 입력'}
        rightText={'장소선정'}
        onClickLeft={handleDirectLetsmeet}
        onClickRight={() => router.push('/search?from=schedule')}
      >
        <div className="flex item-center justify-center text-[#1e1e1e] text-xl font-medium leading-snug py-4 mt-3">
          장소를
          <br />
          선정할까요?
        </div>
      </SelectModal>
      <CustomModal
        open={isDirectModalOpen}
        onOpenChange={handleDirectLetsmeet}
        isFooter={true}
        footerText={'입력완료'}
        onNext={handleDirectComplete}
      >
        <div className="text-[#1e1e1e] text-xl font-medium leading-[17px] mb-[15px] ml-[4px]">
          {title}
        </div>
        <div className="text-[#8e8d8d] text-xl font-medium leading-[17px] mb-[20px] ml-[4px]">
          {startTime}
        </div>
        <div className="flex justify-center items-center">
          {selectedLocation ? (
            <div className="ml-4 text-[14px] font-medium text-[#1e1e1e] truncate">
              {selectedLocation.place}
            </div>
          ) : (
            <button
              onClick={handleSearchNavigation}
              className="flex w-[228px] px-3 py-1.5 justify-end items-center gap-[10px] rounded-[24px] border border-[var(--NavBarColor,#AFAFAF)] bg-[var(--Grays-White,#FFF)] cursor-pointer"
            >
              {/* 선택된 위치가 있으면 표시, 없으면 기본 텍스트 */}
              {/* <span className="ml-4 text-[14px] font-medium text-[#1e1e1e] truncate">
              {selectedLocation ? selectedLocation.place : ''}
            </span> */}
              <Image
                src="/vector.svg"
                alt="위치 아이콘"
                width={20}
                height={20}
              />
            </button>
          )}
        </div>
      </CustomModal>
    </div>
  )
}
