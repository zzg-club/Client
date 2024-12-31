'use client'

import React, { useState } from 'react'
import Navbar from '../../components/Navigate/NavBar'
import AddPlaceModal from '../../components/Modals/AddPlaceModal'

const LetsMeetPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 네비게이션 바 */}
      <Navbar
        onSelectNav={(selectedNav) => {
          if (selectedNav === '렛츠밋') {
            console.log('렛츠밋 선택됨')
          }
        }}
      />

      {/* 페이지 콘텐츠 */}
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-gray-500 text-sm text-center leading-[20px]">
          모임 일정을 추가해봐요!
        </p>
      </div>

      {/* 장소 추가 버튼 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-[72px] right-[24px] flex items-center justify-center w-[144px] h-[56px] bg-purple-500 text-white font-pretendard text-[15px] font-semibold rounded-[24px] shadow-md hover:bg-purple-600 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        장소 추가하기
      </button>

      {/* 장소 추가 모달 */}
      {showModal && (
        <AddPlaceModal
          onClose={() => setShowModal(false)}
          onFindMidpoint={() => {
            setShowModal(false)
            alert('중간지점 찾기 선택됨')
          }}
          onDirectInput={() => {
            setShowModal(false)
            alert('직접 입력 선택됨')
          }}
        />
      )}
    </div>
  )
}

export default LetsMeetPage
