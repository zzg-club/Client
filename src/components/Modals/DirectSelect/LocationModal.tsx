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
  onTitleChange?: (title: string) => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function LocationModal({
  isVisible,
  onClose,
  onClickRight,
  initialTitle,
}: LocationModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const directParam = searchParams.get('direct')
  const transitParam = searchParams.get('transitName')
  const [isDirectModal, setIsDirectModal] = useState(directParam === 'true')
  const [title, setTitle] = useState(initialTitle)
  const [loading, setLoading] = useState(false)
  const [nearestTransit, setNearestTransit] = useState<string | null>(null)
  const { selectedGroupId } = useGroupStore()
  const { selectedLocation } = useLocationStore()

  // URL에서 `transitName`이 존재하면 상태 업데이트
  useEffect(() => {
    if (transitParam) {
      setNearestTransit(decodeURIComponent(transitParam))
    }
  }, [transitParam])

  const handleSearchNavigation = async (groupId: number) => {
    try {
      setIsDirectModal(true)

      //  위치 ID 생성 API 호출
      const locationCreateResponse = await fetch(
        `${API_BASE_URL}/api/location/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ groupId }),
        },
      )

      if (!locationCreateResponse.ok) throw new Error('위치 ID 생성 실패')

      const locationCreateData = await locationCreateResponse.json()
      console.log(
        `위치 ID 생성 완료: locationId = ${locationCreateData.data.location_id}`,
      )

          // 검색 페이지로 이동
      router.push(`/search?from=/letsmeet&direct=true`)
    } catch (error) {
      console.error('위치 생성 오류:', error)
      alert('위치 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  /* 제목 입력 시 UI 업데이트 */
  const handleUpdateTitle = async (newTitle: string) => {
    setTitle(newTitle)
  }

  /* 입력 완료: 그룹 생성 → 위치 확정 → 제목 생성 */
  const handleDirectLocation = async () => {
    if (!selectedLocation) {
      alert('선택된 위치가 없습니다.')
      return
    }

    try {
      setLoading(true)

      const groupId = useGroupStore.getState().selectedGroupId
      if (!groupId) throw new Error('groupId가 존재하지 않습니다.')

      // 중앙 위치 확정 API 호출
      const locationResponse = await fetch(
        `${API_BASE_URL}/api/location/direct`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            groupId,
            midAddress: nearestTransit, // 가장 가까운 지하철역 전달
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          }),
        },
      )

      if (!locationResponse.ok) throw new Error('중앙 위치 확정 실패')

      console.log(`중앙 위치 확정 완료: ${nearestTransit}`)

      // 제목 생성 API 호출
      const updateTitleResponse = await fetch(`${API_BASE_URL}/api/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          groupId,
          groupName: title, // 사용자 입력 제목 전달
        }),
      })

      if (!updateTitleResponse.ok) throw new Error('약속 제목 생성 실패')

      console.log('약속 제목 생성 완료')

      onClickRight()
      setIsDirectModal(false) // 모달 상태 직접 변경

      // **setTimeout을 사용하여 모달을 확실히 닫기**
      setTimeout(() => {
        onClose() // 모달 닫기 추가
      }, 100) // 약간의 지연 추가

      router.replace('/letsmeet?middle=direct')

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
              onClick={() => {
                if (selectedGroupId !== null) {
                  handleSearchNavigation(selectedGroupId) // groupId가 있을 때만 실행
                } else {
                  console.error('selectedGroupId가 null입니다.')
                }
              }}
              className="flex w-[228px] px-3 py-1.5 items-center gap-[10px] rounded-[24px] border border-[var(--NavBarColor,#AFAFAF)] bg-[var(--Grays-White,#FFF)] cursor-pointer"
            >
              {/* 텍스트를 버튼 정중앙에 위치 */}
              <span className="absolute left-1/2 transform -translate-x-1/2 text-[14px] font-medium text-[#666666] truncate">
                {nearestTransit || ''}
              </span>

              {/* 아이콘을 오른쪽에 고정 */}
              <div className="ml-auto">
                <Image
                  src="/vector.svg"
                  alt="위치 아이콘"
                  width={20}
                  height={20}
                />
              </div>
            </button>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex justify-center items-center border-t border-[#afafaf] p-4">
          <button
            onClick={handleDirectLocation}
            className="text-center text-[18px] font-medium text-[var(--MainColor,#9562FB)]"
          >
            입력 완료
          </button>
        </div>
      </div>
    </div>
  )
}
