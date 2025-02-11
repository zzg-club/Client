'use client'

import React, { useState, useEffect } from 'react'
import NavBar from '@/components/Navigate/NavBar'
import Button from '@/components/Buttons/Floating/Button'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import { LetsmeetCard } from '@/components/Cards/LetsmeetCard'
import { useRouter } from 'next/navigation'
import LocationModal from '@/components/Modals/DirectSelect/LocationModal'
import mockSchedules from '@/data/dummyDataArray.json'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'

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

export default function LetsMeetPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
  const [title, setTitle] = useState('제목 없는 일정')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [participants, setParticipants] = useState<Participant[]>([])
  const router = useRouter()

  const handleFindMidpoint = () => {
    router.push('/search?from=/letsmeet')
  }

  const handleDirectInput = () => {
    setTitle('제목 없는 일정')
    setIsDirectModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDirectModalOpen(false)
  }

  const handleComplete = () => {
    console.log('완료 버튼 클릭')
    handleCloseModal()
  }

  useEffect(() => {
    if (mockSchedules.length > 0 && currentIndex >= mockSchedules.length) {
      setCurrentIndex(0)
    }

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
          transportIcon: '/train.svg',
          depart: '죽전역',
        }

        const updatedParticipants = [
          myInfo,
          ...mockSchedules[currentIndex].participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayGray.svg',
          })),
        ]

        setParticipants(updatedParticipants)
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
          transportIcon: '/train.svg',
          depart: '서울역',
        }

        const updatedParticipants = [
          fallbackInfo,
          ...mockSchedules[currentIndex].participants.map((participant) => ({
            ...participant,
            transportIcon: '/subwayGray.svg',
          })),
        ]

        setParticipants(updatedParticipants)
      }
    }

    updateParticipants()
  }, [currentIndex])

  // 캐러셀 알림 목데이터
  const notifications = [
    {
      id: 1,
      notiMessage: '선정하던 장소가 있습니다!',
      leftBtnText: '이어서 하기',
      RightBtnText: '새로 만들기',
    },
    {
      id: 2,
      notiMessage: '선정하던 장소가 있습니다!!',
      leftBtnText: '이어서 하기',
      RightBtnText: '새로 만들기',
    },
    {
      id: 3,
      notiMessage: '선정하던 장소가 있습니다~!',
      leftBtnText: '이어서 하기',
      RightBtnText: '새로 만들기',
    },
  ]
  // 캐러셀 알림 버튼 클릭 이벤트
  const handleLeftBtn = () => {
    alert('왼쪽 버튼 클릭')
  }

  const handleRightBtn = () => {
    alert('오른쪽 버튼 클릭')
  }

  return (
    <div className="flex flex-col min-h-screen h-screen">
      <NavBar activeTab="렛츠밋" />

      {/* 캐로셀 알림 컴포넌트 */}
      {notifications.length > 0 && (
        <div className="flex justify-center items-center overflew-hidden">
          <CarouselNotification
            notifications={notifications}
            onLeftBtn={handleLeftBtn}
            onRightBtn={handleRightBtn}
          />
        </div>
      )}

      {/* 렛츠밋 카드 컴포넌트 */}
      {mockSchedules.length > 0 ? (
        <>
          <div className="w-full h-[34px] px-4 my-[8px] flex justify-start items-center gap-[2px]">
            <div className="ml-[8px] text-[#1e1e1e] text-xs font-medium leading-[17px]">
              내 장소
            </div>
            <div className="text-[#9562fa] text-base font-medium leading-[17px]">
              +{mockSchedules.length}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-[120px]">
            {mockSchedules.map((schedule) => (
              <div key={schedule.id}>
                <LetsmeetCard
                  title={schedule.title}
                  startDate={schedule.startDate}
                  startTime={schedule.startTime}
                  endTime={schedule.endTime}
                  destination={schedule.destination.name}
                  participants={participants}
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
          onTitleChange={setTitle}
        ></LocationModal>
      )}
    </div>
  )
}
