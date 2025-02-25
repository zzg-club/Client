'use client'

import React, { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/Navigate/NavBar'
import Button from '@/components/Buttons/Floating/Button'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import { LetsmeetCard } from '@/components/Cards/LetsmeetCard'
import { useRouter } from 'next/navigation'
import LocationModal from '@/components/Modals/DirectSelect/LocationModal'
import { useSurveyStore } from '@/store/surveyStore'
import { useGroupStore } from '@/store/groupStore'
import { useLocationStore } from '@/store/locationsStore'

export type Participant = {
  id: number
  name: string
  image: string
  type: string
  scheduleComplete: string
}

type Schedule = {
  id: number
  startDate: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: Participant[]
  surveyId: number
}

type Notification = {
  id: number
  leftBtnText: string
  surveyId: number
  notiMessage?: string
}

export default function LetsMeetPage() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  const isDirectModal = searchParams?.get('direct') === 'true'

  const [isOpen, setIsOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
  const [title, setTitle] = useState('제목 없는 일정')
  const [scheduleList, setScheduleList] = useState<Schedule[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { setSelectedSurveyId } = useSurveyStore()
  const { selectedGroupId, setSelectedGroupId } = useGroupStore()
  const { selectedLocation, setSelectedLocation } = useLocationStore()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])
  //`direct=true`이면 모달 자동으로 열기
  useEffect(() => {
    if (isDirectModal) {
      setIsDirectModalOpen(true)
    }
  }, [isDirectModal])

  // URL에서 받아온 값으로 상태 업데이트
  useEffect(() => {
    if (
      isDirectModal &&
      selectedLocation &&
      selectedLocation.place &&
      selectedLocation.lat !== undefined &&
      selectedLocation.lng !== undefined
    ) {
      console.log('위치 설정: ', {
        place: selectedLocation.place,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      })

      setSelectedLocation({
        place: selectedLocation.place,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      })
    }
  }, [selectedLocation, isDirectModal, setSelectedLocation])

  const fetchNotification = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/notification`, {
        method: 'GET',
        credentials: 'include', // 쿠키 전송을 위해 필요
      })

      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`)
      }
      const notiData = await response.json()
      setNotifications(notiData.data)
      console.log('알림 정보:', notiData)
    } catch (error) {
      console.error('알림 정보 불러오기 실패:', error)
    }
  }, [API_BASE_URL])

  // 스케줄 정보 리스트
  const getSchedule = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/List`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`)
      }

      const data = await response.json()
      console.log('스케줄 정보:', data.data)

      if (Array.isArray(data.data)) {
        const formattedSchedules = data.data.map((schedule: Schedule) => ({
          id: schedule.id,
          startDate: schedule.startDate || '',
          title: schedule.title,
          startTime: schedule.startTime || '',
          endTime: schedule.endTime || '',
          location: schedule.location || '',
          participants: schedule.participants || [],
          surveyId: schedule.surveyId,
        }))

        setScheduleList(formattedSchedules.reverse())
      } else {
        console.error('데이터 구조 에러:', data.data)
      }
    } catch (error) {
      console.error('스케줄 정보 불러오기 실패:', error)
    }
  }, [API_BASE_URL])

  //유저 정보 연동
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/information`, {
          method: 'GET',
          credentials: 'include',
        })
        if (!response.ok) {
          // 예외 처리
          throw new Error(`서버 에러: ${response.status}`)
        }

        const data = await response.json()
        console.log('원본 유저 정보:', data)
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error)
      }
    }

    fetchUserInfo()
    fetchNotification()
    getSchedule()
  }, [API_BASE_URL, fetchNotification, getSchedule])

  const handleFindMidpoint = async () => {
    try {
      // 1. 약속 그룹 생성 (groupId 발급)
      const membersResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!membersResponse.ok) throw new Error('약속 생성 실패')

      const membersData = await membersResponse.json()
      const newGroupId = membersData.data.groupId

      console.log('생성된 groupId:', newGroupId)

      setSelectedGroupId(newGroupId)

      // 2. 렛츠밋 약속(위치) 생성
      const locationResponse = await fetch(
        `${API_BASE_URL}/api/location/create`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId: newGroupId }),
        },
      )

      if (!locationResponse.ok) throw new Error('위치 생성 실패')

      const locationData = await locationResponse.json()
      console.log('위치 생성 완료, location_id:', locationData.data.location_id)

      router.push(`/search?from=/letsmeet`)
    } catch (error) {
      console.error('그룹 생성 오류:', error)
    }
  }

  const handleDirectInput = async () => {
    try {
      // 직접 입력 모달 열기
      setTitle('제목 없는 일정')
      setSelectedLocation(null)
      setIsDirectModalOpen(true)
    } catch (error) {
      console.error('직접 입력 오류:', error)
    }
  }

  const handleCloseModal = () => {
    setIsDirectModalOpen(false)
    router.replace('/letsmeet')
  }

  const addSchedule = async () => {
    await getSchedule()
    //모달 닫기 및 리디렉션
    setIsDirectModalOpen(false)
    router.replace('/letsmeet')
  }

  const handleComplete = async () => {
    console.log('handleComplete 실행됨 - addSchedule 호출')
    await addSchedule() // 중앙 위치 확정 → 일정 추가 실행
  }

  // 캐러셀 알림 버튼 클릭 이벤트
  const handleLeftBtn = (id: number) => {
    const currentNotification = notifications.find((n) => n.id === id)
    if (currentNotification?.notiMessage?.includes('일정')) {
      setSelectedSurveyId(currentNotification.surveyId)
      router.push('schedule/select')
    } else {
      if (selectedGroupId) setSelectedGroupId(selectedGroupId)
      router.push('letsmeet/middle')
    }
  }

  const handleRightBtn = (id: number) => {
    const filter = notifications.filter((n) => n.id !== id)
    setNotifications(filter)
    console.log('filter', filter)
  }

  return (
    <div className="flex flex-col min-h-screen h-screen">
      <NavBar activeTab="렛츠밋" />

      {/* 캐로셀 알림 컴포넌트 */}
      {notifications.length > 0 && (
        <div className="flex justify-center items-center overflew-hidden">
          <CarouselNotification
            notifications={notifications}
            onClickLeftBtn={handleLeftBtn}
            onClickRightBtn={handleRightBtn}
          />
        </div>
      )}

      {/* 렛츠밋 카드 컴포넌트 */}
      {scheduleList.length > 0 ? (
        <>
          <div className="w-full h-[34px] px-4 my-[8px] flex justify-start items-center gap-[2px]">
            <div className="ml-[8px] text-[#1e1e1e] text-xs font-medium leading-[17px]">
              내 장소
            </div>
            <div className="text-[#9562fa] text-base font-medium leading-[17px]">
              +{scheduleList.length}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-[120px]">
            {scheduleList.map((schedule) => (
              <div key={schedule?.id}>
                <LetsmeetCard
                  id={schedule?.id}
                  startDate={schedule?.startDate}
                  title={schedule?.title}
                  startTime={schedule?.startTime}
                  endTime={schedule?.endTime}
                  location={schedule?.location}
                  participants={schedule?.participants}
                  surveyId={schedule?.surveyId}
                  getSchedule={getSchedule}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        // 장소 정보 없는 경우 렌더링 화면
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-center text-zinc-400 text-base font-medium leading-[17px]">
            모임 장소를 추가해봐요!
          </div>
        </div>
      )}
      {/* 장소 추가하기 버튼 */}
      <Button
        buttonString="장소 추가하기"
        isOpen={isOpen}
        onClick={() => {
          setIsOpen(!isOpen)
          setIsOptionsOpen(!isOptionsOpen)
        }}
      />

      {/* 옵션 모달 */}
      <ScheduleOptions
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onClickUp={handleFindMidpoint} // "중간지점 찾기" 버튼 핸들러
        onClickDown={handleDirectInput} // "직접 입력하기" 버튼 핸들러
        optionStringUp="중간지점 찾기"
        optionStringDown="직접 입력하기"
      />
      {/* LocationModal */}
      {isDirectModalOpen && (
        <LocationModal
          isVisible={isDirectModalOpen}
          onClose={handleCloseModal}
          onClickRight={handleComplete}
          initialTitle={title}
          onTitleChange={(newTitle) => setTitle(newTitle)}
          selectedLocation={selectedLocation ?? undefined}
        />
      )}
    </div>
  )
}
