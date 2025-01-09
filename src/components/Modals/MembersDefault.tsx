'use client'

import Image from 'next/image'

export interface ModalProps {
  title: string
  memberCount?: number
  members: {
    id: number
    name: string
    image: string
  }[]
  blackText: boolean
}

export default function MembersDefault({
  title,
  memberCount,
  members,
  blackText,
}: ModalProps) {
  return (
    <div>
      {blackText ? (
        <>
          {/* 헤더 부분: 모임 이름, 엑스 버튼 */}
          <div className="mb-[6px]">
            <div className="text-black text-base font-medium leading-snug">
              {title}
            </div>
          </div>
          {/* 제목, 부제목 부분*/}
          <div className="mb-8">
            <div className="flex items-center gap-1">
              <span className="text-[#8e8d8d] text-base font-medium leading-snug">
                참여 인원
              </span>
              {memberCount && (
                <span className="text-[#9562fa] text-base font-semibold leading-snug">
                  {memberCount}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="my-[20px]">
          <div className="flex items-center gap-1">
            <span className="text-[#8e8d8d] text-base font-medium leading-snug">
              {title}
            </span>
            {memberCount && (
              <span className="text-[#9562fa] text-base font-semibold leading-snug">
                {memberCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 멤버 그리드 부분 */}
      <div className="grid grid-cols-3 gap-[32px] max-h-[170px] overflow-y-auto scrollbar-none">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-1">
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
