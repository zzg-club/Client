'use client'

import React, { useState } from 'react'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CustomModal from '@/components/Modals/CustomModal'
import CustomCalendar from '@/components/CustomCalendar'
import Button from '@/components/Buttons/Floating/Button'
import { DateRange } from 'react-day-picker'
import NavBar from '@/components/Navigate/NavBar'
import { ScheduleCard } from '@/components/Cards/ScheduleCard'

const mockSchedules = [
  {
    id: 1,
    date: '12월 5일',
    title: '제목 없는 일정',
    startTime: '13:00',
    endTime: '15:00',
    // location: '서울역',
    participants: [
      {
        id: 1,
        name: 'User 1',
        image: '/globe.svg',
      },
      {
        id: 2,
        name: 'User 2',
        image: '/globe.svg',
      },
      {
        id: 3,
        name: 'User 3',
        image: '/globe.svg',
      },
      {
        id: 4,
        name: 'User 4',
        image: '/globe.svg',
      },
      {
        id: 5,
        name: 'User 5',
        image: '/globe.svg',
      },
    ],
  },
  {
    id: 2,
    date: '12월 6일',
    title: '팀 미팅',
    startTime: '15:00',
    endTime: '16:30',
    location: '강남역',
    participants: [
      {
        id: 1,
        name: 'User 1',
        image: '/globe.svg',
      },
      {
        id: 2,
        name: 'User 2',
        image: '/globe.svg',
      },
      {
        id: 3,
        name: 'User 3',
        image: '/globe.svg',
      },
      {
        id: 4,
        name: 'User 4',
        image: '/globe.svg',
      },
      {
        id: 5,
        name: 'User 5',
        image: '/globe.svg',
      },
      {
        id: 6,
        name: 'User 6',
        image: '/globe.svg',
      },
      {
        id: 7,
        name: 'User 7',
        image: '/globe.svg',
      },
    ],
  },
  {
    id: 3,
    date: '12월 5일',
    title: '프로젝트 미팅',
    startTime: '13:00',
    endTime: '15:00',
    location: '서울역',
    participants: [
      {
        id: 1,
        name: 'User 1',
        image: '/globe.svg',
      },
      {
        id: 2,
        name: 'User 2',
        image: '/globe.svg',
      },
      {
        id: 3,
        name: 'User 3',
        image: '/globe.svg',
      },
    ],
  },
]

export default function ScheduleLanding() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState<
    DateRange | Date[] | undefined
  >()

  const handleSelect = (selection: DateRange | Date[] | undefined) => {
    setSelectedDates(selection)
    console.log('Selected:', selection)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }
  const handleOpenDialog = () => {
    setIsDialogOpen(!isDialogOpen)
  }
  return (
    <div>
      {/* Add Moim Button */}
      <NavBar />
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
        <div className="pt-[267px] text-center text-zinc-400 text-base font-medium leading-[17px]">
          모임 일정을 추가해봐요!
        </div>
      )}
      <ScheduleOptions
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        optionStringUp="일정 조율하기"
        optionStringDown="직접 입력하기"
        onClickUp={handleOpenDialog}
        onClickDown={() => alert('직접 입력하기 선택')}
      />
      <Button
        buttonString="일정 추가하기"
        onClick={handleToggle}
        isOpen={isOpen}
      />

      {/* Dialog */}
      <CustomModal
        open={isDialogOpen}
        onOpenChange={handleOpenDialog}
        onNext={() => alert('다음으로')}
        isFooter={true}
      >
        <CustomCalendar
          initialMode="range"
          selected={selectedDates}
          onSelect={handleSelect}
        />
      </CustomModal>
    </div>
  )
}
