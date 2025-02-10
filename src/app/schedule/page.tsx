'use client'

import React, { useState, useEffect } from 'react'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CustomModal from '@/components/Modals/CustomModal'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import Button from '@/components/Buttons/Floating/Button'
import NavBar from '@/components/Navigate/NavBar'
import { ScheduleCard } from '@/components/Cards/ScheduleCard'
import EditTitle from '@/components/Header/EditTitle'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { useDateTimeStore } from '@/store/dateTimeStore'
import { useRouter } from 'next/navigation'

// 스케줄 카드 목데이터
const mockSchedules = [
  {
    id: 1,
    startDate: '12월 6일 금요일',
    title: '팀 미팅',
    startTime: '15:00',
    endTime: '16:30',
    location: '',
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

export default function ScheduleLanding() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const { selectedDates, stringDates, handleSelect, mode, selected } =
    useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [startDate, setStartDate] = useState<string | null>(null) // 직접입력하기-시작날짜,시간
  const [endDate, setEndDate] = useState<string | null>(null) // 직접입력하기-끝날짜,시간

  const resetDateTime = useDateTimeStore((state) => state.resetDateTime)
  const router = useRouter()

  // 연동 데이터
  const [groupId, setGroupId] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          'https://api.moim.team/api/user/information',
          {
            method: 'GET',
            credentials: 'include', // 쿠키 전송을 위해 필요
          },
        )
        if (!response.ok) {
          // 예외 처리
          throw new Error(`서버 에러: ${response.status}`)
        }
        const data = await response.json()
        console.log('유저 정보:', data)
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error)
      }
    }

    const getSchedule = async () => {
      try {
        const response = await fetch(
          'https://api.moim.team/api/schedule/get-all',
          {
            method: 'GET',
            credentials: 'include', // 쿠키 전송을 위해 필요
          },
        )
        if (!response.ok) {
          // 예외 처리
          throw new Error(`서버 에러: ${response.status}`)
        }
        const data = await response.json()
        console.log('스케줄 정보:', data)
      } catch (error) {
        console.error('스케줄 정보 불러오기 실패:', error)
      }
    }

    fetchUserInfo()
    getSchedule()
  }, [])

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }
  const handleOpenCdialog = () => {
    if (isCdialogOpen) {
      // 모달이 닫힐 때 선택된 날짜 초기화
      handleSelect(undefined)
    }
    setIsCdialogOpen(!isCdialogOpen)
  }
  const handleOpenDdialg = async () => {
    if (isDdialogOpen) {
      // 직접 입력 모달이 닫힐 때 시작/끝 날짜,시간 초기화
      resetDateTime()
    }
    setIsDdialogOpen(!isDdialogOpen)

    try {
      const response = await fetch('https://api.moim.team/api/members', {
        method: 'POST',
        credentials: 'include', // 쿠키 전송을 위해 필요
      })
      if (!response.ok) {
        // 예외 처리
        throw new Error(`서버 에러: ${response.status}`)
      }
      const data = await response.json()
      console.log('그룹 ID', data)
      setGroupId(data.data.groupId)
    } catch (error) {
      console.error('그룹 아이디 만들기 실패', error)
    }
  }

  // 직접입력하기 모달에서 받아온 시작, 끝 string 저장
  const handleDateChange = (startDate: string, endDate: string) => {
    setStartDate(startDate)
    setEndDate(endDate)
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
      const response = await fetch('https://api.moim.team/api/schedule', {
        method: 'POST',
        credentials: 'include', // 쿠키 전송을 위해 필요
        headers: {
          'Content-Type': 'application/json', // JSON 형식 명시
        },
        body: JSON.stringify({
          groupId: groupId,
          name: title,
          startDate: startDate,
          endDate: endDate,
        }),
      })
      if (!response.ok) {
        // 예외 처리
        throw new Error(`서버 에러: ${response.status}`)
      }
      const data = await response.json()
      console.log('직접 생성 성공', data)
    } catch (error) {
      console.error('직접 생성 실패', error)
    }

    router.push('/schedule')
  }

  return (
    <div className="flex flex-col min-h-screen h-screen">
      {/* Add Moim Button */}
      <NavBar activeTab="스케줄" />

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
          <div className="flex-1 overflow-y-auto pb-[120px]">
            {mockSchedules.map((schedule) => (
              <div key={schedule.id}>
                <ScheduleCard
                  startDate={schedule.startDate}
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
