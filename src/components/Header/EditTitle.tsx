'use client'

import { GoPencil } from 'react-icons/go'
import { useState } from 'react'

interface EditTitleProps {
  initialTitle: string
  onTitleChange: (newTitle: string) => void //수정된 제목을 부모 컴포넌트로 전달
}

export default function EditTitle({
  initialTitle,
  onTitleChange,
}: EditTitleProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isEditing, setIsEditing] = useState(false) // 수정 모드 상태

  // 제목 변경 핸들러
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  // 수정 완료 핸들러 (Enter 키 입력 or Blur 이벤트)
  const handleSave = () => {
    setIsEditing(false) // 수정 모드 종료
    onTitleChange(title) // 상위 컴포넌트에 저장된 제목 전달
  }

  // 키 입력 핸들러 (Enter로 저장)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <div>
      {/* 수정 모드일 때 오버레이 */}
      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      )}

      {/* 제목과 수정 버튼 */}
      <div
        className={`relative flex items-center gap-2 ${
          isEditing ? 'z-20' : ''
        }`}
      >
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleSave} // 포커스를 잃으면 저장
            onKeyDown={handleKeyDown} // 엔터 키로 저장
            autoFocus // 버튼 클릭 시 바로 입력 가능
            className=" text-white text-2xl font-semibold font-['Pretendard'] leading-[17px] tracking-tight bg-transparent outline-none placeholder-white"
          />
        ) : (
          <span className="text-center text-[#afafaf] text-2xl font-semibold font-['Pretendard'] leading-[17px] tracking-tight">
            {title}
          </span>
        )}
        {!isEditing && ( // 수정 모드일 때는 연필 아이콘 숨기기
          <button onClick={() => setIsEditing(true)} className="z-20">
            <GoPencil className="w-6 h-6 text-[#afafaf]" strokeWidth={1} />
          </button>
        )}
      </div>
    </div>
  )
}
