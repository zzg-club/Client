import React, { useEffect, useState } from 'react'
import './CustomPin.css'
import Image from 'next/image'

interface CustomPinProps {
  imagePath: string
  isMine?: boolean
  latitude: number
  longitude: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const CustomPin: React.FC<CustomPinProps> = ({
  imagePath,
  isMine = false,
  latitude,
  longitude,
}) => {
  const [depart, setDepart] = useState<string>('')

  useEffect(() => {
    const fetchNearestTransit = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/transit`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude }),
        })

        if (!response.ok) throw new Error('Failed to fetch nearest transit')

        const data = await response.json()

        if (data.success) {
          setDepart(data.data.transitName || '출발지 미정')
        }
      } catch (error) {
        console.error('Failed to fetch nearest transit:', error)
      }
    }

    fetchNearestTransit()
  }, [latitude, longitude])

  return (
    <div className={`pin-container ${isMine ? 'pin-purple' : 'pin-gray'}`}>
      <div
        className="pin-globe"
        style={{ backgroundImage: `url(${imagePath})` }}
      ></div>
      <Image
        src={isMine ? '/Polygon2Purple.svg' : '/Polygon2Gray.svg'}
        className="pin-polygon"
        alt="Polygon shape"
        width={28}
        height={21}
      />
      <div
        className={`flex h-4 px-2 py-2 justify-center items-center gap-3 self-stretch rounded-full bg-white      
            font-medium text-[8px] leading-[17px] tracking-[-0.5px]`}
        style={{
          border: `1px solid ${isMine ? 'var(--MainColor, #9562fb)' : '#AFAFAF'}`,
        }}
      >
        {depart}에서 출발
      </div>
    </div>
  )
}

export default CustomPin
