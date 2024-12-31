'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // useRouter 훅 사용
import NavBar from '@/components/Navigate/NavBar'
import Button from '@/components/Buttons/Floating/Button'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'

const LetsMeetPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false) // 버튼 상태 관리
  const [isOptionsOpen, setIsOptionsOpen] = useState(false) // 옵션 모달 상태 관리
  const router = useRouter() // Next.js 라우터 훅

  // 옵션 선택 핸들러
  const handleFindMidpoint = () => {
    // 중간지점 찾기 클릭 시 middle 페이지로 이동
    router.push('letsmeet/middle')
  }

  const handleDirectInput = () => {
    alert('직접 입력하기 선택됨!')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 네비게이션 바 */}
      <NavBar />

      {/* 페이지 콘텐츠 */}
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-gray-500 text-sm text-center leading-[20px]">
          모임 일정을 추가해봐요!
        </p>
      </div>

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
    </div>
  )
}

export default LetsMeetPage
