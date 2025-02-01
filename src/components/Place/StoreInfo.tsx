'use client'

import React, { useState } from 'react'
import KakaoMap from '@/components/Map/KakaoMap' // KakaoMap 컴포넌트 임포트

const StoreInfo = ({ selectedPlace }: { selectedPlace: any }) => {
  const [activeDropdown, setActiveDropdown] = useState<
    'time' | 'capacity' | null
  >(null) // 드롭다운 상태 관리

  if (!selectedPlace) {
    return null // selectedPlace가 없으면 아무것도 렌더링하지 않음
  }

  const toggleDropdown = (dropdown: 'time' | 'capacity') => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  return (
    <div>
      {/* 상단 정보 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 32px 20px 50px',
        }}
      >
        {/* 영업 시간 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src="/clock-icon.svg"
            alt="Clock Icon"
            style={{ width: '28px', height: '28px', marginBottom: '4px' }}
          />
          <p style={{ fontSize: '12px', color: '#8E8D8D', margin: 0 }}>
            영업 시간
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexDirection: 'column',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#9562FB',
                margin: 0,
              }}
            >
              10:00 - 22:00
            </p>
            <img
              src={
                activeDropdown === 'time'
                  ? '/drop-down-button.svg'
                  : '/drop-button.svg'
              }
              alt="Drop Button"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              onClick={() => toggleDropdown('time')}
            />
          </div>
        </div>

        {/* 최대 인원 */}
        {/* <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src="/people.svg"
            alt="People Icon"
            style={{ width: '28px', height: '28px', marginBottom: '4px' }}
          />
          <p style={{ fontSize: '12px', color: '#8E8D8D', margin: 0 }}>
            최대 인원
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexDirection: 'column',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#9562FB',
                margin: 0,
              }}
            >
              12명
            </p>
            <img
              src={
                activeDropdown === 'capacity'
                  ? '/drop-down-button.svg'
                  : '/drop-button.svg'
              }
              alt="Drop Button"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              onClick={() => toggleDropdown('capacity')}
            />
          </div>
        </div> */}

        {/* 전화 버튼 */}
        <button
          style={{
            backgroundColor: '#61C56C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '24px',
            padding: '16px 64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            width: '200px',
            height: '60px',
          }}
        >
          <img
            src="/call.svg"
            alt="Call Icon"
            style={{ width: '36px', height: '36px' }}
          />
        </button>
      </div>

      {/* 영업 시간 드롭다운 */}
      {activeDropdown === 'time' && (
        <div
          style={{
            display: 'flex',
            width: '393px',
            padding: '16px 32px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '17px',
            letterSpacing: '-0.5px',
            marginBottom: '8px',
          }}
        >
          <p>수(12/26) 10:00 - 22:00</p>
          <p style={{ color: '#AFAFAF' }}>목 10:00 - 22:00</p>
          <p style={{ color: '#AFAFAF' }}>금 10:00 - 22:00</p>
          <p style={{ color: '#AFAFAF' }}>토 12:00 - 20:00</p>
          <p style={{ color: '#AFAFAF' }}>일 12:00 - 20:00</p>
          <p style={{ color: '#AFAFAF' }}>월 10:00 - 22:00</p>
          <p style={{ color: '#AFAFAF' }}>화 10:00 - 22:00</p>
        </div>
      )}

      {/* 지도 */}
      <div>
        {/* 지도 영역 */}
        <div
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#F5F6F8',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginTop: '16px',
            marginLeft: '32px',
            marginRight: '32px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '200px', // 지도의 높이를 조정
              position: 'relative',
            }}
          >
            {/* KakaoMap 컴포넌트 삽입 */}
            <KakaoMap selectedPlace={selectedPlace} />
          </div>
          {/* 하단 텍스트 영역 */}
          <div
            style={{
              padding: '12px 5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E6E6E6',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#AFAFAF',
                margin: 0,
              }}
            >
              {selectedPlace.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreInfo
