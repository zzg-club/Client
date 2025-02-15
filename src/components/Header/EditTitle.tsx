'use client'

import { GoPencil } from 'react-icons/go'
import { useEffect, useState } from 'react'
import { useSurveyStore } from '@/store/surveyStore'
import axios from 'axios'

interface EditTitleProps {
  initialTitle: string
  onTitleChange: (newTitle: string) => void
}

export default function EditTitle({
  initialTitle,
  onTitleChange,
}: EditTitleProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isEditing, setIsEditing] = useState(false)
  const { selectedSurveyId } = useSurveyStore()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    setTitle(initialTitle)
  }, [initialTitle])

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  console.log('initialTitle', initialTitle)
  console.log('title', title)

  const handleSave = async () => {
    setIsEditing(false)
    onTitleChange(title)

    try {
      const res = axios.patch(
        `${API_BASE_URL}/api/survey/${selectedSurveyId}`,
        {
          name: title,
        },
        {
          withCredentials: true, // 쿠키 전송을 위해 필요
        },
      )

      console.log('일정 이름 변경 성공', res)
    } catch (error) {
      console.log('일정 이름 변경 실패', error)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSave()
    }
  }

  const truncateTitle = (text: string, maxLength: number) => {
    return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  return (
    <div>
      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-[3000]"></div>
      )}

      <div
        className={`relative flex items-center gap-2 ${
          isEditing ? 'z-[4000]' : ''
        }`}
      >
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-white text-[26px] font-semibold font-['Pretendard'] leading-[17px] tracking-tight bg-transparent outline-none placeholder-white overflow-hidden whitespace-nowrap w-[250px] max-w-full" // 가로 길이 제한 추가
          />
        ) : (
          <span className="text-center text-[#afafaf] text-[26px] font-semibold font-['Pretendard'] leading-[30px] tracking-tight overflow-hidden whitespace-nowrap">
            {truncateTitle(title, 10)}
          </span>
        )}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="z-20">
            <GoPencil className="w-6 h-6 text-[#afafaf]" strokeWidth={1} />
          </button>
        )}
      </div>
    </div>
  )
}
