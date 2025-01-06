'use client'

import React, { useState } from 'react'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CustomModal from '@/components/Modals/CustomModal'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import Button from '@/components/Buttons/Floating/Button'
import { DateRange } from 'react-day-picker'
import NavBar from '@/components/Navigate/NavBar'
import { ScheduleCard } from '@/components/Cards/ScheduleCard'
import EditTitle from '@/components/Header/EditTitle'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'

// 스케줄 카드 목데이터
const mockSchedules = [
  {
    id: 1,
    date: '12월 6일 금요일',
    title: '팀 미팅',
    startTime: '15:00',
    endTime: '16:30',
    location: '',
    participants: [
      {
        id: 1,
        name: '나',
        image: '/globe.svg',
      },
      {
        id: 2,
        name: '김태엽',
        image: '/globe.svg',
      },
      {
        id: 3,
        name: '지유진',
        image: '/globe.svg',
      },
      {
        id: 4,
        name: '이소룡',
        image: '/globe.svg',
      },
      {
        id: 5,
        name: '박진우',
        image: '/globe.svg',
      },
      {
        id: 6,
        name: '이예지',
        image: '/globe.svg',
      },
      {
        id: 7,
        name: '조성하',
        image: '/globe.svg',
      },
      {
        id: 8,
        name: '성윤정',
        image: '/globe.svg',
      },
      {
        id: 9,
        name: '김나영',
        image: '/globe.svg',
      },
      {
        id: 10,
        name: '이채연',
        image: '/globe.svg',
      },
    ],
  },
  {
    id: 2,
    date: '12월 28일 토요일',
    title: '프로젝트 미팅',
    startTime: '13:00',
    endTime: '15:00',
    location: '서울역',
    participants: [
      {
        id: 1,
        name: '나',
        image: '/globe.svg',
      },
      {
        id: 2,
        name: '김태엽',
        image: '/globe.svg',
      },
      {
        id: 3,
        name: '지유진',
        image: '/globe.svg',
      },
    ],
  },
]

export default function ScheduleLanding() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct
  const [selectedDates, setSelectedDates] = useState<
    DateRange | Date[] | Date | undefined
  >()
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const handleSelect = (selection: DateRange | Date[] | Date | undefined) => {
    setSelectedDates(selection)
    console.log('Selected:', selection)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }
  const handleOpenCdialog = () => {
    setIsCdialogOpen(!isCdialogOpen)
  }
  const handleOpenDdialg = () => {
    setIsDdialogOpen(!isDdialogOpen)
  }

  // 캐러셀 알림 목데이터
  const notifications = [
    {
      id: 1,
      notiMessage: '생성하던 일정이 있습니다!',
      leftBtnText: '이어서 하기',
      RightBtnText: '새로 만들기',
    },
    {
      id: 2,
      notiMessage: '생성하던 일정이 있습니다!!',
      leftBtnText: '이어서 하기',
      RightBtnText: '새로 만들기',
    },
    {
      id: 3,
      notiMessage: '생성하던 일정이 있습니다~!',
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
    <div className="flex flex-col min-h-screen">
      {/* Add Moim Button */}
      <NavBar activeTab="스케줄" />

      {/* 캐로셀 알림 컴포넌트 */}
      <div className="flex justify-center items-center overflew-hidden">
        <CarouselNotification
          notifications={notifications}
          onLeftBtn={handleLeftBtn}
          onRightBtn={handleRightBtn}
        />
      </div>
      {/* 스케줄 카드 컴포넌트 */}
      {mockSchedules.length > 0 ? (
        <>
          <div className="w-full h-[34px] px-4 my-[8px] flex justify-start items-center gap-[2px]">
            <div className="ml-[8px] text-[#1e1e1e] text-xs font-medium leading-[17px]">
              내 일정
            </div>
            <div className="text-[#9562fa] text-base font-medium leading-[17px]">
              +{mockSchedules.length}
            </div>
          </div>
          {mockSchedules.map((schedule) => (
            <div key={schedule.id}>
              <ScheduleCard
                date={schedule.date}
                title={schedule.title}
                startTime={schedule.startTime}
                endTime={schedule.endTime}
                location={schedule.location}
                participants={schedule.participants}
              />
            </div>
          ))}
        </>
      ) : (
        // 스케줄 정보 없는 경우 렌더링 화면
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-center text-zinc-400 text-base font-medium leading-[17px]">
            모임 일정을 추가해봐요!
          </div>
        </div>
      )}
      <ScheduleOptions
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        optionStringUp="일정 조율하기"
        optionStringDown="직접 입력하기"
        onClickUp={handleOpenCdialog}
        onClickDown={handleOpenDdialg}
      />
      <Button
        buttonString="일정 추가하기"
        onClick={handleToggle}
        isOpen={isOpen}
      />

      {/* 일정 조율하기 모달 */}
      <CustomModal
        open={isCdialogOpen}
        onOpenChange={handleOpenCdialog}
        onNext={() => alert('다음으로')}
        isFooter={true}
        footerText={'다음으로'}
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
        onNext={() => alert('다음으로')}
        isFooter={true}
        footerText={'입력완료'}
      >
        <EditTitle initialTitle={title} onTitleChange={handleTitleChange} />
        <DateTimeModal />
      </CustomModal>
    </div>
  )
}
