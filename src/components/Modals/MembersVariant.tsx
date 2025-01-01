'use client'

import { X } from 'lucide-react'
import Image from 'next/image'

export interface ModalProps {
  date: string
  location?: string
  startTime?: string
  endTime?: string
  members: {
    id: number
    name: string
    image: string
  }[]
  onRemove: (id: number) => void
}

export default function MembersVariant({
  date,
  location,
  startTime,
  endTime,
  members,
  onRemove,
}: ModalProps) {
  return (
    <div>
      {/* 헤더 부분: 날짜, 친구 추가 버튼, 엑스 버튼 */}
      <div className="mb-[6px]">
        <div className="text-black text-base font-medium leading-snug">
          {date}
        </div>
      </div>

      {/* 제목, 부제목 부분*/}
      <div className="mb-8">
        <div className="flex items-center gap-1">
          {location && (
            <span className="text-[#8e8d8d] text-base font-medium leading-snug">
              {location}
            </span>
          )}
          <span className="text-[#9562fa] text-base font-semibold leading-snug">
            {startTime}-{endTime}
          </span>
        </div>
      </div>

      {/* 멤버 그리드 부분 */}
      <div className="grid grid-cols-3 gap-[20px]">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-3xl border-2 border-[#9562fa] relative">
              <Image
                src={member.image}
                alt={member.name}
                width={48}
                height={48}
                objectFit="cover"
                className="rounded-3xl"
              />
              {/* X 버튼 */}
              <button
                className="absolute top-0.5 right-0.5 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 p-0.5 opacity-80 bg-[#afafaf] rounded-full border-2 border-[#8e8d8d] flex items-center justify-center"
                onClick={() => onRemove(member.id)}
              >
                <X className="w-4 h-4 text-[#1e1e1e]" />
              </button>
            </div>
            <span className="self-stretch text-center text-[#8e8d8d] text-base font-normal leading-[17px]">
              {member.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
