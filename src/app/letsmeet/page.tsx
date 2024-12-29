'use client'

import React, { useState } from 'react'
import Navbar from '../../components/Navigate/NavBar'
import dynamic from 'next/dynamic'
import SelectPopupModal from '../../components/Modals/SelectPopup' // 모달 컴포넌트 가져오기

const DynamicSchedulePage = dynamic(() => import('../schedule/page'), {
  ssr: false,
}) // 스케줄 페이지 동적 임포트

const LetsMeetPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false) // 모달 상태
  const [modalTitle, setModalTitle] = useState('') // 동적으로 변경 가능한 타이틀 상태

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 네비게이션 바 */}
      <Navbar
        onSelectNav={(selectedNav) => {
          if (selectedNav === '렛츠밋') {
            setModalTitle('장소를<br />선정할까요?') // 타이틀 설정
            setShowModal(true)
          }
        }}
      />

      {/* 아래 스케줄 페이지 콘텐츠 포함 */}
      <div className="flex-1">
        <DynamicSchedulePage />
      </div>

      {/* 장소 선택 모달 */}
      {showModal && (
        <SelectPopupModal
          title={modalTitle} // 동적으로 설정된 타이틀 전달
          onClose={() => setShowModal(false)} // 모달 닫기 핸들러
          onDirectInput={() => {
            setShowModal(false)
            alert('직접 입력 선택됨') // 동작 정의
          }}
          onSelectPlace={() => {
            setShowModal(false)
            alert('선정하기 선택됨') // 동작 정의
          }}
        />
      )}
    </div>
  )
}

export default LetsMeetPage
