'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar/SearchBar'
import { getCurrentLocation } from '@/components/Map/getCurrentLocation'
import Image from 'next/image'
import LocationModal from '@/components/Modals/DirectSelect/LocationModal'

const KAKAO_API_KEY = '5e437624aad33d7f67c00082667e8425'

interface LocationPageProps {
  onLocationClick: (location: {
    place: string
    lat: number
    lng: number
  }) => void // ✅ 매개변수 받도록 수정
  isDirectModal: boolean
}

interface Address {
  address_name: string
}

interface RoadAddress {
  building_name?: string
  address_name: string
}

// "주소 검색 API" 응답 타입 (address_name은 address 내부에 존재)
interface AddressDocument {
  address?: Address
  road_address?: RoadAddress
  x: string // 경도 (longitude)
  y: string // 위도 (latitude)
}

// "장소 검색 API" 응답 타입 (place_name 포함)
interface PlaceDocument {
  place_name: string
  address_name: string
  road_address_name?: string
  x: string // 경도 (longitude)
  y: string // 위도 (latitude)
}

// API 응답 타입
interface AddressAPIResponse {
  documents: AddressDocument[]
}

interface PlaceAPIResponse {
  documents: PlaceDocument[]
}

const LocationPage: React.FC<LocationPageProps> = ({
  onLocationClick,
  isDirectModal,
}) => {
  {
    const router = useRouter()
    const searchParams = useSearchParams()
    const from = searchParams.get('from')
    const queryParam = searchParams.get('query') || ''

    const [searchQuery, setSearchQuery] = useState(queryParam)
    const [locations, setLocations] = useState<
      { place: string; jibun: string; road: string; lat: number; lng: number }[]
    >([])
    const [selectedLocation, setSelectedLocation] = useState<{
      place: string
      lat: number
      lng: number
    } | null>(null)
    const [isModalVisible, setIsModalVisible] = useState(isDirectModal)

    const fetchAddressByQuery = async (query: string) => {
      if (!query.trim()) {
        setLocations([])
        return
      }

      try {
        const queryEncoded = encodeURIComponent(query)

        // 🔹 1. 주소 검색 API 요청
        const addressResponse = await fetch(
          `https://dapi.kakao.com/v2/local/search/address.json?query=${queryEncoded}`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_API_KEY}`,
              Referer: 'https://localhost:3000',
            },
          },
        )
        const addressData: AddressAPIResponse = await addressResponse.json()

        // 🔹 2. 장소 검색 API 요청
        const placeResponse = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${queryEncoded}`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_API_KEY}`,
              Referer: 'https://localhost:3000',
            },
          },
        )
        const placeData: PlaceAPIResponse = await placeResponse.json()

        const combinedResults: {
          place: string
          jibun: string
          road: string
          lat: number
          lng: number
        }[] = []

        addressData.documents.forEach((doc) => {
          combinedResults.push({
            place:
              doc.road_address?.building_name ||
              doc.road_address?.address_name ||
              doc.address?.address_name ||
              '주소 정보 없음',
            jibun: doc.address?.address_name || '지번 주소 없음',
            road: doc.road_address?.address_name || '도로명 주소 없음',
            lat: parseFloat(doc.y) || 0, // ✅ 위도 값 추가
            lng: parseFloat(doc.x) || 0, // ✅ 경도 값 추가
          })
        })

        placeData.documents.forEach((doc) => {
          combinedResults.push({
            place: doc.place_name, // ✅ "장소 검색 API"에서만 존재
            jibun: doc.address_name || '지번 주소 없음',
            road: doc.road_address_name || '도로명 주소 없음',
            lat: parseFloat(doc.y) || 0, // ✅ 위도 값 추가
            lng: parseFloat(doc.x) || 0, // ✅ 경도 값 추가
          })
        })

        setLocations(combinedResults)
      } catch (error) {
        console.error('🔹 검색 오류 발생:', error)
      }
    }

    const fetchCombinedLocationData = async (
      latitude: number,
      longitude: number,
    ) => {
      try {
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=주변&x=${longitude}&y=${latitude}&radius=5000&sort=distance`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_API_KEY}`,
              Referer: 'https://localhost:3000',
            },
          },
        )
        const data = await response.json()
        console.log('🔹 Kakao API 응답:', data)

        if (!data.documents || !Array.isArray(data.documents)) {
          throw new Error('Kakao API 응답 데이터 형식이 올바르지 않습니다.')
        }

        const nearbyPlaces = data.documents.map((place: PlaceDocument) => ({
          place: place.place_name,
          jibun: place.address_name || '지번 주소 없음',
          road: place.road_address_name || '도로명 주소 없음',
          lat: parseFloat(place.y) || 0, // ✅ 위도 값 추가
          lng: parseFloat(place.x) || 0, // ✅ 경도 값 추가
        }))

        setLocations(nearbyPlaces)
      } catch (error) {
        console.error('🔹 내 위치 기반 검색 오류 발생:', error)
      }
    }

    const fetchCurrentLocationData = useCallback(async () => {
      try {
        const { lat, lng } = await getCurrentLocation()
        console.log(`현재 위치: 위도 ${lat}, 경도 ${lng}`)
        await fetchCombinedLocationData(lat, lng)
      } catch (error) {
        console.error('위치 정보 가져오기 실패:', error)
      }
    }, [fetchCombinedLocationData])

    useEffect(() => {
      if (searchQuery === 'current') {
        // 🔹 내 위치를 가져와서 검색
        fetchCurrentLocationData()
      } else if (searchQuery.trim()) {
        fetchAddressByQuery(searchQuery)
      }
    }, [searchQuery, fetchCurrentLocationData, fetchAddressByQuery])

    const handleLocationSelect = (location: {
      place: string
      lat: number
      lng: number
    }) => {
      onLocationClick(location)
      setSelectedLocation(location)
      if (isDirectModal) {
        // ✅ `directmodal`에서 왔다면 모달 열기
        setIsModalVisible(true)
      } else {
        // ✅ `middle` 페이지로 이동
        router.push(
          `/letsmeet/middle?selectedLocation=${encodeURIComponent(location.place)}`,
        )
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
          <Image
            src="/arrow_back.svg"
            alt="뒤로 가기"
            width={24}
            height={24}
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
            onChange={(value) => setSearchQuery(value)} // 🔹 SearchBar 입력값을 searchQuery 상태에 저장
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

        <div className="mt-3 w-full flex flex-col mb-[21px]">
          {locations.map((location, index) => (
            <div
              key={index}
              className="flex h-[80px] py-4 px-7 flex-col justify-center items-start gap-2 self-stretch rounded-full bg-white"
              onClick={() => {
                handleLocationSelect(location) //  `location` 전달
                onLocationClick(location) // `onLocationClick`에 location 객체 전달
              }}
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
        {/* 중앙 위치 직접선택 모달 */}
        {isModalVisible && selectedLocation && (
          <LocationModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onClickRight={() => setIsModalVisible(false)}
            initialTitle={selectedLocation.place}
            onTitleChange={() => {}}
            selectedLocation={selectedLocation}
          />
        )}
      </div>
    )
  }
}
export default LocationPage
