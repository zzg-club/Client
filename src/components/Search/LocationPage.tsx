'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar/SearchBar'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'

const KAKAO_API_KEY = '6a4b0efd1b0d4527a05d4d81fcb5ce95'

const LocationPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const [locations, setLocations] = useState<
    { place: string; jibun: string }[]
  >([])

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const { lat, lng } = await getCurrentLocation()
        console.log(`현재 위치: 위도 ${lat}, 경도 ${lng}`)
        await fetchCombinedLocationData(lat, lng)
      } catch (error) {
        console.error('위치 정보 가져오기 실패:', error)
      }
    }
    fetchLocationData()
  }, [])

  //   // ✅ 주소 검색어로 좌표 가져오기
  const fetchAddressByQuery = async (query: string) => {
    if (!query.trim()) {
      alert('검색어를 입력해주세요.')
      return
    }

    try {
      const queryEncoded = encodeURIComponent(query)
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${queryEncoded}`,
        {
          headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        },
      )

      if (!response.ok) {
        throw new Error(`주소 검색 실패: HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('검색 주소 응답:', data)

      if (!data.documents || data.documents.length === 0) {
        alert('주소를 찾을 수 없습니다. 정확한 주소를 입력하세요.')
        return
      }

      const { x: longitude, y: latitude } = data.documents[0]
      console.log(`검색된 주소의 좌표: 위도 ${latitude}, 경도 ${longitude}`)
      await fetchCombinedLocationData(
        parseFloat(latitude),
        parseFloat(longitude),
      )
    } catch (error) {
      console.error('주소 검색 중 오류 발생:', error)
    }
  }

  // ✅ 내 위치와 주변 장소 정보를 통합하는 함수
  const fetchCombinedLocationData = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      const addressResponse = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        },
      )

      if (!addressResponse.ok) {
        throw new Error(`주소 변환 실패: HTTP ${addressResponse.status}`)
      }

      const addressData = await addressResponse.json()
      console.log('내 위치 주소 응답:', addressData)

      let currentPlace = '위치 정보 없음'
      let currentJibun = '지번 주소 없음'
      let regionName = '주변'

      if (addressData.documents.length > 0) {
        const { address, road_address } = addressData.documents[0]
        currentPlace =
          road_address?.building_name ||
          road_address?.address_name ||
          address?.address_name ||
          '주소 정보 없음'
        currentJibun = address?.address_name || '지번 주소 없음'
        regionName = address?.region_2depth_name || '주변'
      }

      const placesResponse = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${regionName}&x=${longitude}&y=${latitude}&radius=5000&sort=distance`,
        {
          headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
        },
      )

      if (!placesResponse.ok) {
        throw new Error(`장소 검색 실패: HTTP ${placesResponse.status}`)
      }

      const placesData = await placesResponse.json()
      console.log('주변 장소 API 응답:', placesData)

      const allLocations = [
        { place: currentPlace, jibun: currentJibun },
        ...placesData.documents.map((place) => ({
          place: place.place_name,
          jibun:
            place.road_address_name || place.address_name || '주소 정보 없음',
        })),
      ]

      setLocations(allLocations)
    } catch (error) {
      console.error('위치 및 장소 데이터 가져오기 실패:', error)
    }
  }

  const handleBackClick = () => {
    router.push(`/search?from=${from}`)
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-white overflow-y-auto">
      {/* 검색창 */}
      <div className="flex w-full px-3 py-[11px] justify-center items-center gap-2 rounded-b-[24px] bg-white shadow-[0_0_10px_0_rgba(30,30,30,0.1)]">
        {/* 뒤로가기 버튼 */}
        <img
          src="/arrow_back.svg"
          alt="뒤로 가기"
          className="w-6 h-6 cursor-pointer"
          onClick={handleBackClick}
        />
        <SearchBar
          placeholder="출발지를 입력해주세요!"
          onSearch={() => {
            if (searchQuery.trim()) {
              fetchAddressByQuery(searchQuery)
            } else {
              alert('검색어를 입력해주세요.')
            }
          }}
          onChange={(value) => setSearchQuery(value)} // 🔹 SearchBar 입력값을 `searchQuery` 상태에 저장
        />

        {/* 검색 버튼 */}
        <button
          onClick={() => {
            if (searchQuery.trim()) {
              fetchAddressByQuery(searchQuery) // 🔹 버튼 클릭 시 입력값을 함수로 전달
            } else {
              alert('검색어를 입력해주세요.')
            }
          }}
          className="text-xl text-center font-pretendard font-medium leading-[17px] tracking-[-0.5px] text-[#9562fb] cursor-pointer"
        >
          검색
        </button>
      </div>

      {/* 로딩 중 표시 */}

      <div className="mt-3 w-full flex flex-col mb-[21px]">
        {locations.map((location, index) => (
          <div
            key={index}
            className="flex h-[80px] py-4 px-7 flex-col justify-center items-start gap-2 self-stretch rounded-full bg-white"
          >
            <p className="text-[#1e1e1e] text-center font-pretendard text-[16px] font-normal leading-[17px] tracking-[-0.5px]">
              {location.place}
            </p>
            <p className="text-[#afafaf] font-pretendard text-[12px] font-normal leading-[17px] tracking-[-0.5px]">
              {location.jibun}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LocationPage
