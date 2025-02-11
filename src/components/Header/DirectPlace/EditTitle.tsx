'use client'

import { useState } from 'react'
import { GoPencil } from 'react-icons/go'

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

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleSave = () => {
    setIsEditing(false)
    onTitleChange(title)
  }

  const handleEditStart = () => {
    setTitle('') // Clear the title when editing starts
    setIsEditing(true)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <div className="relative">
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            outline: 'none',
          }}
          placeholder=""
          className="text-black text-xl font-medium font-['Pretendard'] leading-[17px] tracking-tight bg-transparent outline-none placeholder-gray-400 overflow-hidden whitespace-nowrap w-full max-w-full"
        />
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={handleEditStart}
            className={`text-xl font-medium font-['Pretendard'] leading-[17px] tracking-tight overflow-hidden whitespace-nowrap text-left text-[#afafaf]`}
          >
            {title || '제목 없는 일정'}
          </button>
          {!isEditing && (
            <button onClick={handleEditStart} className="z-20">
              <GoPencil className="w-4 h-4 text-[#afafaf]" strokeWidth={1} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
