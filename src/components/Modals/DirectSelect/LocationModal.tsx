'use client'

import EditTitle from '@/components/Header/DirectPlace/EditTitle'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export interface LocationModalProps {
  isVisible: boolean
  onClose: () => void
  onClickRight: () => void
  initialTitle: string
  onTitleChange: (newTitle: string) => void
  selectedLocation?: { place: string; lat: number; lng: number } // 선택된 위치
  scheduleId?: number // 수정할 스케줄 ID 추가
}

export default function LocationModal({
  isVisible,
  onClose,
  onClickRight,
  initialTitle,
  selectedLocation,
  scheduleId,
}: LocationModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const directParam = searchParams.get('direct') // URL에서 `direct` 가져오기

  const [isDirectModal, setIsDirectModal] = useState(directParam === 'true')
  const [title, setTitle] = useState(initialTitle)

  const handleSearchNavigation = () => {
    setIsDirectModal(true) // `direct` 모달 활성화
    router.push(`/search?from=/letsmeet&direct=true`)
  }

  // 제목 변경 API 요청
  const handleUpdateTitle = async (newTitle: string) => {
    setTitle(newTitle) // UI 업데이트

    try {
      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle, // 새로운 제목 업데이트
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`제목 변경 실패: ${response.status}`)
      }

      const data = await response.json()
      console.log('스케줄 제목 변경 성공:', data)
    } catch (error) {
      console.error('제목 변경 오류:', error)
    }
  }

  // 중앙 위치 직접 선택 API 호출
  const handleDirectLocation = async () => {
    if (!selectedLocation) {
      alert('선택된 위치가 없습니다.')
      return
    }

    try {
      setLoading(true)

      // 1. 그룹 생성 API 호출
      const groupResponse = await fetch('https://api.moim.team/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함 요청
      })

      if (!groupResponse.ok) {
        throw new Error(`그룹 생성 실패: ${groupResponse.status}`)
      }

      const groupData = await groupResponse.json()
      const groupId = groupData.data.groupId // 그룹 ID 받아오기

      console.log(`그룹 생성 완료, groupId: ${groupId}`)

      // 2. 중앙 위치 확정 API 호출
      const locationResponse = await fetch(
        'https://api.moim.team/api/location/direct',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: groupId, // 생성된 그룹 ID 사용
            groupName: title,
            midAddress: selectedLocation.place,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          }),
        },
      )

      if (!locationResponse.ok) {
        throw new Error(`중앙 위치 확정 실패: ${locationResponse.status}`)
      }

      const locationData = await locationResponse.json()
      console.log(`중앙 위치 확정 완료: ${locationData.data.midAddress}`)

      alert('중앙 위치가 확정되었습니다!')
      onClickRight()
    } catch (error) {
      console.error('오류 발생:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loading && !isDirectModal) {
      console.log('로딩 중...')
    }
  }, [loading, isDirectModal])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="w-[280px] bg-white rounded-[24px] overflow-hidden">
        <div className="flex flex-col mx-6 my-6 gap-11">
          {/* 상단 타이틀 영역 */}
          <div className="flex items-center justify-between ml-1">
            <EditTitle
              initialTitle={initialTitle}
              onTitleChange={handleUpdateTitle}
            />
            <button
              onClick={onClose}
              className="bg-none border-none cursor-pointer"
            >
              <X className="w-6 h-6 text-[#1e1e1e]" />
            </button>
          </div>

          {/* 중간 버튼 영역 */}
          <div className="flex justify-center items-center">
            <button
              onClick={handleSearchNavigation}
              className="flex w-[228px] px-3 py-1.5 justify-end items-center gap-[10px] rounded-[24px] border border-[var(--NavBarColor,#AFAFAF)] bg-[var(--Grays-White,#FFF)] cursor-pointer"
            >
              {/* 선택된 위치가 있으면 표시, 없으면 기본 텍스트 */}
              <span className="ml-4 text-[14px] font-medium text-[#1e1e1e] truncate">
                {selectedLocation ? selectedLocation.place : ''}
              </span>
              <Image
                src="/vector.svg"
                alt="위치 아이콘"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
        {/* 하단 버튼 영역 */}
        <div className="flex justify-center items-center border-t border-[#afafaf] p-4">
          <button
            onClick={handleDirectLocation}
            className="text-center text-[18px] font-medium leading-[22px] tracking-tight text-[var(--MainColor,#9562FB)] font-['Pretendard']"
          >
            입력 완료
          </button>
        </div>
      </div>
    </div>
  )
}
