'use client'

import React, { useState } from 'react'
import NavBar from '@/components/Navigate/NavBar'
import Button from '@/components/Buttons/Floating/Button'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import { LetsmeetCard } from '@/components/Cards/LetsmeetCard'
import { useRouter } from 'next/navigation'
import LocationModal from '@/components/Modals/DirectSelect/LocationModal'

const mockSchedules = [
  {
    id: 1,
    startDate: '12월 6일 금요일',
    title: '팀 미팅',
    startTime: '',
    endTime: '16:30',
    location: '신촌역',
    participants: [
      {
        id: 1,
        name: '나',
        image: '/sampleProfile.png',
      },
      {
        id: 2,
        name: '김태엽',
        image: '/sampleProfile.png',
      },
      {
        id: 3,
        name: '지유진',
        image: '/sampleProfile.png',
      },
      {
        id: 4,
        name: '이소룡',
        image: '/sampleProfile.png',
      },
      {
        id: 5,
        name: '박진우',
        image: '/sampleProfile.png',
      },
      {
        id: 6,
        name: '이예지',
        image: '/sampleProfile.png',
      },
      {
        id: 7,
        name: '조성하',
        image: '/sampleProfile.png',
      },
      {
        id: 8,
        name: '성윤정',
        image: '/sampleProfile.png',
      },
      {
        id: 9,
        name: '김나영',
        image: '/sampleProfile.png',
      },
      {
        id: 10,
        name: '이채연',
        image: '/sampleProfile.png',
      },
    ],
  },
  {
    id: 2,
    startDate: '12월 28일 토요일',
    title: '프로젝트 미팅',
    startTime: '13:00',
    endTime: '15:00',
    location: '서울역',
    participants: [
      {
        id: 1,
        name: '나',
        image: '/sampleProfile.png',
      },
      {
        id: 2,
        name: '김태엽',
        image: '/sampleProfile.png',
      },
      {
        id: 3,
        name: '지유진',
        image: '/sampleProfile.png',
      },
    ],
  },
]

export default function LetsMeetPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('제목 없는 일정')
  const router = useRouter()

  const handleFindMidpoint = () => {
    router.push('/search?from=/letsmeet')
  }

  const handleDirectInput = () => {
    setTitle('제목 없는 일정') // 기본 제목 설정
    setIsModalOpen(true) // LocationModal 열기
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleComplete = () => {
    console.log('완료 버튼 클릭')
    handleCloseModal()
  }

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
                  startTime={schedule.startTime}
                  endTime={schedule.endTime}
                  location={schedule.location}
                  participants={schedule.participants}
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
      {isModalOpen && (
        <LocationModal
          isVisible={isModalOpen}
          onClose={handleCloseModal}
          onClickRight={handleComplete}
          initialTitle={title}
          onTitleChange={setTitle}
        ></LocationModal>
      )}
    </div>
  )
}
