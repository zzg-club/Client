import Image from 'next/image'
import { FiMoreHorizontal } from 'react-icons/fi'
import { MdArrowDropDown } from 'react-icons/md'

export interface ProfileGroupProps {
  onClick: () => void
  profiles: {
    id: number
    name: string
    image: string
  }[]
  maxDisplay?: number // 선택적으로 처리할 수 있게 하기 위해 물음표 사용, 물음표 없이 number로 선언되면 무조건 props로 넘겨받아야 함
}

export function ProfileSelected({
  onClick,
  profiles,
  maxDisplay = 5,
}: ProfileGroupProps) {
  // 전체 프로필 개수를 계산(length)
  // 배열의 처음부터 최대 갯수까지 슬라이스, 최대 maxDisplay만큼의 프로필만 화면에 표시
  // 표시된 프로필 수가 전체 프로필 수보다 적다면 더보기 기능 필요
  const totalCount = profiles.length
  const displayProfiles = profiles.slice(0, maxDisplay)
  const viewMore = displayProfiles.length < totalCount

  return (
    <div className="flex items-center gap-1" onClick={onClick}>
      <div className="flex -space-x-[14px]">
        {displayProfiles.map((profile, index) => (
          <div
            key={profile.id}
            className="relative h-8 w-8 rounded-[20px] border-2 border-[#9562fa] overflow-hidden"
          >
            {/* 프로필 이미지 */}
            <Image src={profile.image} alt={profile.name} fill sizes="32px" />
            {/* 다섯 번째 프로필 이미지에 회색 배경, 더보기 아이콘 */}
            {viewMore && index === maxDisplay - 1 && (
              <div className="absolute inset-0 bg-[#afafaf]/80 flex items-center justify-center cursor-pointer">
                <FiMoreHorizontal className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* 모임 인원이 5명 이상인 경우 5+로 보이게 설정 */}
      <div className="flex items-center text-xl font-medium text-[#9562fa] group-hover:text-[#fff]">
        {totalCount > maxDisplay ? `${maxDisplay}+` : totalCount}
        <MdArrowDropDown
          size="24"
          className="cursor-pointer text-[#afafaf] group-hover:text-[#fff]"
        />
      </div>
    </div>
  )
}
