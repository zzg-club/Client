'use client'

import React from 'react'

// Props 타입 정의
interface SetPlacePopupProps {
  title: string // 동적으로 변경 가능한 타이틀
  onClose: () => void // 모달 닫기 핸들러
  onDirectInput?: () => void // 직접 입력 버튼 클릭 핸들러 (옵션)
  onSelectPlace?: () => void // 선정하기 버튼 클릭 핸들러 (옵션)
}

const SelectPopupModal: React.FC<SetPlacePopupProps> = ({
  title,
  onClose,
  onDirectInput,
  onSelectPlace,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[280px] rounded-[24px] shadow-lg flex flex-col">
        {/* 닫기 버튼 */}
        <button
          className="absolute top-[19px] right-[19px] w-[24px] h-[24px] flex items-center justify-center text-gray-500 hover:text-black"
          onClick={onClose}
        >
          {/* SVG 아이콘 삽입 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 타이틀 영역 */}
        <div className="flex flex-col items-center justify-center flex-grow px-[16px] mt-[36px]">
          <h2
            className="text-center text-[20px] font-medium font-pretendard leading-[1.4] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: title }} // 줄바꿈을 HTML에서 처리
          ></h2>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-between border-t border-gray-200 h-[55px]">
          <button
            className="flex-1 text-center text-[16px] text-purple-500 font-medium hover:bg-gray-100 rounded-l-[12px] font-pretendard"
            onClick={onDirectInput}
          >
            직접 입력
          </button>
          <button
            className="flex-1 text-center text-[16px] text-purple-500 font-medium hover:bg-gray-100 rounded-r-[12px] border-l border-gray-200 font-pretendard"
            onClick={onSelectPlace}
          >
            선정하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectPopupModal
