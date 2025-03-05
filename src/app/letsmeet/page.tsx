'use client'

import React, { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/Navigate/NavBar'
import Button from '@/components/Buttons/Floating/Button'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import { LetsmeetCard } from '@/components/Cards/LetsmeetCard'
import { useRouter, useSearchParams } from 'next/navigation'
import LocationModal from '@/components/Modals/DirectSelect/LocationModal'
import { useGroupStore } from '@/store/groupStore'
import { useSurveyStore } from '@/store/surveyStore'
import { useLocationIdStore } from '@/store/locationIdStore'
import { useNotificationStore } from '@/store/notificationStore'
type Schedule = {
  id: number
  startDate: string
  endDate: string
  title: string
  startTime: string
  endTime: string
  location?: string
  locationId?: number
  participants: {
    id: number
    name: string
    image: string
    type: string
    locationComplete: string
  }[]
}

type Notification = {
  id: number
  leftBtnText: string
  surveyId: number
  notiMessage?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function LetsMeetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDirectModal = searchParams?.get('direct') === 'true'
  const place = searchParams?.get('place') || ''
  const lat = searchParams?.get('lat')
    ? parseFloat(searchParams.get('lat')!)
    : null
  const lng = searchParams?.get('lng')
    ? parseFloat(searchParams.get('lng')!)
    : null

  const [isOpen, setIsOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
  const [title, setTitle] = useState('제목 없는 일정')
  const [scheduleList, setScheduleList] = useState<Schedule[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const { setSelectedLocationId } = useLocationIdStore()
  const { selectedGroupId, setSelectedGroupId } = useGroupStore()
  const { setSelectedSurveyId } = useSurveyStore()
  const [selectedLocation, setSelectedLocation] = useState<{
    place: string
    lat: number
    lng: number
  } | null>(null)
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )

  //`direct=true`이면 모달 자동으로 열기
  useEffect(() => {
    if (isDirectModal) {
      setIsDirectModalOpen(true)
    }
  }, [isDirectModal])

  useEffect(() => {
    // 렛츠밋 페이지에 들어올 때 `toast=true`가 있으면 토스트 띄우기
    if (searchParams?.get('toast') === 'true') {
      showNotification('출발지 입력 완료!')

      // URL에서 `toast=true`를 제거하여 새로고침 시 중복 방지
      const newSearchParams = new URLSearchParams(window.location.search)
      newSearchParams.delete('toast')
      const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`
      window.history.replaceState(null, '', newUrl)
    }
  }, [searchParams, showNotification])

  // URL에서 받아온 값으로 상태 업데이트
  useEffect(() => {
    if (isDirectModal && place && lat && lng) {
      setSelectedLocation({ place, lat, lng })
    }
  }, [isDirectModal, place, lat, lng])

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
  }, [])

  const handleFindMidpoint = async () => {
    const groupResponse = await fetch(`${API_BASE_URL}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!groupResponse.ok) throw new Error('그룹 생성 실패')

    const groupData = await groupResponse.json()
    const groupId = groupData.data.groupId
    console.log(`그룹 생성 완료: groupId = ${groupId}`)

    //  위치 ID 생성 API 호출
    const locationCreateResponse = await fetch(
      `${API_BASE_URL}/api/location/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groupId }),
      },
    )

    if (!locationCreateResponse.ok) throw new Error('위치 ID 생성 실패')

    const locationCreateData = await locationCreateResponse.json()
    const locationId = locationCreateData.data.location_id

    console.log(`위치 ID 생성 완료: locationId = ${locationId}}`)

    setSelectedLocationId(locationId)
    setSelectedGroupId(groupId)

    router.push('/search?from=/letsmeet')
  }

  const handleDirectInput = async () => {
    // 그룹 생성 API 호출
    const groupResponse = await fetch(`${API_BASE_URL}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!groupResponse.ok) throw new Error('그룹 생성 실패')

    const groupData = await groupResponse.json()
    const groupId = groupData.data.groupId
    console.log(`그룹 생성 완료: groupId = ${groupId}`)

    // Zustand에 groupId 저장
    setSelectedGroupId(groupId)

    setTitle('제목 없는 일정')
    setSelectedLocation(null)
    setIsDirectModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDirectModalOpen(false)
    router.replace('/letsmeet')
  }

  const handleComplete = () => {
    if (!selectedLocation) return

    const newSchedule = {
      id: scheduleList.length + 1,
      startDate: '',
      endDate: '',
      title: title,
      startTime: '',
      endTime: '',
      location: selectedLocation.place,
      participants: [],
    }

    setScheduleList([...scheduleList, newSchedule])
    setIsDirectModalOpen(false)
    router.replace('/letsmeet')
  }

  const getSchedule = async () => {
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
          endDate: schedule.endDate || '',
          title: schedule.title,
          startTime: schedule.startTime || '',
          endTime: schedule.endTime || '',
          location: schedule.location || '',
          locationId: useLocationIdStore.getState().selectedLocationId || -1,
          participants: schedule.participants || [],
        }))
        setScheduleList(formattedSchedules.reverse())
      } else {
        console.error('데이터 구조 에러:', data.data)
      }
    } catch (error) {
      console.error('스케줄 정보 불러오기 실패:', error)
    }
  }

  //유저 정보
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/information`, {
          method: 'GET',
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`)
        }
        const data = await response.json()
        console.log('유저 정보:', data)
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error)
      }
    }

    // 스케줄 정보 리스트

    fetchUserInfo()
    fetchNotification()
    getSchedule()
  }, [fetchNotification])

  // // 캐러셀 알림 버튼 클릭 이벤트
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
              <LetsmeetCard
                key={schedule.id}
                id={schedule.id}
                startDate={schedule.startDate || ''}
                endDate={schedule.endDate || ''}
                title={schedule.title}
                startTime={schedule.startTime}
                endTime={schedule.endTime}
                location={schedule.location}
                participants={schedule.participants}
                locationId={
                  schedule.locationId ??
                  useLocationIdStore.getState().selectedLocationId ??
                  -1
                }
                getSchedule={getSchedule}
                fetchNotification={fetchNotification}
              />
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
          onTitleChange={setTitle}
        />
      )}
    </div>
  )
}
