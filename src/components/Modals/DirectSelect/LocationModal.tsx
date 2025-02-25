'use client'

import EditTitle from '@/components/Header/DirectPlace/EditTitle'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useGroupStore } from '@/store/groupStore'
import { useLocationStore } from '@/store/locationsStore'

export interface LocationModalProps {
  isVisible: boolean
  onClose: () => void
  onClickRight: () => void
  initialTitle: string
  onTitleChange: (newTitle: string) => void
  selectedLocation?: { place: string; lat: number; lng: number }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function LocationModal({
  isVisible,
  onClose,
  onClickRight,
  initialTitle,
  selectedLocation,
}: LocationModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const directParam = searchParams.get('direct') // URL에서 `direct` 가져오기
  const [isDirectModal, setIsDirectModal] = useState(directParam === 'true')
  const [title, setTitle] = useState(initialTitle)
  const [loading, setLoading] = useState(false)
  const { setSelectedGroupId } = useGroupStore()
  const { setSelectedLocation } = useLocationStore()

  const handleSearchNavigation = () => {
    setIsDirectModal(true) // `direct` 모달 활성화
    router.push(`/search?from=/letsmeet&direct=true`)
  }

  // `제목 입력 시 UI 업데이트트
  const handleUpdateTitle = async (newTitle: string) => {
    setTitle(newTitle)
  }

  // 입력완료 시 1. 그룹 생성 2. 약속 ID 생성 3. 직접 입력 위치 확정 4. 제목 생성성
  const handleDirectLocation = async () => {
    if (!selectedLocation) {
      alert('선택된 위치가 없습니다.')
      return
    }

    try {
      setLoading(true)

      // 1️. 그룹 생성 API 호출
      console.log('그룹 생성 요청 시작')
      const groupResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!groupResponse.ok) {
        throw new Error(`그룹 생성 실패: ${groupResponse.status}`)
      }

      const groupData = await groupResponse.json()
      const groupId = groupData.data.groupId
      console.log(`그룹 생성 완료: groupId = ${groupId}`)

      // 2️. 위치 ID 생성 API 호출
      console.log('위치 ID 생성 요청 시작')
      const locationCreateResponse = await fetch(
        `${API_BASE_URL}/api/location/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ groupId }),
        },
      )

      if (!locationCreateResponse.ok) {
        throw new Error(`위치 ID 생성 실패: ${locationCreateResponse.status}`)
      }

      const locationCreateData = await locationCreateResponse.json()
      const locationId = locationCreateData.data.location_id
      console.log(`위치 ID 생성 완료: locationId = ${locationId}`)

      // 3️. 중앙 위치 확정 API 호출
      console.log('중앙 위치 확정 요청 시작')
      const locationResponse = await fetch(
        `${API_BASE_URL}/api/location/direct`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            groupId,
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

      // 4. 제목 생성 API 호출
      console.log('약속 제목 수정 요청 시작')
      const updateTitleResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          groupId, // 그룹 ID 사용
          groupName: title, // 사용자가 입력한 제목
        }),
      })

      if (!updateTitleResponse.ok) {
        throw new Error(`약속 제목 생성 실패: ${updateTitleResponse.status}`)
      }

      console.log('약속 제목 생성 완료')

      // Zustand 스토어 업데이트
      setSelectedGroupId(groupId)
      setSelectedLocation(selectedLocation)

      onClickRight()

      alert('중앙 위치가 확정되었습니다!')

      // 렛츠밋 페이지 이동
      router.replace('/letsmeet')
    } catch (error) {
      console.error('오류 발생:', error)
      alert('오류가 발생했습니다. 다시 시도해주세요.')
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
