'use client'

import React, { useEffect, useState } from 'react'
import './CustomPin.css'
import Image from 'next/image'
import { useGroupStore } from '@/store/groupStore'

interface Participant {
  userId: number
  username: string
  userProfile: string
  latitude: number
  longitude: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const CustomPin: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [departures, setDepartures] = useState<{ [key: number]: string }>({})
  const { selectedGroupId } = useGroupStore()

  useEffect(() => {
    if (!selectedGroupId) return

    const fetchLocationData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/location/${selectedGroupId}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!response.ok) throw new Error('Failed to fetch location data')

        const data = await response.json()
        console.log('참여자 위치 데이터:', data)

        if (!data.success) return

        const allParticipants: Participant[] = []

        // 내 위치 추가
        if (data.data.myLocation) {
          allParticipants.push({
            userId: data.data.myLocation.userId,
            username: data.data.myLocation.username,
            userProfile: data.data.myLocation.userProfile,
            latitude: data.data.myLocation.latitude,
            longitude: data.data.myLocation.longitude,
          })
        }

        // 모든 참여자 위치 추가
        data.data.membersLocation.forEach((member: Participant) => {
          allParticipants.push({
            userId: member.userId,
            username: member.username,
            userProfile: member.userProfile,
            latitude: member.latitude,
            longitude: member.longitude,
          })
        })

        setParticipants(allParticipants)
      } catch (error) {
        console.error('참여자 위치 데이터 조회 실패:', error)
      }
    }

    fetchLocationData()
  }, [selectedGroupId])

  useEffect(() => {
    const fetchNearestTransitForAll = async () => {
      const newDepartures: { [key: number]: string } = {}

      await Promise.all(
        participants.map(async (participant) => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/transit`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: participant.latitude,
                longitude: participant.longitude,
              }),
            })

            if (!response.ok) throw new Error('Failed to fetch nearest transit')

            const data = await response.json()
            if (data.success) {
              newDepartures[participant.userId] =
                data.data.transitName || '출발지 미정'
            }
          } catch (error) {
            console.error(
              `지하철역 탐색 실패 (User: ${participant.userId})`,
              error,
            )
          }
        }),
      )

      setDepartures(newDepartures)
    }

    if (participants.length > 0) {
      fetchNearestTransitForAll()
    }
  }, [participants])

  return (
    <>
      {participants.map((participant) => {
        const isMine = participant.userId === participants[0]?.userId
        return (
          <div
            key={participant.userId}
            className={`pin-container ${isMine ? 'pin-purple' : 'pin-gray'}`}
          >
            <div
              className="pin-globe"
              style={{ backgroundImage: `url(${participant.userProfile})` }}
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
              {departures[participant.userId] || '출발지 미정'}에서 출발
            </div>
          </div>
        )
      })}
    </>
  )
}

export default CustomPin
