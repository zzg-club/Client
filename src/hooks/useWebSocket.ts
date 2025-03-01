import { useEffect, useState, useRef } from 'react'
import { Client } from '@stomp/stompjs'

type LocationData = {
  userId: number
  userName: string
  userProfile: string
  latitude: number
  longitude: number
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL

const useWebSocket = (groupId: number | null) => {
  const [locations, setLocations] = useState<LocationData[]>([])
  const stompClientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!groupId) return

    //console.log(`WebSocket 연결 시도: ${WEBSOCKET_URL} (groupId: ${groupId})`)

    const stompClient = new Client({
      brokerURL: WEBSOCKET_URL,
      reconnectDelay: 5000, // 자동 재연결 설정
      //debug: (msg) => console.log('STOMP 디버그:', msg),
      connectHeaders: {
        Authorization: `Bearer ${document.cookie}`, // 인증 헤더 추가
      },
    })

    stompClient.onConnect = () => {
      //console.log('WebSocket 연결 성공:', frame)

      stompClient.subscribe(`/topic/location/${groupId}`, (message) => {
        //console.log('위치 데이터 수신:', message.body)

        try {
          const parsedData = JSON.parse(message.body)

          setLocations((prevLocations) => {
            const updatedLocations = [...prevLocations]

            if (parsedData.myLocation) {
              updatedLocations.push(parsedData.myLocation)
            }

            if (parsedData.membersLocation) {
              updatedLocations.push(...parsedData.membersLocation)
            }
            //console.log('업데이트된 locations:', updatedLocations) // 업데이트된 배열 확인
            return updatedLocations
          })
        } catch (error) {
          console.error('JSON 파싱 오류:', error)
        }
      })

      //console.log('구독 완료: /topic/location/' + groupId)
    }

    stompClient.onStompError = (frame) => {
      console.error('STOMP 오류 발생:', frame.headers['message'])
    }

    stompClient.onWebSocketError = (error) => {
      console.error('WebSocket 연결 오류:', error)
    }

    stompClientRef.current = stompClient
    stompClient.activate()

    return () => {
      //console.log('WebSocket 연결상태')
    }
  }, [groupId])

  /** 위치 정보 전송 함수 */
  const sendLocation = (latitude: number, longitude: number) => {
    if (!groupId && groupId!==-1) {
      console.error('groupId 없음 - 위치 전송 불가')
      return
    }

    /*console.log(
      `위치 정보 전송 시도: 그룹 ${groupId}, 좌표: (${latitude}, ${longitude})`,
    )*/

    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn('WebSocket이 아직 연결되지 않음. 5초 후 재시도...')
      setTimeout(() => sendLocation(latitude, longitude), 5000)
      return
    }

    const locationData = {
      latitude,
      longitude,
    }

    try {
      stompClientRef.current.publish({
        destination: `/app/travelTime/${groupId}/update`,
        body: JSON.stringify(locationData),
      })

      //console.log('위치 전송 완료:', locationData)
    } catch (error) {
      console.error('WebSocket 메시지 전송 중 오류 발생:', error)
    }
  }

  return { locations, sendLocation }
}

export default useWebSocket
