'use client'

import React from 'react'

// Props 타입 정의
interface AddPlaceModalProps {
  onClose: () => void // 모달 닫기 핸들러
  onFindMidpoint: () => void // 중간지점 찾기 클릭 핸들러
  onDirectInput: () => void // 직접 입력 클릭 핸들러
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  onClose,
  onFindMidpoint,
  onDirectInput,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-end z-50">
      {/* 모달 컨테이너 */}
      <div className="bg-white rounded-[24px] shadow-lg w-[173px] h-[106px] px-[38px] py-[24px] flex flex-col items-center gap-[24px]">
        {/* 버튼 리스트 */}
        <button
          className="text-[18px] font-medium text-[#9562FB] leading-[17px] text-center hover:underline tracking-[-0.5px] font-pretendard"
          onClick={onFindMidpoint}
        >
          중간지점 찾기
        </button>
        <button
          className="text-[18px] font-medium text-[#9562FB] leading-[17px] text-center hover:underline tracking-[-0.5px] font-pretendard"
          onClick={onDirectInput}
        >
          직접 입력하기
        </button>
      </div>

      {/* 닫기 버튼 */}
      <button
        className="absolute bottom-[74px] right-[24px] bg-[#F4E3FF] w-[56px] h-[56px] flex items-center justify-center rounded-[24px] text-black text-[24px] hover:bg-purple-200"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  )
}

export default AddPlaceModal
