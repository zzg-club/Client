'use client'

import Image from 'next/image'

export interface ModalProps {
  date: string
  title: string
  subtitle?: number
  members: {
    id: number
    name: string
    image: string
  }[]
}

export default function MembersDefault({
  date,
  title,
  subtitle,
  members,
  //   onClose,
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
          <span className="text-[#8e8d8d] text-base font-medium leading-snug">
            {title}
          </span>
          {subtitle && (
            <span className="text-[#9562fa] text-base font-semibold leading-snug">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* 멤버 그리드 부분 */}
      <div className="grid grid-cols-3 gap-[20px]">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-3xl border-2 border-[#9562fa] overflow-hidden">
              <Image
                src={member.image}
                alt={member.name}
                width={48}
                height={48}
                objectFit="cover" // 비율 유지하며 채우기
              />
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
